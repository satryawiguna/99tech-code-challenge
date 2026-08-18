import { Ticket } from "../../domain/ticket/Ticket";
import { TicketFilter } from "./TicketFilter";

/**
 * Architecture §11: application-level repository abstraction.
 * No SQL, no database-specific types — implemented by infrastructure/persistence.
 */
export interface TicketRepository {
  create(ticket: Ticket): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  findMany(filter: TicketFilter): Promise<Ticket[]>;
  update(ticket: Ticket): Promise<Ticket>;
  delete(id: string): Promise<boolean>;
}
