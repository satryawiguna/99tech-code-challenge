# Problem 5 — API Contract

## 1. Purpose

This document defines the HTTP API contract for Problem 5 based on the approved discovery, domain model, and backend architecture.

The API exposes CRUD operations for the `Ticket` resource through a versioned REST interface.

This document defines:

- endpoint paths;
- HTTP methods;
- request parameters;
- request bodies;
- response bodies;
- HTTP status codes;
- validation behavior;
- filtering behavior;
- error response structure;
- API documentation requirements, including OpenAPI and interactive Swagger UI.

The contract is intentionally limited to the challenge scope.

---

## 2. API Boundary

The API is exposed through:

```text
/api/v1
```

The primary resource is:

```text
/api/v1/tickets
```

The API is responsible for:

- accepting HTTP requests;
- validating external request data;
- invoking application use cases;
- mapping application results to HTTP responses;
- mapping application errors to HTTP responses.

The API does not own:

- Ticket domain invariants;
- database implementation;
- authentication;
- user management;
- persistence implementation details.

---

## 3. API Endpoints

The initial API surface is:

| Method   | Endpoint              | Purpose         |
| -------- | --------------------- | --------------- |
| `POST`   | `/api/v1/tickets`     | Create a Ticket |
| `GET`    | `/api/v1/tickets`     | List Tickets    |
| `GET`    | `/api/v1/tickets/:id` | Get a Ticket    |
| `PATCH`  | `/api/v1/tickets/:id` | Update a Ticket |
| `DELETE` | `/api/v1/tickets/:id` | Delete a Ticket |

These endpoints map to the application use cases:

```text
POST   /api/v1/tickets       → CreateTicket
GET    /api/v1/tickets       → ListTickets
GET    /api/v1/tickets/:id   → GetTicket
PATCH  /api/v1/tickets/:id   → UpdateTicket
DELETE /api/v1/tickets/:id   → DeleteTicket
```

---

## 4. Ticket Representation

The API representation of a Ticket is:

```json
{
  "id": "ticket-123",
  "title": "Unable to login",
  "description": "User cannot access the application.",
  "status": "open",
  "priority": "high",
  "createdAt": "2026-08-17T10:00:00.000Z",
  "updatedAt": "2026-08-17T10:00:00.000Z"
}
```

The API representation reflects the domain model.

The following fields are server-controlled:

```text
id
status on creation
createdAt
updatedAt
```

The following fields may be supplied or modified by the client subject to validation:

```text
title
description
priority
status on update
```

---

## 5. Create Ticket

### Endpoint

```http
POST /api/v1/tickets
```

### Request Body

```json
{
  "title": "Unable to login",
  "description": "User cannot access the application.",
  "priority": "high"
}
```

### Request Fields

| Field         | Required | Client Controlled | Rules                        |
| ------------- | -------- | ----------------- | ---------------------------- |
| `title`       | Yes      | Yes               | Must not be empty            |
| `description` | Yes      | Yes               | Must contain meaningful text |
| `priority`    | Yes      | Yes               | `low`, `medium`, or `high`   |
| `status`      | No       | No                | Server sets `open`           |
| `id`          | No       | No                | Server generated             |
| `createdAt`   | No       | No                | Server generated             |
| `updatedAt`   | No       | No                | Server generated             |

The client must not provide `id`, `status`, `createdAt`, or `updatedAt` as authoritative creation values.

The server creates the Ticket with:

```text
status = open
```

### Success Response

```http
201 Created
```

Example:

```json
{
  "data": {
    "id": "ticket-123",
    "title": "Unable to login",
    "description": "User cannot access the application.",
    "status": "open",
    "priority": "high",
    "createdAt": "2026-08-17T10:00:00.000Z",
    "updatedAt": "2026-08-17T10:00:00.000Z"
  }
}
```

### Possible Errors

```text
400 Bad Request
```

Returned when the request body is invalid.

---

## 6. List Tickets

### Endpoint

