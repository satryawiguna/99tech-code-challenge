# Problem 5 — Implementation Plan

## 1. Planning Objective

This plan translates the six approved context documents into an ordered, executable sequence of implementation work for the Support Ticket Management API.

It translates:

```text
Requirements (discovery.md, prd.md)
    ↓
Domain decisions (domain.md)
    ↓
Architecture (architecture.md)
    ↓
API contract (api-contract.md)
    ↓
Database design (database.md)
```

into concrete implementation steps.

**What this plan changes:** nothing about product scope, domain rules, architecture boundaries, API behavior, or database schema. It only adds implementation-level detail (project layout, libraries, file names, scripts, env var names, Docker structure) that the approved context intentionally left open.

**What this plan does not do:** it does not implement source code, does not redefine any approved decision, and does not introduce infrastructure not justified by the challenge.

The repository is currently greenfield — only `context/`, `CLAUDE.md`, and `.claude/` exist. No source code, package manifest, or configuration files exist yet.

---

## 2. Authoritative Inputs

- `context/discovery.md` — challenge requirements, scope boundaries, engineering decisions
- `context/prd.md` — product goals, scope, Ticket product model, API/persistence expectations
- `context/domain.md` — Ticket entity, attributes, invariants, lifecycle, domain rules DR-01…DR-10
- `context/architecture.md` — layered architecture, dependency direction, project structure, runtime/config strategy, API documentation strategy, testing architecture, security baseline
- `context/api-contract.md` — endpoints, request/response schemas, validation rules, error codes, API documentation requirements (includes the empty-`description` validation clarification confirmed present at lines 478–479 and 499)
- `context/database.md` — SQLite schema, constraints, indexes, environment isolation, transaction boundary

---

## 3. Implementation Strategy

Work proceeds bottom-up through the architecture's dependency direction, so that each layer can be implemented and verified against a stable layer beneath it:

```text
Foundation (tooling, config)
    ↓
Domain (no dependencies)
    ↓
Repository abstraction (ports — depends only on domain)
    ↓
SQLite persistence implementation (depends on the port + database.md schema)
    ↓
Application use cases (depends on domain + repository port)
    ↓
HTTP/API interface (depends on application use cases)
    ↓
Cross-cutting validation/error handling (wires HTTP ↔ application ↔ domain error mapping)
    ↓
API documentation (describes the now-implemented HTTP surface)
    ↓
Testing (verifies every layer above)
    ↓
Docker/environment verification
    ↓
Documentation (README)
    ↓
Final quality verification
```

This order avoids rework: the domain and repository contract are stable before anything depends on them, and the HTTP layer is built only after the application use cases it calls already exist.

---

## 4. Implementation Steps

### Step 1 — Project Bootstrap & Tooling

**Objective**
Establish a working TypeScript/ExpressJS project skeleton that can compile and run.

**Dependencies**
None (first step).

**Files / Modules**

```text
package.json
tsconfig.json
.eslintrc / .prettierrc (optional, minimal)
.gitignore
.env.example
src/
  interface/http/
  application/
  domain/ticket/
  infrastructure/persistence/
  shared/
```

**Implementation**

- Initialize `npm` project (`package.json`) — see Implementation Decision #1 (package manager).
- Add TypeScript, ExpressJS, and dev tooling as dependencies (exact packages selected in §12).
- Create `tsconfig.json` targeting Node LTS, `strict: true`, `outDir: dist`, `rootDir: src`.
- Create the `src/` layer folders mirroring Architecture §9 (`interface/http`, `application`, `domain/ticket`, `infrastructure/persistence`, `shared`).
- Add `.gitignore` covering `node_modules`, `dist`, `.env`, and SQLite data files.
- Add npm scripts: `dev`, `build`, `start`, `test` (concrete tool choices in §12).

**Constraints**

- Architecture §3: ExpressJS + TypeScript are challenge requirements (CR-01, CR-02) — not substitutable.
- Architecture §9 layer boundaries must be reflected in the folder structure from the start.

**Verification**

- `npm run build` compiles with no TypeScript errors on an empty skeleton.
- `npm run dev` starts a placeholder server without runtime errors.

---

### Step 2 — Configuration & Runtime Foundation

**Objective**
Provide environment-aware configuration that keeps `local`, `dev`, and `prod` isolated, per Architecture §16 and Database §3.

