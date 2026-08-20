# Problem 2 --- Fancy Form: Product Requirements Document

## 1. Document Purpose

This PRD translates the discovery findings for **Problem 2: Fancy Form**
into explicit product requirements, user stories, acceptance criteria,
business rules, application states, and edge cases.

The challenge is a **frontend-focused interactive token/currency swap
experience**. The provided price feed is used to calculate quotes, while
balances and swap execution are simulated locally.

This document is product-focused. Technical implementation details such
as project structure, state-management libraries, data-fetching
strategy, numeric libraries, and test framework belong in
`architecture.md`.

---

## 2. Product Overview

### Product

**Nocturne Swap**

### Problem

Users need a clear and intuitive way to:

1.  select an asset to pay;
2.  select an asset to receive;
3.  enter an amount;
4.  see the resulting quote;
5.  review the swap details;
6.  confirm the swap;
7.  see the simulated result.

The challenge evaluates not only functionality, but also **usage
intuitiveness and visual attractiveness**.

The UI therefore needs to communicate the swap relationship clearly
while handling loading, validation, unavailable prices, and simulated
execution gracefully.

---

## 3. Product Goals

### Primary Goals

- Provide an intuitive asset-swap experience.
- Use the provided price feed to calculate exchange rates.
- Allow users to discover and select supported priced assets.
- Provide immediate quote feedback after a valid amount is entered.
- Clearly communicate balances and validation errors.
- Provide a review step before simulated execution.
- Provide a clear success state after a simulated swap.
- Preserve the visual quality represented by the current UI design.
- Demonstrate production-quality frontend engineering within the scope
  of the challenge.

### Secondary Goals

- Make the UI responsive.
- Handle asynchronous price loading and refresh.
- Provide predictable behavior for edge cases.
- Keep financial calculations deterministic and testable.
- Keep source data, derived quote data, and simulated execution data
  clearly separated.

---

## 4. Non-Goals

The following are explicitly outside the product scope:

- real wallet connection;
- user authentication;
- persistent user accounts;
- real blockchain transactions;
- real liquidity routing;
- real AMM execution;
- real gas estimation;
- real order-book depth;
- production-grade trading infrastructure;
- persistent balances;
- backend swap execution.

The challenge allows backend interactions to be simulated or mocked, so
a real transaction execution layer is unnecessary for this product.

---

# 5. Source-of-Truth Model

The product explicitly separates three categories of data:

```text
Provided Source Data
        ↓
Derived Application Data
        ↓
Simulated Application Behavior
```

### 5.1 Provided Source Data

The authoritative external price source is:

`https://interview.switcheo.com/prices.json`

It provides:

```text
currency
date
price
```

Token icons are provided by:

`https://github.com/Switcheo/token-icons/tree/main/tokens`

### 5.2 Derived Application Data

The application derives:

```text
normalized prices
exchange rate
receive amount
USD values
minimum received
asset search results
price-data timestamp/freshness
```

### 5.3 Simulated Application Data

The application simulates:

```text
wallet balances
swap execution
balance mutation
transaction identifier
```

No simulated value must be presented as real blockchain execution or
authoritative market/execution data.

---

# 6. Users

### Primary User

A user who wants to exchange one supported token/currency for another.

The user should be able to understand the following without technical
knowledge:

```text
What am I paying?
What will I receive?
How much will I receive?
What is the rate?
How much balance do I have?
What will happen if I confirm?
```

---

# 7. Core User Journey

The primary journey is:

```text
Open application
      ↓
Load price data
      ↓
Select source asset
      ↓
Select destination asset
      ↓
Enter amount
      ↓
Receive calculated quote
      ↓
Review swap
      ↓
Confirm swap
      ↓
Simulated processing
      ↓
Swap complete
      ↓
Balances updated
```

Alternative/error paths:

```text
Price loading
      ↓
Loading state

Price request fails
      ↓
Error state
      ↓
Refresh / Retry

Invalid amount
      ↓
Validation message

Insufficient balance
      ↓
Validation message

Asset has no valid price
      ↓
Quote unavailable

Swap simulation fails
      ↓
Execution error
```

---

# 8. Functional Requirements

## FR-001 --- Load Price Feed

The application must load the challenge-provided price feed:

`https://interview.switcheo.com/prices.json`

The returned records contain:

