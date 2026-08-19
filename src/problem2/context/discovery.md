# Problem 2 — Fancy Form: Discovery

## 1. Purpose

This document records the discovery findings for **Problem 2: Fancy Form** before product requirements, architecture, UI/UX specification, and implementation are defined.

The goal is to establish a shared understanding of:

- the challenge objective;
- authoritative external data sources;
- available price data;
- token/icon data;
- intended user flow;
- the distinction between source data, derived values, and simulated behavior;
- known ambiguities and technical risks;
- explicit scope boundaries.

This is a discovery artifact, not an implementation specification.

---

## 2. Challenge Summary

### Challenge

**Problem 2: Fancy Form**

### Category

- Frontend
- Fullstack

### Core Task

Build a **currency/token swap form** based on the provided template. A user should be able to swap assets from one currency/token to another.

### Challenge Evaluation Signals

The challenge states that:

1. Input validation/error messages may be added.
2. Submission is evaluated on **intuitiveness and visual attractiveness**.
3. The provided files may be disregarded if a better frontend experience is produced.
4. The provided token image repository may be used.
5. The provided price-information URL may be used to compute exchange rates.
6. Vite is mentioned as a bonus opportunity.

---

## 3. Sources of Truth

### 3.1 Challenge Requirements

The challenge description is the primary source for functional expectations.

The supplied visual/template is a reference, not an immutable specification.

### 3.2 Price Feed

The challenge-provided price endpoint is:

`https://interview.switcheo.com/prices.json`

The inspected response returns an array of records with:

```text
currency
date
price
```

The current response contains 36 records.

Important observation: the response is a **static challenge data snapshot** with timestamps from 2023-08-29. Therefore, the UI should not imply that the source itself is genuinely real-time market data.

Recommended terminology:

- "Market prices from the provided price feed"
- "Rates updated X ago"

Avoid claiming that this endpoint provides production-grade live market prices.

### 3.3 Token Icons

The challenge-provided token icon repository is:

`https://github.com/Switcheo/token-icons/tree/main/tokens`

The repository contains token SVG assets using symbol-based filenames, including examples such as:

```text
ATOM.svg
BLUR.svg
BTC.svg
BUSD.svg
```

The repository should be treated as the visual asset source for supported token symbols.

### 3.4 UI Design Reference

The current UI design created for this challenge is a design reference and interaction baseline.

It contains four major states:

1. Main swap form
2. Asset selector
3. Confirm swap modal
4. Swap-complete modal

The design should be validated against actual challenge data and requirements rather than treated as a literal representation of backend capabilities.

---

## 4. External Data Discovery

### 4.1 Price Record Structure

The inspected endpoint returns records such as:

```json
{
  "currency": "ETH",
  "date": "2023-08-29T07:10:52.000Z",
  "price": 1645.9337373737374
}
```

Other observed currencies include:

```text
BLUR
bNEO
BUSD
USD
ETH
GMX
STEVMOS
LUNA
RATOM
STRD
EVMOS
IBCX
IRIS
ampLUNA
KUJI
STOSMO
USDC
axlUSDC
ATOM
STATOM
OSMO
rSWTH
STLUNA
LSI
OKB
OKT
SWTH
USC
WBTC
wstETH
YieldUSD
ZIL
```

The endpoint provides enough information to calculate relative exchange rates using USD-denominated prices.

---

## 5. Important Data Quality Findings

### 5.1 Duplicate Currency Records Exist

The endpoint contains multiple records for the same currency.

For example, `BUSD` appears more than once and `USDC` appears multiple times with different timestamps/prices.

Observed `USDC` records include:

```text
2023-08-29T07:10:40.000Z → 0.989832
2023-08-29T07:10:30.000Z → 1
2023-08-29T07:10:30.000Z → 1
2023-08-29T07:10:40.000Z → 0.9998782611186441
```

### Discovery Implication

The application must normalize the raw price feed before exposing assets to the UI.

A deterministic duplicate-selection policy must be defined during architecture.

Recommended candidate policy:

```text
same currency
    ↓
select record with latest timestamp
    ↓
if timestamps are equal, apply deterministic tie-breaker
```

The implementation should not rely on array order.

---

## 6. Price Eligibility

