# Problem 5 — Support Ticket Management API

A CRUD backend for managing support tickets, built with ExpressJS and TypeScript, persisted with SQLite. See [context/](context/) for the full approved product, domain, architecture, API, and database design, and [planning/implementation-plan.md](planning/implementation-plan.md) for the execution plan this implementation follows.

## Prerequisites

- Node.js 22.x and npm 10.x (or newer)
- Docker + Docker Compose (only required for the `dev`/`prod` container runtime — not required for local development)

## Installation

```bash
npm install
```

## Configuration

Configuration is environment-variable driven; nothing environment-specific is hard-coded.

| Variable       | Required | Description                                             |
| -------------- | -------- | --------------------------------------------------------- |
| `NODE_ENV`     | No (defaults to `local`) | One of `local`, `dev`, `prod`.               |
| `PORT`         | No (defaults to `3000`)  | HTTP port the server listens on.             |
| `DATABASE_URL` | Yes      | Filesystem path to the SQLite database file for this environment. |

Copy [`.env.example`](.env.example) to `.env` for local development:

```bash
cp .env.example .env
```

Each environment (`local`, `dev`, `prod`) **must** use its own `DATABASE_URL` / SQLite file. The application refuses to start if `DATABASE_URL` is missing.

## Running Locally (no Docker required)

```bash
npm run dev
```

This starts the API with hot reload against the `local` SQLite file defined in `.env` (default: `./data/tickets.local.sqlite`). The `data/` directory is created automatically if it doesn't exist.

## Building

```bash
npm run build   # compiles TypeScript to dist/ and copies the OpenAPI spec
npm start       # runs the compiled server (requires NODE_ENV/PORT/DATABASE_URL)
```

## Testing

```bash
npm test
```

Runs the full automated suite (domain, application, persistence/integration, API, and OpenAPI-verification tests) with [Vitest](https://vitest.dev/). Tests use an isolated in-memory SQLite database and never read or write the `local`, `dev`, or `prod` database files.

## API Overview

The API is versioned under `/api/v1`. Full request/response contracts are defined in [context/api-contract.md](context/api-contract.md).

| Method   | Endpoint              | Purpose          |
| -------- | ---------------------- | ---------------- |
| `POST`   | `/api/v1/tickets`      | Create a Ticket  |
| `GET`    | `/api/v1/tickets`      | List Tickets (optional `status`, `priority` filters, combined with AND) |
| `GET`    | `/api/v1/tickets/:id`  | Get a Ticket     |
| `PATCH`  | `/api/v1/tickets/:id`  | Partially update a Ticket |
| `DELETE` | `/api/v1/tickets/:id`  | Delete a Ticket  |

Ticket `status`: `open` (initial, server-set) `| in_progress | resolved | closed`.
Ticket `priority`: `low | medium | high`.

Successful responses use a `{ "data": ... }` envelope; errors use `{ "error": { "code", "message" } }` with one of `VALIDATION_ERROR` (400), `TICKET_NOT_FOUND` (404), or `INTERNAL_SERVER_ERROR` (500).

### API Documentation (OpenAPI / Swagger UI)

While the server is running:

- Interactive Swagger UI: `http://localhost:<PORT>/api-docs`
- Raw OpenAPI document: `http://localhost:<PORT>/openapi.json`

## Docker

### Dev environment

```bash
docker compose up --build ticket-api-dev
```

Serves the API on `http://localhost:3001`, using `NODE_ENV=dev` and a dedicated named volume (`ticket-data-dev`) mounted at `/app/data`, isolated from `local` and `prod`.

### Prod environment

```bash
docker compose up --build ticket-api-prod
```

Serves the API on `http://localhost:3002`, using `NODE_ENV=prod` and a dedicated named volume (`ticket-data-prod`), isolated from `local` and `dev`.

Both services can run simultaneously (`docker compose up --build`); each keeps its own SQLite file, so data created in one is never visible in another.

Stop everything with:

```bash
docker compose down
```

(Add `-v` to also remove the named volumes and their persisted data.)

## Project Structure

```text
src/
├── interface/http/        # Express app, routes, controllers, schemas, middleware, OpenAPI doc
├── application/            # Use cases (CreateTicket, ListTickets, ...) and the TicketRepository port
├── domain/ticket/          # Ticket entity, invariants, status/priority — no framework dependencies
├── infrastructure/persistence/  # SQLite connection, schema, and repository implementation
└── shared/config/          # Environment configuration loading
```

Dependency direction: `HTTP → Application → Domain`, and `Application → Repository Abstraction ← SQLite Repository Implementation → SQLite`. See [context/architecture.md](context/architecture.md) for the full rationale.