```text
currency
date
price
```

The application must normalize the response before exposing assets to
the swap UI.

### Acceptance Criteria

- On initial application load, the application requests the price
  feed.
- While the request is pending, the UI shows a loading state.
- A successful response produces a normalized collection of priced
  assets.
- Invalid/unusable price records are excluded.
- Assets without a usable price are not selectable.
- A failed request produces a recoverable error state.
- Swap actions remain unavailable until a valid quote can be
  calculated.

---

## FR-002 --- Normalize Duplicate Price Records

The price feed can contain multiple records for the same currency.

The application must apply a deterministic normalization policy.

### Product Rule

For each currency:

1.  consider only records with a valid numeric price;
2.  select the record with the latest valid `date`;
3.  if multiple valid records have the same timestamp, use a
    deterministic tie-breaker;
4.  do not rely on raw array order.

The exact technical tie-breaker belongs in `architecture.md`.

### Acceptance Criteria

- A currency appears only once in the normalized asset collection.
- The selected record is deterministic.
- Array ordering does not change the resulting selected price.
- Invalid price records cannot become the selected price.

---

## FR-003 --- Display Supported Assets

The application must expose assets that have a valid normalized price.

Each asset should provide enough information for the user to identify
it:

```text
symbol
display name
icon
price
balance
```

### Acceptance Criteria

- Every selectable asset has a symbol.
- Every selectable asset has a valid price.
- The UI displays the token symbol.
- The UI displays a human-readable name when metadata is available.
- The UI displays the token icon when available.
- An unavailable icon does not break the asset selector.
- Assets without valid prices are omitted from selection.

---

## FR-004 --- Select Pay Asset

The user must be able to select the asset they want to pay with.

### Acceptance Criteria

- Clicking the source asset selector opens the asset-selection dialog.
- The dialog identifies itself as the source/pay asset selector.
- The user can search by asset symbol.
- The user can search by display name.
- Selecting an asset closes the selector.
- The selected asset appears in the "You pay" field.
- The selected asset balance is displayed.
- The source asset is not changed if the user cancels the selector.

---

## FR-005 --- Select Receive Asset

The user must be able to select the asset they want to receive.

### Acceptance Criteria

- Clicking the destination asset selector opens the asset-selection
  dialog.
- The dialog identifies itself as the destination/receive asset
  selector.
- The user can search by asset symbol.
- The user can search by display name.
- Selecting an asset closes the selector.
- The selected asset appears in the "You receive" field.
- The selected asset balance is displayed.

---

## FR-006 --- Search Assets

The asset selector must support searching.

Search should match at least:

```text
symbol
display name
```

Search must be case-insensitive.

### Acceptance Criteria

Given:

```text
ETH — Ethereum
ATOM — Cosmos Hub
USDC — USD Coin
```

Searching for:

```text
eth
```

returns ETH.

Searching for:

```text
ethereum
```

returns ETH.

If no assets match, the selector displays an appropriate empty state.

---

## FR-007 --- Enter Pay Amount

The user must be able to enter the amount of the source asset.

### Valid Input

The amount must:

- be numeric;
- be greater than zero;
- be representable using the supported decimal precision;
- not exceed the available source balance.

### Invalid Input

The application must handle:

```text
empty
zero
negative
non-numeric
malformed decimal
amount greater than balance
```

### Acceptance Criteria

- Invalid input does not produce a quote.
- A meaningful validation message is displayed where appropriate.
- Review is disabled while the form is invalid.
- A valid amount produces a quote when both selected assets have valid
  prices.

---

## FR-008 --- Calculate Receive Amount

The receive amount must be derived from normalized prices using their
common USD reference.

### Formula

For source asset `A` and destination asset `B`:

```text
exchangeRate(A → B)
=
price(A) / price(B)
```

For source amount `N`:

```text
receiveAmount
=
N × price(A) / price(B)
```

### Acceptance Criteria

- The receive amount updates when the source amount changes.
- The receive amount updates when the source asset changes.
- The receive amount updates when the destination asset changes.
- The calculation uses normalized price values.
- The application does not request the price feed on every keystroke.
- A quote is unavailable when either selected asset has no valid
  price.

---

## FR-009 --- Display Exchange Rate

The UI must display the current calculated exchange rate.

Example:

```text
1 ETH = 229.0263 ATOM
```

