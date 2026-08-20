import Decimal from "decimal.js";
import type { NormalizedPrice } from "../price/normalizedPrice";

export interface Asset {
  readonly symbol: string;
  readonly price: Decimal;
}

export function toAsset(normalizedPrice: NormalizedPrice): Asset {
  return { symbol: normalizedPrice.currency, price: normalizedPrice.price };
}

export function assetsFromNormalizedPrices(prices: readonly NormalizedPrice[]): Asset[] {
  return prices.map(toAsset);
}

export function isSelectableAsset(asset: Asset | null | undefined): asset is Asset {
  return !!asset && asset.symbol.length > 0 && asset.price.isFinite() && asset.price.greaterThan(0);
}
