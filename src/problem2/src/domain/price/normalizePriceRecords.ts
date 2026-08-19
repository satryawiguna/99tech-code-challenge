import Decimal from "decimal.js";
import type { PriceRecord } from "./priceRecord";
import type { NormalizedPrice } from "./normalizedPrice";

interface ParsedPriceRecord {
  readonly currency: string;
  readonly price: Decimal;
  readonly timestamp: number;
}

function parseValidRecord(record: PriceRecord): ParsedPriceRecord | null {
  if (!record || typeof record.currency !== "string" || record.currency.length === 0) return null;

  const timestamp = Date.parse(record.date);
  if (!Number.isFinite(timestamp)) return null;

  const price = new Decimal(record.price);
  if (!price.isFinite() || price.lessThanOrEqualTo(0)) return null;

  return { currency: record.currency, price, timestamp };
}

/**
 * For equal latest timestamps within a currency, the record with the lowest
 * numeric price is selected (approved deterministic tie-breaker). Sorting
 * both fields explicitly keeps the result independent of input array order.
 */
function selectLatestValidRecord(records: readonly ParsedPriceRecord[]): ParsedPriceRecord {
  return [...records].sort((a, b) => {
    if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp;
    return a.price.comparedTo(b.price);
  })[0];
}

export function normalizePriceRecords(records: readonly PriceRecord[]): NormalizedPrice[] {
  const validRecords = records
    .map(parseValidRecord)
    .filter((record): record is ParsedPriceRecord => record !== null);

  const byCurrency = new Map<string, ParsedPriceRecord[]>();
  for (const record of validRecords) {
    const existing = byCurrency.get(record.currency);
    if (existing) {
      existing.push(record);
    } else {
      byCurrency.set(record.currency, [record]);
    }
  }

  return [...byCurrency.entries()]
    .map(([currency, group]) => {
      const selected = selectLatestValidRecord(group);
      return { currency, price: selected.price, timestamp: selected.timestamp };
    })
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export function latestDatasetTimestamp(prices: readonly NormalizedPrice[]): number | null {
  if (prices.length === 0) return null;
  return prices.reduce((latest, price) => Math.max(latest, price.timestamp), -Infinity);
}
