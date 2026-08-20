import {
  assetsFromNormalizedPrices,
  latestDatasetTimestamp,
  normalizePriceRecords,
} from "@/domain";
import type { FetchPriceRecords, PriceFetchError } from "../services/pricePort";
import type { PriceState } from "../services/priceState";

export type LoadPricesResult =
  | { readonly status: "loaded"; readonly priceState: PriceState }
  | { readonly status: "error"; readonly error: PriceFetchError };

export interface LoadPricesInput {
  readonly fetchPriceRecords: FetchPriceRecords;
}

/**
 * FR-001: fetch the price feed and hand the raw records to Domain
 * normalization. Infrastructure has already validated response shape before
 * this runs (architecture.md §41) — this use case only orchestrates the
 * fetch → normalize → derive-assets/timestamp workflow.
 */
export async function loadPrices(input: LoadPricesInput): Promise<LoadPricesResult> {
  const result = await input.fetchPriceRecords();

  if (!result.ok) {
    return { status: "error", error: result.error };
  }

  const normalizedPrices = normalizePriceRecords(result.value);
  const assets = assetsFromNormalizedPrices(normalizedPrices);
  const datasetTimestamp = latestDatasetTimestamp(normalizedPrices);

  return { status: "loaded", priceState: { normalizedPrices, assets, datasetTimestamp } };
}
