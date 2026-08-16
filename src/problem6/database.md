# Scoreboard Database Design

## 1. Purpose

This document defines the persistence model for the Scoreboard API.

The design focuses on:

- maintaining an auditable score history;
- preventing duplicate score rewards;
- maintaining a fast aggregate score for leaderboard queries;
- keeping score updates transactionally consistent;
- separating user identity ownership from the Score Service;
- keeping scoring rules under server-side control.

The database model is designed to support the API contract defined in `openapi.yaml`.

---

## 2. Data Ownership

The Score Service does not own the complete user identity lifecycle.

### External Identity/User Domain

The Identity/User domain is responsible for:

- user registration;
- authentication;
- user identity;
- account lifecycle;
- authoritative user profile data.

The Score Service only requires the authenticated user identifier and a minimal user profile projection for leaderboard presentation.

### Score Service

The Score Service owns:

- action definitions used for scoring;
- score events;
- aggregate user scores;
- the leaderboard read model;
- idempotency state required to safely process retries.

---

## 3. Logical Data Model

The Score Service uses four core domain data sets and one request-processing data set:

```text
┌──────────────────────────┐
│    action_definitions    │
├──────────────────────────┤
│ id                       │
│ code                     │
│ name                     │
│ points                   │
│ is_active                │
│ created_at               │
│ updated_at               │
└────────────┬─────────────┘
             │
             │ 1:N
             ▼
┌──────────────────────────┐
│      score_events        │
├──────────────────────────┤
│ id                       │
│ user_id                  │
│ action_definition_id     │
│ reference_id             │
│ points                   │
│ created_at               │
└────────────┬─────────────┘
             │
             │ N:1
             ▼
┌──────────────────────────┐
│       user_scores        │
├──────────────────────────┤
│ user_id                  │
│ total_score              │
│ updated_at               │
└──────────────────────────┘

┌──────────────────────────┐
│      user_profiles       │
├──────────────────────────┤
│ user_id                  │
│ display_name             │
│ updated_at               │
└──────────────────────────┘

┌──────────────────────────┐
│   idempotency_records    │
├──────────────────────────┤
│ id                       │
│ user_id                  │
│ idempotency_key          │
│ request_hash             │
│ status                   │
│ response_status          │
│ response_body            │
│ created_at               │
│ expires_at               │
└──────────────────────────┘
```

`user_profiles` is a read-oriented projection and is not the authoritative user database.

`idempotency_records` is a request-processing data set rather than a score domain entity. Its lifecycle is independent from the immutable `score_events` ledger.

---

## 4. Table: `action_definitions`

Stores server-side definitions of actions that can produce scores.

### Columns

| Column       | Type              | Constraints      | Description                                       |
| ------------ | ----------------- | ---------------- | ------------------------------------------------- |
| `id`         | UUID / identifier | PK               | Internal immutable identifier                     |
| `code`       | VARCHAR(100)      | UNIQUE, NOT NULL | Business-facing action identifier                 |
| `name`       | VARCHAR(255)      | NOT NULL         | Human-readable action name                        |
| `points`     | INTEGER           | NOT NULL, >= 0   | Number of points awarded                          |
| `is_active`  | BOOLEAN           | NOT NULL         | Whether the action can currently generate rewards |
| `created_at` | TIMESTAMP         | NOT NULL         | Creation timestamp                                |
| `updated_at` | TIMESTAMP         | NOT NULL         | Last update timestamp                             |

### Example

```text
id:         act-001
code:       ACTION_COMPLETED
name:       Complete Action
points:     10
is_active:  true
```

### Constraints

```text
UNIQUE(code)
```

The `code` is exposed indirectly through the API as `actionType`.

The client never controls the `points` value.

### Lifecycle

Action definitions that have been referenced by score events must not be physically deleted.

Instead, they should be deactivated by setting:

```text
is_active = false
```

This preserves the historical relationship between score events and the action definition that produced them.

A new definition should receive a new immutable `id` if the business meaning of an existing action changes significantly.

---

## 5. Table: `score_events`

`score_events` is the immutable score ledger.

Every successful score-producing action creates one record.

### Columns

