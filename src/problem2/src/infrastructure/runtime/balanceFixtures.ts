/**
 * Static local mock balances (round simulated values, approved decision).
 * Expressed as plain numbers, not Decimal — decimal.js is confined to the
 * Domain layer; the Application layer converts these into Decimal when
 * constructing initial Domain Balance state.
 */
export const BALANCE_FIXTURES: Readonly<Record<string, number>> = {
  ETH: 5,
  USDC: 10000,
  ATOM: 300,
  OSMO: 1000,
  SWTH: 100000,
  WBTC: 0.5,
  USD: 2000,
};

export function getFixtureBalance(symbol: string): number {
  return BALANCE_FIXTURES[symbol] ?? 0;
}