```http
GET /api/v1/tickets
```

The endpoint returns a collection of Tickets.

### Query Parameters

| Parameter  | Required | Allowed Values                              |
| ---------- | -------- | ------------------------------------------- |
| `status`   | No       | `open`, `in_progress`, `resolved`, `closed` |
| `priority` | No       | `low`, `medium`, `high`                     |

### Examples

```http
GET /api/v1/tickets
```

```http
GET /api/v1/tickets?status=open
```

```http
GET /api/v1/tickets?priority=high
```

```http
GET /api/v1/tickets?status=open&priority=high
```

When multiple filters are supplied, the result must satisfy all supplied filters.

### Success Response

```http
200 OK
```

Example:

```json
{
  "data": [
    {
      "id": "ticket-123",
      "title": "Unable to login",
      "description": "User cannot access the application.",
      "status": "open",
      "priority": "high",
      "createdAt": "2026-08-17T10:00:00.000Z",
      "updatedAt": "2026-08-17T10:00:00.000Z"
    }
  ]
}
```

An empty collection is a successful response:

```json
{
  "data": []
}
```

### Possible Errors

```text
400 Bad Request
```

Returned when a query parameter contains an invalid value.

---

## 7. Get Ticket

### Endpoint

```http
GET /api/v1/tickets/:id
```

### Path Parameter

| Parameter | Required | Description       |
| --------- | -------- | ----------------- |
| `id`      | Yes      | Ticket identifier |

### Success Response

```http
200 OK
```

Example:

```json
{
  "data": {
    "id": "ticket-123",
    "title": "Unable to login",
    "description": "User cannot access the application.",
    "status": "open",
    "priority": "high",
    "createdAt": "2026-08-17T10:00:00.000Z",
    "updatedAt": "2026-08-17T10:00:00.000Z"
  }
}
```

### Possible Errors

```text
404 Not Found
```

Returned when the Ticket does not exist.

---

## 8. Update Ticket

### Endpoint

```http
PATCH /api/v1/tickets/:id
```

The update operation uses partial update semantics.

### Request Body

At least one mutable field must be provided.

Example:

```json
{
  "priority": "high"
}
```

Another example:

```json
{
  "title": "Unable to login after password reset",
  "status": "in_progress"
}
```

### Mutable Fields

| Field         | Client Controlled | Rules                                               |
| ------------- | ----------------- | --------------------------------------------------- |
| `title`       | Yes               | Must not be empty when provided                     |
| `description` | Yes               | Must satisfy domain input constraints when provided |
| `status`      | Yes               | Must be a supported status value                    |
| `priority`    | Yes               | Must be a supported priority value                  |

The following fields must not be modified by the client:

```text
id
createdAt
updatedAt
```

`updatedAt` is maintained by the server.

### Success Response

```http
200 OK
```

Example:

```json
{
  "data": {
    "id": "ticket-123",
    "title": "Unable to login",
    "description": "User cannot access the application.",
    "status": "in_progress",
    "priority": "high",
    "createdAt": "2026-08-17T10:00:00.000Z",
    "updatedAt": "2026-08-17T10:15:00.000Z"
  }
}
```

### Possible Errors

```text
400 Bad Request
404 Not Found
```

A `400 Bad Request` is returned for invalid update data.

A `404 Not Found` is returned when the Ticket does not exist.

---

## 9. Delete Ticket

### Endpoint

```http
DELETE /api/v1/tickets/:id
```

Deleting a Ticket removes it from the active Ticket collection.

The API does not expose soft-delete semantics.

### Success Response

```http
204 No Content
```

The response contains no response body.

### Possible Errors

```text
404 Not Found
```

Returned when the Ticket does not exist.

---

## 10. Error Response Contract

The API uses a consistent error representation.

