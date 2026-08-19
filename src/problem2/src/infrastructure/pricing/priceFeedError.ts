export type PriceFeedErrorCode = "NetworkError" | "InvalidResponseShape";

export interface PriceFeedError {
  readonly code: PriceFeedErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
