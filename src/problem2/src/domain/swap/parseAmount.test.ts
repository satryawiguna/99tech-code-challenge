import { describe, expect, it } from "vitest";
import { parseAmount } from "./parseAmount";

describe("parseAmount", () => {
  it("parses a valid plain decimal string", () => {
    expect(parseAmount("1").toNumber()).toBe(1);
    expect(parseAmount("0.5").toNumber()).toBe(0.5);
    expect(parseAmount("1645.9337373737374").toNumber()).toBeCloseTo(1645.9337373737374);
  });

  it("trims surrounding whitespace", () => {
    expect(parseAmount("  2.5  ").toNumber()).toBe(2.5);
  });

  it("returns a non-finite Decimal for empty input", () => {
    expect(parseAmount("").isFinite()).toBe(false);
    expect(parseAmount("   ").isFinite()).toBe(false);
  });

  it("returns a non-finite Decimal for non-numeric input", () => {
    expect(parseAmount("abc").isFinite()).toBe(false);
  });

  it("returns a non-finite Decimal for malformed decimals", () => {
    expect(parseAmount("1.2.3").isFinite()).toBe(false);
    expect(parseAmount("1..2").isFinite()).toBe(false);
    expect(parseAmount("..5").isFinite()).toBe(false);
    expect(parseAmount("-").isFinite()).toBe(false);
  });

  it("parses zero and negative amounts as finite (business validity is Domain quote/validation's job, not parsing)", () => {
    expect(parseAmount("0").isFinite()).toBe(true);
    expect(parseAmount("-5").isFinite()).toBe(true);
  });
});