### Acceptance Criteria

- The rate reflects the currently selected source and destination
  assets.
- The rate updates when either asset changes.
- The rate updates after a price refresh.
- The displayed precision is consistent throughout the application.

The exact numeric precision and rounding strategy belong in
`architecture.md`.

---

## FR-010 --- Display USD Values

The UI should display USD values where the approved design calls for
them.

### Acceptance Criteria

- The source USD value corresponds to the entered source amount and
  normalized source price.
- The destination USD value corresponds to the calculated destination
  amount and normalized destination price.
- Values are recalculated after a price refresh.
- Formatting is consistent throughout the application.

---

## FR-011 --- HALF Action

The user must be able to populate half of the available source balance.

### Formula

```text
halfAmount = sourceBalance / 2
```

### Acceptance Criteria

- Clicking `HALF` sets the source amount to 50% of the current
  balance.
- The resulting amount is validated normally.
- The quote is recalculated automatically.

---

## FR-012 --- MAX Action

The user must be able to populate the full available source balance.

### Formula

```text
maxAmount = sourceBalance
```

### Acceptance Criteria

- Clicking `MAX` sets the source amount to the maximum available
  balance.
- The quote is recalculated automatically.
- The resulting amount does not exceed the available balance.

---

## FR-013 --- Swap Direction

The user must be able to reverse the source and destination sides.

The reversal operation must use the underlying unrounded calculation values, not values that have already been formatted for display.

### Product Rule

When reversing:

```text
sourceAsset ↔ destinationAsset
sourceAmount ↔ receiveAmount
sourceBalance ↔ destinationBalance
```

The quote must then be recalculated using the new source and destination
assets.

### Acceptance Criteria

Given:

```text
1 ETH → 229 ATOM
```

when the user reverses the swap, the form becomes conceptually:

```text
229 ATOM → 1 ETH
```

- Source and destination assets are exchanged.
- The previously quoted receive amount becomes the new source amount.
- The previously entered source amount becomes the new quoted receive
  amount, subject to recalculation/formatting.
- Balances are updated to the corresponding source/destination assets.
- Validation is re-evaluated.
- The quote is recalculated.

---

## FR-014 --- Prevent Invalid Same-Asset Swap

The product must prevent swapping an asset into itself.

### Acceptance Criteria

If source and destination assets are identical:

- the user receives clear feedback;
- review is disabled;
- no executable quote is presented.

---

## FR-015 --- Display Balance

The application must display the balance for the currently selected
assets.

Balances are local/mock application state.

### Acceptance Criteria

- Source balance is visible near the source input.
- Destination balance is visible near the destination input.
- Balance values update after a simulated successful swap.
- Balance validation uses the current local balance.

---

## FR-016 --- Validate Sufficient Balance

The source amount must not exceed the source asset balance.

### Acceptance Criteria

Given:

```text
Balance = 4.2183 ETH
Input = 5 ETH
```

the application must:

- mark the input invalid;
- display an insufficient-balance message;
- prevent review and confirmation.

---

## FR-017 --- Refresh Price Data

The user must be able to manually refresh the provided price feed.

### Refresh Flow

```text
Refresh
   ↓
Fetch price feed
   ↓
Normalize records
   ↓
Update price state
   ↓
Recalculate quote
   ↓
Update source-data timestamp
```

### Acceptance Criteria

- Clicking Refresh requests the challenge price feed again.
- A loading state is visible during refresh.
- Successful refresh updates normalized prices.
- The active quote is recalculated.
- The displayed source-data timestamp is updated.
- If refresh fails and valid previous data exists, the previous valid
  data remains usable.
- A failed refresh provides a recoverable error state.

---

## FR-018 --- Display Price Data Timestamp

The application must communicate the timestamp of the provided price data.

Because the challenge endpoint is a static challenge data source rather
than a production real-time market stream, the UI must not claim that it
contains live market prices.

Preferred terminology includes:

```text
Provided price data
Price data source
Source data: Aug 29, 2023
```

### Acceptance Criteria

- The UI displays the source timestamp or an equivalent clear
  representation.
- The displayed dataset timestamp is the latest timestamp among the normalized valid price records currently in use.
- Refresh means re-fetching the provided challenge price feed.
- The UI does not claim that the endpoint provides production
  real-time market prices.

---

# 9. Swap Review Requirements

