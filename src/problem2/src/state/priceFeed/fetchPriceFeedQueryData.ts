import { EMPTY_PRICE_STATE, loadPrices, refreshPrices } from "@/application";
import type { FetchPriceRecords, PriceFetchError, PriceState } from "@/application";

export interface PriceFeedQueryData {
  readonly priceState: PriceState;
  /** null when the most recent fetch succeeded; set when it failed (recoverable — priceState still reflects the last valid data). */
  readonly lastError: PriceFetchError | null;
}

export interface FetchPriceFeedQueryDataInput {
  readonly fetchPriceRecords: FetchPriceRecords;
  /** The previously resolved query data, if any. Absent on the very first load. */
  readonly previous: PriceFeedQueryData | null;
}

/**
 * Framework-independent orchestration used by `usePriceFeedQuery`: the first
 * call uses `loadPrices`; every subsequent call uses `refreshPrices` with the
 * previous result's priceState, so a refresh failure preserves the last
 * valid normalized prices (FR-017, domain.md §18) as an explicit typed
 * result rather than relying on TanStack Query's implicit stale-data
 * behavior. Kept independent of React so it is directly unit-testable.
 */
export async function fetchPriceFeedQueryData(
  input: FetchPriceFeedQueryDataInput,
): Promise<PriceFeedQueryData> {
  if (!input.previous) {
    const result = await loadPrices({ fetchPriceRecords: input.fetchPriceRecords });
    return result.status === "loaded"
      ? { priceState: result.priceState, lastError: null }
      : { priceState: EMPTY_PRICE_STATE, lastError: result.error };
  }

  const result = await refreshPrices({
    fetchPriceRecords: input.fetchPriceRecords,
    previousPriceState: input.previous.priceState,
  });

  return result.status === "refreshed"
    ? { priceState: result.priceState, lastError: null }
    : { priceState: result.priceState, lastError: result.error };
}
