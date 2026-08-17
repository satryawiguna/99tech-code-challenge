# Scoreboard Scalability Design

## 1. Purpose

This document describes how the Scoreboard Service can scale as traffic, users, and score events increase.

The design starts with a simple transactional architecture and identifies scaling strategies that can be introduced as individual components become bottlenecks.

The primary scalability goals are:

- supporting horizontal API scaling;
- keeping leaderboard reads fast;
- handling concurrent score-producing requests safely;
- reducing database read pressure;
- preventing a single component from becoming a system-wide bottleneck;
- preserving score correctness while scaling.

---

## 2. Current Architecture

The initial architecture consists of:

```text
                    ┌─────────────────┐
                    │     Clients     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Score API    │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
      Identity Provider  Action Service   Score Database
                                             │
                           ┌─────────────────┼─────────────────┐
                           │                 │                 │
                           ▼                 ▼                 ▼
                     score_events       user_scores       idempotency
```

The API is stateless with respect to request processing.

Persistent state is stored in the database.

This allows multiple API instances to process requests concurrently.

---

## 3. Scalability Principles

The design follows several principles.

### 3.1 Stateless API

The Score API should not store request-specific state in local process memory.

State required across requests is persisted in the database or an appropriate shared infrastructure component.

Therefore multiple API instances can serve requests interchangeably.

```text
                  Load Balancer
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       API #1        API #2        API #3
          │            │            │
          └────────────┼────────────┘
                       ▼
                 Shared Database
```

---

### 3.2 Separate Read and Write Characteristics

The system has two fundamentally different workloads.

#### Score writes

```text
POST /v1/score-events
```

These operations require:

- authentication;
- action verification;
- idempotency;
- database transaction;
- score event insertion;
- aggregate score update.

#### Leaderboard reads

```text
GET /v1/leaderboard
```

These operations are read-heavy and should not require recalculating scores from the complete event history.

The `user_scores` aggregate therefore provides an important scalability boundary between score writes and leaderboard reads.

---

## 4. Horizontal API Scaling

The Score API can be scaled horizontally by running multiple instances.

```text
                     Load Balancer
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
      Score API #1     Score API #2     Score API #3
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    Shared Services
```

Because authentication state, idempotency state, score events, and aggregate scores are not stored in local process memory, requests can be distributed across instances.

No session affinity is required for the Score API.

---

## 5. Database as the Primary Write Consistency Boundary

The Score Database remains the source of truth for score mutations.

The following operations remain transactionally consistent:

```text
Idempotency record
        +
Score event
        +
User aggregate score
        +
Completed response
```

This transaction boundary should not be weakened merely to increase throughput.

Score correctness is more important than maximizing write throughput.

---

## 6. Leaderboard Read Scaling

The leaderboard reads from:

```text
user_scores
```

rather than calculating:

```text
SUM(score_events.points)
```

for every request.

The query is conceptually:

```sql
SELECT
    us.user_id,
    up.display_name,
    us.total_score
FROM user_scores us
LEFT JOIN user_profiles up
    ON up.user_id = us.user_id
ORDER BY
    us.total_score DESC,
    us.user_id ASC
LIMIT 10;
```

This keeps leaderboard queries bounded to the aggregate/read model rather than the complete score-event history.

---

## 7. Database Indexing

The most important indexes for the initial architecture are:

### Action lookup

```text
UNIQUE(action_definitions.code)
```

Used to resolve:

```text
actionType
    ↓
action definition
```

### Business duplicate protection

```text
UNIQUE(
    user_id,
    action_definition_id,
    reference_id
)
```

This constraint is both a correctness mechanism and a lookup optimization.

### Idempotency

```text
UNIQUE(
    user_id,
    idempotency_key
)
```

This supports efficient idempotency-key lookup.

### Leaderboard

The leaderboard should have an index supporting:

```text
ORDER BY
    total_score DESC,
    user_id ASC
```

The exact index syntax depends on the selected database engine.

Indexes should be added according to measured query patterns rather than creating indexes for every possible column combination.

---

## 8. Caching Strategy

