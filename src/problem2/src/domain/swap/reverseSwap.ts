import type Decimal from "decimal.js";
import type { Asset } from "../asset/asset";
import type { SwapQuote } from "./swapQuote";

export interface ReversedSwapInput {
  readonly sourceAsset: Asset;
  readonly destinationAsset: Asset;
  readonly sourceAmount: Decimal;
}

/**
 * Exchanges source/destination and carries the quote's underlying unrounded
 * receiveAmount forward as the new source amount (BR-012) — never a
 * display-rounded value. Callers must recalculate the quote from this input.
 */
export function reverseSwap(quote: SwapQuote): ReversedSwapInput {
  return {
    sourceAsset: quote.destinationAsset,
    destinationAsset: quote.sourceAsset,
    sourceAmount: quote.receiveAmount,
  };
}
