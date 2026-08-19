# Problem 2 — Fancy Form: Domain Model

## 1. Document Purpose

This document defines the domain model for **Problem 2: Fancy Form / Nocturne Swap**.

It translates the frozen `prd.md` into domain concepts, business rules, calculations, invariants, lifecycle behavior, and testable domain capabilities.

This document intentionally does **not** define frontend framework choices, state-management libraries, numeric libraries, component structure, API implementation, or other technical decisions. Those belong in `architecture.md`.

The domain must implement the behavior established by the PRD and must not introduce new product behavior without traceability.

---

# 2. Domain Scope

The domain represents a **local, simulated token/currency swap experience**.

```text
Provided Price Data
        ↓
Price Normalization
        ↓
Selectable Assets
        ↓
Quote Calculation
        ↓
Swap Validation
        ↓
Review Snapshot
        ↓
Simulated Execution
        ↓
Balance Mutation
```

## 2.1 Provided Source Data

The challenge-provided price feed supplies records containing:

```text
currency
date
price
```

Token icons and presentation metadata are outside the pricing domain.

## 2.2 Derived Domain Data

The domain derives:

```text
normalized price
exchange rate
receive amount
USD values
minimum received
dataset timestamp
selectable assets
swap quote
review snapshot
execution result
```

## 2.3 Application/UI Query Behavior

The following are intentionally **not core domain concepts**:

```text
asset search by symbol/name
case-insensitive filtering
empty search result presentation
input formatting
display formatting
modal state
loading presentation
error presentation
```

The domain provides the selectable asset collection. Application/UI code may query or filter that collection.

## 2.4 Simulated Domain Behavior

The domain simulates:

```text
wallet balances
swap review
swap execution
balance mutation
transaction identifier
```

No simulated value represents real blockchain execution, real liquidity, or authoritative live execution data.

---

# 3. Domain Responsibilities

The domain is responsible for:

- selecting valid normalized prices;
- representing priced assets;
- representing simulated balances;
- calculating swap quotes;
- calculating USD values;
- validating swap eligibility;
- calculating minimum received;
- reversing a quote;
- creating an immutable review snapshot;
- executing a reviewed snapshot;
- mutating simulated balances after successful execution;
- producing a simulated transaction identifier;
- representing domain-level errors and results.

The domain is not responsible for:

- rendering UI;
- choosing a frontend framework;
- choosing a state-management library;
- choosing a numeric library;
- fetching HTTP data;
- resolving token icons;
- implementing asset-search presentation;
- deciding responsive behavior;
- managing browser focus.

---

# 4. Core Domain Concepts

```text
PriceRecord
NormalizedPrice
Asset
Balance
SlippageTolerance
UsdValue
SwapQuote
SwapReviewSnapshot
SwapExecution
TransactionIdentifier
```

Main relationship:

```text
PriceRecord[]
      ↓ normalize
NormalizedPrice[]
      ↓
Asset[]
      ↓
Quote Calculation
      ↓
SwapQuote
      ↓
SwapReviewSnapshot
      ↓
SwapExecution
      ↓
Balance Mutation
```

---

# 5. Entities and Value Objects

## 5.1 PriceRecord

`PriceRecord` represents one raw record supplied by the challenge price feed.

### Attributes

```text
currency
date
price
```

### Rules

A record participates in normalization only when:

- `currency` is usable;
- `date` is usable;
- `price` is a valid numeric price.

Invalid records must not become the selected normalized price.

---

## 5.2 NormalizedPrice

`NormalizedPrice` represents the single usable price selected for a currency.

### Attributes

```text
currency
price
timestamp
```

### Invariants

- At most one normalized price exists for a currency.
- Only valid numeric prices are eligible.
- The latest valid timestamp wins.
- Equal timestamps use deterministic handling.
- Raw array order must not determine the result.

The exact tie-breaker implementation is deferred to `architecture.md`.

---

## 5.3 Asset

`Asset` represents a selectable priced token/currency.

### Core attributes

```text
symbol
price
```

Display name and icon metadata may accompany an asset, but are not required for domain calculations.

An asset does **not** own a wallet balance. Balance is modeled separately.

### Invariants