Caching may be introduced when leaderboard read traffic becomes a significant source of database load.

A shared cache such as Redis can be used for:

```text
leaderboard:top10
```

The API can then follow:

```text
Client
  ↓
Score API
  ↓
Redis
  │
  ├── Cache hit → return leaderboard
  │
  └── Cache miss
          ↓
       Database
          ↓
       Update cache
```

The cache should be treated as a performance optimization rather than the source of truth.

The database remains authoritative.

---

## 9. Cache Invalidation

Leaderboard data changes when the aggregate score changes.

After a successful score transaction:

```text
score event created
        +
user score updated
```

the affected leaderboard cache can be invalidated.

Conceptually:

```text
Score transaction
       ↓
Commit
       ↓
Invalidate leaderboard cache
```

Cache invalidation should happen only after the database transaction successfully commits.

This prevents a failed transaction from publishing an invalid cache state.

---

## 10. Cache Consistency

The leaderboard cache may be slightly stale.

This is acceptable because:

- the database remains authoritative;
- the leaderboard is a read-oriented view;
- score correctness is maintained by the transactional write path.

The system should therefore distinguish between:

```text
Score correctness
```

and:

```text
Leaderboard display freshness
```

The former requires strong consistency.

The latter may tolerate short-lived eventual consistency when caching is introduced.

---

## 11. Read Replicas

If leaderboard traffic becomes significantly larger than score-write traffic, read replicas can reduce pressure on the primary database.

The architecture can evolve toward:

```text
                    Score API
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
        Primary DB            Read Replica
             │                     │
             │                     ▼
             │                Leaderboard
             │
             ▼
       Score mutations
```

Write operations continue to use the primary database.

Leaderboard reads may use a read replica.

However, replica lag must be considered.

A recently awarded score may not immediately appear on a replica.

Therefore read replicas should only be introduced when the application can tolerate this level of eventual consistency for leaderboard reads.

---

## 12. Protecting the Primary Database

As traffic grows, the primary database may become the main bottleneck.

Several measures can be applied progressively:

1. optimize indexes;
2. optimize slow queries;
3. reduce unnecessary reads;
4. introduce leaderboard caching;
5. introduce read replicas;
6. archive historical data where appropriate;
7. partition very large event tables when justified.

These measures should be introduced based on observed bottlenecks.

---

## 13. Score Event Table Growth

`score_events` is an append-heavy table.

As the system grows, it may eventually contain millions or billions of records.

The table should therefore be designed with long-term growth in mind.

The initial architecture does not require partitioning.

If event volume becomes large enough to affect:

- index size;
- write performance;
- historical queries;
- maintenance operations;

partitioning may be introduced.

Possible partitioning strategies include:

```text
created_at
```

or another business-appropriate partition key.

Partitioning should be introduced only after measuring the actual workload.

---

## 14. Historical Data and Archiving

Historical score events are part of the audit ledger and should not be silently deleted.

However, older events may eventually be moved to cheaper archival storage if the operational database becomes too large.

Conceptually:

```text
Recent score events
        ↓
Primary operational database

Older historical events
        ↓
Archive storage
```

The archive process must preserve:

- event identity;
- user identity;
- action definition identity;
- reference ID;
- awarded points;
- original timestamp.

The aggregate `user_scores` table remains in the operational database.

---

## 15. Concurrent Score Writes

Concurrent requests are expected.

For example:

```text
Request A ─────────────┐
                       ├── Same user / same action
Request B ─────────────┘
```

Application-level checks alone are not sufficient to prevent race conditions.

The database remains the final consistency boundary through:

```text
UNIQUE(
    user_id,
    action_definition_id,
    reference_id
)
```

and the transactional score update.

Only one request can successfully create the business score event.

---

## 16. Idempotency Under Horizontal Scaling

Because the API is stateless, the same idempotency key may be received by different API instances.

For example:

```text
Client
  │
  ├──── Request ────► API #1
  │
  └──── Retry ──────► API #2
```

This is safe because idempotency state is stored in the shared database.

Both API instances use:

