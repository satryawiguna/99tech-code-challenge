import { Request, Response } from "express";

/**
 * Catch-all for routes outside the approved API surface (API Contract §3).
 * API Contract §11 permits extending the stable error-code set when a new
 * stable condition is identified; "NOT_FOUND" covers requests to routes
 * that are not part of the documented API at all (distinct from the
 * Ticket-specific "TICKET_NOT_FOUND" used within the documented routes).
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found.",
    },
  });
}
