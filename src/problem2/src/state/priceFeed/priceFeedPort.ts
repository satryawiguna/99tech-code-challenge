import { fetchPriceFeed, readAppConfigFromProcessEnv } from "@/infrastructure";
import type { FetchPriceRecords } from "@/application";

/**
 * Binds Infrastructure's price-feed adapter and config reader into the
 * Application-owned `FetchPriceRecords` port shape (structural typing —
 * see application/services/pricePort.ts). `readAppConfigFromProcessEnv`
 * prefers `NEXT_PUBLIC_PRICE_FEED_URL` and falls back to the
 * challenge-provided URL when unset — this hook runs client-side, and
 * Next.js only inlines `NEXT_PUBLIC_*` variables into the browser bundle.
 */
export function createPriceFeedPort(url?: string): FetchPriceRecords {
  const priceFeedUrl = url ?? readAppConfigFromProcessEnv().priceFeedUrl;
  return () => fetchPriceFeed({ url: priceFeedUrl });
}
