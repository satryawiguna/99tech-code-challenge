import { Ticket } from "../../domain/ticket/Ticket";
import { TicketFilter } from "../ports/TicketFilter";
import { TicketRepository } from "../ports/TicketRepository";

export class ListTickets {
  constructor(private readonly repository: TicketRepository) {}

  async execute(filter: TicketFilter): Promise<Ticket[]> {
    return this.repository.findMany(filter);
  }
}