- A selectable asset has a symbol.
- A selectable asset has a valid normalized price.
- An asset without a valid normalized price cannot participate in a quote.

---

## 5.4 Balance

`Balance` represents the locally simulated amount held for an asset.

```text
Balance
├── asset
└── amount
```

### Invariants

- A source amount must not exceed the current source balance.
- Successful execution decreases source balance by the confirmed source amount.
- Successful execution increases destination balance by the confirmed receive amount.
- Failed execution must not apply the successful balance mutation.

Persistence is outside product scope.

---

## 5.5 SlippageTolerance

`SlippageTolerance` represents the selected simulated slippage setting.

Supported values:

```text
0.1%
0.5%
1%
```

Exactly one value is selected at a time.

The value is used to derive the simulated minimum-received threshold. It does not represent real blockchain execution protection.

---

## 5.6 UsdValue

`UsdValue` represents a USD-denominated value derived from a normalized asset price.

### Source-side rule

```text
sourceUsdValue
=
sourceAmount × normalizedSourcePrice
```

### Destination-side rule

```text
destinationUsdValue
=
receiveAmount × normalizedDestinationPrice
```

USD values are derived from the same normalized price source used by the quote. They are not independently sourced market values.

---

## 5.7 SwapQuote

`SwapQuote` represents the mathematical quote produced from valid priced assets and a source amount.

### Conceptual attributes

```text
sourceAsset
destinationAsset
sourceAmount
sourceUsdValue
exchangeRate
receiveAmount
destinationUsdValue
minimumReceived
slippage
```

### Quote-calculation invariants

A quote calculation requires:

- source asset exists;
- destination asset exists;
- source and destination assets differ;
- both assets have valid normalized prices;
- source amount is greater than zero;
- source amount is valid under supported precision.

**Balance availability is validated separately from mathematical quote calculation.**

This separation allows:

```text
Quote Calculation
       ↓
SwapQuote
       ↓
Swap Validation
       ↓
Review Eligibility
```

---

## 5.8 SwapReviewSnapshot

`SwapReviewSnapshot` represents the reviewed swap values approved for confirmation.

### Conceptual attributes

```text
sourceAsset
destinationAsset
sourceAmount
sourceUsdValue
exchangeRate
receiveAmount
destinationUsdValue
minimumReceived
slippage
```

### Invariants

- A snapshot can only be created from a valid quote and valid swap.
- Once created, the snapshot is immutable.
- Confirmation must use the snapshot.
- Later form changes must not silently alter the reviewed transaction.

---

## 5.9 SwapExecution

`SwapExecution` represents a local simulated execution of a reviewed swap.

```text
SwapExecution
├── reviewedSnapshot
├── status
└── transactionIdentifier
```

Execution is tied to the reviewed snapshot and must not re-read mutable form state to determine what is being executed.

A successful execution is the point at which the simulated balance mutation is applied.

---

## 5.10 TransactionIdentifier

`TransactionIdentifier` represents a local identifier for a successful simulated execution.

### Rules

- Unique per simulated execution.
- Uses a defined local format.
- Does not need to be deterministic across separate executions.
- Must not be represented as a real blockchain transaction hash.

Exact generation is deferred to `architecture.md`.

---

# 6. Price Normalization

```text
PriceRecord[]
      ↓
validate records
      ↓
group by currency
      ↓
select latest valid timestamp
      ↓
deterministic tie-breaker
      ↓
NormalizedPrice[]
```

Rules:

1. Only valid numeric prices participate.
2. A currency has at most one normalized price.
3. Latest valid timestamp wins.
4. Equal timestamps use deterministic handling.
5. Raw array order cannot determine the result.
6. A currency without a valid price is not a usable priced asset.

---

# 7. Quote Calculation

## 7.1 Exchange Rate

For source asset `A` and destination asset `B`:

```text
rate(A → B)
=
price(A) / price(B)
```

---

## 7.2 Receive Amount

For source amount `N`:

```text
receiveAmount
=
N × rate(A → B)
```

Equivalent:

```text
receiveAmount
=
N × price(A) / price(B)
```

---

## 7.3 USD Values

```text
sourceUsdValue
=
sourceAmount × price(source)

destinationUsdValue
=
receiveAmount × price(destination)
```

