import { describe, expect, it, vi } from "vitest";
import { fetchPriceFeed } from "./fetchPriceFeed";

function fakeResponse(options: {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
}): Response {
  return {
    ok: options.ok,
    status: options.status ?? (options.ok ? 200 : 500),
    json: options.json ?? (async () => []),
  } as Response;
}

describe("fetchPriceFeed", () => {
  it("returns validated records for a well-formed array response", async () => {
    const fetchImpl = vi.fn(async () =>
      fakeResponse({
        ok: true,
        json: async () => [
          { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
        ],
      }),
    );

    const result = await fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual([
      { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
    ]);
    expect(fetchImpl).toHaveBeenCalledWith("https://example.test/prices.json");
  });

  it("drops individual records with the wrong shape while keeping valid ones", async () => {
    const fetchImpl = vi.fn(async () =>
      fakeResponse({
        ok: true,
        json: async () => [
          { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1600 },
          { currency: "BAD", date: "2023-08-29T07:10:52.000Z", price: "not-a-number" },
          { currency: "ALSO_BAD" },
          null,
          "not-an-object",
        ],
      }),
    );

    const result = await fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0].currency).toBe("ETH");
  });

  it("returns InvalidResponseShape when the top-level response is not an array", async () => {
    const fetchImpl = vi.fn(async () =>
      fakeResponse({ ok: true, json: async () => ({ not: "an array" }) }),
    );

    const result = await fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("InvalidResponseShape");
  });

  it("returns InvalidResponseShape when the body is not valid JSON", async () => {
    const fetchImpl = vi.fn(async () =>
      fakeResponse({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
    );

    const result = await fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("InvalidResponseShape");
  });

  it("returns NetworkError for a non-ok HTTP status", async () => {
    const fetchImpl = vi.fn(async () => fakeResponse({ ok: false, status: 503 }));

    const result = await fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("NetworkError");
    expect(result.error.message).toContain("503");
  });

  it("returns NetworkError when the fetch call itself throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });

    const result = await fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("NetworkError");
  });

  it("returns an empty but successful result when the feed legitimately has no records", async () => {
    const fetchImpl = vi.fn(async () => fakeResponse({ ok: true, json: async () => [] }));

    const result = await fetchPriceFeed({ url: "https://example.test/prices.json", fetchImpl });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual([]);
  });
});
