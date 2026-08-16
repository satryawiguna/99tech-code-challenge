# Scoreboard Security & Threat Model

## 1. Purpose

This document defines the security boundaries and primary threats for
the Scoreboard API.

The security design focuses on protecting score-producing operations
from:

- unauthorized access;
- user impersonation;
- client-side score manipulation;
- unauthorized action rewards;
- duplicate score rewards;
- replay attacks;
- idempotency-key misuse;
- invalid or malicious input.

The design follows a server-authoritative scoring model.

---

## 2. Security Boundaries

The main system boundaries are:

```text
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
       │ HTTPS
       │ JWT + request
       ▼
┌──────────────────────┐
│      Score API       │
├──────────────────────┤
│ Authentication       │
│ Authorization        │
│ Validation           │
│ Action verification  │
│ Score calculation    │
│ Idempotency          │
└──────────┬───────────┘
           │
           ├──────────────► Identity Provider
           │
           ├──────────────► Action/Domain Service
           │
           ▼
┌──────────────────────┐
│   Score Database     │
├──────────────────────┤
│ score_events         │
│ user_scores          │
│ action_definitions   │
│ user_profiles        │
│ idempotency_records  │
└──────────────────────┘
```

The client is considered untrusted.

The Score API is responsible for enforcing all security-sensitive
scoring rules.

---

## 3. Authentication

The API requires an authenticated identity for score-producing
operations.

The client sends:

```http
Authorization: Bearer <access-token>
```

The Score API validates the access token using the configured Identity
Provider.

The authenticated identity determines the user receiving the score.

The client must not be allowed to choose the authoritative `userId`
through the request body.

### Authentication failures

Invalid, expired, or otherwise unacceptable credentials result in:

```text
401 Unauthorized
```

No score mutation is performed.

---

## 4. Authorization

Authentication establishes who the user is.

Authorization determines whether the authenticated user is allowed to
perform the requested operation.

The Score API must ensure that:

```text
authenticated user
        =
user receiving the reward
```

A client must not be able to submit a score event for another user by
providing another user's identifier.

Administrative operations, action-definition management, and user
management are outside the scope of this API.

---

## 5. Server-Side Scoring

The client must never determine the number of points awarded.

The request contains:

```json
{
  "actionType": "ACTION_COMPLETED",
  "referenceId": "action-123"
}
```

The request does not contain:

```text
points
totalScore
```

The Score API resolves:

```text
actionType
    ↓
action_definitions.code
    ↓
configured points
```

For example:

```text
ACTION_COMPLETED
        ↓
action_definitions.points
        ↓
10 points
```

A malicious client attempting to submit:

```json
{
  "actionType": "ACTION_COMPLETED",
  "referenceId": "action-123",
  "points": 999999
}
```

must not affect the awarded score.

The server-side action definition remains authoritative.

---

## 6. Action Eligibility Verification

A valid action type alone is not sufficient evidence that a user should
receive points.

The Score API or relevant Action/Domain Service verifies that the
referenced action actually occurred and is eligible for scoring.

The verification considers:

```text
authenticated user
+
actionType
+
referenceId
```

The API must not blindly trust a client-provided `referenceId`.

For example, a client must not be able to claim:

```text
referenceId = payment-123
```

and automatically receive payment-related points without verifying that
the corresponding business action actually occurred.

---

## 7. Input Validation

All client-controlled input must be validated before processing.

The API validates:

- required fields;
- data types;
- string lengths;
- allowed action types;
- reference identifier format;
- idempotency key format;
- request structure.

Validation must follow the OpenAPI contract.

Invalid input results in:

```text
400 Bad Request
```

Validation errors must not result in score mutations.

---

## 8. Idempotency Protection

Score creation is a state-changing operation and must support safe
client retries.

The client provides:

```http
Idempotency-Key: <unique-key>
```

The key is scoped to the authenticated user:

```text
UNIQUE(user_id, idempotency_key)
```

The server stores a hash of the normalized request payload.

This prevents the same key from being reused for a different request.

### Same key + same request

The previously stored response is returned.

No additional score is awarded.

### Same key + different request

The API returns:

```text
409 IDEMPOTENCY_KEY_REUSED
```

### Existing request in progress

The API returns:

```text
409 IDEMPOTENCY_REQUEST_IN_PROGRESS
```

No additional score event is created.

---

## 9. Duplicate Business Action Protection

Idempotency keys do not replace business-level duplicate protection.

The database enforces:

```text
UNIQUE(
    user_id,
    action_definition_id,
    reference_id
)
```

This prevents a client from receiving the same business reward twice
using different idempotency keys.

For example:

```text
Request A

user-123
ACTION_COMPLETED
action-123
Idempotency-Key: key-A
```

and:

```text
Request B

user-123
ACTION_COMPLETED
action-123
Idempotency-Key: key-B
```

Only one request can create the corresponding score event.

The competing request receives:

```text
409 ACTION_ALREADY_REWARDED
```

---

## 10. Transactional Integrity

The following operations are performed atomically:

```text
Create idempotency record
        +
Insert score event
        +
Update user score
        +
Complete idempotency record
```

The successful operation commits all changes together.

An unexpected database or infrastructure failure causes:

