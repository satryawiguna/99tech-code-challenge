export type DomainErrorCode =
  | "InvalidAmount"
  | "AmountExceedsBalance"
  | "MissingSourceAsset"
  | "MissingDestinationAsset"
  | "SameAssetSwap"
  | "MissingSourcePrice"
  | "MissingDestinationPrice"
  | "QuoteUnavailable"
  | "InvalidReview"
  | "InvalidReviewSnapshot"
  | "ExecutionInProgress"
  | "ExecutionFailed";

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = code;
    this.code = code;
  }
}

export function invalidAmount(message = "Source amount is invalid."): DomainError {
  return new DomainError("InvalidAmount", message);
}

export function amountExceedsBalance(
  message = "Source amount exceeds the available balance.",
): DomainError {
  return new DomainError("AmountExceedsBalance", message);
}

export function missingSourceAsset(message = "No source asset is selected."): DomainError {
  return new DomainError("MissingSourceAsset", message);
}

export function missingDestinationAsset(
  message = "No destination asset is selected.",
): DomainError {
  return new DomainError("MissingDestinationAsset", message);
}

export function sameAssetSwap(message = "Source and destination assets must differ."): DomainError {
  return new DomainError("SameAssetSwap", message);
}

export function missingSourcePrice(
  message = "The source asset has no valid normalized price.",
): DomainError {
  return new DomainError("MissingSourcePrice", message);
}

export function missingDestinationPrice(
  message = "The destination asset has no valid normalized price.",
): DomainError {
  return new DomainError("MissingDestinationPrice", message);
}

export function quoteUnavailable(message = "A valid quote cannot be produced."): DomainError {
  return new DomainError("QuoteUnavailable", message);
}

export function invalidReview(message = "The swap is not eligible for review."): DomainError {
  return new DomainError("InvalidReview", message);
}

export function invalidReviewSnapshot(
  message = "Confirmation does not contain a valid review snapshot.",
): DomainError {
  return new DomainError("InvalidReviewSnapshot", message);
}

export function executionInProgress(message = "Execution is already processing."): DomainError {
  return new DomainError("ExecutionInProgress", message);
}

export function executionFailed(message = "The simulated execution failed."): DomainError {
  return new DomainError("ExecutionFailed", message);
}
