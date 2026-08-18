import { applyTicketUpdate, Ticket, TicketMutablePatch } from "../../domain/ticket/Ticket";
import { TicketNotFoundError } from "../errors";
import { TicketRepository } from "../ports/TicketRepository";

export class UpdateTicket {
  constructor(private readonly repository: TicketRepository) {}

  async execute(id: string, patch: TicketMutablePatch): Promise<Ticket> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TicketNotFoundError(id);
    }

    const updated = applyTicketUpdate(existing, patch, new Date().toISOString());
    return this.repository.update(updated);
  }
}