## FR-019 --- Review Swap

The user must be able to review a valid swap before confirmation.

### Review Preconditions

Review is enabled only when:

- price data is available;
- source asset is selected;
- destination asset is selected;
- source and destination assets differ;
- source amount is valid;
- source amount is greater than zero;
- source amount does not exceed balance;
- a valid quote exists.

### Acceptance Criteria

Clicking `Review swap` opens the confirmation view.

The confirmation view must show:

```text
Pay
Receive
Rate
Minimum received
Slippage
```

Only information that is actually available or explicitly defined as
simulated may be shown.

---

## FR-020 --- Minimum Received

The UI may display a minimum-received value based on the selected
slippage tolerance.

### Product Formula

For a quoted receive amount:

```text
minimumReceived
=
receiveAmount × (1 - slippage)
```

### Important Product Constraint

This is a **simulated slippage threshold derived from the displayed
quote**.

It does not represent:

- an executable blockchain guarantee;
- a real liquidity constraint;
- a real execution price;
- a real transaction protection mechanism.

### Acceptance Criteria

- The value changes when the slippage selection changes.
- The value is never greater than the quoted receive amount.
- The confirmation screen shows the same value used by the review
  state.
- The UI does not represent the value as a real blockchain execution
  guarantee.

---

## FR-021 --- Slippage Selection

The current design provides:

```text
0.1%
0.5%
1%
```

The user must be able to select one of these values.

### Acceptance Criteria

- Exactly one option is selected at a time.
- The selected value is visually identifiable.
- Changing the selected value recalculates minimum received.
- The selected value is carried into the review state.

---

# 10. Simulated Execution Requirements

## FR-022 --- Confirm Swap

The user must be able to confirm a valid reviewed swap.

### Acceptance Criteria

- Confirm is available only for a valid reviewed swap.
- Clicking Confirm enters a processing state.
- Duplicate confirmation actions are prevented while processing.
- The application performs a local simulated execution.
- Successful execution updates local balances.
- Successful execution opens the completion state.

### Product Rule

Confirmation must execute the reviewed swap snapshot.

Changes made to the underlying form after review must not silently alter the transaction being confirmed.

---

## FR-023 --- Simulated Balance Update

After successful execution:

```text
sourceBalance
=
sourceBalance - sourceAmount

destinationBalance
=
destinationBalance + receiveAmount
```

### Acceptance Criteria

- The source balance decreases by the amount paid.
- The destination balance increases by the amount received.
- The displayed result matches the confirmed swap.
- No real blockchain transaction is performed.

---

## FR-024 --- Swap Completion

The application must show a clear success state after successful
simulated execution.

### Completion State

The UI should show:

```text
Swap complete

You swapped {sourceAmount} {sourceAsset}
for {receiveAmount} {destinationAsset}.

Transaction
{transactionIdentifier}

New swap
```

### Acceptance Criteria

- The user can clearly see that the swap completed.
- Source and destination amounts match the confirmed swap.
- The transaction identifier is explicitly treated as simulated/local.
- The user can start a new swap.

---

## FR-025 --- Simulated Transaction Identifier

A transaction identifier may be generated for presentation.

### Acceptance Criteria

- A transaction identifier is displayed after successful simulation.
- It is unique for each simulated execution.
- It follows a defined local format.
- It does not need to be deterministic across separate executions.
- The UI does not imply that it is a real blockchain transaction hash.

---

# 11. Removed Execution Metrics

## Price Impact

**Removed from product requirements.**

The provided price feed does not contain sufficient information to
calculate genuine price impact.

The product must not invent a financial value merely to populate the UI.

## Network Fee

**Removed from product requirements.**

The provided price feed does not contain network, gas, route, or
execution information.

The product must not invent a financial value merely to populate the UI.

### Product Decision

The final implementation should omit both values unless a new
authoritative challenge requirement provides a legitimate data source
and calculation model.

This keeps the product technically honest and avoids presenting
arbitrary simulated financial information as meaningful trading data.

---

# 12. Asset Selector Requirements

## FR-026 --- Selector Presentation

The asset selector should present:

```text
Search
Token icon
Symbol
Display name
Current price
Balance
```

### Acceptance Criteria

- The selector is visually distinguishable from the underlying page.
- The user can close it without making a selection.
- Search input receives appropriate focus when the selector opens.
- The list is scrollable when necessary.
- The currently selected asset is visually identifiable.

