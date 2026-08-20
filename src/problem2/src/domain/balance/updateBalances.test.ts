import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { updateBalances } from "./updateBalances";
import { findBalanceAmount } from "./balance";
import { createReviewSnapshot } from "../swap/reviewSnapshot";
import { validateSwap } from "../swap/validateSwap";
import type { Asset } from "../asset/asset";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

function snapshotFor(sourceAmount: Decimal, sourceBalance: Decimal) {
  const validation = validateSwap({
    sourceAsset: ETH,
    destinationAsset: ATOM,
    sourceAmount,
    sourceBalance,
    slippage: 0.005,
  });
  const result = createReviewSnapshot(validation);
  if (!result.ok) throw new Error("expected a valid snapshot");
  return result.value;
}

describe("updateBalances", () => {
  it("decreases the source balance by the confirmed source amount", () => {
    const snapshot = snapshotFor(new Decimal(1), new Decimal(4.2183));
    const balances = [
      { assetSymbol: "ETH", amount: new Decimal(4.2183) },
      { assetSymbol: "ATOM", amount: new Decimal(0) },
    ];

    const updated = updateBalances(balances, snapshot);

    expect(findBalanceAmount(updated, "ETH").equals(new Decimal(4.2183).minus(1))).toBe(true);
  });

  it("increases the destination balance by the confirmed receive amount", () => {
    const snapshot = snapshotFor(new Decimal(1), new Decimal(4.2183));
    const balances = [
      { assetSymbol: "ETH", amount: new Decimal(4.2183) },
      { assetSymbol: "ATOM", amount: new Decimal(10) },
    ];

    const updated = updateBalances(balances, snapshot);

    expect(
      findBalanceAmount(updated, "ATOM").equals(new Decimal(10).plus(snapshot.receiveAmount)),
    ).toBe(true);
  });

  it("creates a destination balance entry when none previously existed", () => {
    const snapshot = snapshotFor(new Decimal(1), new Decimal(4.2183));
    const balances = [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }];

    const updated = updateBalances(balances, snapshot);

    expect(findBalanceAmount(updated, "ATOM").equals(snapshot.receiveAmount)).toBe(true);
  });
});
