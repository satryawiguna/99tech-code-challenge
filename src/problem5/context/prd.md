# Problem 5 — Product Requirements Document

## 1. Purpose

This document defines the product-level requirements for the Problem 5 Support Ticket Management API.

The PRD translates the challenge requirements and approved discovery decisions into a concise product definition before domain, architecture, API, database, and implementation work.

The challenge does not prescribe a business domain. Therefore, Support Ticket Management is an engineering decision selected to demonstrate a practical CRUD backend within the recommended 16-hour scope.

## 2. Product Overview

**Product:** Support Ticket Management API

**Primary Resource:** Ticket

The product provides a REST API for creating, viewing, filtering, updating, and deleting support tickets.

The product is intentionally limited to a single primary resource and does not attempt to implement a complete customer-support platform.

## 3. Product Goals

The product must allow a client to:

1. Create a Ticket.
2. Retrieve a collection of Tickets.
3. Filter Tickets by status and priority.
4. Retrieve a Ticket by ID.
5. Update Ticket details.
6. Delete a Ticket.
7. Persist Ticket data across application restarts.

The implementation must remain proportional to the challenge scope.

## 4. Primary User / Client

The product is designed for an API client interacting with the service.

For this challenge, “user” means a client consuming the API. It does not imply implementation of registration, authentication, authorization, roles, permissions, or user identity management.

## 5. Product Scope

### In Scope

- Ticket CRUD;
- Ticket status and priority;
- creation and modification timestamps;
- status and priority filtering;
- persistent Ticket storage;
- validation;
- predictable HTTP responses;
- consistent API errors;
- automated tests;
- README configuration and run instructions.

### Out of Scope

- user accounts;
- authentication and authorization;
- comments;
- attachments;
- notifications or email delivery;
- real-time updates;
- workflow automation;
- audit-log infrastructure;
- external support integrations;
- microservices;
- message brokers;
- distributed caching;
- Kubernetes;
- distributed transactions;
- pagination;
- dedicated idempotency-key support.

## 6. Ticket Product Model

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

Supported status values:

```text
open
in_progress
resolved
closed
```

Every newly created Ticket starts with:

```text
status = open
```

The product does not enforce a strict status-transition matrix. Any supported status may be assigned during an update.

Supported priority values:

```text
low
medium
high
```

Priority is client-controlled during creation and update, subject to validation.

Server-controlled fields:

```text
id
status on creation
createdAt
updatedAt
```

## 7. Core Product Operations

```text
POST   /api/v1/tickets
GET    /api/v1/tickets
GET    /api/v1/tickets/:id
PATCH  /api/v1/tickets/:id
DELETE /api/v1/tickets/:id
```

These correspond to:

```text
CreateTicket
ListTickets
GetTicket
UpdateTicket
DeleteTicket
```

## 8. Filtering

The Ticket collection supports:

```text
status
priority
```

When multiple filters are supplied, all supplied filters must be satisfied.

## 9. Product Behavior

### Create

Client supplies:

```text
title
description
priority
```

Server supplies:

```text
id
status = open
createdAt
updatedAt
```

### Update

Updates use partial semantics.

Mutable fields:

```text
title
description
status
priority
```

Server-controlled fields:

```text
id
createdAt
updatedAt
```

### Delete

Deleting a Ticket removes it from the active Ticket collection. Soft-delete is not part of the product.

## 10. API Expectations

The API is versioned under:

```text
/api/v1
```

Successful responses containing data use a `data` envelope:

```json
{
  "data": {}
}
```

Collection responses use:

```json
{
  "data": []
}
```

Delete returns `204 No Content`.

Errors use:

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket not found"
  }
}
```

The API must not expose stack traces, database errors, secrets, or other internal implementation details.

## 11. Validation Expectations

Invalid client input must be rejected.

At minimum:

- title is required on creation and must not be empty;
- description is required on creation;
- priority must be supported;
- status must be supported when supplied during update;
- update requests must contain at least one mutable field;
- server-controlled fields must not be accepted as authoritative client values.

Exact maximum string lengths, identifier format, and validation library remain implementation-level decisions.

## 12. Persistence

Ticket data must survive beyond the lifetime of the application process.

The selected persistence technology is **SQLite**.

SQLite is an engineering decision because the challenge requires simple persistence and does not justify a separate database service.

The persistence model contains one primary table:

```text
tickets
```

The application accesses persistence through a repository abstraction.

## 13. Architecture Direction

```text
HTTP / Interface
       ↓
Application
       ↓
Domain

Application
       ↓
Repository Abstraction
       ↑
SQLite Repository Implementation
       ↓
SQLite
```

The domain and application layers must not depend directly on SQLite-specific APIs.

## 14. Quality Expectations

Automated tests should cover important domain, application, persistence, and API behavior.

The implementation should avoid unnecessary infrastructure and remain appropriate for the recommended 16-hour challenge duration.

## 15. Success Criteria

The product is successful when:

1. ExpressJS and TypeScript are used.
2. All Ticket CRUD operations work.
3. Status and priority filtering works.
4. Ticket data persists in SQLite.
5. Invalid input is rejected predictably.
6. Missing Tickets return the defined not-found behavior.
7. Unexpected errors do not expose internal details.
8. Important behavior is covered by automated tests.
9. README contains configuration and run instructions.
10. The implementation remains within the documented scope.

## 16. Traceability

| Product Decision       | Source                            |
| ---------------------- | --------------------------------- |
| ExpressJS              | Discovery CR-01                   |
| TypeScript             | Discovery CR-02                   |
| CRUD                   | Discovery CR-03 to CR-08          |
| Simple persistence     | Discovery CR-09                   |
| README                 | Discovery CR-10                   |
| Support Ticket domain  | Discovery Section 5               |
| Ticket resource        | Discovery A-01 / Domain Section 2 |
| Status values          | Domain DR-05                      |
| Priority values        | Domain DR-06                      |
| Initial status `open`  | Domain DR-04                      |
| API surface            | API Contract                      |
| API version `/api/v1`  | API Contract / Architecture       |
| SQLite                 | Database Design                   |
| Repository abstraction | Architecture                      |
| No authentication      | Discovery A-04                    |
| Proportional scope     | Discovery Engineering Principles  |

## 17. Product Decision Summary

| Decision                   | Status       | Type                      |
| -------------------------- | ------------ | ------------------------- |
| Support Ticket Management  | Selected     | Engineering decision      |
| Ticket as primary resource | Selected     | Engineering decision      |
| Status filtering           | Confirmed    | Product decision          |
| Priority filtering         | Confirmed    | Product decision          |
| SQLite                     | Selected     | Persistence decision      |
| REST API                   | Selected     | API/architecture decision |
| `/api/v1`                  | Selected     | API decision              |
| Authentication             | Out of scope | Scope decision            |
| Pagination                 | Out of scope | Scope decision            |
| Dedicated idempotency      | Out of scope | Scope decision            |

## 18. Next Phase

The stable product/engineering context is:

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

After this context is approved, Claude Code / AI engineering setup and execution planning can consume it.

Implementation planning is treated as an execution activity rather than permanent product context.
