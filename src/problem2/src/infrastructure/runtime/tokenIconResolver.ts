/**
 * The bundled SVG filenames (public/tokens/) use display-style casing for a
 * handful of staked-asset symbols, while the price feed's raw currency codes
 * use a different casing for the same assets (Discovery §11 icon-mapping
 * risk). This is the known alias table for the currently bundled set.
 */
const ICON_ALIASES: Readonly<Record<string, string>> = {
  STATOM: "stATOM",
  STOSMO: "stOSMO",
  STLUNA: "stLUNA",
  STEVMOS: "stEVMOS",
  RATOM: "rATOM",
};

/** Every symbol with a bundled icon file under public/tokens/{symbol}.svg. */
export const BUNDLED_TOKEN_ICON_SYMBOLS: ReadonlySet<string> = new Set([
  "ATOM",
  "BLUR",
  "BUSD",
  "ETH",
  "EVMOS",
  "GMX",
  "IBCX",
  "IRIS",
  "KUJI",
  "LSI",
  "LUNA",
  "OKB",
  "OKT",
  "OSMO",
  "STRD",
  "SWTH",
  "USC",
  "USD",
  "USDC",
  "WBTC",
  "YieldUSD",
  "ZIL",
  "ampLUNA",
  "axlUSDC",
  "bNEO",
  "rATOM",
  "rSWTH",
  "stATOM",
  "stEVMOS",
  "stLUNA",
  "stOSMO",
  "wstETH",
]);

export const FALLBACK_TOKEN_ICON_PATH = "/tokens/_fallback.svg";

function iconPath(fileSymbol: string): string {
  return `/tokens/${fileSymbol}.svg`;
}

/**
 * exact symbol match → known alias mapping → generic placeholder (FR-028 /
 * Discovery §11). Never throws and never returns a path known to be missing.
 */
export function resolveTokenIconPath(
  symbol: string,
  availableIcons: ReadonlySet<string> = BUNDLED_TOKEN_ICON_SYMBOLS,
): string {
  if (availableIcons.has(symbol)) return iconPath(symbol);

  const alias = ICON_ALIASES[symbol];
  if (alias && availableIcons.has(alias)) return iconPath(alias);

  return FALLBACK_TOKEN_ICON_PATH;
}
