import Decimal from "decimal.js";
import type { Asset } from "../asset/asset";
import { isSelectableAsset } from "../asset/asset";
import type { SlippageTolerance } from "./slippage";
import type { Result } from "../result";
import { ok, err } from "../result";
import type { DomainError } from "../errors";
import {
  invalidAmount,
  missingDestinationAsset,
  missingDestinationPrice,
  missingSourceAsset,
  missingSourcePrice,
  sameAssetSwap,
} from "../errors";

export interface SwapQuote {
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

export function calculateExchangeRate(sourcePrice: Decimal, destinationPrice: Decimal): Decimal {
  return sourcePrice.dividedBy(destinationPrice);
}

/**
 * Deliberately computed as `sourceAmount × price(source) / price(destination)`
 * rather than `sourceAmount × exchangeRate`, matching the approved Domain
 * formula exactly rather than an equivalent two-step calculation.
 */
export function calculateReceiveAmount(
  sourceAmount: Decimal,
  sourcePrice: Decimal,
  destinationPrice: Decimal,
): Decimal {
  return sourceAmount.times(sourcePrice).dividedBy(destinationPrice);
}

export function calculateUsdValues(
  sourceAmount: Decimal,
  sourcePrice: Decimal,
  receiveAmount: Decimal,
  destinationPrice: Decimal,
): { sourceUsdValue: Decimal; destinationUsdValue: Decimal } {
  return {
    sourceUsdValue: sourceAmount.times(sourcePrice),
    destinationUsdValue: receiveAmount.times(destinationPrice),
  };
}

export function calculateMinimumReceived(
  receiveAmount: Decimal,
  slippage: SlippageTolerance,
): Decimal {
  return receiveAmount.times(new Decimal(1).minus(slippage));
}

export interface CalculateQuoteInput {
  readonly sourceAsset: Asset | null | undefined;
  readonly destinationAsset: Asset | null | undefined;
  readonly sourceAmount: Decimal;
  readonly slippage: SlippageTolerance;
}

export function calculateQuote(input: CalculateQuoteInput): Result<SwapQuote, DomainError> {
  const { sourceAsset, destinationAsset, sourceAmount, slippage } = input;

  if (!sourceAsset) return err(missingSourceAsset());
  if (!destinationAsset) return err(missingDestinationAsset());
  if (sourceAsset.symbol === destinationAsset.symbol) return err(sameAssetSwap());
  if (!isSelectableAsset(sourceAsset)) return err(missingSourcePrice());
  if (!isSelectableAsset(destinationAsset)) return err(missingDestinationPrice());
  if (!sourceAmount.isFinite() || sourceAmount.lessThanOrEqualTo(0)) return err(invalidAmount());

  const exchangeRate = calculateExchangeRate(sourceAsset.price, destinationAsset.price);
  const receiveAmount = calculateReceiveAmount(
    sourceAmount,
    sourceAsset.price,
    destinationAsset.price,
  );
  const { sourceUsdValue, destinationUsdValue } = calculateUsdValues(
    sourceAmount,
    sourceAsset.price,
    receiveAmount,
    destinationAsset.price,
  );
  const minimumReceived = calculateMinimumReceived(receiveAmount, slippage);

  return ok({
    sourceAsset,
    destinationAsset,
    sourceAmount,
    sourceUsdValue,
    exchangeRate,
    receiveAmount,
    destinationUsdValue,
    minimumReceived,
    slippage,
  });
}
