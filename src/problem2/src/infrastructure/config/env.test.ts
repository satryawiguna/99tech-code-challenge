import { describe, expect, it } from "vitest";
import { readAppConfig } from "./env";

describe("readAppConfig", () => {
  it("uses the provided APP_ENV and PRICE_FEED_URL when valid", () => {
    const config = readAppConfig({
      APP_ENV: "dev",
      PRICE_FEED_URL: "https://example.test/prices.json",
    });

    expect(config).toEqual({ appEnv: "dev", priceFeedUrl: "https://example.test/prices.json" });
  });

  it.each(["local", "dev", "prod"] as const)("accepts %s as a valid APP_ENV", (appEnv) => {
    expect(readAppConfig({ APP_ENV: appEnv }).appEnv).toBe(appEnv);
  });

  it("defaults APP_ENV to local when missing or unrecognized", () => {
    expect(readAppConfig({}).appEnv).toBe("local");
    expect(readAppConfig({ APP_ENV: "staging" }).appEnv).toBe("local");
  });

  it("defaults PRICE_FEED_URL to the challenge-provided endpoint when missing or blank", () => {
    expect(readAppConfig({}).priceFeedUrl).toBe("https://interview.switcheo.com/prices.json");
    expect(readAppConfig({ PRICE_FEED_URL: "  " }).priceFeedUrl).toBe(
      "https://interview.switcheo.com/prices.json",
    );
  });

  it("never reads process.env directly (pure function of its input)", () => {
    const before = readAppConfig({});
    process.env.PRICE_FEED_URL = "https://should-not-be-read.test";
    const after = readAppConfig({});
    delete process.env.PRICE_FEED_URL;

    expect(after).toEqual(before);
  });

  it("prefers NEXT_PUBLIC_PRICE_FEED_URL/NEXT_PUBLIC_APP_ENV over the unprefixed names", () => {
    const config = readAppConfig({
      APP_ENV: "local",
      PRICE_FEED_URL: "https://unprefixed.test/prices.json",
      NEXT_PUBLIC_APP_ENV: "prod",
      NEXT_PUBLIC_PRICE_FEED_URL: "https://prefixed.test/prices.json",
    });

    expect(config).toEqual({ appEnv: "prod", priceFeedUrl: "https://prefixed.test/prices.json" });
  });

  it("falls back to the unprefixed names when NEXT_PUBLIC_ variants are absent", () => {
    const config = readAppConfig({
      APP_ENV: "dev",
      PRICE_FEED_URL: "https://unprefixed.test/prices.json",
    });

    expect(config).toEqual({ appEnv: "dev", priceFeedUrl: "https://unprefixed.test/prices.json" });
  });
});