Both use the normalized prices underlying the quote.

---

## 7.4 Minimum Received

```text
minimumReceived
=
receiveAmount × (1 - slippage)
```

This is a simulated quote-derived threshold.

It is not a blockchain guarantee, liquidity constraint, execution price, or transaction-protection mechanism.

---

# 8. Calculation Precision

The domain distinguishes:

```text
calculation precision
```

from:

```text
display precision
```

Display formatting must never modify the underlying values used by domain calculations.

```text
calculation value
      ↓
display formatting
      ↓
UI value
```

not:

```text
display-formatted value
      ↓
domain calculation
```

Exact numeric representation and rounding implementation are deferred to `architecture.md`.

---

# 9. Swap Validation

Swap validation determines whether the current inputs can produce a reviewable swap.

Required conditions:

```text
source asset selected
AND
destination asset selected
AND
source != destination
AND
source asset has valid price
AND
destination asset has valid price
AND
source amount valid
AND
source amount > 0
AND
source amount <= source balance
AND
valid quote exists
```

If any validation condition fails:

```text
Swap Validation Failure
      ↓
Review Ineligible
      ↓
No Confirmation
```

A validation failure does not necessarily mean that the mathematical quote is invalid.
For example, an amount may produce a mathematically valid quote while still exceeding
the available source balance. In that case:

```text
Quote = valid
Swap = invalid
Review = ineligible
```

Quote calculation itself remains separate from balance validation.

---

# 10. Same-Asset Rule

Source and destination assets must differ.

```text
ETH → ETH
```

is invalid.

When the same asset is selected:

- the swap is not reviewable;
- no executable quote is presented;
- the user must select a different destination asset.

---

# 11. Amount Validation

The source amount must:

- be numeric;
- be greater than zero;
- be representable using supported decimal precision;
- not exceed current source balance.

Invalid inputs include:

```text
empty
zero
negative
non-numeric
malformed decimal
greater than balance
```

Invalid input must not become a reviewable swap.

---

# 12. HALF and MAX

## 12.1 HALF

```text
halfAmount
=
sourceBalance / 2
```

The resulting amount is validated normally and then used to calculate a new quote.

## 12.2 MAX

```text
maxAmount
=
sourceBalance
```

The resulting amount is validated normally and then used to calculate a new quote.

---

# 13. Reverse Swap

Reversing a swap exchanges the source and destination sides.

```text
sourceAsset      ↔ destinationAsset
sourceAmount     ↔ receiveAmount
```

Given:

```text
1 ETH → 229 ATOM
```

reversal starts with:

```text
229 ATOM → 1 ETH
```

### Precision rule

The new source amount must use the **underlying unrounded receive amount**.

Example:

```text
Underlying receive:
229.026348...

Displayed:
229.03 ATOM
```

Reversal uses:

```text
229.026348...
```

not:

```text
229.03
```

After reversal:

1. source and destination assets are exchanged;
2. the underlying receive amount becomes the new source amount;
3. validation is re-evaluated;
4. the quote is recalculated;
5. USD values and minimum received are recalculated.

---

# 14. Review Snapshot Lifecycle

```text
Swap Form
    ↓
Calculate Quote
    ↓
Validate Swap
    ↓
Review
    ↓
SwapReviewSnapshot
    ↓
Confirm
    ↓
SwapExecution
```

The snapshot captures the values presented to the user at review time.

User confirmation triggers execution of the reviewed snapshot.

The confirmation action itself is an application-level command; the domain executes
the immutable reviewed snapshot supplied by that command.

Changes to the underlying form after review must not silently alter the transaction.

---

# 15. Simulated Execution

Execution is allowed only for a valid reviewed snapshot.

## Preconditions

```text
review snapshot exists
AND
review snapshot is valid
AND
execution is not already processing
```

## Successful Execution

A successful execution:

1. uses the reviewed snapshot;
2. applies the simulated balance mutation;
3. produces a simulated transaction identifier;
4. returns a successful execution result.

## Failed Execution

A failed execution:

- is not treated as successful;
- does not apply the successful balance mutation;
- returns an execution failure for application/UI handling.

---

# 16. Balance Mutation

