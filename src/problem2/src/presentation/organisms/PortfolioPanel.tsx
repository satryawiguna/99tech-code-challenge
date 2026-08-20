"use client";

import type { Asset } from "@/domain";
import { usePortfolioHoldings } from "@/state";
import { formatTokenAmount, formatUsd } from "@/shared/utils";
import { TokenIcon } from "../atoms/TokenIcon";

export interface PortfolioPanelProps {
  readonly assets: readonly Asset[];
  readonly onPickHolding: (symbol: string) => void;
}

/** Matches the "Your balances" aside in the Claude Design reference. */
export function PortfolioPanel({ assets, onPickHolding }: PortfolioPanelProps) {
  const { holdings, totalUsdValue } = usePortfolioHoldings(assets);

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h6 className="text-muted" style={{ margin: "0 0 2px" }}>
          Your balances
        </h6>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            fontSize: 22,
            margin: "6px 0 10px",
          }}
        >
          {formatUsd(totalUsdValue)}
        </div>
        {holdings.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>
            No simulated balances yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {holdings.slice(0, 6).map((holding) => (
              <button
                key={holding.symbol}
                type="button"
                className="list-row"
                title="Pay with this asset"
                onClick={() => onPickHolding(holding.symbol)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 2px",
                  border: 0,
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  color: "inherit",
                  font: "inherit",
                  textAlign: "left",
                }}
              >
                <TokenIcon symbol={holding.symbol} size={26} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13 }}>{holding.symbol}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--muted-3)" }}>
                    {formatTokenAmount(holding.amount)}
                  </span>
                </span>
                <span style={{ fontSize: 12.5 }}>{formatUsd(holding.usdValue)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: 1, background: "var(--color-divider)" }} />
      <p className="text-muted" style={{ fontSize: 11.5, lineHeight: 1.5, margin: 0 }}>
        Assets without a listed price can&rsquo;t be quoted and are hidden from selection.
      </p>
    </aside>
  );
}
