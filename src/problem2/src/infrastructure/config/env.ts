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
 */
export function readAppConfig(source: Readonly<Record<string, string | undefined>>): AppConfig {
  return {
    appEnv: isAppEnv(source.APP_ENV) ? source.APP_ENV : DEFAULT_APP_ENV,
    priceFeedUrl: source.PRICE_FEED_URL?.trim() || DEFAULT_PRICE_FEED_URL,
  };
}

export function readAppConfigFromProcessEnv(): AppConfig {
  return readAppConfig(process.env);
}