---

## FR-027 --- Empty Search State

When search returns no matching assets:

```text
No assets found
```

The state should clearly communicate that the search produced no result.

---

## FR-028 --- Missing Icon Fallback

If a token icon cannot be resolved:

```text
exact symbol match
        ↓
known alias
        ↓
generic token placeholder
```

### Acceptance Criteria

- Missing icons never cause a broken-image UI.
- The asset remains selectable when it otherwise has valid price data.
- The fallback remains visually consistent with the design system.

---

# 13. Application States

The product must explicitly support these states.

## Initial Loading

```text
Loading price data...
```

The main swap experience should not present a false ready state before
required price data is available.

## Ready

Price data is loaded and the user can interact with the form.

## Quote Ready

The selected assets and amount are valid and a quote is available.

## Validation Error

The user input or selection is invalid.

## Price Error

The price feed failed to load or refresh.

## Quote Unavailable

A selected asset does not have a usable normalized price.

## Review

The user is reviewing a valid swap.

## Processing

The simulated swap is being executed.

## Success

The simulated swap completed successfully.

## Execution Error

The simulated execution failed.

---

# 14. Validation Requirements

The application must validate the following:

Validation Expected behavior

---

Empty amount No quote; show input guidance/error
Zero amount Invalid; prevent review
Negative amount Invalid; prevent review
Non-numeric amount Invalid; prevent review
Malformed decimal Invalid; prevent review
Amount \> balance Insufficient balance; prevent review
Missing source asset Prevent review
Missing destination asset Prevent review
Same source/destination Prevent review
Missing source price Quote unavailable
Missing destination price Quote unavailable
Price feed unavailable Disable review until valid data exists

---

# 15. UX Requirements

## UX-001 --- Clear Mental Model

The user must immediately understand:

```text
You pay
    ↓
You receive
```

The source and destination areas must be visually distinct.

## UX-002 --- Immediate Feedback

When the user changes:

- amount;
- source asset;
- destination asset;
- slippage;

the relevant derived information should update without requiring an
additional submit action.

## UX-003 --- Prevent Invalid Actions

The UI should disable or prevent actions that cannot succeed rather than
allowing the user to reach an avoidable failure state.

## UX-004 --- Preserve Context

Opening an asset selector or confirmation modal should preserve the
current swap context.

## UX-005 --- Loading Feedback

Asynchronous operations must communicate progress.

The user should never be left wondering whether Refresh or Confirm was
activated.

## UX-006 --- Error Recovery

Errors should provide a clear next action where possible:

```text
Price feed error
→ Refresh / Retry

Invalid input
→ Correct amount

No asset found
→ Change search
```

## UX-007 --- Responsive Experience

The experience must remain usable across desktop and smaller viewport
sizes.

Exact responsive breakpoints belong in the UI/UX specification and
`architecture.md`.

---

# 16. Visual Requirements

The current approved design establishes the visual direction:

- dark interface;
- strong typography hierarchy;
- purple accent;
- rounded cards and dialogs;
- clear token identity;
- focused swap form;
- portfolio/balance panel;
- modal-based asset selection;
- modal-based confirmation;
- clear success state.

The final implementation may refine the visual treatment as long as it
preserves:

1.  intuitive interaction;
2.  clear hierarchy;
3.  strong readability;
4.  accessible controls;
5.  responsive behavior.

The challenge allows the provided files/design to be disregarded, so the
current design is a product reference rather than an immutable
implementation constraint.

---

# 17. Accessibility Requirements

The UI should meet baseline accessibility expectations.

### Requirements

- Interactive controls must be keyboard accessible.
- Dialogs must be dismissible with keyboard interaction.
- Inputs must have meaningful labels or accessible names.
- Validation messages must be associated with the relevant input.
- Focus must be managed when dialogs open and close.
- Buttons must expose meaningful accessible names.
- Color must not be the only mechanism used to communicate state.
- Disabled controls must have understandable semantics.
- Token icons should use appropriate alternative text or be treated as
  decorative when adjacent text already conveys identity.

---

# 18. Data and Business Rules

## BR-001 --- Price Source

The price source is the challenge-provided:

`https://interview.switcheo.com/prices.json`

## BR-002 --- Price Normalization