After successful simulated execution:

```text
sourceBalance
=
sourceBalance - sourceAmount
```

and:

```text
destinationBalance
=
destinationBalance + receiveAmount
```

The values come from the reviewed snapshot.

No persistent account or wallet state is required by the product.

---

# 17. Dataset Timestamp

The domain dataset timestamp is:

```text
latest timestamp
among normalized valid price records currently in use
```

It describes the provided challenge price data.

It must not be interpreted as proof of production real-time market data.

---

# 18. Price Refresh Boundary

Fetching source data is an **application concern**.

The domain receives new source records and normalizes them.

Correct boundary:

```text
Application
    ↓
Fetch Price Records
    ↓
Domain
    ↓
Normalize Price Records
    ↓
New Normalized Price State
    ↓
Recalculate Active Quote
```

The domain does not perform HTTP requests.

## Successful Refresh

When the application supplies a new valid price dataset:

- normalized prices are replaced;
- the active quote is recalculated;
- the dataset timestamp is updated.

## Failed Refresh

If fetching fails while valid previous price data exists:

```text
Fetch Failure
      ↓
Previous Valid Price State
      ↓
Remains Usable
```

How the application displays the refresh failure is outside the domain.

If no valid price data exists, the domain cannot produce a quote.

---

# 19. Domain-Relevant Lifecycle

The domain lifecycle is represented by domain concepts rather than UI presentation states:

```text
Price State
    ↓
Quote State
    ↓
Review Snapshot
    ↓
Execution
    ↓
Execution Result
```

Possible outcomes:

```text
No Valid Price State
      ↓
Quote Unavailable

Invalid Swap Inputs
      ↓
Validation Failure

Valid Quote + Valid Swap
      ↓
Review Snapshot

Valid Review Snapshot
      ↓
Execution

Execution
      ↓
Success | Failure
```

Frontend states such as:

```text
loading
modal open
processing indicator
success screen
error banner
```

are application/UI concerns.

---

# 20. Domain Errors

## InvalidAmount

The source amount is empty, zero, negative, non-numeric, malformed, or otherwise invalid.

## AmountExceedsBalance

The source amount exceeds the current source balance.

## MissingSourceAsset

No source asset is selected.

## MissingDestinationAsset

No destination asset is selected.

## SameAssetSwap

Source and destination assets are identical.

## MissingSourcePrice

The source asset does not have a valid normalized price.

## MissingDestinationPrice

The destination asset does not have a valid normalized price.

## QuoteUnavailable

A valid quote cannot be produced.

## InvalidReview

The swap is not eligible for review.

## InvalidReviewSnapshot

Confirmation does not contain a valid review snapshot.

## ExecutionInProgress

Execution is already processing.

## ExecutionFailed

The simulated execution failed.

Exact error representation and UI mapping are implementation concerns.

---

# 21. Domain Invariants

### Price invariants

1. Only valid numeric price records can become normalized prices.
2. A currency has at most one normalized price.
3. Latest valid timestamp wins.
4. Equal timestamps use deterministic handling.
5. Raw array order cannot determine the selected price.

### Asset invariants

6. A selectable asset has a valid normalized price.
7. An asset without a valid price cannot participate in a quote.

### Balance invariants

8. A source amount must not exceed current source balance.
9. Successful execution decreases source balance by confirmed source amount.
10. Successful execution increases destination balance by confirmed receive amount.
11. Failed execution must not apply successful balance mutation.

### Quote invariants

12. Source and destination assets must differ.
13. Source amount must be greater than zero.
14. Source amount must satisfy supported precision.
15. Quote calculation requires valid normalized prices.

### Calculation invariants

16. Exchange rate:

```text
price(source) / price(destination)
```

17. Receive amount:

```text
sourceAmount × exchangeRate
```

18. Source USD value:

```text
sourceAmount × source price
```

19. Destination USD value:

```text
receiveAmount × destination price
```

20. Minimum received:

```text
receiveAmount × (1 - slippage)
```

21. Display rounding must not alter underlying calculation values.

### Review invariants

22. Review requires a valid quote and valid swap.
23. Review creates an immutable snapshot.
24. Confirmation executes the reviewed snapshot.
25. Later form changes cannot silently modify the reviewed transaction.

