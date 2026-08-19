import { Decimal, reverseSwap as domainReverseSwap, validateSwap } from "@/domain";
import type { Asset, SlippageTolerance, SwapQuote, SwapValidation } from "@/domain";

export interface ReverseSwapInput {
  readonly currentQuote: SwapQuote;
  /** Balance of the asset that becomes the new source (previously the destination) — FR-013. */
  readonly newSourceBalanceAmount: number;
  readonly slippage: SlippageTolerance;
}

export interface ReverseSwapResult {
  readonly sourceAsset: Asset;
  readonly destinationAsset: Asset;
  readonly sourceAmount: Decimal;
  readonly validation: SwapValidation;
}

/**
 * FR-013 / BR-012: exchanges source/destination and carries the underlying
 * unrounded receive amount forward (Domain's `reverseSwap`), then
 * recalculates and revalidates against the new source asset's balance
 * (architecture.md §20).
 */
export function reverseSwap(input: ReverseSwapInput): ReverseSwapResult {
  const reversed = domainReverseSwap(input.currentQuote);
  const sourceBalance = new Decimal(input.newSourceBalanceAmount);

  const validation = validateSwap({
    sourceAsset: reversed.sourceAsset,
    destinationAsset: reversed.destinationAsset,
    sourceAmount: reversed.sourceAmount,
    sourceBalance,
    slippage: input.slippage,
  });

  return {
    sourceAsset: reversed.sourceAsset,
    destinationAsset: reversed.destinationAsset,
    sourceAmount: reversed.sourceAmount,
    validation,
  };
}
