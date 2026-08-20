"use client";

import { useId, useState } from "react";
import { calculateExchangeRate } from "@/domain";
import type { Asset } from "@/domain";
import {
  applyHalfAmountAction,
  applyMaxAmountAction,
  prepareReviewAction,
  reverseSwapAction,
  useCurrentSwapValidation,
  useSwapStore,
} from "@/state";
import { formatTokenAmount, formatUsd } from "@/shared/utils";
import { Button } from "../atoms/Button";
import { AmountField } from "../molecules/AmountField";
import { AssetSelectorTrigger } from "../molecules/AssetSelectorTrigger";
import { SlippageSelector } from "../molecules/SlippageSelector";
import { AssetPickerDialog } from "./AssetPickerDialog";
import { SwapReviewDialog } from "./SwapReviewDialog";
import { getNoticeMessage, getSwapCtaState } from "./swapFormCopy";

export interface SwapFormProps {
  readonly assets: readonly Asset[];
}

type PickerSide = "pay" | "receive" | null;

/**
 * Main swap form (Currency Swap.dc.html baseline). All calculation and
 * validation is delegated to `useCurrentSwapValidation`/the swapActions
 * integration boundary — this component only renders results and forwards
 * user intent. Price impact and network fee are intentionally never
 * rendered (approved deviation); no live/production market-data wording is used.
 */
