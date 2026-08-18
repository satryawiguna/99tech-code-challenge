import { describe, expect, it } from "vitest";
import { TicketNotFoundError } from "../../src/application/errors";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";
import { GetTicket } from "../../src/application/use-cases/GetTicket";
import { FakeTicketRepository } from "./fakeTicketRepository";

describe("GetTicket use case", () => {
  it("returns the ticket when it exists", async () => {
    const repository = new FakeTicketRepository();
    const created = await new CreateTicket(repository).execute({
      title: "A",
      description: "a",
      priority: "low",
    });

    const ticket = await new GetTicket(repository).execute(created.id);
    expect(ticket).toEqual(created);
  });

  it("throws TicketNotFoundError when the ticket does not exist", async () => {
    const repository = new FakeTicketRepository();
    await expect(
      new GetTicket(repository).execute("missing"),
    ).rejects.toThrow(TicketNotFoundError);
  });
});
