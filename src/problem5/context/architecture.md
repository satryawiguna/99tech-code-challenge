# Problem 5 — Backend Architecture

## 1. Purpose

This document defines the backend architecture for Problem 5 based on the approved discovery, PRD, and domain model.

The architecture establishes the application boundaries, dependency direction, request flow, persistence boundary, error handling, validation strategy, testing strategy, and operational baseline before implementation begins.

The architecture is intentionally proportional to the challenge scope and recommended 16-hour duration.

---

## 2. Architectural Goals

The architecture should:

- provide a clear RESTful CRUD interface;
- keep the implementation simple and maintainable;
- separate HTTP concerns from application and domain logic;
- isolate persistence concerns behind an explicit boundary;
- make domain rules independently testable;
- support basic filtering;
- provide predictable error handling;
- make configuration environment-aware;
- provide a reasonable testing boundary;
- avoid infrastructure that is not justified by the challenge.

---

## 3. Architectural Constraints

The architecture must satisfy the following challenge constraints:

| Constraint           | Decision                 |
| -------------------- | ------------------------ |
| Backend framework    | ExpressJS                |
| Language             | TypeScript               |
| Interface            | RESTful CRUD API         |
| Persistence          | Simple database          |
| Filtering            | Basic resource filtering |
| Documentation        | `README.md`              |
| Recommended duration | 16 hours                 |

The challenge does not require:

- authentication;
- authorization;
- microservices;
- distributed infrastructure;
- real-time communication;
- external service integrations.

---

## 4. Architecture Style

The backend will use a **layered architecture with explicit dependency boundaries**.

Conceptually:

```text
HTTP / Interface Layer
        ↓
Application Layer
        ↓
Domain Layer

Application Layer
        ↓
Repository Abstraction
        ↑
Persistence Implementation
        ↓
SQLite
```

The architecture is intentionally not a full enterprise or microservice architecture.

The purpose of the layers is to keep responsibilities clear and make the code easier to test and evolve.

---

## 5. System Boundary

The system boundary is:

```text
Client
  │
  │ HTTP
  ▼
┌──────────────────────────────┐
│       Ticket API Service     │
│                              │
│  Interface / HTTP Layer      │
│             ↓                │
│  Application Layer           │
│             ↓                │
│  Domain Layer                │
│             ↓                │
│  Persistence Boundary        │
│             ↓                │
│  Persistence Implementation  │
└──────────────┬───────────────┘
               │
               ▼
          Simple Database
```

The Ticket API Service owns the Ticket application behavior and persistence required by the challenge.

User identity, authentication, and external support-system capabilities are outside this boundary.

---

## 6. Architectural Layers

### 6.1 Interface / HTTP Layer

Responsible for:

- Express application setup;
- routing;
- HTTP request handling;
- request parsing;
- request validation at the API boundary;
- mapping application results to HTTP responses;
- mapping application errors to HTTP responses.

The HTTP layer must not contain database access logic.

---

### 6.2 Application Layer

Responsible for application use cases:

```text
CreateTicket
ListTickets
GetTicket
UpdateTicket
DeleteTicket
```

The application layer coordinates:

- domain behavior;
- validation that belongs to use-case orchestration;
- repository operations;
- application-level error handling.

The application layer should not depend directly on Express request or response objects.

---

### 6.3 Domain Layer

Responsible for the meaning and invariants of `Ticket`.

The domain owns:

- Ticket entity semantics;
- Ticket status;
- Ticket priority;
- domain invariants;
- status validity without enforcing a strict transition matrix;
- priority constraints while allowing client-provided priority values;
- domain rules;
- mutable versus immutable attributes.

The domain layer must not depend on Express or a specific database technology.

---

### 6.4 Persistence Boundary

The application layer communicates with persistence through repository abstractions.

Conceptually:

```text
Application
    ↓
TicketRepository
    ↓
Repository Implementation
    ↓
Database
```

The repository abstraction defines the persistence operations required by the application.

The implementation details of the selected database remain outside the domain layer.

---

### 6.5 Persistence Implementation

Responsible for:

- database connection;
- queries;
- mapping database records to application/domain representations;
- persistence operations;
- migrations or schema initialization;
- database-specific behavior.

The persistence implementation must preserve the domain invariants.

---

## 7. Dependency Direction

Dependencies should flow toward stable business/application abstractions rather than toward infrastructure details.

Preferred direction:

```text
HTTP
  ↓
Application
  ↓
Domain
```

and:

```text
Application
  ↓
Repository Abstraction
  ↑
Repository Implementation
  ↓
Database
```

The application should depend on a repository contract rather than directly importing a database client into use-case code.

The domain should remain independent of:

- ExpressJS;
- the selected database;
- ORM/query-builder APIs;
- HTTP status codes.

---

## 8. Request Processing Flow

A typical create request follows:

```text
Client
  │
  │ POST /api/v1/tickets
  ▼
Router
  │
  ▼
Request Validation
  │
  ▼
CreateTicket Use Case
  │
  ▼
Ticket Domain Rules
  │
  ▼
TicketRepository
  │
  ▼
Database
  │
  ▼
Application Result
  │
  ▼
HTTP Response
  │
  ▼
Client
```

