import {
  applyHalfAmount as applyHalfAmountUseCase,
  applyMaxAmount as applyMaxAmountUseCase,
  calculateQuote as calculateQuoteUseCase,
  confirmReviewedSwap as confirmReviewedSwapUseCase,
  prepareReview as prepareReviewUseCase,
  reverseSwap as reverseSwapUseCase,
} from "@/application";
import type {
  ApplyAmountResult,
  ConfirmReviewedSwapResult,
  ReverseSwapResult,
  TransactionIdSource,
} from "@/application";
import { err, findBalanceAmount, invalidReviewSnapshot } from "@/domain";
import type { DomainError, Result, SwapReviewSnapshot, SwapValidation } from "@/domain";
import { useSwapStore } from "./swapStore";

/**
 * The state-to-application integration boundary: reads current values from
 * the store, calls the corresponding Application use case, and writes the
 * result back via the store's own setters. No calculation, validation,
 * execution, or balance-transition rule is implemented in this file — every
 * business decision happens inside the Application/Domain call itself.
 */

function currentSourceBalanceAmount(): number {
  const { sourceAsset, balances } = useSwapStore.getState();
  return findBalanceAmount(balances, sourceAsset?.symbol ?? "").toNumber();
}

export function applyHalfAmountAction(): ApplyAmountResult {
  const { sourceAsset, destinationAsset, slippage, setSourceAmountInput } = useSwapStore.getState();
  const result = applyHalfAmountUseCase({
    sourceAsset,
    destinationAsset,
    sourceBalanceAmount: currentSourceBalanceAmount(),
    slippage,
  });
  // .toString() preserves full Decimal precision — this is serialization for
  // the raw text-input field, not display rounding (that remains Presentation's job).
  setSourceAmountInput(result.sourceAmount.toString());
  return result;
}

export function applyMaxAmountAction(): ApplyAmountResult {
  const { sourceAsset, destinationAsset, slippage, setSourceAmountInput } = useSwapStore.getState();
  const result = applyMaxAmountUseCase({
    sourceAsset,
    destinationAsset,
    sourceBalanceAmount: currentSourceBalanceAmount(),
    slippage,
  });
  setSourceAmountInput(result.sourceAmount.toString());
  return result;
}

export function calculateCurrentQuoteAction(): SwapValidation {
  const { sourceAsset, destinationAsset, sourceAmountInput, slippage } = useSwapStore.getState();
  return calculateQuoteUseCase({
    sourceAsset,
    destinationAsset,
    sourceAmountInput,
    sourceBalanceAmount: currentSourceBalanceAmount(),
    slippage,
  });
}

/** FR-013 / BR-012: reverses the current quote's sides, not raw form state, then revalidates against the new source balance. */
export function reverseSwapAction(): ReverseSwapResult | null {
  const state = useSwapStore.getState();
  const currentValidation = calculateCurrentQuoteAction();
  if (!currentValidation.quote) return null;

  const newSourceBalanceAmount = findBalanceAmount(
    state.balances,
    currentValidation.quote.destinationAsset.symbol,
  ).toNumber();

  const result = reverseSwapUseCase({
    currentQuote: currentValidation.quote,
    newSourceBalanceAmount,
    slippage: state.slippage,
  });

  state.setSourceAsset(result.sourceAsset);
  state.setDestinationAsset(result.destinationAsset);
  state.setSourceAmountInput(result.sourceAmount.toString());
  return result;
}

/** FR-019 / BR-013: captures the current quote as an immutable review snapshot. */
export function prepareReviewAction(): Result<SwapReviewSnapshot, DomainError> {
  const validation = calculateCurrentQuoteAction();
  const result = prepareReviewUseCase(validation);
  if (result.ok) useSwapStore.getState().setReviewSnapshot(result.value);
  return result;
}

/**
 * FR-022/FR-023: executes exactly the stored reviewed snapshot — never a
 * value rebuilt from current form state. The synchronous timing here is
 * intentional; simulating a "processing" delay for UX purposes is a
 * Presentation concern for a later phase, not a State responsibility.
 */
export function confirmReviewedSwapAction(
  transactionIdSource: TransactionIdSource,
): Result<ConfirmReviewedSwapResult, DomainError> {
  const state = useSwapStore.getState();

  if (!state.reviewSnapshot) {
    return err(invalidReviewSnapshot());
  }

  const alreadyProcessing = state.executionPhase === "processing";
  state.setExecutionPhase("processing");

  const result = confirmReviewedSwapUseCase({
    reviewedSnapshot: state.reviewSnapshot,
    alreadyProcessing,
    balances: state.balances,
    transactionIdSource,
  });

  if (result.ok) {
    state.setBalances(result.value.balances);
    state.setLastExecution(result.value.execution);
    state.setExecutionPhase(result.value.execution.status === "success" ? "success" : "failed");
  } else {
    state.setExecutionPhase("failed");
  }

  return result;
}
