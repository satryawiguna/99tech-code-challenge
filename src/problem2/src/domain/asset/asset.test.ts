import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { assetsFromNormalizedPrices, isSelectableAsset, toAsset } from "./asset";
import type { NormalizedPrice } from "../price/normalizedPrice";

function normalizedPrice(currency: string, price: number): NormalizedPrice {
  return { currency, price: new Decimal(price), timestamp: Date.parse("2023-08-29T07:10:52.000Z") };
}

describe("toAsset / assetsFromNormalizedPrices", () => {
  it("maps a normalized price to an asset with the same symbol and price", () => {
    const asset = toAsset(normalizedPrice("ETH", 1645.9337373737374));

    expect(asset.symbol).toBe("ETH");
    expect(asset.price.toNumber()).toBeCloseTo(1645.9337373737374);
  });

  it("maps a collection of normalized prices to assets", () => {
    const assets = assetsFromNormalizedPrices([
      normalizedPrice("ETH", 1600),
      normalizedPrice("ATOM", 7.1573),
    ]);

    expect(assets.map((asset) => asset.symbol)).toEqual(["ETH", "ATOM"]);
  });
});

describe("isSelectableAsset", () => {
  it("returns true for an asset with a valid positive price", () => {
    expect(isSelectableAsset(toAsset(normalizedPrice("ETH", 1600)))).toBe(true);
  });

  it("returns false for undefined or null", () => {
    expect(isSelectableAsset(undefined)).toBe(false);
    expect(isSelectableAsset(null)).toBe(false);
  });

  it("returns false for a non-finite or non-positive price", () => {
    expect(isSelectableAsset({ symbol: "X", price: new Decimal(0) })).toBe(false);
    expect(isSelectableAsset({ symbol: "X", price: new Decimal(-1) })).toBe(false);
    expect(isSelectableAsset({ symbol: "X", price: new Decimal(Infinity) })).toBe(false);
  });
});
