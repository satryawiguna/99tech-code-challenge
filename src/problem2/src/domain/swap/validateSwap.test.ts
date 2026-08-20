import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { validateSwap } from "./validateSwap";
import type { Asset } from "../asset/asset";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

describe("validateSwap", () => {
  it("is reviewEligible with a quote when the amount is within balance", () => {
    const result = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(2),
      sourceBalance: new Decimal(4.2183),
      slippage: 0.005,
    });

    expect(result.reviewEligible).toBe(true);
    expect(result.error).toBeNull();
    expect(result.quote).not.toBeNull();
  });

  it("returns a mathematically valid quote but marks the swap ineligible when the amount exceeds balance", () => {
    const result = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(5),
      sourceBalance: new Decimal(4.2183),
      slippage: 0.005,
    });

    expect(result.quote).not.toBeNull();
    expect(result.reviewEligible).toBe(false);
    expect(result.error?.code).toBe("AmountExceedsBalance");
  });

  it("allows an amount exactly equal to the balance", () => {
    const balance = new Decimal(4.2183);
    const result = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: balance,
      sourceBalance: balance,
      slippage: 0.005,
    });

    expect(result.reviewEligible).toBe(true);
  });

  it("returns no quote when the quote itself cannot be calculated (e.g. same asset)", () => {
    const result = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ETH,
      sourceAmount: new Decimal(1),
      sourceBalance: new Decimal(10),
      slippage: 0.005,
    });

    expect(result.quote).toBeNull();
    expect(result.reviewEligible).toBe(false);
    expect(result.error?.code).toBe("SameAssetSwap");
  });
});