The challenge states that not every token has a price and that tokens without a listed price may be omitted.

Therefore an asset should be selectable only when it has a valid normalized price.

```text
Raw price records
        ↓
Validate price
        ↓
Normalize duplicates
        ↓
Exclude invalid/unpriced assets
        ↓
Selectable assets
```

The UI should not expose an asset as a valid swap option if its price cannot be used for the quote.

---

## 7. Exchange Rate Discovery

The price feed provides a common USD reference.

For source asset `A` and destination asset `B`:

```text
exchangeRate(A → B)
=
price(A) / price(B)
```

For an input amount:

```text
receiveAmount
=
inputAmount × price(source) / price(destination)
```

Example using the inspected data:

```text
ETH ≈ $1645.9337
ATOM ≈ $7.18666

1 ETH
≈
1645.9337 / 7.18666
≈
229.03 ATOM
```

This matches the general behavior shown in the current UI reference.

The exchange calculation is a **frontend-derived value**, not a value returned directly by the price endpoint.

---

## 8. Data Classification

The application should explicitly distinguish data by origin.

### 8.1 External Source Data

Directly obtained from the provided price feed:

```text
currency
price
price timestamp
```

### 8.2 Derived Application Data

Calculated locally:

```text
exchange rate
receive amount
USD value of entered amount
rate freshness/age
filtered asset list
search results
```

`minimum received` may also be derived once the slippage rule is defined.

### 8.3 Mock/Simulated Data

The current UI reference contains concepts that are not provided by `prices.json`.

Examples:

```text
balances
network fee
price impact
transaction hash
actual swap execution
balance mutation after a swap
```

These should only be implemented as simulated/local behavior unless another authoritative challenge source provides the missing data.

This separation prevents the implementation from falsely implying real blockchain execution.

---

## 9. Balance Discovery

The visual reference includes a portfolio/balance area and shows a balance for each asset.

The provided price endpoint does not provide wallet balances.

Therefore balances are **mock/local application state** if retained.

Expected behaviors from the current UI include:

```text
HALF
→ use 50% of selected source balance

MAX
→ use full selected source balance
```

The application should prevent submission when the source amount exceeds the available balance.

Example:

```text
Balance: 4.2183 ETH
Input:   5 ETH

→ insufficient balance
→ review action disabled
```

---

## 10. Token Metadata Discovery

The price endpoint provides the currency symbol but does not provide all presentation metadata required by the UI.

The UI requires at least:

```text
symbol
display name
icon
price
balance
```

Therefore token presentation metadata should be handled separately from price data.

Conceptual normalized asset model:

```text
Asset
├── symbol
├── name
├── icon
├── price
├── priceUpdatedAt
└── balance
```

Where:

```text
price / priceUpdatedAt
→ price feed

icon
→ Switcheo token-icons

name
→ local metadata / mapping

balance
→ local/mock application state
```

The exact metadata strategy belongs in `architecture.md`.

---

## 11. Icon Mapping Risk

The token icon repository uses symbol-based filenames, but the price feed contains symbols that may not map one-to-one to a simple filename convention.

Examples include:

```text
bNEO
ampLUNA
rSWTH
axlUSDC
wstETH
YieldUSD
```

Therefore the application should not assume that:

```text
{currency}.svg
```

will always exist.

Recommended icon resolution:

```text
exact symbol match
      ↓
known alias mapping
      ↓
generic token placeholder
```

The UI must remain usable when an icon is unavailable.

---

## 12. Current UI / UX Flow

### 12.1 Main Swap Screen

The current design includes:

- application header;
- swap title;
- price-feed freshness indicator;
- refresh action;
- "You pay" input;
- source token selector;
- source balance;
- HALF action;
- MAX action;
- swap-direction action;
- "You receive" output;
- destination token selector;
- destination balance;
- exchange rate;
- minimum received;
- price impact;
- network fee;
- max slippage;
- review action;
- portfolio/balance summary.

### 12.2 Asset Selector

The selector provides:

- search by name or symbol;
- token icon;
- token symbol;
- token display name;
- current price;
- balance;
- scrollable asset list.

The selected asset becomes the source or destination asset depending on which selector opened the dialog.

### 12.3 Confirm Swap

