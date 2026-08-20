import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import {
  calculateHalfAmount,
  calculateMaxAmount,
  findBalanceAmount,
  hasSufficientBalance,
  setBalanceAmount,
} from "./balance";

describe("calculateHalfAmount", () => {
  it("returns half of the balance", () => {
    expect(calculateHalfAmount(new Decimal(4.2183)).toNumber()).toBeCloseTo(2.10915);
  });
});

describe("calculateMaxAmount", () => {
  it("returns the full balance", () => {
    expect(calculateMaxAmount(new Decimal(4.2183)).toNumber()).toBe(4.2183);
  });
});

describe("hasSufficientBalance", () => {
  it("returns true when the amount does not exceed the balance", () => {
    expect(hasSufficientBalance(new Decimal(4), new Decimal(4.2183))).toBe(true);
    expect(hasSufficientBalance(new Decimal(4.2183), new Decimal(4.2183))).toBe(true);
  });

  it("returns false when the amount exceeds the balance", () => {
    expect(hasSufficientBalance(new Decimal(5), new Decimal(4.2183))).toBe(false);
  });
});

describe("findBalanceAmount / setBalanceAmount", () => {
  it("returns zero for an asset with no recorded balance", () => {
    expect(findBalanceAmount([], "ETH").toNumber()).toBe(0);
  });

  it("finds the recorded balance for an asset", () => {
    const balances = [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }];

    expect(findBalanceAmount(balances, "ETH").toNumber()).toBe(4.2183);
  });

  it("sets a new balance entry when one does not exist", () => {
    const balances = setBalanceAmount([], "ETH", new Decimal(4.2183));

    expect(findBalanceAmount(balances, "ETH").toNumber()).toBe(4.2183);
  });

  it("updates an existing balance entry without duplicating it", () => {
    const initial = [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }];
    const updated = setBalanceAmount(initial, "ETH", new Decimal(2));

    expect(updated).toHaveLength(1);
    expect(findBalanceAmount(updated, "ETH").toNumber()).toBe(2);
  });
});
