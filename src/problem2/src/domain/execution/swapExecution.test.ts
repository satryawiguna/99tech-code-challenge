import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { executeSwap } from "./swapExecution";
import { createReviewSnapshot } from "../swap/reviewSnapshot";
import { validateSwap } from "../swap/validateSwap";
import type { Asset } from "../asset/asset";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

function reviewedSnapshot() {
  const validation = validateSwap({
    sourceAsset: ETH,
    destinationAsset: ATOM,
    sourceAmount: new Decimal(1),
    sourceBalance: new Decimal(4.2183),
    slippage: 0.005,
  });
  const result = createReviewSnapshot(validation);
  if (!result.ok) throw new Error("expected a valid snapshot");
  return result.value;
}

describe("executeSwap", () => {
  it("succeeds for a valid reviewed snapshot that is not already processing", () => {
    const result = executeSwap({
      reviewedSnapshot: reviewedSnapshot(),
      alreadyProcessing: false,
      random: () => 0.5,
      now: () => 1000,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("success");
    expect(result.value.transactionIdentifier.value.startsWith("SIM-")).toBe(true);
  });

  it("ties the execution to the exact reviewed snapshot supplied", () => {
    const snapshot = reviewedSnapshot();
    const result = executeSwap({
      reviewedSnapshot: snapshot,
      alreadyProcessing: false,
      random: () => 0.5,
      now: () => 1000,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.reviewedSnapshot).toBe(snapshot);
  });

  it("rejects a duplicate confirmation while an execution is already processing", () => {
    const result = executeSwap({
      reviewedSnapshot: reviewedSnapshot(),
      alreadyProcessing: true,
      random: () => 0.5,
      now: () => 1000,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("ExecutionInProgress");
  });

  it("produces a unique transaction identifier per execution", () => {
    const first = executeSwap({
      reviewedSnapshot: reviewedSnapshot(),
      alreadyProcessing: false,
      random: () => 0.111,
      now: () => 1000,
    });
    const second = executeSwap({
      reviewedSnapshot: reviewedSnapshot(),
      alreadyProcessing: false,
      random: () => 0.999,
      now: () => 1000,
    });

    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.value.transactionIdentifier.value).not.toBe(
      second.value.transactionIdentifier.value,
    );
  });
});
