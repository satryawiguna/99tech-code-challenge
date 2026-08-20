import type { Balance } from "./balance";
import { findBalanceAmount, setBalanceAmount } from "./balance";
import type { SwapReviewSnapshot } from "../swap/reviewSnapshot";

/**
 * Applies the balance mutation for a successfully executed reviewed snapshot:
 * sourceBalance -= sourceAmount, destinationBalance += receiveAmount (BR-008).
 * Must only be called after a successful SwapExecution.
 */
export function updateBalances(
  balances: readonly Balance[],
  snapshot: SwapReviewSnapshot,
): Balance[] {
  const sourceAmount = findBalanceAmount(balances, snapshot.sourceAsset.symbol).minus(
    snapshot.sourceAmount,
  );
  const withSourceUpdated = setBalanceAmount(balances, snapshot.sourceAsset.symbol, sourceAmount);

  const destinationAmount = findBalanceAmount(
    withSourceUpdated,
    snapshot.destinationAsset.symbol,
  ).plus(snapshot.receiveAmount);
  return setBalanceAmount(withSourceUpdated, snapshot.destinationAsset.symbol, destinationAmount);
}
