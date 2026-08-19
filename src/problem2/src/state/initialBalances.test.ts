import { describe, expect, it } from "vitest";
import { BALANCE_FIXTURES } from "@/infrastructure";
import { createInitialBalances } from "./initialBalances";

describe("createInitialBalances", () => {
  it("converts every fixture entry into a Domain Balance with a Decimal amount", () => {
    const balances = createInitialBalances();

    expect(balances).toHaveLength(Object.keys(BALANCE_FIXTURES).length);
    const eth = balances.find((balance) => balance.assetSymbol === "ETH");
    expect(eth?.amount.toNumber()).toBe(BALANCE_FIXTURES.ETH);
  });
});