```text
ROLLBACK
```

This prevents partial score mutations.

The system must not reach a state where:

```text
score_event exists
```

but:

```text
user_scores was not updated
```

or vice versa.

---

## 11. Score Ledger Protection

`score_events` is treated as an immutable audit ledger.

Normal application flows must not modify historical score events.

Historical points represent the points actually awarded at the time the
event occurred.

If a correction is required, the preferred mechanism is a compensating
score event rather than modifying the original historical record.

---

## 12. Database Constraint as Security Boundary

Application-level validation alone is not sufficient for correctness.

The database provides final protection for critical invariants.

### Idempotency

```text
UNIQUE(user_id, idempotency_key)
```

### Duplicate business action

```text
UNIQUE(
    user_id,
    action_definition_id,
    reference_id
)
```

These constraints protect against race conditions where multiple
requests pass application-level checks concurrently.

---

## 13. Replay Protection

A valid JWT does not automatically make every request replayable.

The Score API uses idempotency keys to safely handle network retries.

A replay using the same idempotency key and request payload returns the
original result.

A replay using the same idempotency key with a different payload is
rejected.

Business-level duplicate protection additionally prevents replaying the
same reward using a new idempotency key.

Therefore replay protection operates at two levels:

```text
Request replay
    ↓
Idempotency-Key

Business action replay
    ↓
Business uniqueness constraint
```

---

## 14. Sensitive Data Handling

The Score API should minimize the amount of sensitive information
stored in score-related tables.

`score_events` should contain only the information required to establish
the scoring event.

Authentication credentials, access tokens, and secrets must never be
stored in:

```text
score_events
user_scores
idempotency_records
```

The `Authorization` header must not be persisted in application logs.

---

## 15. Logging and Auditability

Security-relevant operations should produce structured application logs
without exposing credentials or sensitive tokens.

Useful fields include:

```text
requestId
authenticatedUserId
actionType
referenceId
idempotencyKey
result
duration
```

The actual access token must never be logged.

Idempotency keys should be treated as request identifiers rather than
authentication credentials.

Logs should not contain unnecessary personal or sensitive information.

---

## 16. Threat Model

### Threat 1 — Client Manipulates Points

```text
Attacker
   ↓
submits points = 999999
   ↓
Score API
```

#### Mitigation

Points are resolved exclusively from server-side action definitions.

---

### Threat 2 — User Impersonation

```text
Attacker
   ↓
submits another user's userId
```

#### Mitigation

The authoritative user identity is derived from the validated access
token.

The request body does not determine the score recipient.

---

### Threat 3 — Fake Action

```text
Attacker
   ↓
submits fabricated referenceId
   ↓
receives reward
```

#### Mitigation

The action must be verified by the relevant Action/Domain Service or
trusted domain state before points are awarded.

---

### Threat 4 — Duplicate Retry

```text
Network timeout
      ↓
Client retries request
      ↓
same Idempotency-Key
```

#### Mitigation

The existing idempotency record allows the original response to be
replayed without creating another score event.

---

### Threat 5 — Idempotency Key Reuse

```text
Request A
key = abc123
action = A

Request B
key = abc123
action = B
```

#### Mitigation

The stored request hash detects payload mismatch.

The API returns:

```text
409 IDEMPOTENCY_KEY_REUSED
```

---

### Threat 6 — Duplicate Business Reward

```text
Request A
key = key-A
action = X

Request B
key = key-B
action = X
```

#### Mitigation

The database uniqueness constraint on:

```text
(user_id, action_definition_id, reference_id)
```

prevents multiple rewards for the same business action.

---

### Threat 7 — Concurrent Requests

Two requests can pass application-level checks concurrently.

#### Mitigation

Database uniqueness constraints and transactional updates provide the
final consistency boundary.

---

### Threat 8 — Malformed Input

An attacker submits invalid or excessively large values.

#### Mitigation

Schema validation, type validation, length limits, and database
constraints reject invalid input before score mutation.

---

### Threat 9 — Token Leakage

An attacker attempts to obtain credentials through application logs.

#### Mitigation

Access tokens and authorization headers must never be written to
application logs.

---

## 17. Security Invariants

The following invariants must always hold:

1. Only authenticated users can submit score-producing requests.
2. The authenticated identity determines the user receiving the score.
3. The client cannot choose awarded points.
4. An action must be verified before points are awarded.
5. The same idempotency key cannot represent two different requests.
6. The same business action cannot receive the same reward twice.
7. Score mutations are performed transactionally.
8. Historical score events are immutable.
9. Access tokens are never persisted or logged.
10. Database constraints enforce critical duplicate-prevention rules.
11. A successful response is returned only after the transaction commits.

---

## 18. Security Summary

The Score API follows a server-authoritative security model:

```text
Authentication
      ↓
Authorization
      ↓
Input Validation
      ↓
Action Verification
      ↓
Server-side Point Calculation
      ↓
Idempotency Protection
      ↓
Business Duplicate Protection
      ↓
Transactional Persistence
      ↓
Auditable Score Event
```

The client is never trusted to determine:

```text
user identity
points
total score
action eligibility
```

Critical correctness rules are enforced both at the application layer
and at the database layer.
