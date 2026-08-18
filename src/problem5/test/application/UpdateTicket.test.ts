import { describe, expect, it } from "vitest";
import { TicketNotFoundError } from "../../src/application/errors";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";
import { UpdateTicket } from "../../src/application/use-cases/UpdateTicket";
import { FakeTicketRepository } from "./fakeTicketRepository";

describe("UpdateTicket use case", () => {
  it("updates mutable fields and bumps updatedAt", async () => {
    const repository = new FakeTicketRepository();
    const created = await new CreateTicket(repository).execute({
      title: "A",
      description: "a",
      priority: "low",
    });

    const updated = await new UpdateTicket(repository).execute(created.id, {
      status: "in_progress",
    });

    expect(updated.status).toBe("in_progress");
    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
  });

  it("throws TicketNotFoundError when the ticket does not exist", async () => {
    const repository = new FakeTicketRepository();
    await expect(
      new UpdateTicket(repository).execute("missing", { status: "closed" }),
    ).rejects.toThrow(TicketNotFoundError);
  });
});
