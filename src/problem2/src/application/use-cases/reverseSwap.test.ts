import { describe, expect, it } from "vitest";
import { Decimal, calculateQuote as domainCalculateQuote } from "@/domain";
import type { Asset } from "@/domain";
import { reverseSwap } from "./reverseSwap";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

function ethToAtomQuote() {
  const result = domainCalculateQuote({
    sourceAsset: ETH,
    destinationAsset: ATOM,
    sourceAmount: new Decimal(1),
    slippage: 0.005,
  });
  if (!result.ok) throw new Error("expected a valid quote");
  return result.value;
}

describe("reverseSwap (application use case)", () => {
  it("exchanges source/destination and revalidates against the new source asset's balance", () => {
    const quote = ethToAtomQuote();

    const result = reverseSwap({
      currentQuote: quote,
      newSourceBalanceAmount: 1000,
      slippage: 0.005,
    });

    expect(result.sourceAsset.symbol).toBe("ATOM");
    expect(result.destinationAsset.symbol).toBe("ETH");
    expect(result.sourceAmount.equals(quote.receiveAmount)).toBe(true);
    expect(result.validation.reviewEligible).toBe(true);
  });

  it("uses the unrounded receive amount, not a display-rounded value, as the new source amount", () => {
    const quote = ethToAtomQuote();

    const result = reverseSwap({
      currentQuote: quote,
      newSourceBalanceAmount: 1000,
      slippage: 0.005,
    });

    expect(result.sourceAmount.decimalPlaces()).toBeGreaterThan(2);
  });

  it("marks the reversed swap ineligible when the new source balance is insufficient", () => {
    const quote = ethToAtomQuote();

    const result = reverseSwap({ currentQuote: quote, newSourceBalanceAmount: 1, slippage: 0.005 });

    expect(result.validation.reviewEligible).toBe(false);
    expect(result.validation.error?.code).toBe("AmountExceedsBalance");
  });
});
