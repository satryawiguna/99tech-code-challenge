"use client";

import { useEffect, useRef, useState } from "react";
import type { Asset, Decimal } from "@/domain";
import { formatPrice, formatTokenAmount } from "@/shared/utils";
import { getTokenDisplayName } from "@/shared/constants";
import { TokenIcon } from "../atoms/TokenIcon";

export interface AssetPickerDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly assets: Asset[];
  readonly balancesBySymbol: Readonly<Record<string, Decimal>>;
  readonly otherSymbol: string | null;
  readonly onSelect: (symbol: string) => void;
  readonly onClose: () => void;
}

/**
 * FR-004/FR-005/FR-006/FR-026/FR-027: search-by-symbol-or-name, keyboard
 * dismissible, focus returns to the search field on open. Uses the native
 * `<dialog>` element so the browser provides a real focus trap and
 * Escape-to-close rather than a hand-rolled approximation.
 */
export function AssetPickerDialog({
  open,
  title,
  assets,
  balancesBySymbol,
  otherSymbol,
  onSelect,
  onClose,
}: AssetPickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setQuery("");
      searchRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const needle = query.trim().toLowerCase();
  const filtered = assets.filter((asset) => {
    if (!needle) return true;
    return (
      asset.symbol.toLowerCase().includes(needle) ||
      getTokenDisplayName(asset.symbol).toLowerCase().includes(needle)
    );
  });

  return (
    <dialog
      ref={dialogRef}
      className="dialog elev-lg"
      aria-label={title}
      onClose={onClose}
      onCancel={onClose}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <span className="dialog-title">{title}</span>
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <input
        ref={searchRef}
        type="search"
        className="input"
        placeholder="Search name or symbol"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search assets"
      />

      <div className="dialog-list" style={{ overflow: "auto" }}>
        {filtered.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 12.5, padding: "14px 8px", margin: 0 }}>
            No priced asset matches &ldquo;{query}&rdquo;.
          </p>
        ) : (
          filtered.map((asset) => (
            <button
              key={asset.symbol}
              type="button"
              className="list-row"
              onClick={() => onSelect(asset.symbol)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                width: "100%",
                padding: "9px 8px",
                border: 0,
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                color: "inherit",
                font: "inherit",
                textAlign: "left",
                boxShadow:
                  asset.symbol === otherSymbol ? "inset 0 0 0 1px var(--color-accent-800)" : "none",
              }}
            >
              <TokenIcon symbol={asset.symbol} size={30} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, color: "var(--color-text)" }}>
                  {asset.symbol}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    color: "var(--muted-3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getTokenDisplayName(asset.symbol)}
                </span>
              </span>
              <span style={{ textAlign: "right" }}>
                <span style={{ display: "block", fontSize: 12.5, color: "var(--color-text)" }}>
                  {formatPrice(asset.price)}
                </span>
                <span style={{ display: "block", fontSize: 11, color: "var(--muted-3)" }}>
                  {(() => {
                    const balance = balancesBySymbol[asset.symbol];
                    return balance && balance.greaterThan(0) ? formatTokenAmount(balance) : "—";
                  })()}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </dialog>
  );
}