### Execution invariants

26. Execution is simulated locally.
27. Each successful execution receives a unique simulated transaction identifier.
28. The identifier is not a real blockchain transaction hash.
29. Duplicate confirmation must not create duplicate executions while processing.

---

# 22. Domain Decision Matrix

| Concern               | Domain Decision                                    |
| --------------------- | -------------------------------------------------- |
| Price source          | Challenge-provided price feed                      |
| Duplicate prices      | Latest valid timestamp + deterministic tie-breaker |
| Unpriced asset        | Cannot participate in quote                        |
| Exchange rate         | `price(A) / price(B)`                              |
| Receive amount        | `sourceAmount × rate`                              |
| Source USD value      | `sourceAmount × source price`                      |
| Destination USD value | `receiveAmount × destination price`                |
| HALF                  | `balance / 2`                                      |
| MAX                   | `balance`                                          |
| Same asset            | Prevent                                            |
| Minimum received      | `receiveAmount × (1 - slippage)`                   |
| Slippage              | `0.1%`, `0.5%`, `1%`                               |
| Dataset timestamp     | Latest timestamp among normalized valid records    |
| Reverse swap          | Exchange sides and recalculate                     |
| Reverse precision     | Use underlying unrounded receive amount            |
| Review                | Immutable snapshot                                 |
| Confirmation          | Execute reviewed snapshot                          |
| Execution             | Local simulation                                   |
| Balance update        | Subtract source / add destination                  |
| Transaction ID        | Unique local/simulated identifier                  |
| Asset search          | Application/UI query behavior                      |
| Price impact          | Removed                                            |
| Network fee           | Removed                                            |
| Blockchain execution  | Out of scope                                       |

---

# 23. Domain vs Application Boundary

## Domain

```text
price normalization
asset validity
balance validity
quote calculation
USD values
minimum received
swap validation
reverse behavior
review snapshot
execution
balance mutation
transaction identity
```

## Application/UI

```text
price-feed fetching
asset search/filtering
input state
input formatting
display formatting
modal state
loading presentation
error presentation
responsive behavior
focus management
navigation
```

The application layer must consume the domain rules rather than redefine them.

---

# 24. Deferred Technical Decisions

The following are intentionally deferred to `architecture.md`:

```text
numeric representation/library
rounding implementation
duplicate timestamp tie-breaker implementation
state-management library
data-fetching strategy
API abstraction
transaction-ID generator implementation
test framework
component organization
asset-search implementation
error-to-UI mapping
```

These decisions must implement the domain rules without changing their meaning.

---

# 25. Domain Capabilities

The following are conceptual domain capabilities, not mandatory class/function names:

```text
normalizePriceRecords(...)
calculateExchangeRate(...)
calculateReceiveAmount(...)
calculateUsdValues(...)
calculateMinimumReceived(...)
calculateQuote(...)
validateSwap(...)
reverseSwap(...)
createReviewSnapshot(...)
executeSwap(reviewedSnapshot)
updateBalances(...)
generateTransactionIdentifier(...)
```

Their concrete organization is an architecture decision.

---

# 26. Complete Swap Flow

```text
Price Records
      ↓
Normalize
      ↓
Normalized Prices
      ↓
Select Source + Destination
      ↓
Enter Source Amount
      ↓
Calculate Quote
      ↓
Validate Swap
      ↓
Calculate/Expose Minimum Received
      ↓
Review
      ↓
Create Review Snapshot
      ↓
User Confirms
      ↓
Execute Reviewed Snapshot
      ↓
Update Balances
      ↓
Generate Simulated Transaction ID
      ↓
Success
```

---

# 27. Reverse Swap Flow

```text
Existing Quote
      ↓
Read underlying unrounded receive amount
      ↓
Exchange source/destination assets
      ↓
Use receive amount as new source amount
      ↓
Re-evaluate validation
      ↓
Recalculate quote
      ↓
Recalculate USD values
      ↓
Recalculate minimum received
      ↓
New Quote
```

The display-formatted receive amount must never become the authoritative input for reversal.

---

# 28. Refresh Flow