The confirmation modal shows:

```text
Pay
Receive
Rate
Minimum received
Network fee
Cancel
Confirm swap
```

The confirmation step is separated from the main form so the user can review the swap before simulated execution.

### 12.4 Swap Complete

The success state shows:

```text
Swap complete
summary of the swap
transaction identifier
New swap
```

The balance state can be updated locally to simulate completion.

---

## 13. Swap State Model

The UI implies these major states:

```text
Idle
  ↓
Input / Selection
  ↓
Quote Ready
  ↓
Review
  ↓
Confirm
  ↓
Processing
  ↓
Success
```

Error paths should also be supported:

```text
Input / Selection
  ↓
Validation Error

Quote
  ↓
Price unavailable / invalid

Processing
  ↓
Simulation Error
```

This state model should be formalized in `prd.md` and `architecture.md`.

---

## 14. Refresh Behavior

The UI includes a manual **Refresh** action.

Intended behavior:

```text
Refresh
   ↓
fetch prices.json
   ↓
normalize data
   ↓
update price state
   ↓
recalculate current quote
   ↓
update freshness indicator
```

The application should not fetch the price endpoint on every keystroke.

Amount changes should use the already-normalized price state for local calculations.

---

## 15. Loading and Error States

### Initial Loading

The application should show a loading state while price data is being fetched.

### Price Feed Failure

If the price endpoint cannot be loaded:

```text
Unable to load market prices.
Retry / Refresh
```

Swap actions should not be enabled when a valid quote cannot be calculated.

### Invalid Asset Price

If either selected asset lacks a valid price:

```text
Quote unavailable
```

### Insufficient Balance

If the source amount exceeds the local balance:

```text
Insufficient {TOKEN} balance
```

### Invalid Amount

Potential invalid inputs include:

```text
empty
zero
negative
non-numeric
malformed decimal
```

Exact validation rules belong in `prd.md`.

---

## 16. Price Impact, Network Fee, and Slippage

The visual reference contains:

```text
Price impact
Network fee
Max slippage
```

However, the provided price endpoint contains only simple token price data.

It does not provide:

```text
order book
liquidity
AMM reserves
gas/network fee
swap route
execution price
blockchain transaction
```

Therefore:

### Price Impact

Cannot be calculated accurately from the provided price feed alone.

### Network Fee

Cannot be calculated accurately from the provided price feed alone.

### Slippage

A user-selected slippage tolerance can be represented as a UI setting, but actual execution slippage cannot be modeled accurately without a quote/execution model.

### Discovery Decision

These features should be treated as **UI/simulation features** unless the challenge repository provides additional requirements or services.

They must not be represented as data obtained from `prices.json`.

---

## 17. Transaction Execution

The current UI includes a transaction identifier after a successful swap.

No blockchain execution service is provided by the inspected price endpoint.

Therefore the current interpretation is:

```text
Confirm swap
     ↓
local simulation
     ↓
update local balances
     ↓
generate/display simulated transaction ID
```

No real blockchain transaction should be implied or attempted without an explicit requirement.

---

## 18. Scope

### In Scope

- interactive token swap form;
- source/destination asset selection;
- token search;
- token icons;
- price-feed integration;
- price normalization;
- duplicate price handling;
- exchange-rate calculation;
- receive amount calculation;
- amount validation;
- balance validation;
- HALF/MAX behavior;
- swap direction;
- refresh;
- loading/error states;
- review modal;
- confirmation modal;
- simulated swap completion;
- local balance updates;
- responsive and visually polished frontend experience.

### Potentially In Scope as Simulation

- network fee;
- price impact;
- minimum received;
- slippage;
- transaction ID.

These require explicit definition in `prd.md` so they are not mistaken for real external data.

### Out of Scope Unless Additional Requirements Exist

- real wallet connection;
- real blockchain transactions;
- real liquidity/order-book integration;
- real AMM routing;
- real gas estimation;
- authentication;
- persistent user accounts;
- backend service;
- database;
- production trading infrastructure.

---

## 19. Key Risks and Ambiguities

### Risk 1 — Static Price Snapshot

The provided price endpoint currently contains historical timestamps.

**Impact:** Calling the UI "live market prices" would be misleading.

