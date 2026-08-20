import type { Decimal } from "@/domain";

/**
 * Display formatting only — never used to compute a value, only to render
 * an already-calculated Domain result (architecture.md §17/§23). Precision
 * scales with magnitude so small-value tokens (e.g. SWTH at $0.004) remain
 * readable while large ones stay compact.
 */
export function formatTokenAmount(amount: Decimal): string {
  if (!amount.isFinite()) return "0";
  const abs = amount.abs();
  const decimalPlaces = abs.greaterThanOrEqualTo(1000)
    ? 2
    : abs.greaterThanOrEqualTo(1)
      ? 4
      : abs.greaterThanOrEqualTo(0.01)
        ? 6
        : 8;
  return amount
    .toDecimalPlaces(decimalPlaces)
    .toNumber()
    .toLocaleString("en-US", { maximumFractionDigits: decimalPlaces });
}

export function formatUsd(amount: Decimal): string {
  if (!amount.isFinite()) return "$0.00";
  if (!amount.isZero() && amount.abs().lessThan(0.01)) return "<$0.01";
  return (
    "$" +
    amount
      .toNumber()
      .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export function formatPrice(price: Decimal): string {
  if (!price.isFinite()) return "$0.00";
  if (price.greaterThanOrEqualTo(1)) {
    return (
      "$" +
      price
        .toNumber()
        .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  }
  if (price.greaterThanOrEqualTo(0.1)) return "$" + price.toFixed(4);
  return "$" + Number(price.toPrecision(3)).toString();
}

/** "just updated" / "Xs ago" / "Xm ago" / ... — the bucket logic shared by both timestamp displays below. */
function formatRelativeAge(elapsedMs: number): string {
  const seconds = Math.max(0, Math.round(elapsedMs / 1000));
  if (seconds < 5) return "just updated";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 365) return `${days}d ago`;
  const years = Math.round(days / 365);
  return `${years}y ago`;
}

/**
 * FR-018/AC-015/domain.md §17: the dataset timestamp is the age of the
 * underlying provided price records themselves (never resets on refresh —
 * refreshing a static snapshot does not make the market data any newer).
 * Always frames it as "Provided price data", never as live/production
 * market data (Discovery Risk 1, approved deviation).
 */
export function formatDatasetTimestamp(timestamp: number | null, now: number = Date.now()): string {
  if (timestamp === null) return "Provided price data";
  return `Provided price data · ${formatRelativeAge(now - timestamp)}`;
}

/**
 * "Updated just now" / "Updated Xs ago" — age of the last successful browser
 * fetch. Resets on each successful refresh (the last-checked clock), distinct
 * from `formatDatasetTimestamp` (the age of the underlying provided records).
 */
export function formatLastCheckedAge(timestamp: number | null, now: number = Date.now()): string {
  if (timestamp === null) return "Live rates";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 5) return "Live rates · just updated";
  return `Live rates · ${formatRelativeAge(now - timestamp)}`;
}
