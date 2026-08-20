import type Decimal from "decimal.js";
import type { DomainError } from "../errors";
import { amountExceedsBalance } from "../errors";
import { calculateQuote } from "./swapQuote";
import type { CalculateQuoteInput, SwapQuote } from "./swapQuote";

export interface ValidateSwapInput extends CalculateQuoteInput {
  readonly sourceBalance: Decimal;
}

export interface SwapValidation {
  /** The mathematically calculated quote, present even when the swap is not reviewable (e.g. insufficient balance). */
  readonly quote: SwapQuote | null;
  readonly reviewEligible: boolean;
  readonly error: DomainError | null;
}

/**
 * Quote calculation and balance eligibility are validated separately
 * (domain.md §5.7/§9): an amount can produce a mathematically valid quote
 * while still exceeding the available balance, in which case the quote is
 * still returned but the swap is not reviewable.
 */
export function validateSwap(input: ValidateSwapInput): SwapValidation {
  const quoteResult = calculateQuote(input);

  if (!quoteResult.ok) {
    return { quote: null, reviewEligible: false, error: quoteResult.error };
  }

  if (input.sourceAmount.greaterThan(input.sourceBalance)) {
    const error = amountExceedsBalance();
    return { quote: quoteResult.value, reviewEligible: false, error };
  }

  return { quote: quoteResult.value, reviewEligible: true, error: null };
}
