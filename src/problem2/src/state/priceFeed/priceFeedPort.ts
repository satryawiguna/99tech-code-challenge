import { fetchPriceFeed, readAppConfigFromProcessEnv } from "@/infrastructure";
import type { FetchPriceRecords } from "@/application";

/**
 * Binds Infrastructure's price-feed adapter and config reader into the
 * Application-owned `FetchPriceRecords` port shape (structural typing —
 * see application/services/pricePort.ts). `readAppConfigFromProcessEnv`
 * already falls back to the challenge-provided URL when `PRICE_FEED_URL`
 * is unset, so this degrades gracefully in a client bundle where the raw
 * env var may not be inlined; a later Presentation phase may still want a
 * `NEXT_PUBLIC_PRICE_FEED_URL` if the config needs to vary per environment
 * from client-rendered code.
 */
export function createPriceFeedPort(url?: string): FetchPriceRecords {
  const priceFeedUrl = url ?? readAppConfigFromProcessEnv().priceFeedUrl;
  return () => fetchPriceFeed({ url: priceFeedUrl });
}
