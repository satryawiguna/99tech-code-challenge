import { TicketPriority } from "../../domain/ticket/TicketPriority";
import { TicketStatus } from "../../domain/ticket/TicketStatus";

export interface TicketFilter {
  status?: TicketStatus;
  priority?: TicketPriority;
}
