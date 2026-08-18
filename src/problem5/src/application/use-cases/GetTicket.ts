import { Ticket } from "../../domain/ticket/Ticket";
import { TicketNotFoundError } from "../errors";
import { TicketRepository } from "../ports/TicketRepository";

export class GetTicket {
  constructor(private readonly repository: TicketRepository) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new TicketNotFoundError(id);
    }
    return ticket;
  }
}
