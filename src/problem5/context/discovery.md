# Problem 5 — Discovery

## 1. Purpose

This document records the discovery findings, requirement traceability, assumptions, scope boundaries, and engineering decisions for Problem 5 of the 99Tech Code Challenge.

The purpose of discovery is to establish a clear understanding of the challenge before implementation begins.

The challenge does not prescribe a specific business domain or resource. Therefore, the domain selected in this document is an engineering decision made for the purpose of demonstrating a practical CRUD backend implementation.

---

## 2. Challenge Requirements

Based on the Problem 5 specification, the challenge requires:

- ExpressJS for the backend server.
- TypeScript.
- A set of CRUD interfaces that allow a user to interact with the service.
- Creating a resource.
- Listing resources with basic filters.
- Getting details of a resource.
- Updating resource details.
- Deleting a resource.
- A simple database for persistence.
- A `README.md` describing configuration and how to run the application.

The stated recommended maximum duration is 16 hours.

The challenge does not prescribe a specific business domain, resource type, database engine, ORM, query builder, API response format, API documentation framework, authentication mechanism, or testing framework.

---

## 3. Requirement Traceability

This section separates requirements explicitly stated by the challenge from engineering requirements derived during discovery.

### 3.1 Challenge Requirements

| ID    | Challenge Requirement                              | Derived Functional Requirement    |
| ----- | -------------------------------------------------- | --------------------------------- |
| CR-01 | Use ExpressJS for the backend server.              | FR-01                             |
| CR-02 | Use TypeScript.                                    | FR-02                             |
| CR-03 | Provide CRUD interfaces for a resource.            | FR-03, FR-04, FR-05, FR-06, FR-07 |
| CR-04 | Create a resource.                                 | FR-03                             |
| CR-05 | List resources with basic filters.                 | FR-04                             |
| CR-06 | Get resource details.                              | FR-05                             |
| CR-07 | Update resource details.                           | FR-06                             |
| CR-08 | Delete a resource.                                 | FR-07                             |
| CR-09 | Use a simple database for persistence.             | FR-08                             |
| CR-10 | Provide README configuration and run instructions. | FR-09                             |

The `CR-*` identifiers represent requirements stated by the challenge. The `FR-*` identifiers below represent implementation-oriented requirements derived directly from those statements.

### 3.2 Derived Engineering Requirements

The following requirements are not explicitly stated by the challenge. They are engineering quality requirements introduced to support a reliable implementation.

| ID     | Engineering Requirement                                                       | Rationale                                                         |
| ------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| DER-01 | Validate external input before business logic or persistence.                 | Protect application boundaries and maintain data integrity.       |
| DER-02 | Return appropriate HTTP status codes.                                         | Provide predictable API behavior.                                 |
| DER-03 | Handle unexpected errors consistently without exposing internal details.      | Improve reliability and avoid unnecessary information disclosure. |
| DER-04 | Provide automated tests for important behavior.                               | Verify CRUD behavior and regression safety.                       |
| DER-05 | Keep environment-specific configuration outside application source code.      | Improve portability and configuration safety.                     |
| DER-06 | Maintain reasonable separation between HTTP, business logic, and persistence. | Improve maintainability and testability.                          |

These requirements must not be presented as requirements originating from the 99Tech challenge.

---

## 4. Functional Requirements

### FR-01 — ExpressJS Backend

The backend server must be implemented using ExpressJS.

**Traceability:** `CR-01`

---

### FR-02 — TypeScript Backend

The backend implementation must use TypeScript.

**Traceability:** `CR-02`

---

### FR-03 — Create Resource

The API must allow a client to create a resource.

**Traceability:** `CR-03`, `CR-04`

---

### FR-04 — List Resources

The API must allow a client to retrieve a collection of resources with basic filtering.

**Traceability:** `CR-03`, `CR-05`

---

### FR-05 — Get Resource Details

The API must allow a client to retrieve a single resource by its identifier.

**Traceability:** `CR-03`, `CR-06`

---

### FR-06 — Update Resource

The API must allow a client to update resource details.

**Traceability:** `CR-03`, `CR-07`

---

### FR-07 — Delete Resource

The API must allow a client to delete a resource.

**Traceability:** `CR-03`, `CR-08`

---

### FR-08 — Resource Persistence

The implementation must persist resource data using a simple database.

**Traceability:** `CR-09`

