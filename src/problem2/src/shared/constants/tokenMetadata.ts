/**
 * Static symbol → display-name mapping (Discovery §10 "Token Metadata
 * Discovery" — name comes from local metadata, not the price feed; PRD §25
 * defers the exact strategy to implementation). Domain's `Asset` type
 * intentionally excludes display name (domain.md §5.3), so this lives at
 * the Presentation boundary where it's actually needed (FR-003/FR-006).
 * Covers every symbol found in the price feed during discovery; an unmapped
 * symbol falls back to itself rather than breaking the UI.
 */
const TOKEN_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  ETH: "Ethereum",
  USDC: "USD Coin",
  ATOM: "Cosmos Hub",
  OSMO: "Osmosis",
  SWTH: "Switcheo",
  LUNA: "Terra",
  GMX: "GMX",
  USD: "US Dollar",
  bNEO: "Bridged NEO",
  BUSD: "Binance USD",
  axlUSDC: "Axelar USDC",
  USC: "USC",
  OKB: "OKB",
  OKT: "OKT Chain",
  KUJI: "Kujira",
  EVMOS: "Evmos",
  IRIS: "IRISnet",
  STRD: "Stride",
  IBCX: "IBC Index",
  LSI: "Liquid Staking Index",
  BLUR: "Blur",
  STATOM: "Stride Staked ATOM",
  STOSMO: "Stride Staked OSMO",
  STLUNA: "Stride Staked LUNA",
  STEVMOS: "Stride Staked EVMOS",
  ampLUNA: "Amplified LUNA",
  RATOM: "Staked ATOM",
  rSWTH: "Reserved SWTH",
  WBTC: "Wrapped Bitcoin",
  wstETH: "Wrapped Staked ETH",
  YieldUSD: "Yield USD",
  ZIL: "Zilliqa",
};

export function getTokenDisplayName(symbol: string): string {
  return TOKEN_DISPLAY_NAMES[symbol] ?? symbol;
}
