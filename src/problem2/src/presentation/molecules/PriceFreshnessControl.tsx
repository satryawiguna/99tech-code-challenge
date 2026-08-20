"use client";

import { useEffect, useState } from "react";
import { formatLastCheckedAge } from "@/shared/utils";
import { Button } from "../atoms/Button";

export interface PriceFreshnessControlProps {
  /** Umur data sumber (FR-018) — ditampilkan sebagai tooltip, bukan counter utama. */
  readonly datasetTimestamp: number | null;
  /** Kapan browser terakhir berhasil fetch — clock yang reset tiap refresh sukses. */
  readonly lastCheckedAt: number | null;
  readonly isRefreshing: boolean;
  readonly onRefresh: () => void;
}

/**
 * FR-017/FR-018: manual refresh + freshness indicator di header (sesuai desain).
 *
 * Baris terlihat adalah last-checked clock ("Updated just now" / "Updated Xs ago")
 * yang tick tiap detik dan reset tiap refresh sukses — sama dengan counter
 * `(now - updated)` di desain. Umur data sumber tetap dipertahankan sebagai
 * tooltip agar FR-018 terpenuhi tanpa mengklaim ini live market stream.
 */
export function PriceFreshnessControl({
  datasetTimestamp,
  lastCheckedAt,
  isRefreshing,
  onRefresh,
}: PriceFreshnessControlProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const title =
    datasetTimestamp === null
      ? "Provided price data"
      : `Provided price data · source ${new Date(datasetTimestamp).toISOString()}`;

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
      <span title={title}>{formatLastCheckedAge(lastCheckedAt, now)}</span>
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
