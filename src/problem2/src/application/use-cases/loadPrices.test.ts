import { describe, expect, it, vi } from "vitest";
import { fetchPriceFeed } from "@/infrastructure";
import { loadPrices } from "./loadPrices";

function fakeResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

describe("loadPrices (integration with the real Infrastructure price adapter)", () => {
  it("loads, normalizes, and derives assets/timestamp from the price feed", async () => {
    const fetchImpl = vi.fn(async () =>
      fakeResponse([
        { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
        { currency: "ATOM", date: "2023-08-29T07:10:00.000Z", price: 7.1573 },
        { currency: "DEAD", date: "2023-08-29T07:10:00.000Z", price: 0 },
      ]),
    );
    const fetchPriceRecords = () =>
      fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    const result = await loadPrices({ fetchPriceRecords });

    expect(result.status).toBe("loaded");
    if (result.status !== "loaded") return;
    expect(result.priceState.assets.map((asset) => asset.symbol).sort()).toEqual(["ATOM", "ETH"]);
    expect(result.priceState.datasetTimestamp).toBe(Date.parse("2023-08-29T07:10:52.000Z"));
  });

  it("returns an error result when the price feed adapter fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });
    const fetchPriceRecords = () =>
      fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    const result = await loadPrices({ fetchPriceRecords });

    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(result.error.code).toBe("NetworkError");
  });

  it("returns an empty, still-successful price state when the feed has no usable records", async () => {
    const fetchImpl = vi.fn(async () => fakeResponse([]));
    const fetchPriceRecords = () =>
      fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    const result = await loadPrices({ fetchPriceRecords });

    expect(result.status).toBe("loaded");
    if (result.status !== "loaded") return;
    expect(result.priceState.assets).toEqual([]);
    expect(result.priceState.datasetTimestamp).toBeNull();
  });
});