**Dependencies**
Step 1.

**Files / Modules**

```text
src/shared/config/env.ts
.env.example
```

**Implementation**

- Load `NODE_ENV`, `PORT`, `DATABASE_URL` from process environment (via `dotenv` in non-Docker local dev; Docker/dev/prod inject env vars directly).
- Validate required config at startup; fail fast with a clear (non-leaking) message if `DATABASE_URL` is missing.
- Ensure `DATABASE_URL` resolves to a distinct SQLite file path per environment (see Implementation Decision #12–13).
- Do not hard-code any environment-specific value in source code (CLAUDE.md §10, Architecture §16).

**Constraints**

- Architecture §16: "An environment must not use the same SQLite database file as another environment."
- Architecture §16: local dev must work via `npm run dev` without requiring Docker.
- Security Baseline (Architecture §20 / CLAUDE.md §10): no hard-coded secrets.

**Verification**

- Starting the app with a missing `DATABASE_URL` fails fast with a safe error, not a stack trace.
- Starting with `NODE_ENV=local` vs `NODE_ENV=dev` resolves to different database file paths.

---

### Step 3 — Domain Layer (Ticket)

**Objective**
Implement the `Ticket` domain entity and invariants (DR-01…DR-10) independent of Express and SQLite.

**Dependencies**
Step 1.

**Files / Modules**

```text
src/domain/ticket/Ticket.ts
src/domain/ticket/TicketStatus.ts
src/domain/ticket/TicketPriority.ts
src/domain/ticket/errors.ts
```

**Implementation**

See §5 (Domain Implementation Plan) for full detail.

**Constraints**

- Must not import Express, an HTTP framework, or a SQLite driver (Architecture §6.3, §7).
- Must enforce DR-01 through DR-10 exactly as written in `domain.md` — no additional rules, no status-transition matrix (Domain §6).

**Verification**

- Domain unit tests (Step 10) pass without any HTTP server or database running.

---

### Step 4 — Repository Abstraction (Application Port)

**Objective**
Define the `TicketRepository` contract the application layer depends on, per Architecture §11.

**Dependencies**
Step 3.

**Files / Modules**

```text
src/application/ports/TicketRepository.ts
src/application/ports/TicketFilter.ts
```

**Implementation**

- Define an interface with `create`, `findById`, `findMany(filter)`, `update`, `delete` operating on domain/application-level Ticket representations — no SQL, no database types.
- Define a `TicketFilter` type carrying optional `status` and `priority` (application-level type, not a database query object), per Architecture §11.

**Constraints**

- Architecture §7: application depends on the repository **abstraction**, never a concrete database client.
- Architecture §11: filter parameters must be application-level types.

**Verification**

- The application layer (Step 6) compiles against this interface with zero references to a SQLite driver.

---

### Step 5 — SQLite Persistence Implementation

**Objective**
Implement `TicketRepository` against SQLite, matching the schema in `database.md` exactly.

**Dependencies**
Step 4.

**Files / Modules**

```text
src/infrastructure/persistence/database/connection.ts
src/infrastructure/persistence/database/schema.ts
src/infrastructure/persistence/repositories/SqliteTicketRepository.ts
```

**Implementation**

See §6 (Persistence Implementation Plan) for full detail.

**Constraints**

- Database §5: exact column set, types, `NOT NULL`, `CHECK` constraints for `status`/`priority`, defaults.
- Database §10: indexes on `status` and `priority`.
- Database §11: all queries parameterized — no string-concatenated SQL (Security Baseline).
- Database §15: schema must initialize deterministically from a clean checkout.
- Database §16: repository translates "row not found" into an application-level not-found signal; it must not construct HTTP responses.

**Verification**

- Repository/integration tests (Step 10) confirm create/read/update/delete/filter behavior directly against a real SQLite file.
- Schema bootstrap is idempotent (running it twice does not error or duplicate the table).

---

### Step 6 — Application Use Cases

**Objective**
Implement the five use cases orchestrating domain + repository, independent of Express.

**Dependencies**
Steps 3, 4.

**Files / Modules**

```text
src/application/use-cases/CreateTicket.ts
src/application/use-cases/ListTickets.ts
src/application/use-cases/GetTicket.ts
src/application/use-cases/UpdateTicket.ts
src/application/use-cases/DeleteTicket.ts
src/application/errors.ts
```

**Implementation**

See §7 (Application Use-Case Plan) for full detail.

**Constraints**

- Architecture §6.2: use cases must not depend on Express request/response objects.
- Domain §13: "missing Ticket" is an application-level condition, not a domain invariant — handled here, not in the domain layer.

**Verification**

- Application-layer tests (Step 10) exercise each use case against a fake/in-memory repository implementing the Step 4 port, with no HTTP or real database involved.

---

### Step 7 — HTTP / API Interface Layer

**Objective**
Expose the five approved endpoints exactly as defined in `api-contract.md`.

**Dependencies**
Step 6.

**Files / Modules**

```text
src/interface/http/app.ts
src/interface/http/server.ts
src/interface/http/routes/ticket.routes.ts
src/interface/http/controllers/ticket.controller.ts
src/interface/http/schemas/ticket.schemas.ts
src/interface/http/middleware/errorHandler.ts
src/interface/http/middleware/notFound.ts
src/interface/http/responses.ts
```

**Implementation**

See §8 (HTTP/API Implementation Plan) for the full endpoint-by-endpoint mapping.

**Constraints**

- API Contract §3–§9: exact paths, methods, request/response shapes, status codes — no reinterpretation.
- Architecture §6.1: no database access logic in this layer.
- API Contract §21: response envelope (`{"data": ...}` / `{"error": {...}}`), `204` with no body for delete.

**Verification**

- Manual/automated HTTP smoke test of all five endpoints against a running local server.
- API tests (Step 10) assert exact status codes and response shapes per the contract.

---

### Step 8 — Validation & Error Handling Consolidation

**Objective**
Ensure validation and error mapping are consistent and centralized, satisfying DER-01, DER-02, DER-03.

**Dependencies**
Steps 3, 6, 7.

**Files / Modules**

```text
src/shared/errors/AppError.ts
src/shared/errors/ValidationError.ts
src/shared/errors/NotFoundError.ts
src/interface/http/middleware/errorHandler.ts (extended)
```

**Implementation**

- Define a small error hierarchy in `shared/errors` used by domain and application layers (e.g. `ValidationError`, `NotFoundError`).
- Central Express error-handling middleware maps:
  - `ValidationError` → `400 VALIDATION_ERROR`
  - `NotFoundError` → `404 TICKET_NOT_FOUND`
  - anything unexpected → `500 INTERNAL_SERVER_ERROR` (log internally, return only `{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "..." } }` — no stack trace, no DB error text).
- Apply `express.json()` with a reasonable body size limit (Security Baseline — request-size limits).

**Constraints**

- API Contract §10–§11: exact error envelope shape and the three defined error codes.
- CLAUDE.md §8: must not expose stack traces, database internals, or secrets.
- API Contract §7: the `:id` path parameter has **no separate 400 behavior for malformed IDs** — the contract only defines `404 Not Found` for `GET/PATCH/DELETE /api/v1/tickets/:id` when the Ticket does not exist. A malformed or unknown ID must resolve to `404`, not `400`. Do not invent a stricter ID-format validation than the contract specifies.

**Verification**

- Error-path tests confirm no response body ever contains a stack trace or raw SQLite error text.
- A request with an ID that does not exist (including a non-UUID string) returns `404`, not `400`.

---

### Step 9 — OpenAPI Specification & Swagger UI

**Objective**
Satisfy the API documentation requirement in Architecture §18 and API Contract §17.

**Dependencies**
Step 7 (the HTTP surface must be finalized before it is documented).

**Files / Modules**

```text
src/interface/http/docs/openapi.yaml
src/interface/http/docs/swagger.ts
```

**Implementation**

See §9 (API Documentation Plan).

**Constraints**

- API Contract §17: OpenAPI + interactive Swagger UI describing exactly the implemented, approved API — "must describe the approved API rather than define undocumented features."
- Architecture §18: exact route/tooling is an implementation decision (see §12).

**Verification**

- Swagger UI loads successfully at the documented route while the server runs.
- Every documented path/method/status code matches `api-contract.md` and the implemented routes.

---

### Step 10 — Automated Testing

**Objective**
Cover domain, application, persistence, API, and API-documentation behavior per Architecture §19 and DER-04.

**Dependencies**
Steps 3–9.

**Files / Modules**

```text
test/domain/ticket.test.ts
test/application/*.test.ts
test/infrastructure/sqliteTicketRepository.test.ts
test/interface/ticket.api.test.ts
test/interface/openapi.test.ts
```

**Implementation**

See §10 (Testing Plan).

**Constraints**

- Architecture §19: tests organized by domain / application / integration (repository) / API / API-doc verification.
- CLAUDE.md §9: tests must verify behavior, not merely mirror implementation.

**Verification**

- Full test suite passes locally (`npm test`).
- Test run does not touch or mutate the `local`, `dev`, or `prod` SQLite files (see Implementation Decision #9 on test DB isolation).

---

### Step 11 — Docker & Environment Verification

**Objective**
Confirm the application runs correctly under `npm run dev` and under Docker for `dev`/`prod`, with SQLite persistence isolated per environment.

**Dependencies**
Steps 1–10 functionally complete.

**Files / Modules**

```text
Dockerfile
docker-compose.yml
.dockerignore
.env.example (extended with dev/prod guidance)
```

**Implementation**

See §11 (Runtime and Environment Plan).

**Constraints**

- Architecture §16: local works via `npm run dev` without Docker; `dev`/`prod` are Docker-supported.
- Database §3: containerized `dev`/`prod` must store the SQLite file on persistent storage (volume) so data survives container recreation.
- Database §3: `local`, `dev`, and `prod` must never share a database file.

**Verification**

- `npm run dev` runs the API locally against the `local` SQLite file with no Docker involved.
- Run Docker Compose using the dev environment configuration; the API starts in a container, and data persists across `docker compose down && docker compose up`.
- Distinct database files/volumes are confirmed for each environment (e.g. by inspecting the mounted paths).

---

### Step 12 — Documentation (README)

**Objective**
Satisfy FR-09 / AC-16: a `README.md` describing configuration and how to run the application.

**Dependencies**
Steps 1–11.

**Files / Modules**

```text
README.md
```

**Implementation**

- Document: prerequisites, install steps, environment variables (from `.env.example`), how to run locally (`npm run dev`), how to run tests, how to build/run in Docker for `dev`/`prod`, where the OpenAPI/Swagger UI is exposed, and a short API overview referencing `api-contract.md`.

**Constraints**

- Discovery CR-10 / FR-09: README must describe configuration and run instructions.
- Must not contradict the actual implemented scripts/env vars from earlier steps.

**Verification**

- A reviewer following the README from a clean checkout can run the app locally and via Docker without external guidance.

---

### Step 13 — Final Quality Verification

**Objective**
Confirm the completed implementation matches all six approved context documents before handing off to Review.

**Dependencies**
Steps 1–12.

**Files / Modules**
None (verification pass only).

**Implementation**

- Walk the Definition of Done checklist in CLAUDE.md §15.
- Re-read `api-contract.md` and `database.md` against the actual implemented routes/schema.
- Confirm no unnecessary infrastructure (CLAUDE.md §11) was introduced.

**Constraints**
All approved context documents, collectively.

**Verification**
See §13 (Verification Strategy) and §14 (Final Implementation Checklist).

---

## 5. Domain Implementation Plan

The `Ticket` domain is implemented as a plain TypeScript module with no framework or database dependency.

- **`TicketStatus`** — a union type / const array: `'open' | 'in_progress' | 'resolved' | 'closed'` (Domain DR-05). A type guard/validator function checks membership.
- **`TicketPriority`** — a union type / const array: `'low' | 'medium' | 'high'` (Domain DR-06). A type guard/validator function checks membership.
- **`Ticket`** — a class or factory function exposing:
  - `id: string` — immutable after creation (DR-10).
  - `title: string` — required, non-empty (DR-02).
  - `description: string` — required, non-empty/meaningful (DR-03).
  - `status: TicketStatus` — defaults to `open` on creation, cannot be client-overridden at creation (DR-04); any supported value accepted on update, no transition matrix (Domain §6, §9).
  - `priority: TicketPriority` — required, domain-constrained (DR-06).
  - `createdAt: string` (UTC ISO 8601) — immutable after creation (DR-08).
  - `updatedAt: string` (UTC ISO 8601) — updated on every persisted mutation (DR-09).
- A domain-level `createTicket(input)` factory validates DR-01–DR-10 and throws a domain `ValidationError` on violation (not an HTTP error — the interface layer maps it later, per Step 8).
- An `applyUpdate(ticket, patch)` domain function enforces that only mutable fields (`title`, `description`, `status`, `priority`) change, recomputes `updatedAt`, and leaves `id`/`createdAt` untouched — this is the concrete mechanism enforcing DR-07, DR-08, DR-10 without altering the underlying rule.

This satisfies Domain §12 (invariants) and Architecture §12 ("Domain Validation") without introducing a status-transition matrix, per Domain §6 and API Contract §13.

---

## 6. Persistence Implementation Plan

- **Schema initialization** (`infrastructure/persistence/database/schema.ts`): executes `CREATE TABLE IF NOT EXISTS tickets (...)` reproducing the exact schema in `database.md` §5 and §9:
  ```sql
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open'
      CHECK (status IN ('open','in_progress','resolved','closed')),
    priority TEXT NOT NULL
      CHECK (priority IN ('low','medium','high')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status);
  CREATE INDEX IF NOT EXISTS tickets_priority_idx ON tickets(priority);
  ```
  Run automatically on application startup (idempotent), satisfying Database §15's "reproducible from a clean checkout" requirement without introducing a separate migration framework (proportionality — CLAUDE.md §11).
- **`SqliteTicketRepository`** implements the `TicketRepository` port from Step 4:
  - `create(ticket)` → parameterized `INSERT`.
  - `findById(id)` → parameterized `SELECT ... WHERE id = ?`; returns `null`/`undefined` when absent (not an exception) — the application layer (Step 6) turns absence into the "missing Ticket" condition (Domain §13).
  - `findMany(filter)` → builds a parameterized `WHERE` clause combining `status` and `priority` with `AND` only when supplied (Database §11, API Contract §6 — AND semantics).
  - `update(id, patch)` → parameterized `UPDATE ... SET ..., updated_at = ? WHERE id = ?`.
  - `delete(id)` → parameterized `DELETE FROM tickets WHERE id = ?`.
  - All row ↔ domain mapping (snake_case columns ↔ camelCase domain fields) happens inside this repository, per Database §12 — the domain never sees `created_at`/`updated_at`.
- No ORM is introduced; a direct, parameterized SQLite driver call is sufficient and proportional for one table (CLAUDE.md §11, Database §17 "Explicit Non-Goals").
- Each operation is a single atomic SQLite statement — no explicit multi-statement transaction is needed, per Database §14/Architecture §15.

---

## 7. Application Use-Case Plan

| Use Case       | Input                              | Behavior                                                                                                      | Output         |
| -------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------- |
| `CreateTicket` | `{ title, description, priority }` | Calls domain `createTicket` (assigns `id`, `status=open`, `createdAt`, `updatedAt`), persists via repository. | Created Ticket |
| `ListTickets`  | `{ status?, priority? }`           | Passes filter to `repository.findMany`; no domain mutation.                                                   | Ticket[]       |
| `GetTicket`    | `{ id }`                           | `repository.findById`; if absent, throws application-level `NotFoundError`.                                   | Ticket         |
| `UpdateTicket` | `{ id, patch }`                    | Loads existing Ticket (404 if absent), applies domain `applyUpdate`, persists via `repository.update`.        | Updated Ticket |
| `DeleteTicket` | `{ id }`                           | Confirms existence (404 if absent), then `repository.delete`.                                                 | void           |

Each use case is a plain async function/class taking the `TicketRepository` port as a constructor/parameter dependency — no Express types anywhere in this layer (Architecture §6.2), satisfying Architecture §10's use-case boundary.

---

## 8. HTTP/API Implementation Plan

| Endpoint                     | Route file         | Controller responsibility                      | Validation                                                                                                                                                                          | Use case       | Success                                               | Errors                                         |
| ---------------------------- | ------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `POST /api/v1/tickets`       | `ticket.routes.ts` | Parse body, call use case, wrap result         | Reject missing/empty `title`, missing/empty `description`, invalid `priority`, and any client-supplied `id`/`status`/`createdAt`/`updatedAt` (API Contract §5, §12)                 | `CreateTicket` | `201` `{ "data": Ticket }`                            | `400 VALIDATION_ERROR`                         |
| `GET /api/v1/tickets`        | `ticket.routes.ts` | Parse query, call use case, wrap collection    | Reject invalid `status`/`priority` query values (API Contract §6, §12)                                                                                                              | `ListTickets`  | `200` `{ "data": Ticket[] }` (empty array is success) | `400 VALIDATION_ERROR`                         |
| `GET /api/v1/tickets/:id`    | `ticket.routes.ts` | Call use case, wrap result                     | None beyond route param presence — no ID-format 400 (see Step 8 constraint)                                                                                                         | `GetTicket`    | `200` `{ "data": Ticket }`                            | `404 TICKET_NOT_FOUND`                         |
| `PATCH /api/v1/tickets/:id`  | `ticket.routes.ts` | Parse partial body, call use case, wrap result | Reject empty body, empty `title` when supplied, empty `description` when supplied, invalid `status`/`priority`, attempts to set `id`/`createdAt`/`updatedAt` (API Contract §8, §12) | `UpdateTicket` | `200` `{ "data": Ticket }`                            | `400 VALIDATION_ERROR`, `404 TICKET_NOT_FOUND` |
| `DELETE /api/v1/tickets/:id` | `ticket.routes.ts` | Call use case                                  | None                                                                                                                                                                                | `DeleteTicket` | `204` (no body)                                       | `404 TICKET_NOT_FOUND`                         |

- Request/response validation schemas live in `interface/http/schemas/ticket.schemas.ts` (library choice in §12).
- Controllers stay thin: parse → call use case → map result to the response envelope from `responses.ts`. No business logic in controllers (CLAUDE.md §7).
- All five routes are mounted under `/api/v1/tickets` (API Contract §2, §16).

---

## 9. API Documentation Plan

- Author `openapi.yaml` by hand, transcribing `api-contract.md` §3–§21 exactly: all 5 paths, request/response schemas, the `status`/`priority` enums, the 3 standard error codes, and the response envelope shape.
- Serve it via `swagger-ui-express` (or equivalent) mounted at a documented route (recommended `/api-docs`, see Implementation Decision #11).
- **Synchronization discipline:** whenever Step 7 changes a route/schema, `openapi.yaml` must be updated in the same change — this plan does not introduce codegen from live routes, since a small, fixed 5-endpoint surface does not justify that added tooling (proportionality, CLAUDE.md §11).
- **Verification:** an automated check (Step 10) parses `openapi.yaml` for validity and asserts its path list matches the five approved endpoints; manual verification confirms Swagger UI renders and is interactive while the server runs.

---

## 10. Testing Plan

| Layer                     | What is verified                                                                                                                         | How                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Domain                    | DR-01–DR-10: valid/invalid status & priority, initial `open` status, immutability of `id`/`createdAt`, empty title/description rejection | Pure unit tests, no I/O                                                                                                  |
| Application               | Create/list/filter/get/update/delete orchestration, missing-Ticket → `NotFoundError`                                                     | Unit tests against an in-memory fake implementing the `TicketRepository` port                                            |
| Persistence (integration) | Schema creation, CRUD against real SQLite, `status`/`priority` filtering with `AND` semantics, `CHECK` constraint enforcement            | Tests run against a real SQLite file/`:memory:` DB, isolated from `local`/`dev`/`prod` data (Implementation Decision #9) |
| API                       | Routes, HTTP methods, status codes, response envelope shape, validation rejections, `404`/`400`/`500` mapping                            | `supertest` (or equivalent) against the Express app, using the same isolated test database                               |
| API documentation         | `openapi.yaml` parses; documented paths match the approved 5 endpoints                                                                   | Lightweight spec-parsing test                                                                                            |
| Environment/runtime       | `npm run dev` boots; Docker build succeeds; container starts and responds                                                                | Manual/scripted check in Step 11, not part of the automated `npm test` suite                                             |

This directly implements Architecture §19's five testing categories and satisfies DER-04/AC-13.

---

## 11. Runtime and Environment Plan

### Local

- `npm run dev` runs the TypeScript server directly (watch mode) against the `local` SQLite file, reading `NODE_ENV=local`/`PORT`/`DATABASE_URL` from a local `.env` (not committed) seeded from `.env.example`.
- Docker is optional locally, per Architecture §16.

### Dev

- `docker compose` (or `docker run`) builds the production image and runs it with `NODE_ENV=dev`, a `dev`-specific `DATABASE_URL`, and a named volume mounting the SQLite file to persistent storage — distinct from the `local` file and the `prod` volume.

### Prod

- Same image, `NODE_ENV=prod`, a distinct `DATABASE_URL`/volume from `dev`.
- No environment-specific application code paths — only configuration differs (Architecture §16: "must remain environment-aware without creating separate application implementations for each environment").

### Configuration

- `PORT`, `NODE_ENV`, `DATABASE_URL` are the only required environment variables (Architecture §16 already names these). Additional variables are added only if a concrete implementation need arises, and documented in `.env.example` + README.

### SQLite persistence isolation

- Three distinct file paths/volumes, one per environment, enforced by `DATABASE_URL` differing per environment — never hard-coded (Database §3).

---

## 12. Implementation Decisions

The following are implementation-level decisions the approved context intentionally leaves open. None of them change product, domain, architecture, API, or database behavior.

| #   | Decision                       | Recommendation                                                                                                                                                                                                 | Reason                                                                                                                     | Context constraint respected                                     |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | Package manager                | npm                                                                                                                                                                                                            | Zero extra tooling, matches `npm run dev` already referenced by Architecture §16                                           | Architecture §16                                                 |
| 2   | Package source layout          | `src/{interface,application,domain,infrastructure,shared}`, compiled to `dist`                                                                                                                                 | Standard Node/TS convention; mirrors Architecture §9's layer tree inside the package                                       | Architecture §9                                                  |
| 3   | Dev/build tooling              | `tsx` (or `ts-node-dev`) for `npm run dev` watch mode; `tsc` for `npm run build`; `node dist/interface/http/server.js` for `npm start`                                                                         | Minimal, standard TS/Node workflow                                                                                         | Architecture §16 (`npm run dev` without Docker)                  |
| 4   | Request validation library     | Zod                                                                                                                                                                                                            | TS-native schema validation, no decorators/reflection, small footprint                                                     | Architecture §12 (HTTP validation), CLAUDE.md §11 (proportional) |
| 5   | SQLite driver                  | `better-sqlite3`                                                                                                                                                                                               | Synchronous API fits simple CRUD, mature TypeScript typings, no async driver complexity for this scale                     | Database §3 (SQLite), Database §11 (parameterized queries)       |
| 6   | Schema initialization approach | Idempotent `CREATE TABLE IF NOT EXISTS` + index statements run at startup; no separate migration framework                                                                                                     | One stable table, no schema evolution required by scope                                                                    | Database §15, CLAUDE.md §11                                      |
| 7   | ID generation                  | `crypto.randomUUID()` (Node built-in)                                                                                                                                                                          | No extra dependency; string-based ID as preferred by Database §6                                                           | Database §6                                                      |
| 8   | Testing framework              | Vitest + `supertest`                                                                                                                                                                                           | TS-native, fast, minimal config; `supertest` is the standard Express HTTP-test tool                                        | Architecture §19 (testing framework is implementation-level)     |
| 9   | Test database isolation        | Dedicated ephemeral SQLite (`:memory:` or temp file) per test run, distinct from `local`/`dev`/`prod` files                                                                                                    | Tests must not corrupt real environment data; "test" is not one of the three named environments but must still be isolated | Database §3 (environment isolation intent)                       |
| 10  | OpenAPI generation approach    | Hand-authored `openapi.yaml`, kept in sync manually with the 5-endpoint surface                                                                                                                                | Fixed, small API surface does not justify codegen tooling                                                                  | API Contract §17, §24; CLAUDE.md §11                             |
| 11  | Swagger UI route               | `/api-docs`                                                                                                                                                                                                    | Common, discoverable convention                                                                                            | API Contract §17 (route is implementation-level)                 |
| 12  | Environment variable names     | `NODE_ENV`, `PORT`, `DATABASE_URL`                                                                                                                                                                             | Already suggested verbatim by Architecture §16                                                                             | Architecture §16                                                 |
| 13  | SQLite file paths              | `data/tickets.local.sqlite`, `data/tickets.dev.sqlite`, `data/tickets.prod.sqlite` (or Docker volume-mounted equivalents), all overridable via `DATABASE_URL`                                                  | Simple, explicit per-environment separation                                                                                | Database §3                                                      |
| 14  | Docker structure               | One multi-stage `Dockerfile` (build stage with `tsc`, slim runtime stage) + one `docker-compose.yml` parameterized by environment configuration; the exact Compose invocation remains an implementation detail | Avoids duplicated Dockerfiles; standard pattern                                                                            | Architecture §16, CLAUDE.md §11                                  |
| 15  | Logging                        | Minimal structured console logging (or a lightweight logger) covering startup, DB connection failure, unexpected request failure                                                                               | Satisfies Observability Baseline without building an observability platform                                                | Architecture §21, §23                                            |
| 16  | Max string lengths             | `title` ≤ 200 chars, `description` ≤ 5000 chars (explicit implementation limits; not product/domain requirements)                                                                                              | Domain/API Contract explicitly defer exact lengths                                                                         | Domain §5.2–5.3, API Contract §12, §24                           |
| 17  | Request body size limit        | Express JSON body limit, e.g. 100kb                                                                                                                                                                            | Satisfies Security Baseline "reasonable request-size limits" without a concrete number specified in context                | Architecture §20, CLAUDE.md §10                                  |

---

## 13. Verification Strategy

After implementation, the result is checked against each context document directly:

```text
discovery.md   → every FR-01..FR-09 / AC-01..AC-16 has a corresponding passing test or manual check
prd.md         → all Product Goals (§3) and Success Criteria (§15) are demonstrably true
domain.md      → DR-01..DR-10 each map to a specific domain unit test
architecture.md→ dependency direction confirmed by inspection (domain has zero Express/SQLite imports;
                  application has zero Express imports; controllers contain no SQL)
api-contract.md→ every endpoint/status code/error code in §3-§21 has a corresponding API test
database.md    → schema, constraints, and indexes match §5-§10 exactly; verified by inspecting the
                  actual CREATE TABLE statement executed at startup
```

Any discrepancy found during this pass is treated as an Implementation Finding per CLAUDE.md §13 — it is reported, not silently fixed by reinterpreting context.

---

## 14. Final Implementation Checklist

- [ ] All challenge requirements (CR-01…CR-10) satisfied
- [ ] Ticket domain invariants (DR-01…DR-10) enforced and unit-tested
- [ ] Architecture dependency direction respected (no domain→Express/SQLite, no controller→SQL)
- [ ] All 5 API endpoints implemented exactly per `api-contract.md`
- [ ] `status` and `priority` filtering implemented with AND semantics
- [ ] Server-controlled fields (`id`, `status` on create, `createdAt`, `updatedAt`) cannot be overridden by clients
- [ ] SQLite schema matches `database.md` (columns, `NOT NULL`, `CHECK`, indexes)
- [ ] Validation rejects all conditions listed in API Contract §12 (including empty `description`)
- [ ] Errors return the defined envelope with only `VALIDATION_ERROR` / `TICKET_NOT_FOUND` / `INTERNAL_SERVER_ERROR`, no internal details leaked
- [ ] Domain, application, persistence, API, and API-doc tests all pass
- [ ] OpenAPI spec + Swagger UI available and consistent with the implemented API
- [ ] `npm run dev` runs locally without Docker
- [ ] Docker build/run works for `dev` and `prod` environment configurations
- [ ] `local`/`dev`/`prod` use isolated SQLite files/volumes
- [ ] README documents configuration and run instructions
- [ ] No unnecessary infrastructure introduced (CLAUDE.md §11)
- [ ] Final diff contains no accidental/unrelated changes

---

## 15. Risks / Notes

- **Native module (`better-sqlite3`) in Docker:** requires a build step matching the container's Node/OS ABI; the Dockerfile's build stage must run `npm install` inside the target platform rather than copying a host-built `node_modules`. Mitigation: multi-stage Docker build that installs dependencies inside the build stage.
- **Single-writer SQLite:** SQLite serializes writes; acceptable at this challenge's expected scale (Architecture §22), but a concurrent-write stress scenario is out of scope and not a realistic risk here.
- **Env file hygiene:** `.env` (with real `DATABASE_URL`/`PORT` values) must stay out of version control; only `.env.example` is committed — this is a real, ordinary risk worth a `.gitignore` entry and a README note, not a new architectural concern.
- **OpenAPI drift:** because the spec is hand-authored rather than generated, it can silently drift from the implemented routes if Step 7 changes without a corresponding Step 9 update. Mitigation: the Step 10 spec-parsing test asserts the path list matches the five approved endpoints, catching gross drift (though not full schema drift).
- **No open questions requiring escalation:** the context review completed prior to this plan (READY, with the `description` validation clarification already applied) found no unresolved conflicts. This plan introduces no new conflicts; all open items above are ordinary, non-material implementation decisions.
