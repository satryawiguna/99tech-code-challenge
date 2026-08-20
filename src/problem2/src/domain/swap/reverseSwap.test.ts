import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { reverseSwap } from "./reverseSwap";
import { calculateQuote } from "./swapQuote";
import type { Asset } from "../asset/asset";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

describe("reverseSwap", () => {
  it("exchanges source and destination assets", () => {
    const quoteResult = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });
    if (!quoteResult.ok) throw new Error("expected a valid quote");

    const reversed = reverseSwap(quoteResult.value);

    expect(reversed.sourceAsset.symbol).toBe("ATOM");
    expect(reversed.destinationAsset.symbol).toBe("ETH");
  });

  it("uses the underlying unrounded receive amount as the new source amount, not a display-rounded value", () => {
    const quoteResult = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });
    if (!quoteResult.ok) throw new Error("expected a valid quote");

    const reversed = reverseSwap(quoteResult.value);

    expect(reversed.sourceAmount.equals(quoteResult.value.receiveAmount)).toBe(true);
    // Sanity check: the underlying value carries far more precision than any display-rounded amount would.
    expect(reversed.sourceAmount.decimalPlaces()).toBeGreaterThan(2);
  });

  it("recalculating a quote from the reversed input produces a consistent round trip", () => {
    const original = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });
    if (!original.ok) throw new Error("expected a valid quote");

    const reversed = reverseSwap(original.value);
    const roundTrip = calculateQuote({
      sourceAsset: reversed.sourceAsset,
      destinationAsset: reversed.destinationAsset,
      sourceAmount: reversed.sourceAmount,
      slippage: 0.005,
    });

    expect(roundTrip.ok).toBe(true);
    if (!roundTrip.ok) return;
    expect(roundTrip.value.receiveAmount.equals(new Decimal(1))).toBe(true);
  });
});
