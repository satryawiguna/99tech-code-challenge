import { describe, expect, it } from "vitest";
import { applyTicketUpdate, createTicket } from "../../src/domain/ticket/Ticket";
import { DomainValidationError } from "../../src/domain/ticket/errors";

const baseParams = () => ({
  id: "ticket-1",
  title: "Sample title",
  description: "Sample description",
  priority: "medium" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
});

describe("createTicket (DR-01..DR-04, DR-06)", () => {
  it("forces status to open regardless of input", () => {
    const ticket = createTicket(baseParams());
    expect(ticket.status).toBe("open");
  });

  it("sets updatedAt equal to createdAt on creation", () => {
    const ticket = createTicket(baseParams());
    expect(ticket.updatedAt).toBe(ticket.createdAt);
  });

  it("preserves the supplied server-generated id", () => {
    const ticket = createTicket(baseParams());
    expect(ticket.id).toBe("ticket-1");
  });

  it("rejects an empty title", () => {
    expect(() => createTicket({ ...baseParams(), title: "   " })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects an empty description", () => {
    expect(() => createTicket({ ...baseParams(), description: "" })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects an unsupported priority", () => {
    expect(() =>
      createTicket({
        ...baseParams(),
        priority: "urgent" as unknown as "low",
      }),
    ).toThrow(DomainValidationError);
  });
});

describe("applyTicketUpdate (DR-05, DR-07..DR-10, no transition matrix)", () => {
  it("updates only the supplied mutable fields", () => {
    const ticket = createTicket(baseParams());
    const updated = applyTicketUpdate(
      ticket,
      { status: "in_progress" },
      "2026-01-02T00:00:00.000Z",
    );
    expect(updated.status).toBe("in_progress");
    expect(updated.title).toBe(ticket.title);
    expect(updated.description).toBe(ticket.description);
    expect(updated.priority).toBe(ticket.priority);
  });

  it("bumps updatedAt to the value supplied by the caller", () => {
    const ticket = createTicket(baseParams());
    const updated = applyTicketUpdate(
      ticket,
      { priority: "high" },
      "2026-01-02T00:00:00.000Z",
    );
    expect(updated.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("keeps id immutable", () => {
    const ticket = createTicket(baseParams());
    const updated = applyTicketUpdate(
      ticket,
      { title: "New title" },
      "2026-01-02T00:00:00.000Z",
    );
    expect(updated.id).toBe(ticket.id);
  });

  it("keeps createdAt immutable", () => {
    const ticket = createTicket(baseParams());
    const updated = applyTicketUpdate(
      ticket,
      { title: "New title" },
      "2026-01-02T00:00:00.000Z",
    );
    expect(updated.createdAt).toBe(ticket.createdAt);
  });

  it("allows any supported status value without a transition matrix", () => {
    const ticket = createTicket(baseParams());
    const closed = applyTicketUpdate(
      ticket,
      { status: "closed" },
      "2026-01-02T00:00:00.000Z",
    );
    const reopened = applyTicketUpdate(
      closed,
      { status: "open" },
      "2026-01-03T00:00:00.000Z",
    );
    expect(reopened.status).toBe("open");
  });

  it("rejects an unsupported status", () => {
    const ticket = createTicket(baseParams());
    expect(() =>
      applyTicketUpdate(
        ticket,
        { status: "archived" as unknown as "open" },
        "2026-01-02T00:00:00.000Z",
      ),
    ).toThrow(DomainValidationError);
  });

  it("rejects an empty title when supplied", () => {
    const ticket = createTicket(baseParams());
    expect(() =>
      applyTicketUpdate(ticket, { title: "" }, "2026-01-02T00:00:00.000Z"),
    ).toThrow(DomainValidationError);
  });

  it("rejects an empty description when supplied", () => {
    const ticket = createTicket(baseParams());
    expect(() =>
      applyTicketUpdate(
        ticket,
        { description: "   " },
        "2026-01-02T00:00:00.000Z",
      ),
    ).toThrow(DomainValidationError);
  });
});