export function SwapForm({ assets }: SwapFormProps) {
  const sourceAsset = useSwapStore((state) => state.sourceAsset);
  const destinationAsset = useSwapStore((state) => state.destinationAsset);
  const sourceAmountInput = useSwapStore((state) => state.sourceAmountInput);
  const slippage = useSwapStore((state) => state.slippage);
  const balances = useSwapStore((state) => state.balances);
  const setSourceAsset = useSwapStore((state) => state.setSourceAsset);
  const setDestinationAsset = useSwapStore((state) => state.setDestinationAsset);
  const setSourceAmountInput = useSwapStore((state) => state.setSourceAmountInput);
  const setSlippage = useSwapStore((state) => state.setSlippage);

  const validation = useCurrentSwapValidation();

  const [picker, setPicker] = useState<PickerSide>(null);
  const [invertRate, setInvertRate] = useState(false);

  const noticeId = useId();
  const sourceBalance = balances.find(
    (balance) => balance.assetSymbol === sourceAsset?.symbol,
  )?.amount;
  const destinationBalance = balances.find(
    (balance) => balance.assetSymbol === destinationAsset?.symbol,
  )?.amount;

  const notice = getNoticeMessage(validation, sourceAmountInput, sourceBalance);
  const cta = getSwapCtaState(validation, sourceAmountInput);
  const quote = validation.quote;

  const balancesBySymbol = Object.fromEntries(
    balances.map((balance) => [balance.assetSymbol, balance.amount]),
  );

  function handlePickAsset(symbol: string) {
    const chosenAsset = assets.find((asset) => asset.symbol === symbol);
    if (!chosenAsset || !picker) return;

    const currentAsset = picker === "pay" ? sourceAsset : destinationAsset;
    const otherAsset = picker === "pay" ? destinationAsset : sourceAsset;
    if (currentAsset && otherAsset && otherAsset.symbol === symbol) {
      // Picking the asset already on the other side swaps the sides (matches the design
      // baseline) — but only once both sides already hold an asset. If the side being
      // picked was still empty, there is nothing to swap into the other side; falling
      // through to the plain assignment below lets a genuine same-asset pick surface
      // Domain's SameAssetSwap validation instead of silently nulling the other side.
      if (picker === "pay") {
        setSourceAsset(chosenAsset);
        setDestinationAsset(sourceAsset);
      } else {
        setDestinationAsset(chosenAsset);
        setSourceAsset(destinationAsset);
      }
    } else if (picker === "pay") {
      setSourceAsset(chosenAsset);
    } else {
      setDestinationAsset(chosenAsset);
    }
    setPicker(null);
  }

  return (
    <section style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 560 }}>
      <h3 style={{ margin: "0 0 4px" }}>Swap assets</h3>
      <p className="text-muted" style={{ fontSize: 13, maxWidth: "44ch" }}>
        Amounts are quoted directly from the provided prices.
      </p>

      <div className="card elev-md" style={{ marginTop: 18 }}>
        <div className="amount-card">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--muted-1)" }}>You pay</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--muted-2)",
              }}
            >
              <span>Balance {sourceBalance ? formatTokenAmount(sourceBalance) : "0"}</span>
              <Button
                variant="ghost"
                style={{ fontSize: 11, padding: "2px 6px" }}
                onClick={() => applyHalfAmountAction()}
              >
                HALF
              </Button>
              <Button
                variant="ghost"
                style={{ fontSize: 11, padding: "2px 6px" }}
                onClick={() => applyMaxAmountAction()}
              >
                MAX
              </Button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <AmountField
              value={sourceAmountInput}
              onChange={setSourceAmountInput}
              aria-label="Amount to pay"
              aria-describedby={notice ? noticeId : undefined}
              aria-invalid={!!notice}
            />
            <AssetSelectorTrigger
              symbol={sourceAsset?.symbol ?? null}
              placeholder="Select"
              label="Choose the asset you pay with"
              onClick={() => setPicker("pay")}
            />
          </div>
          <div style={{ fontSize: 12, marginTop: 4, color: "var(--muted-3)" }}>
            {quote ? formatUsd(quote.sourceUsdValue) : "$0.00"}
          </div>
        </div>

        <div style={{ position: "relative", height: 34 }}>
          <div
            style={{
              position: "absolute",
              inset: "17px 0 auto 0",
              height: 1,
              background: "var(--color-divider)",
            }}
          />
          <Button
            variant="secondary"
            icon
            onClick={() => reverseSwapAction()}
            aria-label="Reverse the swap direction"
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              transform: "translateX(-50%)",
              borderRadius: 999,
              color: "var(--color-accent)",
            }}
          >
            ⇅
          </Button>
        </div>

        <div className="amount-card">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--muted-1)" }}>You receive</span>
            <span style={{ fontSize: 12, color: "var(--muted-2)" }}>
              Balance {destinationBalance ? formatTokenAmount(destinationBalance) : "0"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <div
              aria-live="polite"
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: "var(--font-heading)",
                fontWeight: 500,
                fontSize: "clamp(25px, 6.5vw, 34px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: quote
                  ? "var(--color-text)"
                  : "color-mix(in srgb, var(--color-text) 40%, transparent)",
              }}
            >
              {quote ? formatTokenAmount(quote.receiveAmount) : "0.0"}
            </div>
            <AssetSelectorTrigger
              symbol={destinationAsset?.symbol ?? null}
              placeholder="Select"
              label="Choose the asset you receive"
              onClick={() => setPicker("receive")}
            />
          </div>
          <div style={{ fontSize: 12, marginTop: 4, color: "var(--muted-3)" }}>
            {quote ? formatUsd(quote.destinationUsdValue) : "$0.00"}
          </div>
        </div>

        {notice ? (
          <div id={noticeId} role="alert" className="notice" style={{ marginTop: 12 }}>
            <span aria-hidden="true">⚠</span>
            <span>{notice}</span>
          </div>
        ) : null}

        {quote ? (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 7,
              fontSize: 12.5,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--muted-2)" }}>Rate</span>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12.5, padding: "1px 5px", color: "var(--color-text)" }}
                onClick={() => setInvertRate((current) => !current)}
              >
                {invertRate
                  ? `1 ${quote.destinationAsset.symbol} = ${formatTokenAmount(calculateExchangeRate(quote.destinationAsset.price, quote.sourceAsset.price))} ${quote.sourceAsset.symbol}`
                  : `1 ${quote.sourceAsset.symbol} = ${formatTokenAmount(quote.exchangeRate)} ${quote.destinationAsset.symbol}`}{" "}
                <span aria-hidden="true" style={{ opacity: 0.45 }}>
                  ⇄
                </span>
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ color: "var(--muted-2)" }}>Minimum received</span>
              <span>
                {formatTokenAmount(quote.minimumReceived)} {quote.destinationAsset.symbol}
              </span>
            </div>
            <div style={{ marginTop: 3 }}>
              <SlippageSelector value={slippage} onChange={setSlippage} />
            </div>
          </div>
        ) : null}

        <Button
          variant="primary"
          block
          disabled={cta.disabled}
          onClick={() => prepareReviewAction()}
        >
          {cta.label}
        </Button>
      </div>

      <AssetPickerDialog
        open={picker !== null}
        title={picker === "pay" ? "Pay with" : "Receive"}
        assets={[...assets]}
        balancesBySymbol={balancesBySymbol}
        otherSymbol={(picker === "pay" ? destinationAsset : sourceAsset)?.symbol ?? null}
        onSelect={handlePickAsset}
        onClose={() => setPicker(null)}
      />

      <SwapReviewDialog />
    </section>
  );
}
