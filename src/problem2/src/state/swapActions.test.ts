import { beforeEach, describe, expect, it } from "vitest";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import type { TransactionIdSource } from "@/application";
import { initialSwapState, useSwapStore } from "./swapStore";
import {
  applyHalfAmountAction,
  applyMaxAmountAction,
  calculateCurrentQuoteAction,
  confirmReviewedSwapAction,
  prepareReviewAction,
  reverseSwapAction,
} from "./swapActions";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

const testTransactionIdSource: TransactionIdSource = {
  random: () => 0.42,
  now: () => 1_693_296_652_000,
};

function seedEthAtomForm(sourceAmountInput = "1") {
  useSwapStore.setState({
    sourceAsset: ETH,
    destinationAsset: ATOM,
    sourceAmountInput,
    balances: [
      { assetSymbol: "ETH", amount: new Decimal(4.2183) },
      { assetSymbol: "ATOM", amount: new Decimal(10) },
    ],
  });
}

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

describe("calculateCurrentQuoteAction", () => {
  it("derives a quote from the current store values without storing derived fields", () => {
    seedEthAtomForm("1");

    const validation = calculateCurrentQuoteAction();

    expect(validation.reviewEligible).toBe(true);
    expect(validation.quote?.receiveAmount.isFinite()).toBe(true);
    expect(useSwapStore.getState()).not.toHaveProperty("quote");
  });
});

describe("applyHalfAmountAction", () => {
  it("sets sourceAmountInput to half the source balance and recalculates the quote", () => {
    seedEthAtomForm("1");

    const result = applyHalfAmountAction();

    expect(result.sourceAmount.toNumber()).toBeCloseTo(4.2183 / 2);
    expect(useSwapStore.getState().sourceAmountInput).toBe(result.sourceAmount.toString());
    expect(result.validation.reviewEligible).toBe(true);
  });
});

describe("applyMaxAmountAction", () => {
  it("sets sourceAmountInput to the full source balance", () => {
    seedEthAtomForm("1");

    const result = applyMaxAmountAction();

    expect(result.sourceAmount.toNumber()).toBe(4.2183);
    expect(useSwapStore.getState().sourceAmountInput).toBe(result.sourceAmount.toString());
  });
});

describe("reverseSwapAction", () => {
  it("swaps source/destination assets and carries the underlying unrounded receive amount forward", () => {
    seedEthAtomForm("1");
    const before = calculateCurrentQuoteAction();
    const expectedReceive = before.quote!.receiveAmount;

    const result = reverseSwapAction();

    expect(result).not.toBeNull();
    const state = useSwapStore.getState();
    expect(state.sourceAsset?.symbol).toBe("ATOM");
    expect(state.destinationAsset?.symbol).toBe("ETH");
    expect(state.sourceAmountInput).toBe(expectedReceive.toString());
  });

  it("returns null and leaves the store untouched when no valid quote exists yet", () => {
    useSwapStore.setState({ sourceAsset: ETH, destinationAsset: null, sourceAmountInput: "1" });

    const result = reverseSwapAction();

    expect(result).toBeNull();
    expect(useSwapStore.getState().sourceAsset?.symbol).toBe("ETH");
  });
});

describe("prepareReviewAction", () => {
  it("stores an immutable review snapshot for a review-eligible swap", () => {
    seedEthAtomForm("1");

    const result = prepareReviewAction();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(useSwapStore.getState().reviewSnapshot).toBe(result.value);
    expect(Object.isFrozen(result.value)).toBe(true);
  });

  it("does not store a snapshot when the swap is not review-eligible", () => {
    seedEthAtomForm("5"); // exceeds the 4.2183 ETH balance

    const result = prepareReviewAction();

    expect(result.ok).toBe(false);
    expect(useSwapStore.getState().reviewSnapshot).toBeNull();
  });
});

describe("confirmReviewedSwapAction", () => {
  it("executes the reviewed snapshot, transitions to success, and applies the balance mutation", () => {
    seedEthAtomForm("1");
    const review = prepareReviewAction();
    if (!review.ok) throw new Error("expected a valid review");

    const result = confirmReviewedSwapAction(testTransactionIdSource);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.execution.status).toBe("success");
    expect(result.value.execution.transactionIdentifier.value.startsWith("SIM-")).toBe(true);

    const state = useSwapStore.getState();
    expect(state.executionPhase).toBe("success");
    expect(state.lastExecution).toBe(result.value.execution);
    const ethBalance = state.balances.find((b) => b.assetSymbol === "ETH");
    const atomBalance = state.balances.find((b) => b.assetSymbol === "ATOM");
    expect(ethBalance?.amount.equals(new Decimal(4.2183).minus(1))).toBe(true);
    expect(atomBalance?.amount.equals(new Decimal(10).plus(review.value.receiveAmount))).toBe(true);
  });

  it("fails with InvalidReviewSnapshot when there is no reviewed snapshot to confirm", () => {
    seedEthAtomForm("1"); // never called prepareReviewAction

    const result = confirmReviewedSwapAction(testTransactionIdSource);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("InvalidReviewSnapshot");
    expect(useSwapStore.getState().executionPhase).toBe("idle");
  });

  it("rejects a duplicate confirmation while already processing, without mutating balances again", () => {
    seedEthAtomForm("1");
    const review = prepareReviewAction();
    if (!review.ok) throw new Error("expected a valid review");
    useSwapStore.getState().setExecutionPhase("processing");
    const balancesBefore = useSwapStore.getState().balances;

    const result = confirmReviewedSwapAction(testTransactionIdSource);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("ExecutionInProgress");
    expect(useSwapStore.getState().balances).toBe(balancesBefore);
  });
});