Example:

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket not found"
  }
}
```

### Error Fields

| Field           | Required | Description                   |
| --------------- | -------- | ----------------------------- |
| `error.code`    | Yes      | Stable application error code |
| `error.message` | Yes      | Human-readable error message  |

Internal implementation details, stack traces, database errors, and secrets must not be exposed through the API response.

---

## 11. Standard Error Codes

The initial error codes are:

| HTTP Status | Code                    | Meaning                         |
| ----------- | ----------------------- | ------------------------------- |
| `400`       | `VALIDATION_ERROR`      | Request data is invalid         |
| `404`       | `TICKET_NOT_FOUND`      | Requested Ticket does not exist |
| `500`       | `INTERNAL_SERVER_ERROR` | Unexpected server failure       |

The exact error code set may be extended if implementation requirements identify additional stable error conditions.

---

## 12. Validation Contract

### Create Validation

The following conditions must be rejected:

- missing `title`;
- empty `title`;
- missing `description`;
- invalid `priority`;
- client-provided authoritative `id`;
- client-provided authoritative `status`;
- client-provided authoritative `createdAt`;
- client-provided authoritative `updatedAt`.

### List Validation

The following conditions must be rejected:

- invalid `status`;
- invalid `priority`.

### Update Validation

The following conditions must be rejected:

- empty update body;
- empty `title` when supplied;
- invalid `status`;
- invalid `priority`;
- attempts to modify `id`;
- attempts to modify `createdAt`;
- attempts to modify `updatedAt`.

The exact maximum string lengths and identifier format will be finalized during implementation/API schema setup.

---

## 13. Status Contract

The supported status values are:

```text
open
in_progress
resolved
closed
```

A newly created Ticket always has:

```text
status = open
```

The API accepts `status` during update operations.

The current domain and API contract do not enforce a strict status-transition matrix.

Therefore, an update may assign any supported status value:

```text
open → in_progress
open → resolved
open → closed
in_progress → open
in_progress → resolved
in_progress → closed
resolved → open
resolved → in_progress
resolved → closed
closed → open
closed → in_progress
closed → resolved
```

The application must still reject values outside the supported status set.

If future requirements introduce strict lifecycle transitions, that change must be explicitly documented as a domain decision and reflected in the API contract.

---

## 14. Priority Contract

The supported priority values are:

```text
low
medium
high
```

The client may provide `priority` during creation and update it later.

The API must reject unsupported values.

`priority` is client-provided but domain-constrained.

---

## 15. HTTP Content Type

Requests containing a JSON body must use:

```http
Content-Type: application/json
```

The API returns JSON responses for successful responses that contain a body and for error responses.

---

## 16. API Versioning

The initial API version is:

```text
v1
```

The version is represented in the URL:

```text
/api/v1/tickets
```

Domain and application layers must remain independent of this URL version.

---

## 17. API Documentation

The backend must provide API documentation based on the approved API contract.

The documentation must provide:

- a machine-readable OpenAPI specification;
- an interactive Swagger UI;
- documentation for all public API endpoints;
- request and response schemas;
- path and query parameters;
- supported validation rules;
- HTTP response status codes;
- error response structures;
- supported filtering behavior.

The API documentation must remain consistent with the approved API contract and the implemented HTTP behavior.

### Documentation Accessibility

The interactive Swagger UI must be accessible while the backend server is running through a documented HTTP endpoint.

The exact documentation route and OpenAPI/Swagger tooling are implementation-level decisions unless explicitly finalized elsewhere.

### Documentation Boundary

API documentation is part of the API delivery surface but does not introduce additional API behavior.

The OpenAPI specification and Swagger UI must describe the approved API rather than define undocumented features or behavior.

---

## 18. API Idempotency

The current CRUD operations do not require a dedicated idempotency-key mechanism.

Create requests are expected to be ordinary REST requests within the scope of this challenge.

If idempotency becomes a requirement in the future, it must be introduced explicitly as an API and application-level design decision.

---

## 19. Authentication and Authorization

Authentication and authorization are intentionally not part of the API contract.

The challenge does not require:

- login endpoints;
- registration endpoints;
- access tokens;
- roles;
- permissions;
- user identity management.

The API therefore assumes that requests reaching the service are allowed to interact with the challenge resource.

Adding authentication would expand the scope beyond the current challenge requirements.

---

## 20. Pagination

Pagination is not part of the initial API contract.

The challenge requires basic listing and filtering but does not require pagination.

Pagination may be introduced later if a concrete requirement justifies it.

---

## 21. Response Envelope

Successful responses containing data use:

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

The `204 No Content` delete response does not contain a response envelope because it contains no body.

---

## 22. API Contract Traceability

| API Decision                 | Source                                               |
| ---------------------------- | ---------------------------------------------------- |
| REST CRUD interface          | Discovery `CR-03` to `CR-08`                         |
| Ticket resource              | Discovery Section 5 / Domain Section 2               |
| Create operation             | Discovery `FR-03` / Domain Section 8                 |
| List operation               | Discovery `FR-04` / Domain Section 11                |
| Get operation                | Discovery `FR-05`                                    |
| Update operation             | Discovery `FR-06` / Domain Section 9                 |
| Delete operation             | Discovery `FR-07` / Domain Section 10                |
| `status` filter              | Discovery Section 11 / Domain Section 11             |
| `priority` filter            | Discovery Section 11 / Domain Section 11             |
| Initial status `open`        | Domain `DR-04`                                       |
| Status values                | Domain `DR-05`                                       |
| Priority values              | Domain `DR-06`                                       |
| Server-controlled timestamps | Domain `DR-07` to `DR-09`                            |
| API versioning               | Architecture Section 17                              |
| Application use cases        | Architecture Section 10                              |
| HTTP/application separation  | Architecture Sections 6 and 7                        |
| No authentication            | Discovery `A-04` / Architecture Section 19           |
| OpenAPI / Swagger UI         | API documentation requirement added to this contract |

---

## 23. API Decision Summary

| Decision              | Status       | Rationale                                     |
| --------------------- | ------------ | --------------------------------------------- |
| REST API              | Confirmed    | Appropriate for CRUD challenge                |
| `/api/v1/tickets`     | Confirmed    | Resource-oriented versioned endpoint          |
| `POST` create         | Confirmed    | Required CRUD operation                       |
| `GET` list            | Confirmed    | Required CRUD operation                       |
| `GET /:id`            | Confirmed    | Required CRUD operation                       |
| `PATCH /:id`          | Confirmed    | Partial update semantics from domain model    |
| `DELETE /:id`         | Confirmed    | Required CRUD operation                       |
| `status` filter       | Confirmed    | Basic domain-relevant filter                  |
| `priority` filter     | Confirmed    | Basic domain-relevant filter                  |
| JSON request/response | Selected     | Appropriate for REST API                      |
| `201` for create      | Selected     | Resource creation semantics                   |
| `204` for delete      | Selected     | No response body required                     |
| Authentication        | Out of scope | Not required                                  |
| Pagination            | Out of scope | Not required                                  |
| Dedicated idempotency | Out of scope | Not required                                  |
| OpenAPI specification | Confirmed    | Machine-readable API contract documentation   |
| Swagger UI            | Confirmed    | Interactive API documentation for development |

---

## 24. OpenAPI Design Items

The following details remain intentionally open for implementation-level finalization:

- exact maximum string lengths;
- exact identifier format;
- validation library;
- exact OpenAPI generation/tooling;
- exact API documentation route/hosting;
- database-specific error mapping.

These items must not change the domain semantics or architectural boundaries defined by the approved documents.

---

## 25. Next Phase

Once this API contract is approved, the remaining stable context includes the database design.

The execution phase then proceeds through:

```text
Approved Context
    ↓
Implementation Planning
    ↓
Human Approval
    ↓
Implementation
```

Planning and implementation are execution activities, not additional context documents.

The database design must preserve the API contract and domain invariants.

The implementation must treat this API contract as the source of truth for externally observable HTTP behavior, including the documented API surface and API documentation requirements.
