import { executeSwap, updateBalances } from "@/domain";
import type { Balance, DomainError, Result, SwapExecution, SwapReviewSnapshot } from "@/domain";
import type { TransactionIdSource } from "../services/transactionIdSourcePort";

export interface ConfirmReviewedSwapInput {
  /** The immutable snapshot produced by `prepareReview` — never rebuilt from mutable form state (BR-013). */
  readonly reviewedSnapshot: SwapReviewSnapshot;
  readonly alreadyProcessing: boolean;
  readonly balances: Balance[];
  readonly transactionIdSource: TransactionIdSource;
}

export interface ConfirmReviewedSwapResult {
  readonly execution: SwapExecution;
  /** Updated only on a successful execution; unchanged on failure (domain.md §15/§16). */
  readonly balances: Balance[];
}

/**
 * FR-022 / FR-023: executes the reviewed snapshot exactly as confirmed and,
 * on success, applies the balance mutation. Confirmation always executes
 * `input.reviewedSnapshot` — there is no code path that reconstructs a
 * transaction from current form state.
 */
export function confirmReviewedSwap(
  input: ConfirmReviewedSwapInput,
): Result<ConfirmReviewedSwapResult, DomainError> {
  const executionResult = executeSwap({
    reviewedSnapshot: input.reviewedSnapshot,
    alreadyProcessing: input.alreadyProcessing,
    random: input.transactionIdSource.random,
    now: input.transactionIdSource.now,
  });

  if (!executionResult.ok) return executionResult;

  const balances =
    executionResult.value.status === "success"
      ? updateBalances(input.balances, input.reviewedSnapshot)
      : input.balances;

  return { ok: true, value: { execution: executionResult.value, balances } };
}
