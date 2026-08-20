import { describe, expect, it } from "vitest";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { applyHalfAmount, applyMaxAmount } from "./applyAmount";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

describe("applyHalfAmount", () => {
  it("sets the amount to half the balance and recalculates/revalidates the quote", () => {
    const result = applyHalfAmount({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceBalanceAmount: 4,
      slippage: 0.005,
    });

    expect(result.sourceAmount.toNumber()).toBe(2);
    expect(result.validation.reviewEligible).toBe(true);
    expect(result.validation.quote?.sourceAmount.toNumber()).toBe(2);
  });

  it("still returns the derived amount when no destination asset is selected yet", () => {
    const result = applyHalfAmount({
      sourceAsset: ETH,
      destinationAsset: null,
      sourceBalanceAmount: 4,
      slippage: 0.005,
    });

    expect(result.sourceAmount.toNumber()).toBe(2);
    expect(result.validation.reviewEligible).toBe(false);
    expect(result.validation.error?.code).toBe("MissingDestinationAsset");
  });
});

describe("applyMaxAmount", () => {
  it("sets the amount to the full balance and recalculates/revalidates the quote", () => {
    const result = applyMaxAmount({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    expect(result.sourceAmount.toNumber()).toBe(4.2183);
    expect(result.validation.reviewEligible).toBe(true);
  });

  it("never produces an amount exceeding the balance", () => {
    const result = applyMaxAmount({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    expect(result.validation.error).toBeNull();
  });
});