---

### FR-09 — Project Documentation

The repository must contain a `README.md` describing configuration and how to run the application.

**Traceability:** `CR-10`

---

## 5. Domain Decision

### Selected Domain

**Support Ticket Management**

### Primary Resource

**Ticket**

The challenge does not prescribe a business domain or resource. `Ticket` is therefore an engineering decision rather than a challenge requirement.

---

## 6. Domain Selection Rationale

Support Ticket Management was selected because it provides enough domain structure to demonstrate backend engineering without introducing unnecessary system complexity.

The resource naturally supports:

- CRUD operations;
- basic filtering;
- input validation;
- enum-based fields;
- persistence;
- resource lifecycle;
- meaningful API responses;
- automated testing.

The domain remains small enough to stay proportional to the challenge's recommended 16-hour duration.

The selected domain does not imply that a complete ticketing platform must be implemented.

---

## 7. Initial Resource Model

The initial `Ticket` resource is expected to contain:

```text
Ticket
├── id
├── title
├── description
├── status
├── priority
├── createdAt
└── updatedAt
```

Exact data types, constraints, database representation, and API representation will be defined during domain, API, and database design.

---

## 8. Initial Status Model

The initial candidate status values are:

```text
open
in_progress
resolved
closed
```

These values are an initial domain proposal and are not directly required by the challenge.

Any lifecycle transition rules will only be introduced if they provide clear value without unnecessarily expanding the scope.

---

## 9. Initial Priority Model

The initial candidate priority values are:

```text
low
medium
high
```

These values are an engineering decision intended to provide meaningful filtering and validation.

---

## 10. Initial API Surface

The expected REST resource surface is:

```text
POST   /api/v1/tickets
GET    /api/v1/tickets
GET    /api/v1/tickets/:id
PATCH  /api/v1/tickets/:id
DELETE /api/v1/tickets/:id
```

This is an initial proposal, not a final API contract.

The final API contract will be defined after domain and architecture review.

---

## 11. Initial Filtering Capability

The list endpoint should support basic filters that are directly useful for the selected resource.

Initial candidates:

```text
status
priority
```

Examples:

```http
GET /api/v1/tickets?status=open
```

```http
GET /api/v1/tickets?status=open&priority=high
```

These filters are engineering decisions derived from the selected domain and are not explicitly prescribed by the challenge.

Additional filtering will not be introduced unless it provides clear value within the challenge scope.

---

## 12. Explicitly Out of Scope

The following capabilities are not required by the challenge and should not be implemented unless later discovery identifies a concrete reason:

- user registration;
- user authentication;
- authorization and role management;
- ticket comments;
- file attachments;
- notifications;
- email delivery;
- real-time updates;
- workflow automation;
- audit-log infrastructure;
- microservices;
- message brokers;
- distributed caching;
- Kubernetes;
- distributed transactions.

The purpose of this boundary is to prevent a CRUD challenge from becoming a complete ticketing platform.

---

## 13. Assumptions

### A-01 — Single Resource Focus

The implementation will focus on one primary resource: `Ticket`.

### A-02 — Single Service

The backend will initially be implemented as a single ExpressJS service.

### A-03 — Simple Persistence

A single relational or similarly appropriate simple database is sufficient for the challenge.

### A-04 — No Authentication Requirement

The phrase "allow a user to interact with the service" is interpreted as a client interacting with the API. It does not imply that an authentication or user-management system must be implemented.

### A-05 — REST API

The CRUD interface will be exposed through conventional HTTP/REST endpoints unless subsequent requirements indicate otherwise.

### A-06 — Initial Domain Scope

Only the `Ticket` resource is required unless implementation findings demonstrate that another resource is necessary to satisfy the challenge.

---

## 14. Ambiguities Identified

The challenge does not specify:

- the resource/domain to implement;
- the database engine;
- the ORM or database access library;
- the exact API response format;
- the exact filtering fields;
- pagination requirements;
- authentication requirements;
- authorization requirements;
- API documentation tooling;
- deployment requirements;
- specific testing framework.

These areas therefore require engineering decisions.

---

## 15. Acceptance Criteria

The following acceptance criteria are derived from the challenge requirements and engineering quality requirements.

### AC-01 — ExpressJS

The server runs using ExpressJS.

**Traceability:** `CR-01`, `FR-01`

### AC-02 — TypeScript