```text
UNIQUE(user_id, idempotency_key)
```

as the shared consistency boundary.

The API instance that successfully claims the key processes the request.

The other instance observes the existing state and follows the idempotency rules.

No local-memory lock is required.

---

## 17. Rate Limiting

Score-producing endpoints should be protected against excessive request volume.

Rate limiting can be applied at multiple layers:

```text
Internet
   ↓
API Gateway / Load Balancer
   ↓
Score API
```

A distributed rate-limiting mechanism should be used when multiple API instances are deployed.

Redis can be introduced for shared rate-limit counters if required.

Rate limiting protects the application and database from accidental or malicious traffic spikes.

Rate limiting does not replace idempotency or business duplicate protection.

---

## 18. Backpressure

The score mutation path is intentionally synchronous because the API must return the resulting aggregate score in the response.

Therefore the initial design does not introduce a queue between the API and database.

If future traffic exceeds the synchronous write capacity, several options can be evaluated:

- database optimization;
- batching where business requirements permit;
- asynchronous processing for non-critical side effects;
- queue-based processing for secondary workloads.

The core score mutation should remain transactional.

A queue should not be introduced merely for the appearance of scalability.

---

## 19. Asynchronous Secondary Processing

Non-critical operations can be moved out of the synchronous transaction.

Examples include:

- analytics;
- notifications;
- reporting;
- audit exports;
- leaderboard cache refresh;
- downstream integrations.

The architecture can evolve toward:

```text
                 Score API
                     │
                     ▼
               Primary DB
                     │
                     ▼
              Event / Queue
              │      │      │
              ▼      ▼      ▼
          Analytics  Notification  Reporting
```

These secondary consumers must not become prerequisites for successfully recording the score event.

The score transaction remains independent from these downstream operations.

---

## 20. Avoiding a Distributed Transaction

The initial design intentionally avoids a distributed transaction across the Identity Provider, Action Service, and Score Database.

The Score API follows this sequence:

```text
Authenticate
    ↓
Authorize
    ↓
Verify action
    ↓
Persist score transaction
```

The Score Database remains responsible for the atomic score mutation.

If additional downstream systems need to react to a successful score event, an asynchronous event mechanism can be introduced rather than extending the core transaction across multiple services.

---

## 21. Horizontal Scaling Limits

Horizontal API scaling does not eliminate all bottlenecks.

The main potential bottleneck is the primary database because every score mutation must update:

```text
score_events
+
user_scores
+
idempotency_records
```

The aggregate update for a highly active user can also create contention because multiple concurrent requests may update the same `user_scores` row.

This should be measured before introducing more complex architecture.

Possible future approaches include:

- database optimization;
- partitioning;
- workload isolation;
- write batching where business semantics allow;
- sharding by user or another appropriate key.

Sharding should be considered only after simpler scaling strategies have been exhausted.

---

## 22. Failure Isolation

A scalable system should prevent non-critical dependencies from cascading into the score mutation path.

For example:

```text
Analytics unavailable
        ↓
Score transaction still succeeds
```

Likewise:

```text
Notification service unavailable
        ↓
Score transaction still succeeds
```

The core score path should depend only on services required to establish the validity of the action and persist the score.

---

## 23. Observability

Scaling decisions should be driven by measurements.

The service should monitor at least:

### API metrics

- request rate;
- response latency;
- error rate;
- HTTP status distribution;
- concurrent requests.

### Score mutation metrics

- score-event creation rate;
- duplicate-action conflict rate;
- idempotency conflict rate;
- transaction latency;
- transaction failure rate.

### Database metrics

- CPU;
- memory;
- connection count;
- query latency;
- lock contention;
- index usage;
- storage growth;
- replication lag if replicas are introduced.

### Cache metrics

- cache hit rate;
- cache miss rate;
- eviction rate;
- cache latency.

---

## 24. Capacity Planning

The system should be evaluated using measurable workload assumptions.

Important variables include:

```text
R = leaderboard requests per second
W = score writes per second
U = active users
E = score events per user
```

The primary scaling pressure is expected to come from:

