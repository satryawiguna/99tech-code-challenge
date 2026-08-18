import { describe, expect, it } from "vitest";
import { TicketNotFoundError } from "../../src/application/errors";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";
import { DeleteTicket } from "../../src/application/use-cases/DeleteTicket";
import { FakeTicketRepository } from "./fakeTicketRepository";

describe("DeleteTicket use case", () => {
  it("removes an existing ticket", async () => {
    const repository = new FakeTicketRepository();
    const created = await new CreateTicket(repository).execute({
      title: "A",
      description: "a",
      priority: "low",
    });

    await new DeleteTicket(repository).execute(created.id);

    expect(await repository.findById(created.id)).toBeNull();
  });

  it("throws TicketNotFoundError when the ticket does not exist", async () => {
    const repository = new FakeTicketRepository();
    await expect(
      new DeleteTicket(repository).execute("missing"),
    ).rejects.toThrow(TicketNotFoundError);
  });
});