Only one valid normalized price record may represent a currency.

The selected record is the latest valid record by timestamp, with
deterministic handling for equal timestamps.

## BR-003 --- Exchange Rate

```text
rate(A → B) = price(A) / price(B)
```

## BR-004 --- Receive Amount

```text
receiveAmount = inputAmount × rate(A → B)
```

## BR-005 --- Minimum Received

```text
minimumReceived = receiveAmount × (1 - slippage)
```

This is a simulated quote-derived threshold, not a real execution
guarantee.

## BR-006 --- Half Balance

```text
halfAmount = balance / 2
```

## BR-007 --- Maximum Balance

```text
maxAmount = balance
```

## BR-008 --- Balance Update

After simulated success:

```text
sourceBalance -= sourceAmount
destinationBalance += receiveAmount
```

## BR-009 --- No Price, No Quote

An asset without a valid normalized price cannot participate in a quote.

## BR-010 --- No Valid Quote, No Review

The user cannot review or confirm an invalid swap.

## BR-011 --- Same Asset, No Swap

Source and destination assets must differ before review.

## BR-012 --- Reverse Swap

Reversing the swap exchanges the source and destination sides and carries the previous quoted relationship into the opposite direction before recalculation.

The reversed source amount must be derived from the underlying unrounded receive amount.

## BR-013 — Review Snapshot

A valid review creates a snapshot of the swap values presented to the user.

Confirmation executes that reviewed snapshot. Subsequent form changes must not silently modify the reviewed transaction.

The snapshot is a domain concept; its concrete data structure belongs in `domain.md` and `architecture.md`.

---

# 19. Numeric Precision and Formatting

Financial/token values must be displayed consistently.

The product requires:

- no misleading floating-point artifacts;
- consistent decimal formatting;
- sufficient precision for small-value tokens;
- readable large numbers;
- consistent USD formatting.

The exact calculation representation and rounding strategy are
implementation decisions that must be defined in `architecture.md`.

The UI must distinguish between:

```text
calculation precision
```

and:

```text
display precision
```

so display rounding does not alter underlying quote calculations.

---

# 20. Error and Recovery Matrix

Situation UI state User action

---

Initial price loading Loading Wait
Price feed failure Error Refresh/Retry
Invalid amount Validation error Correct amount
Insufficient balance Validation error Reduce amount / MAX
Asset has no price Quote unavailable Select another asset
Same asset selected Validation error Select another asset
Empty search result Empty state Change search
Refresh in progress Loading Wait
Swap processing Processing Wait
Simulated swap failure Execution error Retry / start again
Swap success Success New swap

---

# 21. Acceptance Criteria --- End-to-End

## AC-001 --- Initial Application

**Given** the application is opened\
**When** the price feed is requested\
**Then** the application shows a loading state\
**And** after successful loading it shows a usable swap form.

## AC-002 --- Select Assets

**Given** valid priced assets exist\
**When** the user selects ETH as the source and ATOM as the destination\
**Then** the form displays both selected assets and their balances.

## AC-003 --- Calculate Quote

**Given** ETH and ATOM have valid normalized prices\
**When** the user enters `1 ETH`\
**Then** the application calculates the corresponding ATOM amount using
normalized prices\
**And** displays the exchange rate.

## AC-004 --- Invalid Amount

**Given** the source balance is `4.2183 ETH`\
**When** the user enters `5 ETH`\
**Then** the form displays an insufficient-balance error\
**And** Review swap is disabled.

## AC-005 --- HALF

**Given** the source balance is `4 ETH`\
**When** the user clicks `HALF`\
**Then** the input becomes `2 ETH`\
**And** the quote is recalculated.

## AC-006 --- MAX

**Given** the source balance is `4 ETH`\
**When** the user clicks `MAX`\
**Then** the input becomes `4 ETH`\
**And** the quote is recalculated.

## AC-007 --- Swap Direction

**Given** the form is configured as:

```text
1 ETH → 229 ATOM
```

**When** the user reverses the swap\
**Then** the form becomes conceptually:

```text
229 ATOM → 1 ETH
```

**And** the quote is recalculated using the reversed asset pair.

## AC-008 --- Search

**Given** the selector contains ETH\
**When** the user searches for `ethereum`\
**Then** ETH appears in the results.

## AC-009 --- Review

