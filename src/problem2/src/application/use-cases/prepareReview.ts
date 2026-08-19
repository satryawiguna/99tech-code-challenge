import { createReviewSnapshot } from "@/domain";
import type { DomainError, Result, SwapReviewSnapshot, SwapValidation } from "@/domain";

/**
 * FR-019 / domain.md §14: review is only reachable from a validated,
 * review-eligible quote. Delegates entirely to Domain's
 * `createReviewSnapshot`, which enforces that precondition and returns an
 * immutable snapshot.
 */
export function prepareReview(validation: SwapValidation): Result<SwapReviewSnapshot, DomainError> {
  return createReviewSnapshot(validation);
}
