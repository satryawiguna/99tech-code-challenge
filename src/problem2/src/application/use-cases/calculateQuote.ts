import { Decimal, parseAmount, validateSwap } from "@/domain";
import type { Asset, SlippageTolerance, SwapValidation } from "@/domain";

export interface CalculateQuoteInput {
  readonly sourceAsset: Asset | null | undefined;
  readonly destinationAsset: Asset | null | undefined;
  readonly sourceAmountInput: string;
  readonly sourceBalanceAmount: number;
  readonly slippage: SlippageTolerance;
}

/**
 * Converts UI-shaped input (a raw amount string, a plain-number balance)
 * into Domain-typed values and delegates entirely to `validateSwap` — no
 * quote formula or validation rule is reimplemented here.
 */
export function calculateQuote(input: CalculateQuoteInput): SwapValidation {
  return validateSwap({
    sourceAsset: input.sourceAsset,
    destinationAsset: input.destinationAsset,
    sourceAmount: parseAmount(input.sourceAmountInput),
    sourceBalance: new Decimal(input.sourceBalanceAmount),
    slippage: input.slippage,
  });
}
