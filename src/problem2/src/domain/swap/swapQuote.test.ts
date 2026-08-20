import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import {
  calculateAssetUsdValue,
  calculateExchangeRate,
  calculateMinimumReceived,
  calculateQuote,
  calculateReceiveAmount,
  calculateUsdValues,
} from "./swapQuote";
import type { Asset } from "../asset/asset";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };
const ZERO_PRICE: Asset = { symbol: "DEAD", price: new Decimal(0) };

describe("calculateExchangeRate", () => {
  it("computes price(source) / price(destination)", () => {
    const rate = calculateExchangeRate(ETH.price, ATOM.price);

    expect(rate.toNumber()).toBeCloseTo(229.9, 0);
  });
});

describe("calculateReceiveAmount", () => {
  it("computes sourceAmount × price(source) / price(destination) exactly", () => {
    const receiveAmount = calculateReceiveAmount(new Decimal(1), ETH.price, ATOM.price);
    const expected = new Decimal(1).times(ETH.price).dividedBy(ATOM.price);

    expect(receiveAmount.equals(expected)).toBe(true);
  });

  it("scales linearly with the source amount", () => {
    const one = calculateReceiveAmount(new Decimal(1), ETH.price, ATOM.price);
    const five = calculateReceiveAmount(new Decimal(5), ETH.price, ATOM.price);

    expect(five.equals(one.times(5))).toBe(true);
  });
});

describe("calculateAssetUsdValue", () => {
  it("computes amount × price", () => {
    expect(
      calculateAssetUsdValue(new Decimal(2), ETH.price).equals(new Decimal(2).times(ETH.price)),
    ).toBe(true);
  });

  it("returns zero for a zero amount", () => {
    expect(calculateAssetUsdValue(new Decimal(0), ETH.price).equals(0)).toBe(true);
  });

  it("scales linearly with amount", () => {
    const one = calculateAssetUsdValue(new Decimal(1), ATOM.price);
    const five = calculateAssetUsdValue(new Decimal(5), ATOM.price);

    expect(five.equals(one.times(5))).toBe(true);
  });
});

describe("calculateUsdValues", () => {
  it("derives source and destination USD values from the normalized prices", () => {
    const sourceAmount = new Decimal(2);
    const receiveAmount = calculateReceiveAmount(sourceAmount, ETH.price, ATOM.price);

    const { sourceUsdValue, destinationUsdValue } = calculateUsdValues(
      sourceAmount,
      ETH.price,
      receiveAmount,
      ATOM.price,
    );

    expect(sourceUsdValue.equals(sourceAmount.times(ETH.price))).toBe(true);
    expect(destinationUsdValue.equals(receiveAmount.times(ATOM.price))).toBe(true);
  });
});

describe("calculateMinimumReceived", () => {
  it("applies receiveAmount × (1 - slippage)", () => {
    const receiveAmount = new Decimal(229.0263);

    expect(calculateMinimumReceived(receiveAmount, 0.005).toNumber()).toBeCloseTo(227.881, 3);
  });

  it("never exceeds the quoted receive amount", () => {
    const receiveAmount = new Decimal(100);

    expect(calculateMinimumReceived(receiveAmount, 0.001).lessThan(receiveAmount)).toBe(true);
  });
});

describe("calculateQuote", () => {
  it("produces a full quote for a valid source/destination pair", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.value.receiveAmount.equals(
        calculateReceiveAmount(new Decimal(1), ETH.price, ATOM.price),
      ),
    ).toBe(true);
    expect(result.value.minimumReceived.lessThan(result.value.receiveAmount)).toBe(true);
  });

  it("does not compute or expose any price-impact or network-fee value", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toHaveProperty("priceImpact");
    expect(result.value).not.toHaveProperty("networkFee");
  });

  it("fails with MissingSourceAsset when no source asset is selected", () => {
    const result = calculateQuote({
      sourceAsset: null,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("MissingSourceAsset");
  });

  it("fails with MissingDestinationAsset when no destination asset is selected", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: null,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("MissingDestinationAsset");
  });

  it("fails with SameAssetSwap when source and destination are identical", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ETH,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("SameAssetSwap");
  });

  it("fails with MissingSourcePrice when the source asset has no valid price", () => {
    const result = calculateQuote({
      sourceAsset: ZERO_PRICE,
      destinationAsset: ATOM,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("MissingSourcePrice");
  });

  it("fails with MissingDestinationPrice when the destination asset has no valid price", () => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ZERO_PRICE,
      sourceAmount: new Decimal(1),
      slippage: 0.005,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("MissingDestinationPrice");
  });

  it.each([
    ["empty/zero", new Decimal(0)],
    ["negative", new Decimal(-1)],
    ["non-finite", new Decimal(NaN)],
  ])("fails with InvalidAmount for a %s amount", (_label, amount) => {
    const result = calculateQuote({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmount: amount,
      slippage: 0.005,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("InvalidAmount");
  });
});
