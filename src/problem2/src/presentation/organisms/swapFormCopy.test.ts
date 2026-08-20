import { describe, expect, it } from "vitest";
import { Decimal, amountExceedsBalance, invalidAmount, sameAssetSwap } from "@/domain";
import type { SwapValidation } from "@/domain";
import { getNoticeMessage, getSwapCtaState } from "./swapFormCopy";

const ETH_PRICE = new Decimal(1600);
const ATOM_PRICE = new Decimal(8);

function quoteFor(sourceAmount: number): NonNullable<SwapValidation["quote"]> {
  return {
    sourceAsset: { symbol: "ETH", price: ETH_PRICE },
    destinationAsset: { symbol: "ATOM", price: ATOM_PRICE },
    sourceAmount: new Decimal(sourceAmount),
    sourceUsdValue: new Decimal(sourceAmount).times(ETH_PRICE),
    exchangeRate: ETH_PRICE.dividedBy(ATOM_PRICE),
    receiveAmount: new Decimal(sourceAmount).times(ETH_PRICE).dividedBy(ATOM_PRICE),
    destinationUsdValue: new Decimal(0),
    minimumReceived: new Decimal(0),
    slippage: 0.005,
  };
}

describe("getNoticeMessage", () => {
  it("returns null when there is no error", () => {
    const validation: SwapValidation = { quote: quoteFor(1), reviewEligible: true, error: null };
    expect(getNoticeMessage(validation, "1", new Decimal(4))).toBeNull();
  });

  it("maps SameAssetSwap to the design's exact wording", () => {
    const validation: SwapValidation = {
      quote: null,
      reviewEligible: false,
      error: sameAssetSwap(),
    };
    expect(getNoticeMessage(validation, "1", undefined)).toBe(
      "Choose two different assets to swap.",
    );
  });

  it("includes the actual held balance for AmountExceedsBalance, not the invalid input amount", () => {
    const validation: SwapValidation = {
      quote: quoteFor(5),
      reviewEligible: false,
      error: amountExceedsBalance(),
    };

    const message = getNoticeMessage(validation, "5", new Decimal(4.2183));

    expect(message).toContain("Insufficient ETH balance");
    expect(message).toContain("4.2183 ETH");
    expect(message).not.toContain("5 ETH");
  });

  it("suppresses the InvalidAmount message while the field is still empty", () => {
    const validation: SwapValidation = {
      quote: null,
      reviewEligible: false,
      error: invalidAmount(),
    };
    expect(getNoticeMessage(validation, "", undefined)).toBeNull();
  });

  it("shows the InvalidAmount message once the user has typed something invalid", () => {
    const validation: SwapValidation = {
      quote: null,
      reviewEligible: false,
      error: invalidAmount(),
    };
    expect(getNoticeMessage(validation, "0", undefined)).toBe(
      "Enter a valid amount greater than zero.",
    );
  });
});

describe("getSwapCtaState", () => {
  it("is enabled and labeled 'Review swap' when review-eligible", () => {
    const validation: SwapValidation = { quote: quoteFor(1), reviewEligible: true, error: null };
    expect(getSwapCtaState(validation, "1")).toEqual({ label: "Review swap", disabled: false });
  });

  it("is disabled with 'Enter an amount' when the field is empty", () => {
    const validation: SwapValidation = {
      quote: null,
      reviewEligible: false,
      error: invalidAmount(),
    };
    expect(getSwapCtaState(validation, "")).toEqual({ label: "Enter an amount", disabled: true });
  });

  it("is disabled with the insufficient-balance label", () => {
    const validation: SwapValidation = {
      quote: quoteFor(5),
      reviewEligible: false,
      error: amountExceedsBalance(),
    };
    expect(getSwapCtaState(validation, "5")).toEqual({
      label: "Insufficient ETH balance",
      disabled: true,
    });
  });

  it("is disabled with 'Select a different asset' for the same-asset case", () => {
    const validation: SwapValidation = {
      quote: null,
      reviewEligible: false,
      error: sameAssetSwap(),
    };
    expect(getSwapCtaState(validation, "1")).toEqual({
      label: "Select a different asset",
      disabled: true,
    });
  });
});