```text
score write volume
+
leaderboard read volume
+
score_events growth
```

Capacity planning should be based on production-like load tests rather than theoretical maximum values.

---

## 25. Scaling Evolution

The recommended scaling path is incremental.

### Stage 1 — Initial Deployment

```text
Load Balancer
      ↓
Multiple Score API instances
      ↓
Primary Database
```

Use:

- stateless API;
- database indexes;
- transactional writes;
- aggregate `user_scores`;
- idempotency constraints.

---

### Stage 2 — Read Optimization

If leaderboard reads become the dominant database workload:

```text
Score API
   │
   ├── Redis
   │
   └── Primary DB
```

Introduce leaderboard caching.

---

### Stage 3 — Read Scaling

If the database is still read-bound:

```text
                 ┌── Read Replica #1
                 │
Score API ───────┼── Read Replica #2
                 │
                 └── Primary DB
```

Route appropriate leaderboard reads to replicas.

---

### Stage 4 — Secondary Workloads

If analytics, notifications, or reporting create additional load:

```text
Score API
    ↓
Primary DB
    ↓
Event / Queue
    ├── Analytics
    ├── Notifications
    └── Reporting
```

Move secondary processing out of the synchronous request path.

---

### Stage 5 — Large-Scale Data Growth

If `score_events` becomes extremely large:

```text
Operational Database
        +
Partitioning
        +
Archival Storage
```

Partitioning and archival should be introduced based on measured storage and query behavior.

---

### Stage 6 — Extreme Write Contention

Only if the primary database remains the dominant bottleneck after the previous optimizations should more complex approaches be considered:

```text
Database partitioning
        ↓
Workload isolation
        ↓
Potential sharding
```

Sharding is not part of the initial architecture.

---

## 26. Scalability Trade-offs

### Strong Transactional Consistency

The score event and aggregate score are updated transactionally.

This limits write throughput compared with an eventually consistent architecture, but protects score correctness.

### Aggregate Score

Maintaining `user_scores` increases write complexity because every successful score event updates an aggregate row.

The trade-off is significantly cheaper leaderboard reads.

### Caching

Caching improves read performance but introduces potential short-lived staleness.

The database remains authoritative.

### Read Replicas

Read replicas improve read throughput but introduce replication lag.

They should therefore be used only for workloads that tolerate eventual consistency.

### Queues

Queues improve isolation and allow secondary workloads to scale independently.

However, introducing queues into the core score mutation path would complicate consistency and response semantics.

The initial design therefore keeps the core score mutation synchronous.

### Partitioning

Partitioning can improve management of very large event tables but adds operational complexity.

It should be introduced only when table size or query behavior justifies it.

### Sharding

Sharding can increase write capacity but significantly increases application and operational complexity.

It is considered a last-resort scaling strategy rather than part of the initial architecture.

---

## 27. Scalability Invariants

The following properties must remain true as the system scales:

1. The API remains stateless.
2. The database remains authoritative for score mutations.
3. The same business action cannot receive duplicate rewards.
4. Idempotency remains globally enforced across API instances.
5. `score_events` and `user_scores` remain transactionally consistent.
6. Leaderboard reads do not require recalculating the complete score-event history.
7. Cache data is never treated as the authoritative score source.
8. Secondary workloads do not block successful score persistence.
9. Scaling the API horizontally must not change scoring semantics.
10. Additional infrastructure must not weaken the core score consistency guarantees.

---

## 28. Summary

The initial Scoreboard architecture can scale incrementally without introducing unnecessary distributed-system complexity.

The recommended progression is:

```text
Stateless API
      ↓
Database indexes + aggregate score
      ↓
Leaderboard caching
      ↓
Read replicas
      ↓
Asynchronous secondary workloads
      ↓
Partitioning / archival
      ↓
Only if necessary:
advanced write scaling / sharding
```

The central principle is:

```text
Scale reads aggressively,
while protecting the transactional score-write boundary.
```

The database remains the source of truth for score correctness, while caching, replicas, queues, and other infrastructure are introduced only when measured workload characteristics justify them.
