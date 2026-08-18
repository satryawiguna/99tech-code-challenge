import { describe, expect, it } from "vitest";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";
import { ListTickets } from "../../src/application/use-cases/ListTickets";
import { FakeTicketRepository } from "./fakeTicketRepository";

describe("ListTickets use case", () => {
  it("returns all tickets when no filter is supplied", async () => {
    const repository = new FakeTicketRepository();
    const create = new CreateTicket(repository);
    await create.execute({ title: "A", description: "a", priority: "low" });
    await create.execute({ title: "B", description: "b", priority: "high" });

    const tickets = await new ListTickets(repository).execute({});
    expect(tickets).toHaveLength(2);
  });

  it("applies status and priority filters using AND semantics", async () => {
    const repository = new FakeTicketRepository();
    const create = new CreateTicket(repository);
    const matching = await create.execute({
      title: "A",
      description: "a",
      priority: "high",
    });
    await create.execute({ title: "B", description: "b", priority: "low" });

    const tickets = await new ListTickets(repository).execute({
      status: "open",
      priority: "high",
    });

    expect(tickets.map((t) => t.id)).toEqual([matching.id]);
  });
});
