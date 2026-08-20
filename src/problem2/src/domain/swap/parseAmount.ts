import Decimal from "decimal.js";

/**
 * Safely parses a raw user-entered amount string into a Decimal. Empty,
 * non-numeric, or malformed input (e.g. "1.2.3") becomes a non-finite
 * Decimal rather than throwing — `calculateQuote`/`validateSwap` already
 * reject non-finite amounts as InvalidAmount (domain.md §11), so this
 * centralizes "malformed decimal" detection instead of duplicating that
 * invariant at the Application boundary.
 */
export function parseAmount(raw: string): Decimal {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return new Decimal(NaN);

  try {
    const value = new Decimal(trimmed);
    return value.isFinite() ? value : new Decimal(NaN);
  } catch {
    return new Decimal(NaN);
  }
}
