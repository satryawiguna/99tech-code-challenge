import type { SwapReviewSnapshot } from "../swap/reviewSnapshot";
import type { TransactionIdentifier } from "./transactionIdentifier";
import { generateTransactionIdentifier } from "./transactionIdentifier";
import type { Result } from "../result";
import { ok, err } from "../result";
import type { DomainError } from "../errors";
import { executionInProgress } from "../errors";

export type ExecutionStatus = "success" | "failed";

export interface SwapExecution {
  readonly reviewedSnapshot: SwapReviewSnapshot;
  readonly status: ExecutionStatus;
  readonly transactionIdentifier: TransactionIdentifier;
}

export interface ExecuteSwapInput {
  readonly reviewedSnapshot: SwapReviewSnapshot;
  /** Whether an execution for the current swap is already in flight (domain.md invariant 29). */
  readonly alreadyProcessing: boolean;
  readonly random: () => number;
  readonly now: () => number;
}

/**
 * Execution is tied to the immutable reviewed snapshot only; it never re-reads
 * mutable form state (domain.md §5.9). Given valid preconditions this always
 * succeeds — nothing in the approved context defines a spontaneous failure
 * condition, so `ExecutionFailed` remains a defined outcome for callers
 * (Application/Infrastructure) to surface if an unexpected error occurs
 * around this call, rather than something this pure function invents.
 */
export function executeSwap(input: ExecuteSwapInput): Result<SwapExecution, DomainError> {
  if (input.alreadyProcessing) return err(executionInProgress());

  return ok({
    reviewedSnapshot: input.reviewedSnapshot,
    status: "success",
    transactionIdentifier: generateTransactionIdentifier(input.random, input.now),
  });
}
