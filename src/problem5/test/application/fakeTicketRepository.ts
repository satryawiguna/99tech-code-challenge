import { TicketFilter } from "../../src/application/ports/TicketFilter";
import { TicketRepository } from "../../src/application/ports/TicketRepository";
import { Ticket } from "../../src/domain/ticket/Ticket";

/** In-memory TicketRepository implementation used only by application-layer tests. */
export class FakeTicketRepository implements TicketRepository {
  private readonly tickets = new Map<string, Ticket>();

  async create(ticket: Ticket): Promise<Ticket> {
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) ?? null;
  }

  async findMany(filter: TicketFilter): Promise<Ticket[]> {
    return [...this.tickets.values()].filter((ticket) => {
      if (filter.status && ticket.status !== filter.status) return false;
      if (filter.priority && ticket.priority !== filter.priority) return false;
      return true;
    });
  }

  async update(ticket: Ticket): Promise<Ticket> {
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async delete(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }
}
