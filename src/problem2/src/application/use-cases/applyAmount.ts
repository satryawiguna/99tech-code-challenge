import { Decimal, calculateHalfAmount, calculateMaxAmount, validateSwap } from "@/domain";
import type { Asset, SlippageTolerance, SwapValidation } from "@/domain";

export interface ApplyAmountInput {
  readonly sourceAsset: Asset | null | undefined;
  readonly destinationAsset: Asset | null | undefined;
  readonly sourceBalanceAmount: number;
  readonly slippage: SlippageTolerance;
}

export interface ApplyAmountResult {
  /** The derived amount, always populated regardless of whether a full quote can be produced (FR-011/FR-012). */
  readonly sourceAmount: Decimal;
  readonly validation: SwapValidation;
}

function applyDerivedAmount(
  input: ApplyAmountInput,
  deriveAmount: (balance: Decimal) => Decimal,
): ApplyAmountResult {
  const sourceBalance = new Decimal(input.sourceBalanceAmount);
  const sourceAmount = deriveAmount(sourceBalance);
  const validation = validateSwap({
    sourceAsset: input.sourceAsset,
    destinationAsset: input.destinationAsset,
    sourceAmount,
    sourceBalance,
    slippage: input.slippage,
  });
  return { sourceAmount, validation };
}

/** FR-011 / BR-006: architecture.md §19 — HALF/MAX derive the amount via Domain, then recalculate and revalidate the quote. */
export function applyHalfAmount(input: ApplyAmountInput): ApplyAmountResult {
  return applyDerivedAmount(input, calculateHalfAmount);
}

/** FR-012 / BR-007 */
export function applyMaxAmount(input: ApplyAmountInput): ApplyAmountResult {
  return applyDerivedAmount(input, calculateMaxAmount);
}
