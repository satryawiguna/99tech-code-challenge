# Problem 5 — Claude Code Instructions

## 1. Purpose

This file defines the working instructions for Claude Code when working on Problem 5.

The project uses a structured AI-assisted engineering workflow. Claude is expected to use the approved engineering context as the source of truth and to support implementation without taking ownership of product or architectural decisions.

The objective is to demonstrate AI-assisted engineering, not to delegate engineering ownership to AI.

---

## 2. Project Context

The approved engineering context is stored under:

```text
src/problem5/context/
├── discovery.md
├── prd.md
├── domain.md
├── architecture.md
├── api-contract.md
└── database.md
```

The context has the following dependency order:

```text
Discovery
    ↓
PRD
    ↓
Domain
    ↓
Architecture
    ↓
API Contract
    ↓
Database Design
```

Read the relevant context documents before making implementation decisions.

Do not invent requirements that are not supported by the context.

---

## 3. Context Responsibilities

Each context document has a distinct responsibility.

### `discovery.md`

Defines:

- challenge requirements;
- constraints;
- assumptions;
- ambiguities;
- engineering decisions;
- scope boundaries;
- derived engineering requirements.

Do not present an engineering decision as if it were a requirement from the challenge.

### `prd.md`

Defines:

- product purpose;
- product goals;
- product scope;
- primary resource;
- product behavior;
- product-level success criteria.

### `domain.md`

Defines:

- Ticket semantics;
- domain attributes;
- domain invariants;
- status;
- priority;
- lifecycle semantics;
- mutable and immutable attributes.

### `architecture.md`

Defines:

- system boundaries;
- architectural style;
- layer responsibilities;
- dependency direction;
- application use cases;
- repository boundary;
- validation;
- error handling;
- testing architecture;
- security baseline.

### `api-contract.md`

Defines:

- HTTP endpoints;
- request and response contracts;
- filtering;
- HTTP status codes;
- error responses;
- API versioning;
- externally observable API behavior.

### `database.md`

Defines:

- SQLite persistence;
- schema;
- columns;
- constraints;
- indexes;
- persistence mappings;
- transaction boundary;
- database-specific responsibilities.

---

## 4. Decision Ownership

Human engineering decisions remain authoritative.

Use this workflow:

```text
AI proposes
    ↓
Human evaluates
    ↓
Human decides
    ↓
AI implements
    ↓
AI verifies/reviews
    ↓
Human verifies
```

Do not silently change an approved requirement, domain rule, architectural decision, API contract, or database decision.

If implementation reveals a conflict with approved context:

1. Stop before silently changing the context.
2. Identify the conflict.
3. Explain the impact.
4. Propose the smallest reasonable resolution.
5. Wait for the engineering decision before changing an approved context document.

---

## 5. Context Is the Source of Truth

Before implementation:

- Read the relevant context documents.
- Check dependencies between decisions.
- Reuse established terminology.
- Respect established scope boundaries.
- Do not redefine decisions in code.

If a requirement is unspecified, classify it as an implementation-level detail unless resolving it requires changing an approved product, domain, architecture, API, or database decision.

Do not create new requirements merely to make implementation easier.

---

## 6. Implementation Planning

Implementation planning is an execution activity derived from the approved context.

It is not part of the permanent context sequence.

The execution flow is:

```text
Stable Context
    ↓
Execution Planning
    ↓
Human Approval
    ↓
Implementation
    ↓
Testing
    ↓
Review
```

An implementation plan may define:

- implementation phases;
- tasks;
- dependencies;
- files/modules;
- implementation order;
- acceptance checks;
- test requirements.

The Planner presents this plan as a concise draft in chat for human approval rather than persisting it as a permanent file. The draft must not redefine the approved product or architecture.

If planning discovers a genuine design problem, return to the relevant context document and obtain a deliberate decision before implementation.

---

## 7. Implementation Principles

### Follow the Architecture

Keep responsibilities within their documented layers.

Prefer:

```text
HTTP
  ↓
Application
  ↓
Domain

Application
  ↓
Repository Abstraction
  ↑
Persistence Implementation
  ↓
SQLite
```

Do not introduce direct database access into domain logic.

Do not place business rules inside HTTP controllers when those rules belong to the domain or application layer.

### Respect the Domain

The primary resource is:

```text
Ticket
```

Supported status values:

```text
open
in_progress
resolved
closed
```

Supported priority values:

```text
low
medium
high
```

New Tickets start with:

```text
status = open
```

Do not introduce a strict status-transition matrix unless the approved context is deliberately changed.

### Respect the API Contract

The API is versioned under:

```text
/api/v1
```

The core endpoints are:

```text
POST   /api/v1/tickets
GET    /api/v1/tickets
GET    /api/v1/tickets/:id
PATCH  /api/v1/tickets/:id
DELETE /api/v1/tickets/:id
```

The supported collection filters are:

```text
status
priority
```

When both filters are provided, they are combined using AND semantics.

Do not change externally observable API behavior without updating the approved API contract.

### Respect Persistence Boundaries

The selected persistence technology is:

```text
SQLite
```

Persistence access must go through the repository boundary.

Application code should not depend directly on SQLite-specific APIs.

### Respect Server-Controlled Fields

The following are server-controlled:

```text
id
createdAt
updatedAt
```

A newly created Ticket also receives:

```text
status = open
```

