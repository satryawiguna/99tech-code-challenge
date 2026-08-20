"use client";

import { useEffect, useState } from "react";
import { formatDatasetTimestamp } from "@/shared/utils";
import { Button } from "../atoms/Button";

export interface PriceFreshnessControlProps {
  readonly datasetTimestamp: number | null;
  readonly isRefreshing: boolean;
  readonly onRefresh: () => void;
}

/**
 * FR-017/FR-018: manual refresh + source-data freshness, positioned in the
 * header per the design baseline.
 *
 * Shows only "Provided price data · Xy ago" — the age of the underlying
 * price records themselves (domain.md §17). This never resets on refresh: a
 * static challenge snapshot does not get any newer just because the browser
 * re-fetched it. A separate resetting "last checked" counter was considered
 * but dropped — visually collapsing to a single resetting line would read
 * as "Live rates," which FR-018/AC-015 explicitly forbid.
 *
 * Ticks in real time via a 1s clock; never re-fetches or re-derives price
 * data on its own.
 */
export function PriceFreshnessControl({
  datasetTimestamp,
  isRefreshing,
  onRefresh,
}: PriceFreshnessControlProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12,
        color: "var(--muted-2)",
      }}
    >
      <span>{formatDatasetTimestamp(datasetTimestamp, now)}</span>
      <Button
        variant="ghost"
        onClick={onRefresh}
        disabled={isRefreshing}
        style={{ fontSize: 12, padding: "4px 8px" }}
      >
        {isRefreshing ? "Refreshing…" : "↻ Refresh"}
      </Button>
    </div>
  );
}
