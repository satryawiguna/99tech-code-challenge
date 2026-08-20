"use client";

import { useEffect, useRef, useState } from "react";
import { formatDatasetTimestamp, formatLastCheckedAge } from "@/shared/utils";
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
 * Two distinct ages are shown, deliberately not merged into one:
 * - "Provided price data · Xy ago" — the age of the underlying price
 *   records themselves (domain.md §17). This never resets on refresh: a
 *   static challenge snapshot does not get any newer just because the
 *   browser re-fetched it. Collapsing this into a resetting counter would
 *   visually imply the market data is live, which FR-018/AC-015 explicitly
 *   forbid.
 * - "Refreshed Xs ago" — purely a client-side "last checked" indicator.
 *   This is honest to reset and count up on every refresh, since it only
 *   claims "this browser asked the server N seconds ago," not that the
 *   price data itself is fresh.
 *
 * Both tick in real time via a 1s clock; neither ever re-fetches or
 * re-derives price data on its own.
 */
export function PriceFreshnessControl({
  datasetTimestamp,
  isRefreshing,
  onRefresh,
}: PriceFreshnessControlProps) {
  const [now, setNow] = useState(() => Date.now());
  const [lastCheckedAt, setLastCheckedAt] = useState(() => Date.now());
  const wasRefreshingRef = useRef(isRefreshing);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (wasRefreshingRef.current && !isRefreshing) {
      setLastCheckedAt(Date.now());
    }
    wasRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

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
      <span>{formatLastCheckedAge(lastCheckedAt, now)}</span>
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