```text
Application
    ↓
Fetch Price Records
    ↓
Domain Normalization
    ↓
Normalized Price State
    ↓
Recalculate Active Quote
    ↓
Update Dataset Timestamp
```

If fetching fails and valid previous data exists:

```text
Fetch Failure
      ↓
Keep Previous Valid Price State
```

---

# 29. Domain Testing Expectations

## Price normalization

- duplicate currency records;
- latest timestamp selection;
- equal timestamp deterministic handling;
- invalid price exclusion;
- array-order independence.

## Quote calculation

- exchange rate;
- receive amount;
- source USD value;
- destination USD value;
- missing prices;
- source amount changes;
- source/destination changes.

## Validation

- empty amount;
- zero;
- negative;
- malformed amount;
- amount exceeding balance;
- missing source asset;
- missing destination asset;
- same-asset swap.

## HALF/MAX

- HALF equals balance / 2;
- MAX equals balance;
- resulting values are revalidated and recalculated.

## Reverse swap

- source/destination exchange;
- underlying receive amount becomes new source amount;
- display rounding does not affect reversal;
- quote recalculates after reversal.

## Slippage

- supported values;
- minimum received calculation;
- recalculation when slippage changes.

## Review

- valid review creates immutable snapshot;
- invalid swap cannot create review;
- confirmation uses snapshot;
- later form changes do not silently modify reviewed transaction.

## Execution

- successful execution;
- execution failure;
- source balance decreases;
- destination balance increases;
- failed execution does not mutate successful balances;
- duplicate confirmation prevention;
- unique simulated transaction identifier.

## Refresh

- new records normalize correctly;
- normalized state replaces previous valid state on success;
- active quote recalculates;
- dataset timestamp updates;
- previous valid state remains usable after fetch failure.

---

# 30. PRD Traceability

| PRD Requirement | Domain Coverage                        |
| --------------- | -------------------------------------- |
| FR-001          | PriceRecord / normalization            |
| FR-002          | NormalizedPrice                        |
| FR-003          | Asset                                  |
| FR-007          | Amount validation                      |
| FR-008          | Quote calculation                      |
| FR-009          | Exchange rate                          |
| FR-011          | HALF                                   |
| FR-012          | MAX                                    |
| FR-013          | Reverse Swap                           |
| FR-014          | Same-Asset invariant                   |
| FR-016          | Balance validation                     |
| FR-017          | Price refresh / normalization boundary |
| FR-018          | Dataset timestamp                      |
| FR-019          | Review eligibility                     |
| FR-020          | Minimum received                       |
| FR-021          | SlippageTolerance                      |
| FR-022          | Review snapshot / execution            |
| FR-023          | Balance mutation                       |
| FR-024          | Swap completion                        |
| FR-025          | Transaction identifier                 |
| BR-001          | Price source                           |
| BR-002          | Price normalization                    |
| BR-003          | Exchange rate                          |
| BR-004          | Receive amount                         |
| BR-005          | Minimum received                       |
| BR-006          | HALF                                   |
| BR-007          | MAX                                    |
| BR-008          | Balance update                         |
| BR-009          | No price, no quote                     |
| BR-010          | No valid quote, no review              |
| BR-011          | Same asset, no swap                    |
| BR-012          | Reverse swap                           |
| BR-013          | Review snapshot                        |

---

# 31. Explicitly Excluded from Domain

The following are intentionally not modeled:

```text
real price impact
real network/gas fee
real liquidity
real routing
real AMM execution
real blockchain transaction
real wallet connection
persistent account balance
authentication
backend execution
asset-search presentation
UI modal behavior
```

The product does not have sufficient authoritative data or scope for these concepts.

---

# 32. Domain Status

The domain model is derived from the frozen PRD and is the contract for subsequent frontend architecture and implementation.

```text
discovery.md
      ↓
prd.md
      ↓
domain.md
      ↓
architecture.md
      ↓
implementation
```

`architecture.md` may decide **how** these rules are implemented, but must not silently change **what** the product does.

---

# 33. Next Artifact

The next context artifact is:

```text
architecture.md
```

Its purpose is to answer:

> **How will the frontend application implement this domain contract?**

It must not redefine the product behavior already established by `prd.md` and formalized in this document.
