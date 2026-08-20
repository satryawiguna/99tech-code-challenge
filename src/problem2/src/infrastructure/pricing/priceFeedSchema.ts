import { z } from "zod";

/**
 * Shape-only validation. Business validity of a record (positive price,
 * parseable date) remains a Domain concern (domain.md §5.1) — this schema
 * only guarantees each field has the correct JSON type before Domain ever
 * sees it.
 */
export const priceRecordSchema = z.object({
  currency: z.string(),
  date: z.string(),
  price: z.number(),
});

export const priceFeedArraySchema = z.array(z.unknown());
