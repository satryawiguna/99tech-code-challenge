import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { initialSwapState, useSwapStore } from "./swapStore";
import { usePortfolioHoldings } from "./usePortfolioHoldings";

const ETH: Asset = { symbol: "ETH", price: new Decimal(1600) };
const ATOM: Asset = { symbol: "ATOM", price: new Decimal(8) };

beforeEach(() => {
  useSwapStore.setState(initialSwapState);
});

describe("usePortfolioHoldings", () => {
  it("excludes zero-balance assets", () => {
    useSwapStore.setState({
      balances: [
        { assetSymbol: "ETH", amount: new Decimal(2) },
        { assetSymbol: "ATOM", amount: new Decimal(0) },
      ],
    });

    const { result } = renderHook(() => usePortfolioHoldings([ETH, ATOM]));

    expect(result.current.holdings.map((h) => h.symbol)).toEqual(["ETH"]);
  });

  it("sorts holdings by USD value descending", () => {
    useSwapStore.setState({
      balances: [
        { assetSymbol: "ATOM", amount: new Decimal(100) }, // $800
        { assetSymbol: "ETH", amount: new Decimal(1) }, // $1600
      ],
    });

    const { result } = renderHook(() => usePortfolioHoldings([ETH, ATOM]));

    expect(result.current.holdings.map((h) => h.symbol)).toEqual(["ETH", "ATOM"]);
  });

  it("sums the total USD value across all holdings", () => {
    useSwapStore.setState({
      balances: [
        { assetSymbol: "ETH", amount: new Decimal(1) },
        { assetSymbol: "ATOM", amount: new Decimal(100) },
      ],
    });

    const { result } = renderHook(() => usePortfolioHoldings([ETH, ATOM]));

    expect(result.current.totalUsdValue.toNumber()).toBe(2400);
  });

  it("treats an asset with no currently-priced entry as zero USD value rather than throwing", () => {
    useSwapStore.setState({ balances: [{ assetSymbol: "UNPRICED", amount: new Decimal(5) }] });

    const { result } = renderHook(() => usePortfolioHoldings([ETH]));

    expect(result.current.holdings[0].usdValue.toNumber()).toBe(0);
  });
});
