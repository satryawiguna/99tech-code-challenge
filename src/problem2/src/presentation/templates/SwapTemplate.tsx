"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { createInitialBalances, useSwapStore, usePriceFeedQuery } from "@/state";
import { Spinner } from "../atoms/Spinner";
import { Button } from "../atoms/Button";
import { MatrixRainBackground } from "../atoms/MatrixRainBackground";
import { PriceFreshnessControl } from "../molecules/PriceFreshnessControl";
import { SwapForm } from "../organisms/SwapForm";
import { PortfolioPanel } from "../organisms/PortfolioPanel";

/**
 * Owns the top-level, data-fetching-driven states (PRD §13: Initial
 * Loading, Price Error, Ready). Quote-unavailable and per-field validation
 * states are handled inside SwapForm once price data is available.
 */
export function SwapTemplate() {
  const query = usePriceFeedQuery();
  const balances = useSwapStore((state) => state.balances);
  const setBalances = useSwapStore((state) => state.setBalances);
  const setSourceAsset = useSwapStore((state) => state.setSourceAsset);
  const setDestinationAsset = useSwapStore((state) => state.setDestinationAsset);
  const sourceAsset = useSwapStore((state) => state.sourceAsset);
  const destinationAsset = useSwapStore((state) => state.destinationAsset);

  useEffect(() => {
    if (balances.length === 0) setBalances(createInitialBalances());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time bootstrap seed, not a reactive sync
  }, []);

  if (query.isPending) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 16px" }}>
          <Spinner label="Loading price data" />
          <span className="text-muted">Loading price data…</span>
        </div>
      </Shell>
    );
  }

  const data = query.data;
  if (!data || (data.priceState.assets.length === 0 && data.lastError)) {
    return (
      <Shell>
        <div className="notice" role="alert" style={{ margin: "20px 16px" }}>
          <span aria-hidden="true">⚠</span>
          <span>
            Unable to load market prices.{" "}
            <Button
              variant="ghost"
              onClick={() => query.refetch()}
              style={{ fontSize: 12.5, padding: "1px 6px" }}
            >
              Retry
            </Button>
          </span>
        </div>
      </Shell>
    );
  }

  const { priceState, lastError } = data;

  function handlePickHolding(symbol: string) {
    const asset = priceState.assets.find((candidate) => candidate.symbol === symbol);
    if (!asset) return;
    setSourceAsset(asset);
    if (destinationAsset?.symbol === symbol) setDestinationAsset(sourceAsset);
  }

  return (
    <Shell
      headerRight={
        <PriceFreshnessControl
          datasetTimestamp={priceState.datasetTimestamp}
          lastCheckedAt={query.dataUpdatedAt}
          isRefreshing={query.isFetching}
          onRefresh={() => query.refetch()}
        />
      }
    >
      {lastError ? (
        <div className="notice" role="status" style={{ margin: "12px 16px 0" }}>
          <span aria-hidden="true">⚠</span>
          <span>Refresh failed — showing the last known provided prices.</span>
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          alignItems: "flex-start",
          padding: "20px 16px 64px",
        }}
      >
        <SwapForm assets={priceState.assets} />
        <PortfolioPanel assets={priceState.assets} onPickHolding={handlePickHolding} />
      </div>
    </Shell>
  );
}

function Shell({ children, headerRight }: { children: ReactNode; headerRight?: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <MatrixRainBackground />
      <header
        className="nav"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 960,
          margin: "0 auto",
          padding: "20px 16px 4px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
          <span
            aria-hidden="true"
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              border: "1px solid var(--color-accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-accent)",
              fontSize: 12,
            }}
          >
            ◇
          </span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}>Nocturne</span>
          <span className="tag tag-outline" style={{ fontSize: 10, letterSpacing: "0.08em" }}>
            SWAP
          </span>
        </div>
        {headerRight}
      </header>
      <main style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