**Mitigation:** Use wording such as "Market prices from the provided price feed" and calculate freshness from the source timestamp.

### Risk 2 — Duplicate Prices

Multiple records can exist for one currency.

**Impact:** Naive mapping can produce non-deterministic or incorrect prices.

**Mitigation:** Define a deterministic normalization policy.

### Risk 3 — Token Metadata Incompleteness

The price feed does not provide display names and may not map directly to icon filenames.

**Impact:** Some assets may have no display metadata or icon.

**Mitigation:** Maintain a small metadata/alias layer and provide a generic fallback icon.

### Risk 4 — Simulated Financial Data

Price impact, network fee, and transaction hash are not provided by the price feed.

**Impact:** The UI could falsely imply that these values are real.

**Mitigation:** Clearly model them as simulated/derived values.

### Risk 5 — Floating-Point Precision

Financial calculations using native JavaScript floating-point numbers can produce rounding artifacts.

**Impact:** Displayed exchange values may differ slightly from expected calculations.

**Mitigation:** Define precision/rounding policy in architecture and use appropriate numeric handling.

### Risk 6 — Stale Quotes

The source price has an associated timestamp.

**Impact:** A quote may be based on old source data.

**Mitigation:** Track source timestamp and expose refresh/freshness behavior.

---

## 20. Engineering Opportunities

Although this is primarily a frontend challenge, it provides opportunities to demonstrate:

```text
External API integration
        ↓
Data normalization
        ↓
Domain calculation
        ↓
Derived state
        ↓
Form validation
        ↓
State transitions
        ↓
Reusable components
        ↓
Responsive UI
        ↓
Error handling
        ↓
Testable business logic
```

The implementation should prioritize clarity and maintainability over unnecessary infrastructure.

---

## 21. Proposed Domain Boundaries

Discovery suggests these conceptual boundaries:

```text
Price Feed
    ↓
Price Normalizer
    ↓
Asset Repository / Store
    ↓
Swap Calculator
    ↓
Swap Form State
    ↓
UI Components
```

Separately:

```text
Token Metadata
    ↓
Asset Presentation Model
```

And:

```text
Mock Balance State
    ↓
Balance Validation
    ↓
Simulated Swap Execution
```

These are discovery-level boundaries only. Final technical structure belongs in `architecture.md`.

---

## 22. Open Decisions for PRD / Architecture

The following decisions should be resolved before implementation:

1. Exact duplicate-price normalization rule.
2. Exact numeric precision and display rounding.
3. Whether balances are fixed mock data or deterministic fixtures.
4. Exact token display-name metadata strategy.
5. Exact icon fallback strategy.
6. Whether price impact is shown as a simulated value or removed.
7. Whether network fee is shown as a simulated value or removed.
8. Exact minimum-received formula.
9. Exact slippage behavior.
10. Simulated transaction-ID generation strategy.
11. Price refresh behavior and stale-data policy.
12. Responsive breakpoints.
13. Accessibility requirements.
14. Unit/integration test boundaries.

These decisions should not be silently assumed during implementation.

---

## 23. Discovery Conclusions

Problem 2 is best understood as a **frontend-focused interactive asset swap experience**, not a real cryptocurrency exchange implementation.

The authoritative external data available to the application is the provided token price feed. The token icon repository supplies visual assets. The swap quote can be calculated locally from normalized prices.

The most important engineering distinction is:

```text
Provided source data
        ≠
Derived quote
        ≠
Simulated trading behavior
```

The current four-state UI provides a strong interaction baseline:

```text
Swap Form
    ↓
Asset Selector
    ↓
Confirm Swap
    ↓
Swap Complete
```

The next artifact should convert these discovery findings into explicit **functional requirements, user stories, acceptance criteria, edge cases, and measurable behavior** in `prd.md`.

---

## 24. Source References

- Challenge-provided price feed: `https://interview.switcheo.com/prices.json`
- Challenge-provided token icons: `https://github.com/Switcheo/token-icons/tree/main/tokens`

The current inspection confirmed that the price feed exposes `currency`, `date`, and `price`, contains duplicate currency records, and includes assets such as ETH, ATOM, USDC, WBTC, SWTH, OSMO, GMX, and others.
