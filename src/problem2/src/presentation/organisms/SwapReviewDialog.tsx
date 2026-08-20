"use client";

import { useEffect, useRef, useState } from "react";
import { confirmReviewedSwapAction, useSwapStore } from "@/state";
import { formatTokenAmount, formatUsd } from "@/shared/utils";
import { Button } from "../atoms/Button";
import { Spinner } from "../atoms/Spinner";

/**
 * FR-019/FR-022/FR-023/FR-024/BR-013: review → confirm → (simulated
 * processing) → success/failure, driven entirely by store state
 * (`reviewSnapshot`, `executionPhase`, `lastExecution`). Confirmation always
 * executes the immutable `reviewSnapshot` already captured by
 * `prepareReviewAction` — nothing here rebuilds it from current form state.
 *
 * Approved deviations from the design baseline:
 * - Shows Slippage, not Network fee.
 * - Never renders Price impact or Network fee.
 * - Transaction identifier is explicitly labeled "Simulated transaction"
 *   (Domain's own "SIM-…" format is not hash-like, but the copy makes the
 *   simulation explicit too).
 *
 * The ~1.2s "Submitting swap" delay is a cosmetic reveal timing local to
 * this component: the real execution and balance mutation already happened
 * synchronously inside `confirmReviewedSwapAction` — only how soon the
 * result is *displayed* is delayed, so the user sees a believable
 * processing state instead of an instant flash.
 */
export function SwapReviewDialog() {
  const reviewSnapshot = useSwapStore((state) => state.reviewSnapshot);
  const executionPhase = useSwapStore((state) => state.executionPhase);
  const lastExecution = useSwapStore((state) => state.lastExecution);
  const setReviewSnapshot = useSwapStore((state) => state.setReviewSnapshot);
  const resetSwapForm = useSwapStore((state) => state.resetSwapForm);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isRevealDelayed, setIsRevealDelayed] = useState(false);
  const open = reviewSnapshot !== null;
  const showPending = isRevealDelayed || executionPhase === "processing";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event?: { preventDefault: () => void }) {
    // FR-022: duplicate/early dismissal must not be allowed to look like the
    // in-flight swap was cancelled — execution has already completed behind
    // the cosmetic reveal delay, so Escape is a no-op until it settles.
    if (showPending) {
      event?.preventDefault();
      return;
    }
    setReviewSnapshot(null);
  }

  function handleConfirm() {
    setIsRevealDelayed(true);
    confirmReviewedSwapAction();
    setTimeout(() => setIsRevealDelayed(false), 1200);
  }

  function handleNewSwap() {
    resetSwapForm();
  }

  if (!reviewSnapshot) {
    return (
      <dialog
        ref={dialogRef}
        className="dialog elev-lg"
        aria-label="Confirm swap"
        onCancel={handleCancel}
      />
    );
  }

  const showDone = !showPending && executionPhase === "success";
  const showFailed = !showPending && executionPhase === "failed";
  const showConfirm = !showPending && !showDone && !showFailed;

  const payLine = `${formatTokenAmount(reviewSnapshot.sourceAmount)} ${reviewSnapshot.sourceAsset.symbol}`;
  const recvLine = `${formatTokenAmount(reviewSnapshot.receiveAmount)} ${reviewSnapshot.destinationAsset.symbol}`;

  return (
    <dialog
      ref={dialogRef}
      className="dialog elev-lg"
      aria-label="Confirm swap"
      onCancel={handleCancel}
    >
      {showConfirm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="dialog-title">Confirm swap</span>
          <div className="dialog-summary">
            <span style={{ flex: "1 1 40%", minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 11, color: "var(--muted-2)" }}>Pay</span>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-heading)",
                  fontSize: 19,
                  marginTop: 2,
                }}
              >
                {payLine}
              </span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--muted-3)" }}>
                {formatUsd(reviewSnapshot.sourceUsdValue)}
              </span>
            </span>
            <span aria-hidden="true" style={{ color: "var(--color-accent)", fontSize: 16 }}>
              →
            </span>
            <span style={{ flex: "1 1 40%", minWidth: 0, textAlign: "right" }}>
              <span style={{ display: "block", fontSize: 11, color: "var(--muted-2)" }}>
                Receive
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-heading)",
                  fontSize: 19,
                  marginTop: 2,
                }}
              >
                {recvLine}
              </span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--muted-3)" }}>
                {formatUsd(reviewSnapshot.destinationUsdValue)}
              </span>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="dialog-row">
              <span style={{ color: "var(--muted-2)" }}>Rate</span>
              <span>
                1 {reviewSnapshot.sourceAsset.symbol} ={" "}
                {formatTokenAmount(reviewSnapshot.exchangeRate)}{" "}
                {reviewSnapshot.destinationAsset.symbol}
              </span>
            </div>
            <div className="dialog-row">
              <span style={{ color: "var(--muted-2)" }}>Minimum received</span>
              <span>
                {formatTokenAmount(reviewSnapshot.minimumReceived)}{" "}
                {reviewSnapshot.destinationAsset.symbol}
              </span>
            </div>
            <div className="dialog-row">
              <span style={{ color: "var(--muted-2)" }}>Slippage</span>
              <span>{(reviewSnapshot.slippage * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Confirm swap
            </Button>
          </div>
        </div>
      ) : null}

      {showPending ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "22px 0 10px",
          }}
        >
          <Spinner size={34} label="Submitting swap" />
          <span className="dialog-title" style={{ fontSize: 17 }}>
            Submitting swap
          </span>
          <span className="text-muted" style={{ fontSize: 12.5 }}>
            {payLine} → {recvLine}
          </span>
        </div>
      ) : null}

      {showDone && lastExecution ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                flex: "none",
                borderRadius: "50%",
                border: "1px solid var(--color-accent)",
                color: "var(--color-accent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✓
            </span>
            <span className="dialog-title" style={{ fontSize: 19 }}>
              Swap complete
            </span>
          </div>
          <p className="dialog-body" style={{ margin: 0 }}>
            You swapped {payLine} for {recvLine}. Balances have been updated.
          </p>
          <div
            className="dialog-row"
            style={{
              padding: "9px 12px",
              background: "var(--color-bg)",
              border: "1px solid var(--color-divider)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span style={{ color: "var(--muted-2)" }}>Simulated transaction</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {lastExecution.transactionIdentifier.value}
            </span>
          </div>
          <div className="dialog-actions">
            <Button variant="primary" onClick={handleNewSwap}>
              New swap
            </Button>
          </div>
        </div>
      ) : null}

      {showFailed ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="dialog-title">Swap failed</span>
          <p className="dialog-body" role="alert" style={{ margin: 0 }}>
            The simulated execution could not be completed. No balances were changed.
          </p>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={handleCancel}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
