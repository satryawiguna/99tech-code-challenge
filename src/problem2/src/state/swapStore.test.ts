import { beforeEach, describe, expect, it } from "vitest";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { DEFAULT_SLIPPAGE, initialSwapState, useSwapStore } from "./swapStore";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1600) };

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

describe("useSwapStore", () => {
  it("starts with the documented initial state", () => {
    const state = useSwapStore.getState();

    expect(state.sourceAsset).toBeNull();
    expect(state.destinationAsset).toBeNull();
    expect(state.sourceAmountInput).toBe("");
    expect(state.slippage).toBe(DEFAULT_SLIPPAGE);
    expect(state.reviewSnapshot).toBeNull();
    expect(state.executionPhase).toBe("idle");
    expect(state.lastExecution).toBeNull();
    expect(state.balances).toEqual([]);
  });

  it("updates fields via their setters without touching unrelated fields", () => {
    useSwapStore.getState().setSourceAsset(ETH);
    useSwapStore.getState().setSourceAmountInput("1.5");
    useSwapStore.getState().setSlippage(0.01);

    const state = useSwapStore.getState();
    expect(state.sourceAsset).toBe(ETH);
    expect(state.sourceAmountInput).toBe("1.5");
    expect(state.slippage).toBe(0.01);
    expect(state.destinationAsset).toBeNull();
  });

  it("resetSwapForm clears the amount/review/execution but keeps asset selection and balances", () => {
    useSwapStore.setState({
      sourceAsset: ETH,
      sourceAmountInput: "2",
      executionPhase: "success",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(5) }],
    });

    useSwapStore.getState().resetSwapForm();

    const state = useSwapStore.getState();
    expect(state.sourceAmountInput).toBe("");
    expect(state.reviewSnapshot).toBeNull();
    expect(state.executionPhase).toBe("idle");
    expect(state.lastExecution).toBeNull();
    expect(state.sourceAsset).toBe(ETH);
    expect(state.balances).toHaveLength(1);
  });
});
