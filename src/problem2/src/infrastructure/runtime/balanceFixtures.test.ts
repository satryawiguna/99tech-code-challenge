import { describe, expect, it } from "vitest";
import { BALANCE_FIXTURES, getFixtureBalance } from "./balanceFixtures";

describe("getFixtureBalance", () => {
  it("returns the fixed seed balance for a known symbol", () => {
    expect(getFixtureBalance("ETH")).toBe(5);
  });

  it("returns zero for an asset with no seeded balance", () => {
    expect(getFixtureBalance("ZIL")).toBe(0);
  });

  it("uses only round, simulated values", () => {
    for (const amount of Object.values(BALANCE_FIXTURES)) {
      expect(Number.isFinite(amount)).toBe(true);
      expect(amount).toBeGreaterThan(0);
    }
  });
});
