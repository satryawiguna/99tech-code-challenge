import Database from "better-sqlite3";
import { Express } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createConnection } from "../../src/infrastructure/persistence/database/connection";
import { initializeSchema } from "../../src/infrastructure/persistence/database/schema";
import { createApp } from "../../src/interface/http/app";

describe("Ticket API", () => {
  let db: Database.Database;
  let app: Express;

  beforeEach(() => {
    db = createConnection(":memory:");
    initializeSchema(db);
    app = createApp(db);
  });

  afterEach(() => {
    db.close();
  });

  it("creates a ticket (201) with server-controlled fields", async () => {
    const res = await request(app).post("/api/v1/tickets").send({
      title: "Unable to login",
      description: "User cannot access the application.",
      priority: "high",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: "Unable to login",
      status: "open",
      priority: "high",
    });
    expect(res.body.data.id).toBeTruthy();
    expect(res.body.data.createdAt).toBe(res.body.data.updatedAt);
  });

  it("rejects create with missing title (400 VALIDATION_ERROR)", async () => {
    const res = await request(app)
      .post("/api/v1/tickets")
      .send({ description: "d", priority: "low" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects create with empty description (400 VALIDATION_ERROR)", async () => {
    const res = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "t", description: "", priority: "low" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects create with an invalid priority (400 VALIDATION_ERROR)", async () => {
    const res = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "t", description: "d", priority: "urgent" });
    expect(res.status).toBe(400);
  });

  it("rejects a malformed JSON body (400 VALIDATION_ERROR, not 500)", async () => {
    const res = await request(app)
      .post("/api/v1/tickets")
      .type("json")
      .send("{not-json");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a request body exceeding the size limit (400 VALIDATION_ERROR, not 500)", async () => {
    const res = await request(app)
      .post("/api/v1/tickets")
      .send({
        title: "t",
        description: "a".repeat(200 * 1024),
        priority: "low",
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a client-supplied id/status/createdAt/updatedAt on create (400)", async () => {
    const res = await request(app).post("/api/v1/tickets").send({
      id: "hacker",
      title: "t",
      description: "d",
      priority: "low",
    });
    expect(res.status).toBe(400);
  });

  it("lists tickets and applies status+priority AND filtering", async () => {
    await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "high" });
    await request(app)
      .post("/api/v1/tickets")
      .send({ title: "B", description: "b", priority: "low" });

    const all = await request(app).get("/api/v1/tickets");
    expect(all.status).toBe(200);
    expect(all.body.data).toHaveLength(2);

    const filtered = await request(app).get(
      "/api/v1/tickets?status=open&priority=high",
    );
    expect(filtered.status).toBe(200);
    expect(filtered.body.data).toHaveLength(1);
    expect(filtered.body.data[0].title).toBe("A");
  });

  it("returns an empty collection successfully", async () => {
    const res = await request(app).get("/api/v1/tickets");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("rejects an invalid status filter (400 VALIDATION_ERROR)", async () => {
    const res = await request(app).get("/api/v1/tickets?status=bogus");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("gets a ticket by id (200)", async () => {
    const created = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "low" });

    const res = await request(app).get(
      `/api/v1/tickets/${created.body.data.id}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.body.data.id);
  });

  it("returns 404 TICKET_NOT_FOUND for a missing ticket", async () => {
    const res = await request(app).get("/api/v1/tickets/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("TICKET_NOT_FOUND");
  });

  it("updates a ticket (200) using partial semantics", async () => {
    const created = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "low" });

    const res = await request(app)
      .patch(`/api/v1/tickets/${created.body.data.id}`)
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("in_progress");
    expect(res.body.data.title).toBe("A");
  });

  it("rejects an empty update body (400 VALIDATION_ERROR)", async () => {
    const created = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "low" });

    const res = await request(app)
      .patch(`/api/v1/tickets/${created.body.data.id}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("rejects an empty title when supplied on update (400)", async () => {
    const created = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "low" });

    const res = await request(app)
      .patch(`/api/v1/tickets/${created.body.data.id}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("rejects an empty description when supplied on update (400)", async () => {
    const created = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "low" });

    const res = await request(app)
      .patch(`/api/v1/tickets/${created.body.data.id}`)
      .send({ description: "" });
    expect(res.status).toBe(400);
  });

  it("rejects attempts to modify id/createdAt/updatedAt (400)", async () => {
    const created = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "low" });

    const res = await request(app)
      .patch(`/api/v1/tickets/${created.body.data.id}`)
      .send({ updatedAt: "2020-01-01T00:00:00.000Z" });
    expect(res.status).toBe(400);
  });

  it("returns 404 TICKET_NOT_FOUND when updating a missing ticket", async () => {
    const res = await request(app)
      .patch("/api/v1/tickets/does-not-exist")
      .send({ status: "closed" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("TICKET_NOT_FOUND");
  });

  it("deletes a ticket (204, no body) and the ticket is then gone", async () => {
    const created = await request(app)
      .post("/api/v1/tickets")
      .send({ title: "A", description: "a", priority: "low" });

    const del = await request(app).delete(
      `/api/v1/tickets/${created.body.data.id}`,
    );
    expect(del.status).toBe(204);
    expect(del.body).toEqual({});

    const get = await request(app).get(
      `/api/v1/tickets/${created.body.data.id}`,
    );
    expect(get.status).toBe(404);
  });

  it("returns 404 TICKET_NOT_FOUND when deleting a missing ticket", async () => {
    const res = await request(app).delete("/api/v1/tickets/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("TICKET_NOT_FOUND");
  });

  it("returns 404 NOT_FOUND for a route outside the approved API surface", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("serves the OpenAPI document and Swagger UI", async () => {
    const spec = await request(app).get("/openapi.json");
    expect(spec.status).toBe(200);
    expect(spec.body.paths).toHaveProperty("/tickets");
    expect(spec.body.paths).toHaveProperty("/tickets/{id}");

    const docs = await request(app).get("/api-docs/");
    expect(docs.status).toBe(200);
  });
});
