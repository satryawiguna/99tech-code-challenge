"use client";

import { calculateAssetUsdValue, Decimal } from "@/domain";
import type { Asset } from "@/domain";
import { useSwapStore } from "./swapStore";

export interface PortfolioHolding {
  readonly symbol: string;
  readonly amount: Decimal;
  readonly usdValue: Decimal;
}

export interface PortfolioHoldings {
  readonly holdings: PortfolioHolding[];
  readonly totalUsdValue: Decimal;
}

/**
 * Aggregates simulated balances (state) against currently priced assets
 * (price feed) into a portfolio view. Per-holding USD value uses Domain's
 * `calculateAssetUsdValue` (domain.md §5: "calculating USD values" is a
 * Domain responsibility) — only the aggregation (filtering, sorting,
 * summing) is State's own.
 */
export function usePortfolioHoldings(assets: readonly Asset[]): PortfolioHoldings {
  const balances = useSwapStore((state) => state.balances);
  const priceBySymbol = new Map(assets.map((asset) => [asset.symbol, asset.price]));

  const holdings = balances
    .filter((balance) => balance.amount.greaterThan(0))
    .map((balance): PortfolioHolding => {
      const price = priceBySymbol.get(balance.assetSymbol);
      return {
        symbol: balance.assetSymbol,
        amount: balance.amount,
        usdValue: price ? calculateAssetUsdValue(balance.amount, price) : new Decimal(0),
      };
    })
    .sort((a, b) => b.usdValue.comparedTo(a.usdValue));

  const totalUsdValue = holdings.reduce(
    (sum, holding) => sum.plus(holding.usdValue),
    new Decimal(0),
  );

  return { holdings, totalUsdValue };
}
