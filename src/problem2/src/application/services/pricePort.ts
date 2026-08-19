import type { PriceRecord, Result } from "@/domain";

/**
 * Application-owned port: the shape Infrastructure's price adapter must
 * satisfy. Deliberately independent of Infrastructure's own PriceFeedError
 * type (architecture.md §5.1 — Application depends on Domain and its own
 * ports, never on Infrastructure directly) even though the two shapes match
 * in practice; Infrastructure's `fetchPriceFeed` is structurally compatible
 * with this port once curried with a URL, with no explicit adapter needed.
 */
export type PriceFetchErrorCode = "NetworkError" | "InvalidResponseShape";

export interface PriceFetchError {
  readonly code: PriceFetchErrorCode;
  readonly message: string;
}

export type FetchPriceRecords = () => Promise<Result<PriceRecord[], PriceFetchError>>;
