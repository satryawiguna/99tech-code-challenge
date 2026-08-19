export type { Result } from "./result";
export { ok, err } from "./result";

/**
 * decimal.js is confined to the Domain layer; this re-export is the only
 * sanctioned way for Application/Infrastructure to construct or type Decimal
 * values, so no other layer needs its own "decimal.js" import.
 */
export { default as Decimal } from "decimal.js";

export type { DomainErrorCode } from "./errors";
export {
  DomainError,
  invalidAmount,
  amountExceedsBalance,
  missingSourceAsset,
  missingDestinationAsset,
  sameAssetSwap,
  missingSourcePrice,
  missingDestinationPrice,
  quoteUnavailable,
  invalidReview,
  invalidReviewSnapshot,
  executionInProgress,
  executionFailed,
} from "./errors";

export type { PriceRecord } from "./price/priceRecord";
export type { NormalizedPrice } from "./price/normalizedPrice";
export { normalizePriceRecords, latestDatasetTimestamp } from "./price/normalizePriceRecords";

export type { Asset } from "./asset/asset";
export { toAsset, assetsFromNormalizedPrices, isSelectableAsset } from "./asset/asset";

export type { Balance } from "./balance/balance";
export {
  calculateHalfAmount,
  calculateMaxAmount,
  hasSufficientBalance,
  findBalanceAmount,
  setBalanceAmount,
} from "./balance/balance";
export { updateBalances } from "./balance/updateBalances";

export type { SlippageTolerance } from "./swap/slippage";
export { SLIPPAGE_TOLERANCES, isSlippageTolerance } from "./swap/slippage";

export type { SwapQuote, CalculateQuoteInput } from "./swap/swapQuote";
export {
  calculateExchangeRate,
  calculateReceiveAmount,
  calculateUsdValues,
  calculateMinimumReceived,
  calculateQuote,
} from "./swap/swapQuote";

export type { ValidateSwapInput, SwapValidation } from "./swap/validateSwap";
export { validateSwap } from "./swap/validateSwap";

export { parseAmount } from "./swap/parseAmount";

export type { ReversedSwapInput } from "./swap/reverseSwap";
export { reverseSwap } from "./swap/reverseSwap";

export type { SwapReviewSnapshot } from "./swap/reviewSnapshot";
export { createReviewSnapshot } from "./swap/reviewSnapshot";

export type { TransactionIdentifier } from "./execution/transactionIdentifier";
export { generateTransactionIdentifier } from "./execution/transactionIdentifier";

export type { ExecutionStatus, SwapExecution, ExecuteSwapInput } from "./execution/swapExecution";
export { executeSwap } from "./execution/swapExecution";
