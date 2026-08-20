import type Decimal from "decimal.js";
import type { Asset } from "../asset/asset";
import type { SlippageTolerance } from "./slippage";
import type { SwapValidation } from "./validateSwap";
import type { Result } from "../result";
import { ok, err } from "../result";
import type { DomainError } from "../errors";
import { invalidReview } from "../errors";

export interface SwapReviewSnapshot {
  readonly sourceAsset: Asset;
  readonly destinationAsset: Asset;
  readonly sourceAmount: Decimal;
  readonly sourceUsdValue: Decimal;
  readonly exchangeRate: Decimal;
  readonly receiveAmount: Decimal;
  readonly destinationUsdValue: Decimal;
  readonly minimumReceived: Decimal;
  readonly slippage: SlippageTolerance;
}

/**
 * Review requires a valid quote AND balance eligibility (domain.md invariant 22).
 * The result is frozen so later form changes cannot silently mutate the
 * reviewed transaction (invariant 23/25) — confirmation must execute this
 * exact snapshot.
 */
export function createReviewSnapshot(
  validation: SwapValidation,
): Result<SwapReviewSnapshot, DomainError> {
  if (!validation.reviewEligible || !validation.quote) {
    return err(validation.error ?? invalidReview());
  }

  const {
    sourceAsset,
    destinationAsset,
    sourceAmount,
    sourceUsdValue,
    exchangeRate,
    receiveAmount,
    destinationUsdValue,
    minimumReceived,
    slippage,
  } = validation.quote;

  return ok(
    Object.freeze({
      sourceAsset,
      destinationAsset,
      sourceAmount,
      sourceUsdValue,
      exchangeRate,
      receiveAmount,
      destinationUsdValue,
      minimumReceived,
      slippage,
    }),
  );
}
