import { describe, expect, it } from "vitest";
import { normalizePriceRecords, latestDatasetTimestamp } from "./normalizePriceRecords";
import type { PriceRecord } from "./priceRecord";

describe("normalizePriceRecords", () => {
  it("selects the latest valid record per currency", () => {
    const records: PriceRecord[] = [
      { currency: "ETH", date: "2023-08-29T07:00:00.000Z", price: 1600 },
      { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
    ];

    const result = normalizePriceRecords(records);

    expect(result).toHaveLength(1);
    expect(result[0].currency).toBe("ETH");
    expect(result[0].price.toNumber()).toBeCloseTo(1645.9337373737374);
    expect(result[0].timestamp).toBe(Date.parse("2023-08-29T07:10:52.000Z"));
  });

  it("returns at most one normalized price per currency", () => {
    const records: PriceRecord[] = [
      { currency: "USDC", date: "2023-08-29T07:10:40.000Z", price: 0.989832 },
      { currency: "USDC", date: "2023-08-29T07:10:30.000Z", price: 1 },
      { currency: "USDC", date: "2023-08-29T07:10:30.000Z", price: 1 },
      { currency: "USDC", date: "2023-08-29T07:10:40.000Z", price: 0.9998782611186441 },
    ];

    const result = normalizePriceRecords(records);
    const usdcRecords = result.filter((price) => price.currency === "USDC");

    expect(usdcRecords).toHaveLength(1);
  });

  it("uses the lowest numeric price as the deterministic tie-breaker for equal timestamps", () => {
    const records: PriceRecord[] = [
      { currency: "USDC", date: "2023-08-29T07:10:40.000Z", price: 0.989832 },
      { currency: "USDC", date: "2023-08-29T07:10:40.000Z", price: 0.9998782611186441 },
    ];

    const result = normalizePriceRecords(records);

    expect(result[0].price.toNumber()).toBe(0.989832);
  });

  it("excludes records with invalid, zero, negative, or non-numeric prices", () => {
    const records: PriceRecord[] = [
      { currency: "ZIL", date: "2023-08-29T07:10:00.000Z", price: Number.NaN },
      { currency: "ZIL", date: "2023-08-29T07:10:00.000Z", price: 0 },
      { currency: "ZIL", date: "2023-08-29T07:10:00.000Z", price: -1 },
      { currency: "BLUR", date: "2023-08-29T07:10:00.000Z", price: 0.2081153 },
    ];

    const result = normalizePriceRecords(records);

    expect(result.find((price) => price.currency === "ZIL")).toBeUndefined();
    expect(result.find((price) => price.currency === "BLUR")).toBeDefined();
  });

  it("excludes records with an unparseable date", () => {
    const records: PriceRecord[] = [{ currency: "OSMO", date: "not-a-date", price: 0.3772 }];

    const result = normalizePriceRecords(records);

    expect(result).toHaveLength(0);
  });

  it("produces a result independent of raw array order", () => {
    const records: PriceRecord[] = [
      { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
      { currency: "ETH", date: "2023-08-29T07:00:00.000Z", price: 1600 },
      { currency: "ATOM", date: "2023-08-29T07:10:00.000Z", price: 7.1573 },
    ];

    const forward = normalizePriceRecords(records);
    const reversed = normalizePriceRecords([...records].reverse());

    expect(forward).toEqual(reversed);
  });

  it("returns an empty collection when no records are valid", () => {
    expect(normalizePriceRecords([])).toEqual([]);
  });
});

describe("latestDatasetTimestamp", () => {
  it("returns the latest timestamp among normalized prices", () => {
    const records: PriceRecord[] = [
      { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
      { currency: "ATOM", date: "2023-08-29T06:00:00.000Z", price: 7.1573 },
    ];

    const normalized = normalizePriceRecords(records);

    expect(latestDatasetTimestamp(normalized)).toBe(Date.parse("2023-08-29T07:10:52.000Z"));
  });

  it("returns null when no normalized prices exist", () => {
    expect(latestDatasetTimestamp([])).toBeNull();
  });
});