| Column                 | Type              | Constraints    | Description                                       |
| ---------------------- | ----------------- | -------------- | ------------------------------------------------- |
| `id`                   | UUID / identifier | PK             | Unique score event identifier                     |
| `user_id`              | UUID / identifier | NOT NULL       | Authenticated user identifier                     |
| `action_definition_id` | UUID / identifier | FK, NOT NULL   | Action definition used to calculate the reward    |
| `reference_id`         | VARCHAR(255)      | NOT NULL       | Identifier of the rewarded domain action/resource |
| `points`               | INTEGER           | NOT NULL, >= 0 | Points actually awarded                           |
| `created_at`           | TIMESTAMP         | NOT NULL       | Event creation timestamp                          |

### Business uniqueness

The following combination must be unique:

```text
(user_id, action_definition_id, reference_id)
```

This represents the identity of a rewardable business action.

For example:

```text
user-123
+
ACTION_COMPLETED
+
action-456
```

can generate only one score reward.

This constraint must be enforced at the database level.

---

## 6. Why Score Events Are Immutable

The score event acts as the audit ledger.

For example:

```text
ACTION_COMPLETED       +10
ACHIEVEMENT_UNLOCKED   +50
PURCHASE_COMPLETED     +100
```

The event records the points that were actually awarded at the time the event was created.

Historical score events should not be silently modified when the current scoring configuration changes.

If an administrative correction is required, the system should use a dedicated correction workflow or compensating mechanism rather than mutating the original historical event.

---

## 7. Table: `user_scores`

`user_scores` stores the current aggregate score for each user.

### Columns

| Column        | Type              | Constraints    | Description                   |
| ------------- | ----------------- | -------------- | ----------------------------- |
| `user_id`     | UUID / identifier | PK             | Authenticated user identifier |
| `total_score` | BIGINT            | NOT NULL, >= 0 | Current aggregate score       |
| `updated_at`  | TIMESTAMP         | NOT NULL       | Last score update timestamp   |

### Purpose

This table is a materialized aggregate used to serve leaderboard queries efficiently.

Instead of calculating the total score from the entire `score_events` table for every leaderboard request, the API reads the already-maintained aggregate.

---

## 8. Table: `user_profiles`

The Score Service maintains a minimal read projection of user profile information required by the leaderboard.

### Example columns

| Column         | Type              | Constraints | Description                          |
| -------------- | ----------------- | ----------- | ------------------------------------ |
| `user_id`      | UUID / identifier | PK          | External user identifier             |
| `display_name` | VARCHAR(255)      | NOT NULL    | Display name used by the leaderboard |
| `updated_at`   | TIMESTAMP         | NOT NULL    | Projection update timestamp          |

The authoritative user profile remains owned by the Identity/User domain.

The projection exists to avoid requiring a synchronous user-service request for every leaderboard row.

---

## 9. Idempotency Records

The Score Service maintains idempotency state to safely handle client retries and prevent the same idempotent request from being processed more than once.

### Columns

| Column            | Type              | Constraints | Description                                |
| ----------------- | ----------------- | ----------- | ------------------------------------------ |
| `id`              | UUID / identifier | PK          | Unique idempotency record identifier       |
| `user_id`         | UUID / identifier | NOT NULL    | Authenticated user identifier              |
| `idempotency_key` | VARCHAR(128)      | NOT NULL    | Client-provided idempotency key            |
| `request_hash`    | VARCHAR(128)      | NOT NULL    | Hash of the normalized request payload     |
| `status`          | VARCHAR(20)       | NOT NULL    | Current idempotency processing state       |
| `response_status` | INTEGER           | NULL        | HTTP status of the original response       |
| `response_body`   | JSON / JSONB      | NULL        | Original response payload                  |
| `created_at`      | TIMESTAMP         | NOT NULL    | Record creation timestamp                  |
| `expires_at`      | TIMESTAMP         | NOT NULL    | Expiration timestamp for idempotency state |

### Status

The idempotency record uses the following states:

| Status       | Description                                                                      |
| ------------ | -------------------------------------------------------------------------------- |
| `PROCESSING` | The request has claimed the idempotency key and is currently being processed     |
| `COMPLETED`  | The request has completed successfully and the original response has been stored |
| `FAILED`     | The request has completed with a replayable application-level failure response   |

### Constraints

```text
UNIQUE(user_id, idempotency_key)
```

