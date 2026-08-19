import type { Asset, NormalizedPrice } from "@/domain";

export interface PriceState {
  readonly normalizedPrices: NormalizedPrice[];
  readonly assets: Asset[];
  readonly datasetTimestamp: number | null;
}

export const EMPTY_PRICE_STATE: PriceState = {
  normalizedPrices: [],
  assets: [],
  datasetTimestamp: null,
};
