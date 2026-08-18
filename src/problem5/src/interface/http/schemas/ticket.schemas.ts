import { z } from "zod";
import { TICKET_PRIORITIES, TicketPriority } from "../../../domain/ticket/TicketPriority";
import { TICKET_STATUSES, TicketStatus } from "../../../domain/ticket/TicketStatus";

// Domain §5.2/§5.3 leave exact max lengths as an implementation-level detail
// (Implementation Decision #16 in the approved plan).
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

const statusValues = TICKET_STATUSES as unknown as [TicketStatus, ...TicketStatus[]];
const priorityValues = TICKET_PRIORITIES as unknown as [TicketPriority, ...TicketPriority[]];

const titleSchema = z
  .string({ required_error: "title is required" })
  .trim()
  .min(1, "title must not be empty")
  .max(MAX_TITLE_LENGTH, `title must be at most ${MAX_TITLE_LENGTH} characters`);

const descriptionSchema = z
  .string({ required_error: "description is required" })
  .trim()
  .min(1, "description must not be empty")
  .max(MAX_DESCRIPTION_LENGTH, `description must be at most ${MAX_DESCRIPTION_LENGTH} characters`);

const statusSchema = z.enum(statusValues);
const prioritySchema = z.enum(priorityValues);

// API Contract §5/§12: client must not supply id/status/createdAt/updatedAt
// on create. `.strict()` rejects any such extra fields with a 400.
export const createTicketBodySchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    priority: prioritySchema,
  })
  .strict();

// API Contract §8/§12: at least one mutable field required; id/createdAt/updatedAt
// must not be modifiable. `.strict()` rejects unknown/forbidden fields with a 400.
export const updateTicketBodySchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    status: statusSchema.optional(),
    priority: prioritySchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one mutable field must be provided.",
  });

// API Contract §6: unknown query params are not part of the contract and are
// left unvalidated/ignored; only status/priority values are constrained.
export const listTicketsQuerySchema = z.object({
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
});

// Type-narrowing only (Express guarantees a non-empty :id segment on a
// matched route) — does not introduce a new rejection condition beyond
// what the API contract already implies via 404 Not Found.
export const ticketIdParamSchema = z.object({ id: z.string().min(1) });

export type CreateTicketBody = z.infer<typeof createTicketBodySchema>;
export type UpdateTicketBody = z.infer<typeof updateTicketBodySchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
