const APP_ENVS = ["local", "dev", "prod"] as const;

export type AppEnv = (typeof APP_ENVS)[number];

export interface AppConfig {
  readonly appEnv: AppEnv;
  readonly priceFeedUrl: string;
}

const DEFAULT_APP_ENV: AppEnv = "local";
const DEFAULT_PRICE_FEED_URL = "https://interview.switcheo.com/prices.json";

function isAppEnv(value: string | undefined): value is AppEnv {
  return !!value && (APP_ENVS as readonly string[]).includes(value);
}

/**
 * Pure, injectable config reader — takes an env-like record rather than
 * reading `process.env` directly so it stays testable without mutating
 * global state. `readAppConfigFromProcessEnv` below is the thin real entrypoint.
 *
 * Prefers the `NEXT_PUBLIC_`-prefixed variant of each variable: this config
 * is consumed from client-rendered code (`createPriceFeedPort`, invoked from
 * a "use client" hook), and Next.js only inlines `NEXT_PUBLIC_*` variables
 * into the browser bundle — a plain `APP_ENV`/`PRICE_FEED_URL` is always
 * `undefined` at actual runtime in the browser, regardless of what the
 * environment/Docker config sets. The unprefixed names are still accepted
 * as a fallback for any future server-only consumer.
 */
export function readAppConfig(source: Readonly<Record<string, string | undefined>>): AppConfig {
  const appEnv = source.NEXT_PUBLIC_APP_ENV ?? source.APP_ENV;
  const priceFeedUrl = source.NEXT_PUBLIC_PRICE_FEED_URL ?? source.PRICE_FEED_URL;
  return {
    appEnv: isAppEnv(appEnv) ? appEnv : DEFAULT_APP_ENV,
    priceFeedUrl: priceFeedUrl?.trim() || DEFAULT_PRICE_FEED_URL,
  };
}

/**
 * Next.js's build-time inlining for `NEXT_PUBLIC_*` variables only works on
 * the literal `process.env.NEXT_PUBLIC_X` expression appearing directly in
 * source — forwarding the whole `process.env` object (as `readAppConfig`
 * takes for testability) defeats that static replacement, leaving the
 * client bundle reading real `undefined` values at runtime. Referencing
 * each variable by its literal expression here keeps that replacement
 * working while `readAppConfig` itself stays a pure, injectable function.
 */
export function readAppConfigFromProcessEnv(): AppConfig {
  return readAppConfig({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_PRICE_FEED_URL: process.env.NEXT_PUBLIC_PRICE_FEED_URL,
    APP_ENV: process.env.APP_ENV,
    PRICE_FEED_URL: process.env.PRICE_FEED_URL,
  });
}