The `request_hash` is used to detect reuse of an idempotency key with a different request payload.

For a new request, the service attempts to create an idempotency record with:

```text
status = PROCESSING
```

The creation is performed atomically using the database uniqueness constraint.

If the record is successfully created, the request owns the idempotency key and may continue processing.

If the same user sends the same idempotency key again:

- `COMPLETED` → return the stored original response;
- `PROCESSING` → return `409 IDEMPOTENCY_REQUEST_IN_PROGRESS`;
- `FAILED` → return the stored replayable failure response.

If the same user reuses an idempotency key with a different request payload, as determined by `request_hash`, the API returns:

```text
409 IDEMPOTENCY_KEY_REUSED
```

### Response Fields

`response_status` and `response_body` are nullable while the request is in the `PROCESSING` state.

Example:

```text
PROCESSING
response_status = NULL
response_body   = NULL
```

After successful processing:

```text
COMPLETED
response_status = 201
response_body   = <original response>
```

After a replayable application-level failure:

```text
FAILED
response_status = <original error status>
response_body   = <original error response>
```

Authentication and request-validation failures occur before an idempotency record is created and therefore are not persisted as idempotency results.

### Expiration

Idempotency records may be expired and removed after the configured retention period.

Records in `PROCESSING` state must not normally expire because the idempotency record and score mutation are handled within the same transaction boundary. An unexpected database or system failure rolls the transaction back.

---

## 10. Relationships

### Action Definition → Score Events

```text
action_definitions.id
        │
        │ 1
        │
        │ N
        ▼
score_events.action_definition_id
```

A single action definition can be referenced by many score events.

### User → Score Events

```text
user
 │
 │ 1
 │
 │ N
 ▼
score_events
```

The `user_id` references the identity owned by the external Identity/User domain.

Depending on service ownership and deployment boundaries, this may not be implemented as a physical cross-service foreign key.

### User → Aggregate Score

```text
user
 │
 │ 1
 │
 │ 1
 ▼
user_scores
```

Each user has at most one aggregate score record.

---

## 11. Indexes

### Action Definitions

```text
UNIQUE INDEX on action_definitions(code)
```

Used to resolve:

```text
actionType
    ↓
action definition
```

### Score Events

```text
UNIQUE INDEX
(
    user_id,
    action_definition_id,
    reference_id
)
```

This is the primary database-level duplicate reward protection.

Additional indexes may be introduced for audit/history queries, depending on actual query requirements.

### User Scores

The leaderboard requires deterministic ordering:

```sql
ORDER BY total_score DESC, user_id ASC
LIMIT 10
```

Therefore the database should maintain an index supporting:

```text
(total_score DESC, user_id ASC)
```

The exact index syntax depends on the selected database engine.

---

## 12. Score Update Transaction

A new score-producing request must persist the idempotency record, score event, and aggregate score atomically within the same database transaction.

The idempotency key is protected by:

```text
UNIQUE(user_id, idempotency_key)
```

Conceptually:

```text
BEGIN TRANSACTION

    Create idempotency record
    status = PROCESSING

    Insert score event

    Update aggregate user score

    Update idempotency record
    status = COMPLETED
    response_status = 201
    response_body = <original response>

COMMIT
```

If an expected application-level failure occurs after the idempotency record has been created, the transaction may persist the idempotency record as:

```text
FAILED
```

along with the replayable error response.

If an unexpected infrastructure or database failure occurs:

```text
ROLLBACK
```

The idempotency record, score event, and aggregate score update are rolled back together.

If the idempotency record already exists for the same `(user_id, idempotency_key)`, the service must inspect the existing record and compare its `request_hash`.

---

## 13. Duplicate Reward Protection

Duplicate protection operates at multiple layers.

### Layer 1 — Idempotency

The API requires:

```text
Idempotency-Key
```

The service atomically claims the key using:

```text
UNIQUE(user_id, idempotency_key)
```

The idempotency record tracks the processing lifecycle:

```text
PROCESSING
    ↓
COMPLETED
```

or:

```text
PROCESSING
    ↓
FAILED
```

The same key with the same request is replayed according to the stored idempotency response.

The same key with a different request payload is rejected.

A request that encounters an existing `PROCESSING` record must not create another score event.

