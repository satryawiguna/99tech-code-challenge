import { describe, expect, it } from "vitest";
import { isSlippageTolerance, SLIPPAGE_TOLERANCES } from "./slippage";

describe("SLIPPAGE_TOLERANCES", () => {
  it("supports exactly 0.1%, 0.5%, and 1%", () => {
    expect(SLIPPAGE_TOLERANCES).toEqual([0.001, 0.005, 0.01]);
  });
});

describe("isSlippageTolerance", () => {
  it("accepts the supported values", () => {
    expect(isSlippageTolerance(0.001)).toBe(true);
    expect(isSlippageTolerance(0.005)).toBe(true);
    expect(isSlippageTolerance(0.01)).toBe(true);
  });

  it("rejects unsupported values", () => {
    expect(isSlippageTolerance(0.02)).toBe(false);
    expect(isSlippageTolerance(0)).toBe(false);
  });
});
