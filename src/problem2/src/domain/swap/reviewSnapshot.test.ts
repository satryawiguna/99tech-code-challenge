import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { createReviewSnapshot } from "./reviewSnapshot";
import { validateSwap } from "./validateSwap";
import type { Asset } from "../asset/asset";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

describe("createReviewSnapshot", () => {
  it("creates a snapshot from a valid, review-eligible swap", () => {
    const validation = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      sourceBalance: new Decimal(4.2183),
      slippage: 0.005,
    });

    const result = createReviewSnapshot(validation);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sourceAsset.symbol).toBe("ETH");
    expect(result.value.destinationAsset.symbol).toBe("ATOM");
  });

  it("is immutable — attempting to reassign a field does not change the snapshot", () => {
    const validation = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      sourceBalance: new Decimal(4.2183),
      slippage: 0.005,
    });
    const result = createReviewSnapshot(validation);
    if (!result.ok) throw new Error("expected a valid snapshot");

    expect(Object.isFrozen(result.value)).toBe(true);
    expect(() => {
      // @ts-expect-error intentionally testing immutability against a readonly field
      result.value.sourceAmount = new Decimal(999);
    }).toThrow();
  });

  it("returns InvalidReview when the swap is not review-eligible (e.g. insufficient balance)", () => {
    const validation = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(5),
      sourceBalance: new Decimal(4.2183),
      slippage: 0.005,
    });

    const result = createReviewSnapshot(validation);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("AmountExceedsBalance");
  });

  it("returns InvalidReview when the underlying quote itself is invalid", () => {
    const validation = validateSwap({
      sourceAsset: ETH,
      destinationAsset: ETH,
      sourceAmount: new Decimal(1),
      sourceBalance: new Decimal(10),
      slippage: 0.005,
    });

    const result = createReviewSnapshot(validation);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("SameAssetSwap");
  });
});
