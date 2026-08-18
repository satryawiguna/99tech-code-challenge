/**
 * Domain §13: a missing Ticket is an application/use-case condition,
 * not a domain invariant. The HTTP layer maps this to 404 Not Found.
 */
export class TicketNotFoundError extends Error {
  constructor(id: string) {
    super(`Ticket "${id}" not found.`);
    this.name = "TicketNotFoundError";
  }
}
