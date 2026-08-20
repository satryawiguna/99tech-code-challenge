"use client";

import { calculateQuote as calculateQuoteUseCase } from "@/application";
import { findBalanceAmount } from "@/domain";
import type { SwapValidation } from "@/domain";
import { useSwapStore } from "./swapStore";

/**
 * Reactive counterpart to `swapActions.ts`'s imperative `calculateCurrentQuoteAction`:
 * subscribes to exactly the store fields the quote depends on, so Presentation
 * re-renders with a fresh quote whenever any of them change, without storing
 * the derived quote itself (architecture.md §11.2/§12). No calculation logic
 * lives here — it only forwards current values to Application's `calculateQuote`.
 */
export function useCurrentSwapValidation(): SwapValidation {
  const sourceAsset = useSwapStore((state) => state.sourceAsset);
  const destinationAsset = useSwapStore((state) => state.destinationAsset);
  const sourceAmountInput = useSwapStore((state) => state.sourceAmountInput);
  const slippage = useSwapStore((state) => state.slippage);
  const balances = useSwapStore((state) => state.balances);

  const sourceBalanceAmount = findBalanceAmount(balances, sourceAsset?.symbol ?? "").toNumber();

  return calculateQuoteUseCase({
    sourceAsset,
    destinationAsset,
    sourceAmountInput,
    sourceBalanceAmount,
    slippage,
  });
}
