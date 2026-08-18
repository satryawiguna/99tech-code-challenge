import { TicketPriority, isTicketPriority } from "./TicketPriority";
import { TicketStatus, isTicketStatus } from "./TicketStatus";
import { DomainValidationError } from "./errors";

export interface Ticket {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateTicketParams {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  createdAt: string;
}

/**
 * DR-01, DR-02, DR-03, DR-04, DR-06: creates a domain-valid Ticket with
 * status forced to "open" regardless of any caller-supplied value.
 */
export function createTicket(params: CreateTicketParams): Ticket {
  const title = assertNonEmptyText(params.title, "title");
  const description = assertNonEmptyText(params.description, "description");

  if (!isTicketPriority(params.priority)) {
    throw new DomainValidationError(
      `Invalid priority "${String(params.priority)}".`,
    );
  }

  if (!params.id) {
    throw new DomainValidationError("Ticket id is required.");
  }

  if (!params.createdAt) {
    throw new DomainValidationError("Ticket createdAt is required.");
  }

  return {
    id: params.id,
    title,
    description,
    status: "open",
    priority: params.priority,
    createdAt: params.createdAt,
    updatedAt: params.createdAt,
  };
}

export interface TicketMutablePatch {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

/**
 * DR-05..DR-10: applies a partial update to mutable fields only.
 * id and createdAt are never touched; no status-transition matrix is enforced
 * (Domain §6) — any supported status value may be assigned.
 */
export function applyTicketUpdate(
  ticket: Ticket,
  patch: TicketMutablePatch,
  updatedAt: string,
): Ticket {
  let nextTitle = ticket.title;
  let nextDescription = ticket.description;
  let nextStatus = ticket.status;
  let nextPriority = ticket.priority;

  if (patch.title !== undefined) {
    nextTitle = assertNonEmptyText(patch.title, "title");
  }
  if (patch.description !== undefined) {
    nextDescription = assertNonEmptyText(patch.description, "description");
  }
  if (patch.status !== undefined) {
    if (!isTicketStatus(patch.status)) {
      throw new DomainValidationError(
        `Invalid status "${String(patch.status)}".`,
      );
    }
    nextStatus = patch.status;
  }
  if (patch.priority !== undefined) {
    if (!isTicketPriority(patch.priority)) {
      throw new DomainValidationError(
        `Invalid priority "${String(patch.priority)}".`,
      );
    }
    nextPriority = patch.priority;
  }

  if (!updatedAt) {
    throw new DomainValidationError("updatedAt is required.");
  }

  return {
    id: ticket.id,
    title: nextTitle,
    description: nextDescription,
    status: nextStatus,
    priority: nextPriority,
    createdAt: ticket.createdAt,
    updatedAt,
  };
}

function assertNonEmptyText(value: string, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new DomainValidationError(`Ticket ${field} must not be empty.`);
  }
  return value;
}
