import { describe, expect, it } from "vitest";
import { Decimal } from "@/domain";
import type { Asset, Balance } from "@/domain";
import { createTransactionIdSource } from "@/infrastructure";
import { calculateQuote } from "./calculateQuote";
import { confirmReviewedSwap } from "./confirmReviewedSwap";
import { prepareReview } from "./prepareReview";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

function reviewedEthToAtomSnapshot() {
  const validation = calculateQuote({
    sourceAsset: ETH,
    destinationAsset: ATOM,
    sourceAmountInput: "1",
    sourceBalanceAmount: 4.2183,
    slippage: 0.005,
  });
  const result = prepareReview(validation);
  if (!result.ok) throw new Error("expected a valid snapshot");
  return result.value;
}

describe("confirmReviewedSwap (integration with the real Infrastructure transaction-ID source)", () => {
  it("executes the reviewed snapshot successfully and produces a clearly simulated transaction identifier", () => {
    const balances: Balance[] = [
      { assetSymbol: "ETH", amount: new Decimal(4.2183) },
      { assetSymbol: "ATOM", amount: new Decimal(10) },
    ];

    const result = confirmReviewedSwap({
      reviewedSnapshot: reviewedEthToAtomSnapshot(),
      alreadyProcessing: false,
      balances,
      transactionIdSource: createTransactionIdSource(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.execution.status).toBe("success");
    expect(result.value.execution.transactionIdentifier.value.startsWith("SIM-")).toBe(true);
    expect(result.value.execution.transactionIdentifier.value).not.toMatch(/^0x/);
  });

  it("decreases the source balance and increases the destination balance on success (balance transition)", () => {
    const snapshot = reviewedEthToAtomSnapshot();
    const balances: Balance[] = [
      { assetSymbol: "ETH", amount: new Decimal(4.2183) },
      { assetSymbol: "ATOM", amount: new Decimal(10) },
    ];

    const result = confirmReviewedSwap({
      reviewedSnapshot: snapshot,
      alreadyProcessing: false,
      balances,
      transactionIdSource: createTransactionIdSource(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const eth = result.value.balances.find((b) => b.assetSymbol === "ETH");
    const atom = result.value.balances.find((b) => b.assetSymbol === "ATOM");
    expect(eth?.amount.equals(new Decimal(4.2183).minus(1))).toBe(true);
    expect(atom?.amount.equals(new Decimal(10).plus(snapshot.receiveAmount))).toBe(true);
  });

  it("rejects a duplicate confirmation while already processing (failed execution) without mutating balances", () => {
    const balances: Balance[] = [
      { assetSymbol: "ETH", amount: new Decimal(4.2183) },
      { assetSymbol: "ATOM", amount: new Decimal(10) },
    ];

    const result = confirmReviewedSwap({
      reviewedSnapshot: reviewedEthToAtomSnapshot(),
      alreadyProcessing: true,
      balances,
      transactionIdSource: createTransactionIdSource(),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("ExecutionInProgress");
  });

  it("executes exactly the reviewed snapshot supplied, never a rebuilt one", () => {
    const snapshot = reviewedEthToAtomSnapshot();

    const result = confirmReviewedSwap({
      reviewedSnapshot: snapshot,
      alreadyProcessing: false,
      balances: [],
      transactionIdSource: createTransactionIdSource(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.execution.reviewedSnapshot).toBe(snapshot);
  });
});
