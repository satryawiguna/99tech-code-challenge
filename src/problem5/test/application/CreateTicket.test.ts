import { describe, expect, it } from "vitest";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";
import { FakeTicketRepository } from "./fakeTicketRepository";

describe("CreateTicket use case", () => {
  it("creates and persists a ticket with server-controlled id/status/timestamps", async () => {
    const repository = new FakeTicketRepository();
    const useCase = new CreateTicket(repository);

    const ticket = await useCase.execute({
      title: "Unable to login",
      description: "User cannot access the application.",
      priority: "high",
    });

    expect(ticket.id).toBeTruthy();
    expect(ticket.status).toBe("open");
    expect(ticket.createdAt).toBe(ticket.updatedAt);

    const stored = await repository.findById(ticket.id);
    expect(stored).toEqual(ticket);
  });
});
