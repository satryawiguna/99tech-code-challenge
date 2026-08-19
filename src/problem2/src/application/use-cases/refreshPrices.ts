import {
  assetsFromNormalizedPrices,
  latestDatasetTimestamp,
  normalizePriceRecords,
} from "@/domain";
import type { FetchPriceRecords, PriceFetchError } from "../services/pricePort";
import type { PriceState } from "../services/priceState";

export type RefreshPricesResult =
  | { readonly status: "refreshed"; readonly priceState: PriceState }
  | {
      readonly status: "refresh-failed";
      readonly priceState: PriceState;
      readonly error: PriceFetchError;
    };

export interface RefreshPricesInput {
  readonly fetchPriceRecords: FetchPriceRecords;
  readonly previousPriceState: PriceState;
}

/**
 * FR-017 / domain.md §18: on success, normalized prices and the dataset
 * timestamp are replaced. On failure, the explicit "refresh-failed" result
 * carries the caller's own `previousPriceState` forward unchanged, so a
 * previously valid price state remains usable — how that is surfaced in the
 * UI is left to a later State/Presentation phase, not decided here.
 */
export async function refreshPrices(input: RefreshPricesInput): Promise<RefreshPricesResult> {
  const result = await input.fetchPriceRecords();

  if (!result.ok) {
    return { status: "refresh-failed", priceState: input.previousPriceState, error: result.error };
  }

  const normalizedPrices = normalizePriceRecords(result.value);
  const assets = assetsFromNormalizedPrices(normalizedPrices);
  const datasetTimestamp = latestDatasetTimestamp(normalizedPrices);

  return { status: "refreshed", priceState: { normalizedPrices, assets, datasetTimestamp } };
}