### Layer 2 — Business Uniqueness

The database enforces:

```text
UNIQUE(
    user_id,
    action_definition_id,
    reference_id
)
```

This protects against concurrent requests using different idempotency keys.

### Layer 3 — Transactional Update

The score event insertion and aggregate score update occur in the same database transaction.

Together these controls provide defense in depth.

---

## 14. Concurrent Request Scenario

Consider two requests arriving simultaneously for the same business action:

```text
Request A ─────────────┐
                       ├── user-123 / ACTION_COMPLETED / action-123
Request B ─────────────┘
```

Both requests may attempt to claim separate idempotency keys and process the same business action.

The business uniqueness constraint is the final protection.

Only one transaction can successfully create:

```text
(user_id, action_definition_id, reference_id)
```

The competing transaction receives a uniqueness conflict and must not award additional points.

The API returns:

```text
409 ACTION_ALREADY_REWARDED
```

rather than awarding the points twice.

---

## 15. Leaderboard Query

The leaderboard should read from `user_scores` rather than recalculating totals from `score_events`.

Conceptually:

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

The final query syntax may vary depending on the database engine.

The important properties are:

- aggregate scores are read from `user_scores`;
- results are ordered deterministically;
- no full score-event aggregation is required for each request;
- only the top 10 records are returned.

---

## 16. Consistency Model

The `score_events` ledger and `user_scores` aggregate are maintained within the same transaction.

The idempotency record that belongs to the successful request is committed as part of the same transaction.

Therefore the Score Service provides strong consistency between the idempotency state, score event, and aggregate score within the transaction boundary.

The `user_profiles` projection may be eventually consistent with the authoritative Identity/User domain.

A temporary stale display name does not affect score correctness.

---

## 17. Scoring Rule Changes

Historical `score_events.points` values represent points awarded at the time of the event.

Changing:

```text
action_definitions.points
```

must not rewrite historical score events.

For example:

```text
Before:
ACTION_COMPLETED = 10

Event A → 10 points

After configuration change:
ACTION_COMPLETED = 20

Event B → 20 points
```

Event A remains:

```text
10 points
```

This preserves the auditability of the score ledger.

---

## 18. Data Ownership Summary

| Data                    | Owner                | Purpose                                    |
| ----------------------- | -------------------- | ------------------------------------------ |
| User identity           | Identity/User domain | Authentication and authoritative user data |
| User profile projection | Score Service        | Leaderboard display                        |
| Action definitions      | Score/Domain service | Server-side scoring rules                  |
| Score events            | Score Service        | Immutable score ledger                     |
| User scores             | Score Service        | Current aggregate / leaderboard read model |
| Idempotency records     | Score Service        | Request deduplication and retry handling   |

---

## 19. Design Trade-offs

### Event Ledger + Aggregate

Maintaining both `score_events` and `user_scores` introduces additional write complexity compared with calculating scores directly from the event table.

The trade-off is intentional:

```text
More complex writes
        ↓
Much cheaper leaderboard reads
```

This is appropriate because leaderboard reads are expected to be frequent.

### User Profile Projection

Maintaining a user profile projection introduces eventual consistency for display information.

The trade-off avoids synchronous cross-service dependencies on every leaderboard request and prevents an N+1 service-call pattern.

### Database Uniqueness

The unique business constraint adds an index and therefore some write overhead.

This is intentional because duplicate reward prevention is a correctness requirement, not merely an optimization.

### Idempotency State

Persisting idempotency state introduces additional storage and transaction work.

The trade-off is intentional because safely handling retries is important for a score-mutating API. The stored request hash also allows the service to reject reuse of an idempotency key for a different request.

---

## 20. Summary

The persistence model separates four important concerns:

1. `score_events` provides the immutable audit history.
2. `user_scores` provides an efficient aggregate for leaderboard reads.
3. `action_definitions` controls scoring rules on the server side.
4. `idempotency_records` protects score mutations from duplicate client retries.

Duplicate rewards are prevented through multiple layers:

```text
Idempotency
     +
Business uniqueness constraint
     +
Database transaction
```

The resulting design prioritizes score correctness, auditability, and efficient leaderboard reads while keeping authentication and authoritative user management outside the Score Service boundary.
