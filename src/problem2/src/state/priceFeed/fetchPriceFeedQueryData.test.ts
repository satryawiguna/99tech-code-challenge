import { describe, expect, it } from "vitest";
import type { FetchPriceRecords } from "@/application";
import { fetchPriceFeedQueryData } from "./fetchPriceFeedQueryData";

function fetcherFor(
  records: Array<{ currency: string; date: string; price: number }>,
): FetchPriceRecords {
  return async () => ({ ok: true, value: records });
}

function failingFetcher(
  code: "NetworkError" | "InvalidResponseShape" = "NetworkError",
): FetchPriceRecords {
  return async () => ({ ok: false, error: { code, message: "simulated failure" } });
}

describe("fetchPriceFeedQueryData", () => {
  it("uses loadPrices semantics on the first call (no previous data)", async () => {
    const data = await fetchPriceFeedQueryData({
      fetchPriceRecords: fetcherFor([
        { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 },
      ]),
      previous: null,
    });

    expect(data.lastError).toBeNull();
    expect(data.priceState.assets.map((asset) => asset.symbol)).toEqual(["ETH"]);
  });

  it("returns an empty price state with the error when the very first load fails", async () => {
    const data = await fetchPriceFeedQueryData({
      fetchPriceRecords: failingFetcher(),
      previous: null,
    });

    expect(data.lastError?.code).toBe("NetworkError");
    expect(data.priceState.assets).toEqual([]);
  });

  it("uses refreshPrices semantics on a subsequent call and replaces prices on success", async () => {
    const first = await fetchPriceFeedQueryData({
      fetchPriceRecords: fetcherFor([
        { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 },
      ]),
      previous: null,
    });

    const second = await fetchPriceFeedQueryData({
      fetchPriceRecords: fetcherFor([
        { currency: "ETH", date: "2023-08-29T08:00:00.000Z", price: 1700 },
      ]),
      previous: first,
    });

    expect(second.lastError).toBeNull();
    expect(second.priceState.assets[0].price.toNumber()).toBe(1700);
  });

  it("preserves the previously valid price state when a subsequent refresh fails", async () => {
    const first = await fetchPriceFeedQueryData({
      fetchPriceRecords: fetcherFor([
        { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 },
      ]),
      previous: null,
    });
    expect(first.lastError).toBeNull();

    const second = await fetchPriceFeedQueryData({
      fetchPriceRecords: failingFetcher("NetworkError"),
      previous: first,
    });

    expect(second.lastError?.code).toBe("NetworkError");
    expect(second.priceState).toBe(first.priceState);
    expect(second.priceState.assets[0].price.toNumber()).toBe(1600);
  });

  it("recovers on a third call after a failed second call, still building on the last valid state", async () => {
    const first = await fetchPriceFeedQueryData({
      fetchPriceRecords: fetcherFor([
        { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 },
      ]),
      previous: null,
    });
    const second = await fetchPriceFeedQueryData({
      fetchPriceRecords: failingFetcher(),
      previous: first,
    });
    const third = await fetchPriceFeedQueryData({
      fetchPriceRecords: fetcherFor([
        { currency: "ETH", date: "2023-08-29T09:00:00.000Z", price: 1800 },
      ]),
      previous: second,
    });

    expect(third.lastError).toBeNull();
    expect(third.priceState.assets[0].price.toNumber()).toBe(1800);
  });
});
