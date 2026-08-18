import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { TicketNotFoundError } from "../../../application/errors";
import { DomainValidationError } from "../../../domain/ticket/errors";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
  };
}

function sendError(res: Response, status: number, code: string, message: string): void {
  const body: ErrorResponseBody = { error: { code, message } };
  res.status(status).json(body);
}

// body-parser (used by express.json()) rejects malformed JSON and oversized
// bodies with an error carrying a stable `type` field — checked instead of
// the error message text or its native status (413 for entity.too.large),
// since both conditions are "invalid request data" per Architecture §13 and
// must map to the approved 400 VALIDATION_ERROR code, not a new 413.
const BODY_PARSER_ERROR_TYPES = new Set([
  "entity.parse.failed",
  "entity.too.large",
]);

function isBodyParserError(err: unknown): err is { type: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    typeof (err as { type: unknown }).type === "string" &&
    BODY_PARSER_ERROR_TYPES.has((err as { type: string }).type)
  );
}

/**
 * API Contract §10/§11: consistent error envelope, exactly the three
 * standard error codes. Never exposes stack traces or internal error text
 * (CLAUDE.md §8) — unexpected errors are logged server-side only.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Request data is invalid.");
    return;
  }

  if (isBodyParserError(err)) {
    sendError(res, 400, "VALIDATION_ERROR", "Request data is invalid.");
    return;
  }

  if (err instanceof DomainValidationError) {
    sendError(res, 400, "VALIDATION_ERROR", err.message);
    return;
  }

  if (err instanceof TicketNotFoundError) {
    sendError(res, 404, "TICKET_NOT_FOUND", "Ticket not found");
    return;
  }

  // eslint-disable-next-line no-console
  console.error("Unexpected error:", err);
  sendError(res, 500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.");
}
