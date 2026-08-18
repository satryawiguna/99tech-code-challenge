import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTicket } from "../../src/domain/ticket/Ticket";
import { createConnection } from "../../src/infrastructure/persistence/database/connection";
import { initializeSchema } from "../../src/infrastructure/persistence/database/schema";
import { SqliteTicketRepository } from "../../src/infrastructure/persistence/repositories/SqliteTicketRepository";

// Implementation Decision #9: an isolated in-memory database per test run —
// never touches the local/dev/prod SQLite files.
describe("SqliteTicketRepository", () => {
  let db: Database.Database;
  let repository: SqliteTicketRepository;

  beforeEach(() => {
    db = createConnection(":memory:");
    initializeSchema(db);
    repository = new SqliteTicketRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it("initializes the tickets table idempotently", () => {
    expect(() => initializeSchema(db)).not.toThrow();
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'",
      )
      .get();
    expect(row).toBeDefined();
  });

  it("persists and retrieves a created ticket", async () => {
    const ticket = createTicket({
      id: "t-1",
      title: "Title",
      description: "Description",
      priority: "medium",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    await repository.create(ticket);
    const found = await repository.findById("t-1");
    expect(found).toEqual(ticket);
  });

  it("returns null for a missing id", async () => {
    expect(await repository.findById("missing")).toBeNull();
  });

  it("filters by status and priority using AND semantics", async () => {
    await repository.create(
      createTicket({
        id: "t-1",
        title: "A",
        description: "a",
        priority: "high",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    await repository.create(
      createTicket({
        id: "t-2",
        title: "B",
        description: "b",
        priority: "low",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    const results = await repository.findMany({
      status: "open",
      priority: "high",
    });
    expect(results.map((t) => t.id)).toEqual(["t-1"]);
  });

  it("updates mutable fields", async () => {
    const ticket = createTicket({
      id: "t-1",
      title: "A",
      description: "a",
      priority: "low",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    await repository.create(ticket);

    await repository.update({
      ...ticket,
      status: "closed",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });

    const found = await repository.findById("t-1");
    expect(found?.status).toBe("closed");
    expect(found?.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("deletes a ticket and reports whether a row existed", async () => {
    const ticket = createTicket({
      id: "t-1",
      title: "A",
      description: "a",
      priority: "low",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    await repository.create(ticket);

    expect(await repository.delete("t-1")).toBe(true);
    expect(await repository.delete("t-1")).toBe(false);
    expect(await repository.findById("t-1")).toBeNull();
  });

  it("rejects an unsupported status via the CHECK constraint", () => {
    expect(() =>
      db
        .prepare(
          `INSERT INTO tickets (id, title, description, status, priority, created_at, updated_at)
           VALUES ('bad', 'x', 'y', 'archived', 'low', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')`,
        )
        .run(),
    ).toThrow();
  });

  it("rejects an unsupported priority via the CHECK constraint", () => {
    expect(() =>
      db
        .prepare(
          `INSERT INTO tickets (id, title, description, status, priority, created_at, updated_at)
           VALUES ('bad', 'x', 'y', 'open', 'urgent', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')`,
        )
        .run(),
    ).toThrow();
  });
});
