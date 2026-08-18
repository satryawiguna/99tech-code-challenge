import { Response } from "express";
import { Ticket } from "../../domain/ticket/Ticket";

interface TicketResponseBody {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

// Explicit whitelist mapping keeps the response shaped exactly like the
// approved API contract even if the domain representation ever grows
// additional internal fields (Security Baseline — no unnecessary data exposure).
function serializeTicket(ticket: Ticket): TicketResponseBody {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

export function sendTicket(res: Response, status: number, ticket: Ticket): void {
  res.status(status).json({ data: serializeTicket(ticket) });
}

export function sendTicketCollection(res: Response, tickets: Ticket[]): void {
  res.status(200).json({ data: tickets.map(serializeTicket) });
}