The backend implementation uses TypeScript.

**Traceability:** `CR-02`, `FR-02`

### AC-03 — Create

A client can create a Ticket.

**Traceability:** `CR-04`, `FR-03`

### AC-04 — List

A client can list Tickets.

**Traceability:** `CR-05`, `FR-04`

### AC-05 — Filtering

The Ticket list supports basic filtering.

**Traceability:** `CR-05`, `FR-04`

### AC-06 — Get

A client can retrieve a Ticket by ID.

**Traceability:** `CR-06`, `FR-05`

### AC-07 — Update

A client can update Ticket details.

**Traceability:** `CR-07`, `FR-06`

### AC-08 — Delete

A client can delete a Ticket.

**Traceability:** `CR-08`, `FR-07`

### AC-09 — Persistence

Ticket data persists in the selected database.

**Traceability:** `CR-09`, `FR-08`

### AC-10 — Validation

Invalid input is rejected with an appropriate response.

**Traceability:** `DER-01`

### AC-11 — Not Found

Requests for non-existent Tickets return an appropriate not-found response.

**Traceability:** `DER-02`

### AC-12 — Error Handling

Unexpected application errors are handled without exposing internal implementation details.

**Traceability:** `DER-03`

### AC-13 — Automated Tests

Important CRUD and domain behavior is covered by automated tests.

**Traceability:** `DER-04`

### AC-14 — Configuration

Environment-specific configuration is not hard-coded into application source code.

**Traceability:** `DER-05`

### AC-15 — Maintainability

HTTP handling, business logic, and persistence concerns have reasonable separation.

**Traceability:** `DER-06`

### AC-16 — README

The repository contains a `README.md` describing configuration and how to run the application.

**Traceability:** `CR-10`, `FR-09`

---

## 16. Engineering Principles

### Keep the Solution Proportional

The implementation should solve the challenge rather than build an unnecessarily complete ticketing platform.

### Prefer Explicit Design Decisions

Where the challenge leaves a decision open, document the rationale rather than presenting the choice as a requirement.

### Keep the Backend Maintainable

The code should have clear boundaries between HTTP handling, business logic, and persistence.

### Validate at the Boundary

Client-controlled input should be validated before entering the application domain.

### Test Behavior

Testing should focus on externally observable behavior and important business rules.

### Avoid Premature Infrastructure

Caching, queues, microservices, and other distributed infrastructure should not be introduced without a demonstrated requirement.

---

## 17. AI-Assisted Development Boundary

AI-assisted development may support the engineering workflow.

AI may assist with:

- requirement analysis;
- discovery;
- domain modeling;
- architecture proposals;
- API design;
- database design;
- PRD drafting;
- planning;
- code implementation;
- test generation;
- code review;
- security review;
- documentation.

Engineering decisions remain subject to human review.

AI-generated proposals must be evaluated against:

- the original challenge requirements;
- the documented scope;
- the selected domain;
- the architecture;
- testability;
- maintainability;
- implementation effort.

The objective is to demonstrate AI-assisted engineering, not to delegate architectural ownership to AI.

---

## 18. Discovery Decision Record

At the end of discovery, the following decisions are established:

| Decision                   | Status       | Type                  |
| -------------------------- | ------------ | --------------------- |
| ExpressJS                  | Confirmed    | Challenge requirement |
| TypeScript                 | Confirmed    | Challenge requirement |
| CRUD API                   | Confirmed    | Challenge requirement |
| Simple database            | Confirmed    | Challenge requirement |
| Basic filtering            | Confirmed    | Challenge requirement |
| README                     | Confirmed    | Challenge requirement |
| Support Ticket domain      | Selected     | Engineering decision  |
| Ticket as primary resource | Selected     | Engineering decision  |
| `status` filtering         | Confirmed    | Engineering decision  |
| `priority` filtering       | Confirmed    | Engineering decision  |
| Authentication             | Out of scope | Scope decision        |
| User management            | Out of scope | Scope decision        |
| Microservices              | Out of scope | Scope decision        |

The selected filtering decisions are now confirmed by the approved PRD, domain model, API contract, and database design.

---

## 19. Next Phase

Discovery is complete.

The stable product/engineering context sequence is:

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

After the stable context is approved, Claude Code / AI engineering setup can consume these documents.

Planning is treated as an execution activity derived from the approved context rather than a permanent context document.