A list request follows:

```text
Client
  │
  │ GET /api/v1/tickets?status=open&priority=high
  ▼
Router
  │
  ▼
Query Validation
  │
  ▼
ListTickets Use Case
  │
  ▼
TicketRepository
  │
  ▼
Database
  │
  ▼
Application Result
  │
  ▼
HTTP Response
```

---

## 9. Project Structure

The initial implementation structure is expected to follow these boundaries:

```text
src/problem5/
├── interface/
│   └── http/
│       ├── routes/
│       ├── controllers/
│       ├── schemas/
│       └── middleware/
│
├── application/
│   ├── use-cases/
│   └── ports/
│
├── domain/
│   └── ticket/
│
├── infrastructure/
│   └── persistence/
│       ├── database/
│       └── repositories/
│
└── shared/
    ├── errors/
    └── config/
```

This structure is a proposed implementation boundary.

The exact file names and framework-specific organization may be adjusted during implementation if the resulting structure remains consistent with the architectural responsibilities.

---

## 10. Use-Case Boundary

The initial application use cases are:

```text
CreateTicket
ListTickets
GetTicket
UpdateTicket
DeleteTicket
```

Each use case should have a focused responsibility.

For example:

```text
CreateTicket
    ↓
validate application input
    ↓
create domain-valid Ticket
    ↓
persist Ticket
    ↓
return result
```

The use cases should not contain Express-specific code.

---

## 11. Repository Boundary

The application layer requires a Ticket repository abstraction.

Conceptually:

```text
TicketRepository

+ create()
+ findById()
+ findMany()
+ update()
+ delete()
```

The exact interface signature is an implementation-level detail to be defined during execution planning.

Filtering parameters required by `ListTickets` should be represented through application-level types rather than database-specific query objects.

---

## 12. Validation Strategy

Validation occurs at appropriate boundaries.

### HTTP Validation

The HTTP layer validates:

- request body shape;
- query parameter shape;
- parameter format;
- basic input constraints.

### Domain Validation

The domain protects:

- valid status values;
- valid priority values;
- required domain attributes;
- immutable attributes;
- initial status behavior;
- absence of a strict status-transition matrix;
- domain constraints on client-provided priority values.

### Persistence Validation

The persistence layer and database should provide appropriate constraints for:

- required values;
- identifier uniqueness;
- supported enum values where practical;
- timestamp consistency where practical.

Validation must not rely exclusively on the HTTP layer because domain invariants must remain protected regardless of the caller.

---

## 13. Error Handling Strategy

Errors should be handled according to their responsibility.

Conceptually:

```text
Domain / Application Error
          ↓
Application Layer
          ↓
HTTP Error Mapping
          ↓
HTTP Response
```

Examples:

| Condition                 | Expected API behavior       |
| ------------------------- | --------------------------- |
| Invalid request data      | `400 Bad Request`           |
| Ticket does not exist     | `404 Not Found`             |
| Unexpected server failure | `500 Internal Server Error` |

The final error response schema and error codes will be defined in the API contract.

Internal error details must not be exposed to clients unnecessarily.

---

## 14. Persistence Strategy

The application will use a simple persistent database appropriate for the challenge.

SQLite is the selected persistence technology, as defined by the database design.

The selection is based on:

- simplicity;
- local development experience;
- TypeScript/Node.js compatibility;
- persistence requirements;
- testing convenience;
- implementation time.

The persistence design must support:

- Ticket creation;
- Ticket retrieval;
- Ticket listing;
- status filtering;
- priority filtering;
- Ticket updates;
- Ticket deletion.

---

## 15. Transaction Boundary

The initial CRUD operations do not require complex multi-step transactions.

A single Ticket create or update should be persisted atomically by the database operation.

No distributed transaction mechanism is required.

If the selected persistence implementation requires an explicit transaction for a particular operation, that transaction should remain local to the persistence boundary.

---

## 16. Configuration Strategy

Environment-specific configuration should be supplied through environment variables or an equivalent configuration mechanism.

Configuration may include:

```text
DATABASE_URL
PORT
NODE_ENV
```

The application should provide safe development defaults where appropriate, but production-sensitive values must not be hard-coded into source code.

The final environment variable names will be defined during implementation setup.

---

## 17. API Versioning

The initial API will use:

```text
/api/v1/tickets
```

Versioning is kept at the API boundary.

The domain and application layers should not depend on the URL version.

This allows future API evolution without requiring the domain model to become aware of HTTP routing concerns.

---

## 18. Testing Architecture

Testing will be organized around behavior and architectural boundaries.

### Domain Tests

Verify:

- Ticket invariants;
- valid status values;
- valid priority values;
- initial status behavior;
- immutable attributes.

### Application Tests

Verify:

- create behavior;
- list behavior;
- filtering;
- get behavior;
- update behavior;
- delete behavior;
- missing Ticket behavior.

