import { describe, expect, it } from "vitest";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { calculateQuote } from "./calculateQuote";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

describe("calculateQuote (application use case)", () => {
  it("produces a review-eligible quote for a valid raw amount within balance", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    expect(result.reviewEligible).toBe(true);
    expect(result.quote?.sourceAsset.symbol).toBe("ETH");
  });

  it("treats a malformed decimal string as an invalid amount, not a crash", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1.2.3",
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    expect(result.reviewEligible).toBe(false);
    expect(result.error?.code).toBe("InvalidAmount");
  });

  it("marks the swap ineligible when the raw amount exceeds the balance, while still returning a quote", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "5",
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    expect(result.quote).not.toBeNull();
    expect(result.reviewEligible).toBe(false);
    expect(result.error?.code).toBe("AmountExceedsBalance");
  });

  it("does not compute or expose price impact or network fee", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    expect(result.quote).not.toHaveProperty("priceImpact");
    expect(result.quote).not.toHaveProperty("networkFee");
  });
});
