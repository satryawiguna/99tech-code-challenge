import { randomUUID } from "node:crypto";
import { createTicket as createDomainTicket, Ticket } from "../../domain/ticket/Ticket";
import { TicketPriority } from "../../domain/ticket/TicketPriority";
import { TicketRepository } from "../ports/TicketRepository";

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
}

export class CreateTicket {
  constructor(private readonly repository: TicketRepository) {}

  async execute(input: CreateTicketInput): Promise<Ticket> {
    const now = new Date().toISOString();
    const ticket = createDomainTicket({
      id: randomUUID(),
      title: input.title,
      description: input.description,
      priority: input.priority,
      createdAt: now,
    });
    return this.repository.create(ticket);
  }
}