**Given** the swap is valid\
**When** the user clicks Review swap\
**Then** the confirmation dialog displays:

```text
source amount
destination amount
rate
minimum received
slippage
```

## AC-010 --- Cancel Review

**Given** the confirmation dialog is open\
**When** the user clicks Cancel\
**Then** the dialog closes\
**And** the current swap form remains unchanged.

## AC-011 --- Confirm

**Given** the swap is valid and reviewed\
**When** the user clicks Confirm swap\
**Then** the application enters a processing state\
**And** after successful simulation it displays Swap complete.

## AC-012 --- Balance Update

**Given** the user confirms a successful simulated swap\
**When** execution completes\
**Then** the source balance decreases by the paid amount\
**And** the destination balance increases by the received amount.

## AC-013 --- Refresh

**Given** a valid quote exists\
**When** the user refreshes prices\
**Then** the price feed is fetched again\
**And** normalized prices are updated\
**And** the active quote is recalculated.

## AC-014 --- Price Feed Failure

**Given** the price feed cannot be loaded\
**When** the request fails\
**Then** the application displays an error/retry state\
**And** does not allow a swap to be reviewed without a valid quote.

## AC-015 --- Stale/Provided Timestamp

**Given** the normalized price records contain source timestamps\
**When** the price data is displayed\
**Then** the UI identifies it as provided price data/source data\
**And** does not describe the feed as production real-time market data.

## AC-016 --- Same Asset

**Given** ETH is selected as both source and destination\
**When** the user attempts to review the swap\
**Then** review is disabled\
**And** the user receives clear feedback to select a different
destination asset.

---

# 22. Quality Requirements

The implementation should demonstrate:

### Maintainability

- clear separation between UI and calculation logic;
- reusable UI components;
- explicit domain/business rules;
- minimal duplication.

### Reliability

- deterministic price normalization;
- deterministic calculations;
- robust validation;
- graceful API failure handling.

### Testability

At minimum, business logic should be independently testable for:

- price normalization;
- exchange-rate calculation;
- receive amount;
- minimum received;
- balance validation;
- HALF;
- MAX;
- swap reversal;
- balance updates.

### Performance

- the price feed must not be requested on every amount change;
- quote calculation should be local once price state is loaded;
- unnecessary UI recalculation should be avoided.

---

# 23. Product Decisions

The following decisions are now resolved at the PRD level.

---

Decision Product decision

---

Price source Challenge-provided `prices.json`

Unpriced assets Omit from selection

Duplicate prices Normalize deterministically using
latest valid timestamp

Quote calculation Local calculation from normalized
prices

Balances Local/mock state

Swap execution Simulated

Transaction ID Simulated/local identifier

Slippage options 0.1%, 0.5%, 1%

Minimum received Quote × (1 − slippage), explicitly
simulated

Same-asset swap Prevent

Price refresh Manual refresh supported

Price timestamp Display source-data timestamp; do
not imply live market data

Price impact Removed

Network fee Removed

Real blockchain Out of scope

---

### Rationale for Removed Metrics

`price impact` and `network fee` are removed because the provided price
source does not supply sufficient authoritative data to calculate them.

The product should prefer **accurate, explainable information over
visually filling every field in the reference design**.

---

# 24. Discovery → PRD Decision Traceability

Some items were intentionally open during discovery and are now resolved
at the product level.

Discovery finding PRD resolution

---

Exact minimum-received formula was open BR-005 / FR-020
Exact slippage behavior was open FR-021
Price impact display was open Removed from product requirements
Network fee display was open Removed from product requirements
Price freshness behavior was open FR-018
Swap direction behavior was open FR-013 / BR-012
Numeric precision was open Deferred to `architecture.md`
Icon fallback was open FR-028
Duplicate normalization was open FR-002 / BR-002
Review snapshot behavior open FR-022
Transaction ID uniqueness open FR-025
Dataset timestamp semantics open FR-018
Reverse calculation precision open FR-013 / BR-012

This means:

```text
Discovery
   ↓
Finding / Open Question
   ↓
PRD Product Decision
   ↓
Domain / Architecture Implementation
```

The discovery document remains historically accurate; the PRD records
the decisions made after discovery review.

---

# 25. Open Decisions for Architecture

The following are intentionally deferred to `architecture.md`:

1.  frontend framework/project structure;
2.  TypeScript configuration;
3.  state-management approach;
4.  server/client data-fetching approach;
5.  API service abstraction;
6.  price normalization implementation;
7.  numeric precision library/strategy;
8.  exact rounding implementation;
9.  token metadata storage;
10. icon resolution implementation;
11. fallback icon implementation;
12. balance fixture structure;
13. simulated transaction-ID implementation;
14. error boundary strategy;
15. test framework;
16. component organization;
17. responsive breakpoints;
18. performance optimization strategy.

---

# 26. Open Decisions for UI/UX Specification

The following should be finalized in the design/UI specification:

1.  exact responsive layout;
2.  mobile asset-selector presentation;
3.  modal dimensions and behavior;
4.  loading skeleton/spinner treatment;
5.  validation message placement;
6.  empty search state;
7.  API error state;
8.  execution error state;
9.  success animation;
10. transaction-ID presentation/copy interaction;
11. accessibility focus behavior;
12. exact number formatting presentation.

Price impact and network fee presentation are intentionally **not**
included because those product requirements have been removed.

---

# 27. Definition of Done

Problem 2 is considered product-complete when:

- [ ] Price feed is loaded successfully.
- [ ] Duplicate prices are normalized deterministically.
- [ ] Selectable assets have valid prices.
- [ ] Source asset can be selected.
- [ ] Destination asset can be selected.
- [ ] Asset search works by symbol and name.
- [ ] Token icons render with fallback behavior.
- [ ] Source amount validation works.
- [ ] Balance validation works.
- [ ] HALF works.
- [ ] MAX works.
- [ ] Swap direction works according to FR-013.
- [ ] Same-asset swap is prevented.
- [ ] Exchange rate is calculated correctly.
- [ ] Receive amount is calculated correctly.
- [ ] USD values are calculated/displayed correctly where required by
      design.
- [ ] Slippage selection works.
- [ ] Minimum received is calculated correctly as a simulated
      threshold.
- [ ] Review flow works.
- [ ] Confirmation flow works.
- [ ] Processing state works.
- [ ] Simulated swap updates balances.
- [ ] Success state works.
- [ ] Simulated transaction identifier is displayed.
- [ ] Refresh works.
- [ ] Source-data timestamp is displayed appropriately.
- [ ] Loading states work.
- [ ] Error states work.
- [ ] Empty states work.
- [ ] Responsive behavior works.
- [ ] Keyboard/accessibility basics work.
- [ ] Core business logic has automated tests.
- [ ] UI matches the approved design direction.
- [ ] No UI claim implies that the challenge price feed or transaction
      execution is production/live blockchain infrastructure.
- [ ] No arbitrary price-impact or network-fee values are presented as
      financial facts.

---

# 28. Traceability to Discovery

Discovery PRD

---

Price feed provides `currency`, `date`, `price` FR-001, BR-001
Duplicate currency records exist FR-002, BR-002
Unpriced assets should be omitted FR-003, BR-009
Token metadata is separate from price data FR-003
Icon mapping may require fallback FR-028
Main swap UI FR-004--FR-018
Asset selector FR-026--FR-027
Confirm flow FR-019--FR-021
Swap complete FR-022--FR-025
Refresh FR-017--FR-018
Validation/error states Section 14
Simulated execution FR-022--FR-025
Price impact/network fee limitations Section 11
Floating-point risk Section 19
State model Section 13
Responsive/accessibility needs Sections 15--17

---

# 29. Source References

- Challenge-provided price feed:
  `https://interview.switcheo.com/prices.json`
- Challenge-provided token icons:
  `https://github.com/Switcheo/token-icons/tree/main/tokens`
- Challenge UI/design reference: current Fancy Form design prepared
  for Problem 2.

This PRD is based on the discovery artifact, the challenge requirements,
the provided data sources, and the review decisions recorded during
context validation.

Technical implementation choices remain intentionally deferred to
`architecture.md`.

---

# 30. PRD Status

This revision incorporates the final product-level decisions identified
during PRD review.

The PRD is now considered **product-level baseline / frozen for domain
modeling**.

Further technical decisions must not be added here unless they change an
existing product requirement or resolve a genuine product ambiguity.

The next artifact is:

```text
domain.md
```

The domain artifact must derive its rules from this PRD rather than
introducing new product behavior without traceability.
