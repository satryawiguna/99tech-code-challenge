import type { Decimal, SwapValidation } from "@/domain";
import { formatTokenAmount } from "@/shared/utils";

/**
 * Maps already-computed Domain error codes to UI copy — no validation rule
 * or calculation happens here, only presentation text selection (Discovery
 * §15 / PRD §14 error matrix, §20 error/recovery matrix).
 */
export function getNoticeMessage(
  validation: SwapValidation,
  sourceAmountInput: string,
  sourceBalance: Decimal | undefined,
): string | null {
  const error = validation.error;
  if (!error) return null;

  switch (error.code) {
    case "SameAssetSwap":
      return "Choose two different assets to swap.";
    case "MissingSourceAsset":
      return "Select an asset to pay with.";
    case "MissingDestinationAsset":
      return "Select an asset to receive.";
    case "MissingSourcePrice":
    case "MissingDestinationPrice":
    case "QuoteUnavailable":
      return "Quote unavailable for the selected assets.";
    case "AmountExceedsBalance": {
      const symbol = validation.quote?.sourceAsset.symbol ?? "";
      const balanceText = sourceBalance
        ? ` — you hold ${formatTokenAmount(sourceBalance)} ${symbol}.`
        : "";
      return `Insufficient ${symbol} balance${balanceText}`;
    }
    case "InvalidAmount":
      return sourceAmountInput.trim() === "" ? null : "Enter a valid amount greater than zero.";
    default:
      return null;
  }
}

export interface SwapCtaState {
  readonly label: string;
  readonly disabled: boolean;
}

/** FR-007/FR-014/FR-016/FR-019: CTA label/disabled state derived purely from the already-computed validation result. */
export function getSwapCtaState(
  validation: SwapValidation,
  sourceAmountInput: string,
): SwapCtaState {
  const error = validation.error;

  if (error?.code === "SameAssetSwap") return { label: "Select a different asset", disabled: true };
  if (error?.code === "MissingSourceAsset" || error?.code === "MissingDestinationAsset") {
    return { label: "Select an asset", disabled: true };
  }
  if (!validation.quote) {
    return {
      label: sourceAmountInput.trim() === "" ? "Enter an amount" : "Quote unavailable",
      disabled: true,
    };
  }
  if (error?.code === "InvalidAmount") return { label: "Enter an amount", disabled: true };
  if (error?.code === "AmountExceedsBalance") {
    return { label: `Insufficient ${validation.quote.sourceAsset.symbol} balance`, disabled: true };
  }

  return { label: "Review swap", disabled: !validation.reviewEligible };
}
