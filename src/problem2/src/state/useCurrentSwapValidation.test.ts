import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { act } from "react";
import { initialSwapState, useSwapStore } from "./swapStore";
import { useCurrentSwapValidation } from "./useCurrentSwapValidation";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1645.9337373737374) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(7.1573) };

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

describe("useCurrentSwapValidation", () => {
  it("returns a review-eligible quote for valid current store values", () => {
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    const { result } = renderHook(() => useCurrentSwapValidation());

    expect(result.current.reviewEligible).toBe(true);
    expect(result.current.quote?.sourceAsset.symbol).toBe("ETH");
  });

  it("re-derives the quote reactively when the store changes", () => {
    useSwapStore.setState({
      sourceAsset: ETH,
      destinationAsset: ATOM,
      sourceAmountInput: "1",
      balances: [{ assetSymbol: "ETH", amount: new Decimal(4.2183) }],
    });

    const { result } = renderHook(() => useCurrentSwapValidation());
    expect(result.current.reviewEligible).toBe(true);

    act(() => {
      useSwapStore.getState().setSourceAmountInput("5");
    });

    expect(result.current.reviewEligible).toBe(false);
    expect(result.current.error?.code).toBe("AmountExceedsBalance");
  });

  it("does not store the derived quote on the Zustand store", () => {
    renderHook(() => useCurrentSwapValidation());

    expect(useSwapStore.getState()).not.toHaveProperty("quote");
    expect(useSwapStore.getState()).not.toHaveProperty("validation");
  });
});
