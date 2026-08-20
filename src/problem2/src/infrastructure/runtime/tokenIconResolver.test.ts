import { describe, expect, it } from "vitest";
import {
  BUNDLED_TOKEN_ICON_SYMBOLS,
  FALLBACK_TOKEN_ICON_PATH,
  resolveTokenIconPath,
} from "./tokenIconResolver";

describe("resolveTokenIconPath", () => {
  it("returns the exact-match icon path when the symbol has a bundled icon", () => {
    expect(resolveTokenIconPath("ETH")).toBe("/tokens/ETH.svg");
    expect(resolveTokenIconPath("bNEO")).toBe("/tokens/bNEO.svg");
  });

  it("resolves known casing aliases when there is no exact-match file", () => {
    expect(resolveTokenIconPath("STATOM")).toBe("/tokens/stATOM.svg");
    expect(resolveTokenIconPath("RATOM")).toBe("/tokens/rATOM.svg");
  });

  it("falls back to the generic placeholder for a completely unknown symbol", () => {
    expect(resolveTokenIconPath("TOTALLY_UNKNOWN_SYMBOL")).toBe(FALLBACK_TOKEN_ICON_PATH);
  });

  it("never throws for an empty or unexpected symbol", () => {
    expect(() => resolveTokenIconPath("")).not.toThrow();
    expect(resolveTokenIconPath("")).toBe(FALLBACK_TOKEN_ICON_PATH);
  });

  it("respects an injected available-icons set for testability", () => {
    const limited = new Set(["ONLY_ONE"]);

    expect(resolveTokenIconPath("ONLY_ONE", limited)).toBe("/tokens/ONLY_ONE.svg");
    expect(resolveTokenIconPath("ETH", limited)).toBe(FALLBACK_TOKEN_ICON_PATH);
  });

  it("covers every Discovery-flagged icon-mapping-risk symbol", () => {
    for (const symbol of [
      "STATOM",
      "STOSMO",
      "STLUNA",
      "STEVMOS",
      "RATOM",
      "bNEO",
      "ampLUNA",
      "rSWTH",
      "axlUSDC",
      "wstETH",
      "YieldUSD",
    ]) {
      expect(resolveTokenIconPath(symbol)).not.toBe(FALLBACK_TOKEN_ICON_PATH);
    }
  });

  it("keeps the bundled icon set non-empty", () => {
    expect(BUNDLED_TOKEN_ICON_SYMBOLS.size).toBeGreaterThan(0);
  });
});
