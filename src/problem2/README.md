# Nocturne Swap — Problem 2: Fancy Form

A frontend token-swap simulation built for the 99Tech code challenge
("Problem 2 — Fancy Form"). Nocturne Swap lets a user pick a source and
destination asset from a provided price feed, enter an amount, review a
quote, and confirm a **simulated** swap that updates local, in-memory
balances.

This is a UI/architecture exercise, not a trading product: there is no
wallet, no blockchain, and no real market execution anywhere in this app.

## Features

- **Price-feed normalization** — deduplicates and validates the challenge
  price feed, keeping only the latest valid record per asset.
- **Quote flow** — live exchange rate, receive amount, and USD values
  recalculated as inputs change.
- **Validation** — invalid amount, insufficient balance, missing price,
  and same-asset states are all explicitly handled, not just prevented
  silently.
- **HALF / MAX** — one-click amount shortcuts based on the current source
  balance.
- **Reverse swap** — flips source/destination and recalculates from the
  new direction.
- **Review snapshot** — confirmation always executes an immutable snapshot
  captured at "Review swap" time; later form edits can't silently change
  what gets confirmed.
- **Simulated execution** — a local balance transition with a clearly
  labeled simulated transaction identifier.
- **Asset search** — search-by-symbol-or-name in the asset picker, with an
  explicit empty-state and icon fallback.
- **Refresh / error recovery** — manual refresh, a retry path for initial
  load failure, and a "keep the last known good data" path when a refresh
  fails.

## Simulation disclaimer

Nocturne Swap is a simulation. It does not:

- connect to a real wallet;
- submit a real blockchain transaction;
- represent executable market liquidity;
- reflect a real account balance;
- claim that the underlying price feed is live/production market data.

Balances are static, in-memory fixtures reset on reload. Transaction
identifiers use a `SIM-` prefix and are never presented as blockchain
transaction hashes.

## Prerequisites

- Node.js 22+
- npm
- Docker (optional, for the containerized workflow)

## Setup

```bash
npm install
cp .env.example .env.local   # optional — sensible defaults are built in
npm run dev
```

Then open [http://localhost:3000/swap](http://localhost:3000/swap).

## Environment variables

See [`.env.example`](.env.example) for the full reference. The two
variables that matter are `APP_ENV` and `PRICE_FEED_URL`:

| Variable                     | Purpose                                      | Default                                      |
| ---------------------------- | -------------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_APP_ENV`        | Environment label (`local` / `dev` / `prod`) | `local`                                      |
| `NEXT_PUBLIC_PRICE_FEED_URL` | Price feed endpoint the app fetches          | `https://interview.switcheo.com/prices.json` |

The price feed is fetched client-side, and Next.js only inlines
`NEXT_PUBLIC_`-prefixed variables into the browser bundle — so these are
the names that actually take effect. Unprefixed `APP_ENV`/`PRICE_FEED_URL`
are also accepted as fallbacks for any future server-only use, but setting
only those has no effect on the deployed app today.

## Native commands

```bash
npm run dev           # start the dev server
npm run build          # production build
npm run start           # serve a production build
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
npm run format:check    # prettier --check .
npm run test             # unit/integration tests (vitest)
npm run test:e2e         # end-to-end tests (playwright)
```

## Docker

Three environment-specific services:

| Service     | Dockerfile target | Port | Purpose                                               |
| ----------- | ----------------- | ---- | ----------------------------------------------------- |
| `app-local` | `dev`             | 3000 | Hot-reload development, bind-mounted source           |
| `app-dev`   | `runner`          | 3001 | Reproducible non-production runtime, standalone build |
| `app-prod`  | `runner`          | 3002 | Reproducible production runtime, standalone build     |

```bash
docker compose up app-local            # dev target, hot reload, http://localhost:3000
docker compose build app-dev && docker compose up app-dev    # http://localhost:3001
docker compose build app-prod && docker compose up app-prod  # http://localhost:3002
docker compose down                    # stop and remove all containers
```

`app-local` reads its config live at container runtime, so editing `.env`
or restarting the container picks up changes immediately.

`app-dev`/`app-prod` **do not** — `NEXT_PUBLIC_APP_ENV`/`NEXT_PUBLIC_PRICE_FEED_URL`
are inlined into the client bundle at Docker build time (Next.js only
inlines `NEXT_PUBLIC_*` vars at build, not at container start). Changing
`NEXT_PUBLIC_PRICE_FEED_URL` and running `docker compose up app-dev` alone
reuses the existing image untouched — you must explicitly rebuild:

```bash
NEXT_PUBLIC_PRICE_FEED_URL=https://example.test/prices.json docker compose build app-dev
docker compose up app-dev
```

`NEXT_PUBLIC_APP_ENV` for `app-dev`/`app-prod` is fixed to `dev`/`prod`
respectively and isn't meant to be overridden per run.

## Architecture overview

Pragmatic Clean Architecture with a one-way dependency rule:

- **Domain** — framework-independent business rules: price normalization,
  quote/rate/USD-value/minimum-received calculations, validation, review
  snapshot, simulated execution, and balance transitions. No React, no
  fetch, no environment reads.
- **Application** — orchestrates Domain use cases (load prices, apply
  HALF/MAX, calculate quote, prepare review, confirm swap, reverse swap)
  behind small ports; no business formulas of its own.
- **Infrastructure** — external boundaries: the price-feed HTTP adapter
  (with schema validation), environment configuration, and simulated
  transaction-id/balance-fixture sources.
- **State** — the Zustand store plus the integration boundary that wires
  user actions to Application use cases and TanStack Query for the price
  feed. Owns UI-facing state only; no business calculations beyond
  aggregation (e.g. summing already-computed values).
- **Presentation** — React components (atoms → molecules → organisms →
  templates) that render Domain-typed results. No calculation, validation,
  or balance mutation logic lives here.

## Testing overview

- **Unit tests** (Vitest) cover Domain rules in isolation, Application use
  cases, Infrastructure adapters, and State/Presentation behavior.
- **Integration tests** cover the State-to-Application wiring and
  component-level flows (e.g. the full review → confirm → success dialog).
- **E2E tests** (Playwright, `e2e/swap.spec.ts`) cover the critical user
  journeys against a running app with the price feed mocked for
  determinism: the minimum flow (load → select → amount → review →
  confirm → success), HALF/MAX, reverse swap, slippage change, invalid
  amount, insufficient balance, same-asset selection, refresh, and
  refresh/price-feed failure recovery.

## Approved design deviations

The implementation intentionally deviates from the visual design
reference in a few places, per the approved product/domain context:

- **No price impact or network fee** — the provided price feed doesn't
  contain enough information to calculate either honestly, so neither is
  shown or invented.
- **Slippage, not network fee, in the confirmation dialog.**
- **"Provided price data" wording** — the price feed timestamp is always
  described as provided/source data, never as "live" or real-time market
  data.
- **Simulated transaction identifier** — confirmed swaps show a `SIM-`
  prefixed identifier, explicitly labeled "Simulated transaction," never a
  blockchain-hash-like value.

## Known environment limitation

On a host where `npx playwright install` can't fetch the pinned Chromium
build (e.g. an OS version older than what the current Playwright release
supports), point the E2E run at any already-installed Chromium-family
browser instead:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="/path/to/chrome" npm run test:e2e
```

This is unset by default, so normal machines and CI keep using
Playwright's own managed browser.
