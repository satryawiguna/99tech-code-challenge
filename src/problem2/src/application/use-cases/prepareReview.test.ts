import { describe, expect, it } from "vitest";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { calculateQuote } from "./calculateQuote";
import { prepareReview } from "./prepareReview";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

describe("prepareReview", () => {
  it("creates an immutable review snapshot from a review-eligible quote", () => {
    const validation = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    const result = prepareReview(validation);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(result.value.sourceAsset.symbol).toBe("ETH");
  });

  it("refuses to create a review snapshot when the swap is not review-eligible", () => {
    const validation = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "5",
      sourceBalanceAmount: 4.2183,
      slippage: 0.005,
    });

    const result = prepareReview(validation);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("AmountExceedsBalance");
  });
});