Do not trust client input for server-controlled values.

---

## 8. Validation and Error Handling

Validate external input at the HTTP boundary.

Domain rules must remain protected by the domain/application boundaries.

Expected API behavior includes:

```text
400 Bad Request
404 Not Found
500 Internal Server Error
```

Do not expose:

- stack traces;
- database internals;
- secrets;
- unnecessary internal implementation details.

Use consistent error handling as defined by the API contract.

---

## 9. Testing

Tests must verify behavior rather than merely implementation details.

Where appropriate, cover:

### Domain

- Ticket invariants;
- status;
- priority;
- initial status;
- immutable fields.

### Application

- create;
- list;
- filtering;
- get;
- update;
- delete;
- missing Ticket behavior.

### Persistence

- SQLite repository behavior;
- persistence;
- filtering;
- constraints.

### API

- routes;
- request validation;
- response structure;
- HTTP status codes;
- error mapping.

Use the testing architecture defined in `architecture.md`.

The exact testing framework is an implementation-level decision.

---

## 10. Security Baseline

At minimum:

- validate all external input;
- use safe/parameterized database operations;
- do not hard-code secrets;
- do not expose internal errors;
- apply reasonable request-size limits;
- avoid returning unnecessary internal data;
- keep dependencies reasonably current.

Authentication and authorization are outside the current Problem 5 scope unless the approved context is deliberately changed.

---

## 11. Scope Control

Problem 5 is intentionally proportional to the challenge.

Do not introduce unnecessary infrastructure such as:

- microservices;
- message brokers;
- distributed caching;
- Kubernetes;
- service mesh;
- distributed transactions;
- real-time WebSockets;
- centralized observability platforms;
- authentication services;
- external identity providers.

Do not expand the Ticket domain with features such as comments, attachments, notifications, or workflow automation unless the approved product scope is changed.

Prefer the simplest solution that satisfies the approved requirements and architecture.

---

## 12. AI-Assisted Engineering Rules

Claude may assist with:

- implementation planning;
- code implementation;
- test generation;
- debugging;
- code review;
- security review;
- documentation.

Claude must not use AI output as a substitute for engineering judgment.

When proposing a new dependency, abstraction, infrastructure component, or architectural change:

1. Explain why it is needed.
2. Check whether the existing context already provides a solution.
3. Prefer the smallest solution appropriate to the challenge.
4. Do not add complexity solely to demonstrate AI orchestration.

Every agent or skill introduced into the workflow must have a clear reason to exist.

---

## 13. Skill Lifecycle

Skills are reusable procedures with separate responsibilities. Their use must
be proportional to the task rather than a mandatory ceremony.

For non-trivial work, start with:

```text
context-loader
    ↓
context-review
```

`context-loader` classifies the task and selects the minimum approved context.
`context-review` determines whether the task is aligned, ambiguous, conflicting,
or out of scope. The loader does not resolve conflicts, and the review does not
replace the loader.

Use focused validation only when relevant:

- `domain-validation` for Ticket semantics, invariants, or their enforcement path;
- `security-review` for HTTP input/error handling, SQLite/schema/query work,
  configuration, dependencies, request limits, or exposed API documentation;
- `testing` for behavior verification;
- `code-review` for an integrated final review;
- `implementation-planning` after context review and before material unplanned work.

Agents must report any unresolved context conflict to the human engineer. No
skill may silently amend approved context or override another document's
decision ownership.

---

## 14. Change Protocol

When modifying code:

1. Read the relevant context.
2. Identify the applicable architecture boundary.
3. Plan the change.
4. Implement the smallest appropriate change.
5. Run relevant tests.
6. Review the resulting diff.
7. Verify that the implementation still matches the approved context.

When a code change appears to require a context change:

```text
Implementation Finding
        ↓
Identify Context Conflict
        ↓
Human Decision
        ↓
Update Context if Approved
        ↓
Update Execution Plan
        ↓
Continue Implementation
```

Never silently change context to make an implementation pass.

---

## 15. Git and Engineering Milestones

Prefer meaningful engineering milestones over commits for every small change.

A typical progression is:

```text
Discovery
    ↓
PRD
    ↓
Domain
    ↓
Architecture
    ↓
API / Database
    ↓
Implementation Plan
    ↓
Implementation
    ↓
Tests
    ↓
Security / Quality Review
    ↓
Finalization
```

Each commit should represent a meaningful engineering state.

Before committing:

```bash
git diff --check
git status
```

Review the staged diff and ensure that unrelated changes are not included.

---

## 16. Definition of Done

A Problem 5 implementation is not complete merely because the server runs.

Before declaring completion, verify:

- approved context is respected;
- API contract is implemented;
- Ticket CRUD works;
- status filtering works;
- priority filtering works;
- SQLite persistence works;
- validation works;
- expected errors are handled;
- automated tests pass;
- security baseline is satisfied;
- README contains configuration and run instructions;
- no unnecessary infrastructure was introduced;
- final diff contains no accidental changes.

---

## 17. Final Rule

When uncertain, follow this priority:

```text
Challenge Requirement
        ↓
Approved Product Context
        ↓
Approved Domain / Architecture
        ↓
API Contract
        ↓
Database Design
        ↓
Execution Plan
        ↓
Implementation Detail
```

Do not reverse this hierarchy.

Implementation details must serve the approved engineering decisions, not redefine them.
