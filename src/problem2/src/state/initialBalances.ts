import { Decimal } from "@/domain";
import type { Balance } from "@/domain";
import { BALANCE_FIXTURES } from "@/infrastructure";

/**
 * Converts Infrastructure's plain-number fixture balances into Domain's
 * Decimal-typed Balance[]. Not part of the pure `swapStore.ts` definition —
 * this is initialization wiring, intended to be called once (e.g. on app
 * mount in a later Presentation phase) via `useSwapStore.getState().setBalances(...)`.
 */
export function createInitialBalances(): Balance[] {
  return Object.entries(BALANCE_FIXTURES).map(([assetSymbol, amount]) => ({
    assetSymbol,
    amount: new Decimal(amount),
  }));
}
