import { TicketNotFoundError } from "../errors";
import { TicketRepository } from "../ports/TicketRepository";

export class DeleteTicket {
  constructor(private readonly repository: TicketRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new TicketNotFoundError(id);
    }
  }
}
