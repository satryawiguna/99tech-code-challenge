import { describe, expect, it, vi } from "vitest";
import { fetchPriceFeed } from "@/infrastructure";
import { loadPrices } from "./loadPrices";
import { refreshPrices } from "./refreshPrices";
import { EMPTY_PRICE_STATE } from "../services/priceState";

function fakeResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

async function loadInitialPriceState() {
  const fetchImpl = vi.fn(async () =>
    fakeResponse([{ currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 }]),
  );
  const result = await loadPrices({
    fetchPriceRecords: () => fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl }),
  });
  if (result.status !== "loaded") throw new Error("expected initial load to succeed");
  return result.priceState;
}

describe("refreshPrices", () => {
  it("replaces normalized prices and the dataset timestamp on a successful refresh", async () => {
    const previousPriceState = await loadInitialPriceState();
    const fetchImpl = vi.fn(async () =>
      fakeResponse([{ currency: "ETH", date: "2023-08-29T08:00:00.000Z", price: 1700 }]),
    );

    const result = await refreshPrices({
      previousPriceState,
      fetchPriceRecords: () =>
        fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl }),
    });

    expect(result.status).toBe("refreshed");
    if (result.status !== "refreshed") return;
    expect(result.priceState.assets[0].price.toNumber()).toBe(1700);
    expect(result.priceState.datasetTimestamp).toBe(Date.parse("2023-08-29T08:00:00.000Z"));
  });

  it("preserves the previously valid price state when the refresh fails", async () => {
    const previousPriceState = await loadInitialPriceState();
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });

    const result = await refreshPrices({
      previousPriceState,
      fetchPriceRecords: () =>
        fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl }),
    });

    expect(result.status).toBe("refresh-failed");
    if (result.status !== "refresh-failed") return;
    expect(result.error.code).toBe("NetworkError");
    expect(result.priceState).toBe(previousPriceState);
    expect(result.priceState.assets[0].price.toNumber()).toBe(1600);
  });

  it("preserves an explicitly empty previous state when no prior load ever succeeded", async () => {
    const fetchImpl = vi.fn(async () => fakeResponse({ not: "an array" }));

    const result = await refreshPrices({
      previousPriceState: EMPTY_PRICE_STATE,
      fetchPriceRecords: () =>
        fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl }),
    });

    expect(result.status).toBe("refresh-failed");
    if (result.status !== "refresh-failed") return;
    expect(result.priceState).toBe(EMPTY_PRICE_STATE);
  });
});