### Integration Tests

Verify:

- repository behavior;
- database persistence;
- database filtering;
- persistence error handling where practical.

### API Tests

Verify:

- HTTP methods and routes;
- request validation;
- HTTP status codes;
- response structure;
- error mapping.

The exact testing framework is an implementation-level detail to be selected during execution planning.

---

## 19. Security Baseline

The challenge does not require authentication or authorization.

The baseline security responsibilities are therefore focused on the API boundary:

- validate all external input;
- avoid exposing internal errors;
- avoid hard-coded secrets;
- use parameterized database operations or safe query mechanisms;
- apply reasonable request-size limits;
- keep dependencies reasonably current;
- avoid returning unnecessary internal data.

No authentication subsystem will be introduced unless a later requirement explicitly requires it.

---

## 20. Observability Baseline

The service should provide sufficient logging for local development and basic troubleshooting.

At minimum, the application should be able to identify:

- application startup failures;
- database connection failures;
- unexpected request failures.

Logging must not expose secrets or sensitive configuration values.

A full centralized observability stack is out of scope for this challenge.

---

## 21. Scalability Considerations

The expected workload does not justify distributed infrastructure.

The initial architecture should therefore favor:

```text
Simple API Service
        ↓
Simple Persistent Database
```

The architecture should nevertheless avoid unnecessary coupling that would make future evolution difficult.

Potential future scaling options, if requirements grow, could include:

- database indexing;
- connection pooling;
- horizontal API instances;
- caching;
- asynchronous processing.

These are future considerations, not implementation requirements for P5.

---

## 22. Explicit Non-Goals

The architecture intentionally does not introduce:

- microservices;
- event-driven architecture;
- message brokers;
- distributed caching;
- Kubernetes;
- service mesh;
- distributed transactions;
- authentication servers;
- authorization services;
- external identity providers;
- real-time WebSocket infrastructure;
- centralized observability platforms.

These technologies are not justified by the current challenge requirements.

---

## 23. Architecture Decision Summary

| Decision                   | Status       | Rationale                                        |
| -------------------------- | ------------ | ------------------------------------------------ |
| ExpressJS                  | Confirmed    | Challenge requirement                            |
| TypeScript                 | Confirmed    | Challenge requirement                            |
| REST API                   | Selected     | Appropriate for CRUD interface                   |
| Layered architecture       | Selected     | Clear responsibilities with limited complexity   |
| Application use cases      | Selected     | Separates HTTP concerns from business operations |
| Ticket domain boundary     | Confirmed    | Defined by domain model                          |
| Repository abstraction     | Selected     | Isolates persistence from application logic      |
| Simple database            | Confirmed    | Challenge requirement                            |
| `/api/v1` versioning       | Selected     | Provides a clear API boundary                    |
| Status transition matrix   | Not enforced | CRUD scope does not require workflow rules       |
| Authentication             | Out of scope | Not required by challenge                        |
| Microservices              | Out of scope | Not justified by challenge scope                 |
| Distributed infrastructure | Out of scope | Not justified by expected workload               |

---

## 24. Traceability to Discovery, PRD, and Domain

| Architecture Decision      | Source                           |
| -------------------------- | -------------------------------- |
| ExpressJS backend          | Discovery `CR-01` / `FR-01`      |
| TypeScript                 | Discovery `CR-02` / `FR-02`      |
| CRUD use cases             | Discovery `FR-03` to `FR-07`     |
| Basic filtering            | PRD / Discovery `FR-04`          |
| Ticket as primary resource | PRD / Domain Section 2           |
| Ticket invariants          | Domain Section 7                 |
| Initial status `open`      | Domain `DR-04`                   |
| Status transition policy   | Domain Section 6                 |
| Status values              | Domain `DR-05`                   |
| Priority values            | Domain `DR-06`                   |
| Simple persistence         | Discovery `FR-08` / PRD          |
| No authentication          | Discovery `A-04` / PRD           |
| Single service             | Discovery `A-02`                 |
| Proportional architecture  | Discovery Engineering Principles |

Architecture decisions in this document must not contradict the approved discovery or domain model.

---

## 25. Architecture Decision Record

The architecture establishes the following overall structure:

```text
                    Client
                       │
                       ▼
              ┌────────────────┐
              │  HTTP / API    │
              │    Layer       │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  Application   │
              │    Layer       │
              │                │
              │ CreateTicket   │
              │ ListTickets    │
              │ GetTicket      │
              │ UpdateTicket   │
              │ DeleteTicket   │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  Domain Layer  │
              │    Ticket      │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │   Repository   │
              │   Abstraction  │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  Persistence   │
              │ Implementation │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │    Database    │
              └────────────────┘
```

The architecture deliberately keeps the system as a single service while maintaining boundaries that support testing and future evolution.

---

## 26. Next Phase

Once this architecture is approved, the next phase is to define the concrete contracts:

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

The API contract must consume the domain and architecture decisions rather than independently redefining them.

The database design must preserve the domain invariants and support the application use cases defined by this architecture.
