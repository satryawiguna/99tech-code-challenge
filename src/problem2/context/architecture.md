# Problem 2 — Fancy Form: Frontend Architecture

## 1. Document Purpose

This document defines the frontend architecture for **Problem 2: Fancy Form / Nocturne Swap**.

It translates the frozen `prd.md` and `domain.md` into concrete frontend architectural decisions.

The architecture must answer:

> **How will the frontend implement the frozen product and domain contract?**

This document defines:

- architectural style;
- layer boundaries;
- dependency rules;
- domain/application/infrastructure/presentation responsibilities;
- state management;
- data fetching;
- UI component organization;
- environment strategy;
- native and Docker runtime;
- testing strategy;
- performance principles;
- project structure;
- implementation constraints.

This document must not redefine business rules already established in `prd.md` and `domain.md`.

---

# 2. Architectural Goals

The architecture is optimized for:

1. **Clear separation of concerns**
2. **Framework-independent domain logic**
3. **Small and maintainable frontend state**
4. **Efficient external data fetching**
5. **Predictable data flow**
6. **High testability**
7. **Good rendering performance**
8. **Local / Dev / Prod environment support**
9. **Native and Docker development/runtime support**
10. **Fast implementation without unnecessary enterprise complexity**

---

# 3. Architectural Principles

## 3.1 Pragmatic Clean Architecture

The application uses **Pragmatic Clean Architecture**.

The goal is to preserve the important dependency boundaries of Clean Architecture without introducing unnecessary abstractions for a small frontend challenge.

The architecture should not create interfaces, repositories, services, or factories merely for abstraction's sake.

Every abstraction must have a clear responsibility or testability benefit.

---

## 3.2 Domain First

Business rules belong to the domain.

The domain must not depend on:

```text
React
Next.js
Zustand
TanStack Query
HTTP
Browser APIs
Docker
```

Domain logic must be executable independently from the UI.

---

## 3.3 Presentation Does Not Own Business Rules

React components must not implement:

```text
exchange rate calculation
receive amount calculation
minimum received calculation
price normalization
swap validation
balance transition logic
reverse-swap business rules
```

Components consume application/domain results.

---

## 3.4 State Is Not Business Logic

Client state management is responsible for storing and coordinating application state.

It must not become the location where domain rules are implemented.

Avoid:

```text
swapStore.calculateQuote()
swapStore.executeSwap()
```

Prefer:

```text
UI
 ↓
Application Use Case
 ↓
Domain
 ↓
Result
 ↓
UI State
```

---

## 3.5 Server/External Data Is Different from Client State

The architecture distinguishes:

```text
External / Server Data
        ↓
TanStack Query

Client/UI State
        ↓
Zustand

Business Rules
        ↓
Domain
```

No single state mechanism should be forced to manage all three concerns.

---

# 4. Architecture Style

The application uses four primary layers:

```text
┌──────────────────────────────┐
│        Presentation          │
│     Atomic UI Components     │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│        Application           │
│       Use Cases / Flow       │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│           Domain             │
│    Pure Business Rules       │
└──────────────────────────────┘

┌──────────────────────────────┐
│       Infrastructure         │
│ Fetching / Config / Runtime  │
└──────────────────────────────┘
```

Conceptually:

```text
Presentation
      ↓
Application
      ↓
Domain

Infrastructure
      ↓ implements
Application Ports / Contracts
```

The Application layer defines the contracts it needs from external capabilities.
Infrastructure provides adapters that implement those contracts.

The Domain remains independent of both Application and Infrastructure.

---

# 5. Dependency Rules

## 5.1 Allowed Dependencies

| Layer          | May Depend On                                         |
| -------------- | ----------------------------------------------------- |
| Presentation   | Application, State, Domain types, shared UI utilities |
| Application    | Domain, Application ports/contracts                   |
| Domain         | Shared pure types/utilities only                      |
| Infrastructure | Application ports/contracts, Domain types             |
| State          | Domain types                                          |
| Shared         | Must remain dependency-light                          |
| -------------- | ----------------------------------------------------- |

---

## 5.2 Dependency Clarifications

The client-state layer is a presentation/application support mechanism.

The intended dependency direction is:

```text
Presentation
      ↓
State

Presentation
      ↓
Application
      ↓
Domain

Infrastructure
      ↓ implements
Application Ports / Contracts
```

The Application layer does not require a direct dependency on Zustand.

The State layer may use Domain types for its client-side representation, but it must
not own Domain business rules.

---

## 5.2 Forbidden Dependencies

### Domain must not depend on

```text
React
Next.js
Zustand
TanStack Query
fetch
Axios
DOM
localStorage
Docker
```

### Presentation must not directly implement

```text
pricing algorithms
swap validation
balance transition logic
execution rules
```

### Infrastructure must not own

```text
business decisions
UI behavior
business validation rules
```

---

# 6. Domain Layer

The domain layer implements the frozen domain contract.

Primary responsibilities:

```text
Price normalization
Asset validity
Balance validity
Quote calculation
USD values
Minimum received
Swap validation
Reverse swap
Review snapshot
Execution
Balance transition
Transaction identity / transaction result semantics
Domain errors
```

The domain remains framework-independent.

---

# 7. Application Layer

The application layer orchestrates domain operations and external capabilities.

It answers:

> **What application workflow should happen when the user performs an action?**

Examples:

```text
loadPrices
refreshPrices
calculateQuote
prepareReview
executeReviewedSwap
reverseSwap
applyHalfAmount
applyMaxAmount
```

These are conceptual use cases. Concrete naming may be adjusted during implementation.

Application use cases may coordinate:

```text
Domain
+
External capability contracts
```

Application use cases produce results and commands that are then reflected
in client state by the appropriate application/presentation boundary.

The Application layer must not require a direct dependency on Zustand.

It must not contain the underlying business formulas.

---

# 8. Infrastructure Layer

Infrastructure handles external technical concerns.

Responsibilities include:

```text
price-feed access
HTTP requests
environment configuration
runtime configuration
browser persistence when explicitly required
transaction ID generation implementation
```

The price feed is an external dependency.

Conceptually:

```text
External Price Feed
    ↓
Infrastructure Price Adapter
    ↓
Application Price Boundary
    ↓
Raw Price Records
    ↓
Domain Normalization
```

The infrastructure adapter owns transport/HTTP concerns.
The domain must never perform the HTTP request itself.

---

# 9. Price Data Architecture

The challenge provides:

```text
https://interview.switcheo.com/prices.json
```

The frontend treats this as external price data.

The architectural flow is:

```text
Presentation / Query Hook
        ↓
TanStack Query
        ↓
Application Price Use Case
        ↓
Price Data Port / Contract
        ↓
Infrastructure Price Adapter
        ↓
HTTP
        ↓
External Price Feed

External Price Feed
        ↓
Raw Price Records
        ↓
Domain Normalization
        ↓
Normalized Prices
        ↓
Quote Calculation
```

TanStack Query manages the external-data lifecycle.
The Infrastructure adapter owns transport concerns.
The Domain owns price normalization and business calculations.

---

# 10. Data Fetching Strategy

## 10.1 TanStack Query

**TanStack Query** is used for external/server-style data.

Responsibilities:

```text
fetching
loading state
error state
caching
staleness
refetching
request deduplication
```

The price feed is not stored as ordinary global UI state.

---

## 10.2 Query Boundary

Presentation code should not directly perform the raw HTTP request.

Prefer:

```text
Component
   ↓
TanStack Query / Query Hook
   ↓
Application Price Use Case
   ↓
Price Data Port / Contract
   ↓
Infrastructure Price Adapter
   ↓
HTTP
```

rather than:

```text
Component
   ↓
fetch(...)
```

---

## 10.3 Refresh

A successful price refresh:

```text
Fetch New Records
       ↓
Domain Normalization
       ↓
Update Normalized Price Data
       ↓
Recalculate Active Quote
```

If refresh fails while valid previous price data exists:

```text
Refresh Failure
       ↓
Keep Previous Valid Price State
```

The user-facing refresh error is a presentation concern.

---

# 11. Client State Management

## 11.1 Zustand

**Zustand** is used for lightweight client/application state.

Appropriate state includes:

```text
source asset selection
destination asset selection
source amount
selected slippage
review UI/application state
simulated balance state
execution status
```

Zustand stores the current client representation of simulated balances.
It does not own balance business rules or balance transition logic. Balance validation and balance transition calculation remain domain responsibilities; the resulting balance state is then
reflected in the client store for presentation and subsequent application flows.

Only state that must be shared across components should become global state.

---

## 11.2 Avoid Excessive Global State

Do not independently store derived values such as:

```text
exchangeRate
receiveAmount
sourceUsdValue
destinationUsdValue
minimumReceived
```

when they can be derived from:

```text
sourceAsset
destinationAsset
sourceAmount
normalizedPrices
slippage
```

The architecture should maintain a small number of authoritative state values.

---

# 12. Derived Quote State

Conceptually:

```text
Source Asset
Destination Asset
Source Amount
Normalized Prices
Slippage
        │
        ↓
    Quote Use Case
        │
        ↓
     SwapQuote
        │
 ┌──────┼──────────────┐
 ↓      ↓              ↓
Rate  Receive       USD Values
                       ↓
                Minimum Received
```

The UI consumes the resulting quote.

The UI must not independently reproduce the quote formulas.

---

# 13. State Flow

The overall user-interaction flow is:

```text
User Input
    ↓
Presentation
    ↓
Application Use Case
    ↓
Domain Calculation
    ↓
Domain Result
    ↓
Client State Update
    ↓
Presentation
```

Client state stores the resulting application representation where shared
state is required; it does not own domain business rules.

For example:

```text
Enter 5 ETH
      ↓
sourceAmount = 5
      ↓
calculateQuote()
      ↓
SwapQuote
      ↓
UI renders receive amount
```

---

# 14. Review and Execution Architecture

The review flow is:

```text
Current Swap State
       ↓
Validate
       ↓
Calculate Quote
       ↓
Create Review Snapshot
       ↓
Review UI
       ↓
User Confirms
       ↓
Application Command
       ↓
executeSwap(reviewedSnapshot)
       ↓
Domain Execution
       ↓
Balance Transition
       ↓
Execution Result
       ↓
Success UI
```

The confirmation action itself is an application-level command.

The domain executes the immutable reviewed snapshot.

---

# 15. Atomic Design

Atomic Design is used **only for the presentation layer**.

It is not the overall application architecture.

Suggested structure:

```text
presentation/
├── atoms/
├── molecules/
├── organisms/
└── templates/
```

Next.js routing and route-level page composition remain under `app/`.
Atomic Design does not introduce a second `pages/` layer under `presentation/`.

---

# 16. Atomic Component Responsibilities

## 16.1 Atoms

Small reusable UI primitives.

Examples:

```text
Button
Input
Icon
Typography
Badge
Divider
Spinner
```

Atoms must not contain business rules.

---

## 16.2 Molecules

Small combinations of atoms representing a meaningful UI control.

Examples:

```text
AssetSelector
AmountInput
BalanceDisplay
SlippageSelector
TokenIcon
SearchInput
```

---

## 16.3 Organisms

Complex reusable sections.

Examples:

```text
SwapForm
SwapDetails
ReviewPanel
AssetPicker
TransactionSummary
```

---

## 16.4 Templates

Page-level layout composition.

Example:

```text
SwapTemplate
```

---

## 16.5 Route Composition

Next.js route files under `app/` compose the appropriate presentation templates and
connect them to application state/use cases. They are not treated as an Atomic Design level.

---

# 17. UI and Domain Boundary

A component may display:

```text
balance
exchange rate
receive amount
USD values
minimum received
```

but does not calculate them itself.

Example:

```text
Domain
  ↓
SwapQuote
  ↓
Application
  ↓
Presentation
  ↓
AmountDisplay
```

This keeps UI components presentational and reusable.

---

# 18. Search Architecture

Asset search is a presentation/application concern.

The domain provides the valid selectable asset collection.

The application/presentation layer may perform:

```text
case-insensitive filtering
symbol matching
name matching
empty-result handling
```

Search behavior must not modify the underlying asset collection.

---

# 19. HALF and MAX Architecture

HALF and MAX are user actions mapped to domain rules.

Conceptually:

```text
User clicks HALF
       ↓
Application Use Case
       ↓
Domain: calculateHalfAmount(balance)
       ↓
Amount Result
       ↓
Update Client State
       ↓
Recalculate quote
       ↓
Revalidate swap
```

MAX:

```text
User clicks MAX
       ↓
Application Use Case
       ↓
Domain: calculateMaxAmount(balance)
       ↓
Amount Result
       ↓
Update Client State
       ↓
Recalculate quote
       ↓
Revalidate swap
```

The exact function names are implementation details. The important architectural rule
is that the HALF/MAX arithmetic is performed by the domain, not by the UI component or
Zustand store.

---

# 20. Reverse Swap Architecture

```text
Current SwapQuote
       ↓
Read underlying receive amount
       ↓
Exchange source/destination
       ↓
Use underlying receive as new source amount
       ↓
Recalculate
       ↓
Revalidate
       ↓
New SwapQuote
```

The UI must not reverse using a display-rounded amount.

---

# 21. Error Handling

Errors are classified by layer.

### Domain errors

Examples:

```text
InvalidAmount
AmountExceedsBalance
MissingSourceAsset
MissingDestinationAsset
SameAssetSwap
MissingSourcePrice
MissingDestinationPrice
QuoteUnavailable
InvalidReview
InvalidReviewSnapshot
ExecutionInProgress
ExecutionFailed
```

### Infrastructure errors

Examples:

```text
network failure
request timeout
malformed response
unexpected external data
```

Infrastructure errors, including transport or response-schema failures, are translated
into application-level outcomes without leaking HTTP-specific details into the domain.

### Presentation errors

Examples:

```text
error banner
toast
inline validation message
modal error
```

The presentation layer decides how an application/domain error is displayed.

---

# 22. Environment Strategy

The application supports:

```text
Local
Dev
Prod
```

Each environment must support:

```text
Native npm execution
Dockerized execution
```

Conceptually:

```text
                 Application
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
        Local       Dev        Prod
          │          │          │
       Native      Native     Docker
          │          │          │
       Docker      Docker     Docker
```

---

# 23. Local Environment

Native development:

```bash
npm run dev
```

Purpose:

- fast development;
- hot reload;
- debugging;
- local iteration.

Dockerized development must provide equivalent application behavior.

---

# 24. Dev Environment

The Dev environment represents a shared/non-production deployment.

It must use environment-specific configuration and must not rely on developer-local configuration.

The same application code should be deployable to Dev without source-level business-rule changes.

---

# 25. Production Environment

Production uses production configuration and production runtime settings.

Production configuration must not be hard-coded into the application source.

---

# 26. Configuration Management

Configuration must be injected through environment/runtime configuration.

Examples:

```text
APP_ENV
PRICE_FEED_URL
```

The exact variable names are implementation decisions.

Secrets must never be committed to source control.

Domain logic must not read environment variables directly.

Correct:

```text
Environment
    ↓
Infrastructure Configuration
    ↓
Application
```

Incorrect:

```text
Domain
    ↓
process.env
```

---

# 27. Docker Strategy

Docker provides a reproducible runtime.

The architecture should support:

```text
docker compose
```

for local/dev workflows where appropriate.

Docker configuration belongs outside the domain and application business logic.

The container should run the same built application artifact intended for its target environment.

---

# 28. Project Structure

The recommended high-level structure is:

```text
src/
├── app/
│   └── swap/
│       └── page.tsx
│
├── domain/
│   ├── price/
│   ├── asset/
│   ├── balance/
│   ├── swap/
│   └── execution/
│
├── application/
│   ├── use-cases/
│   └── services/
│
├── infrastructure/
│   ├── pricing/
│   ├── config/
│   └── runtime/
│
├── presentation/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
│
├── state/
│
└── shared/
    ├── types/
    ├── constants/
    └── utils/
```

The exact framework-specific route structure may remain under `app/`.

---

# 29. Dependency Matrix

| From           | To                          | Allowed                      |
| -------------- | --------------------------- | ---------------------------- |
| Presentation   | Application                 | Yes                          |
| Presentation   | Domain types                | Yes                          |
| Presentation   | Infrastructure              | No                           |
| Application    | Domain                      | Yes                          |
| Application    | Application ports/contracts | Yes                          |
| Domain         | Application                 | No                           |
| Domain         | Infrastructure              | No                           |
| Infrastructure | Domain types                | Yes                          |
| Infrastructure | Presentation                | No                           |
| State          | Domain types                | Yes                          |
| State          | React UI                    | No                           |
| Shared         | Domain                      | Must remain dependency-light |

---

# 30. Testing Strategy

Testing is a mandatory architectural requirement.

The application uses three primary levels:

```text
Unit
Integration
E2E
```

Testing priority:

```text
              E2E
               ▲
               │
          Integration
               ▲
               │
              Unit
```

The majority of tests should remain at unit/domain level.

---

# 31. Unit Testing

Unit tests must cover domain rules independently from React.

Required areas:

### Price

```text
latest valid timestamp
duplicate currency
invalid price
equal timestamp handling
array-order independence
```

### Quote

```text
exchange rate
receive amount
USD values
minimum received
```

### Validation

```text
empty amount
zero
negative
malformed amount
amount exceeds balance
missing source
missing destination
same asset
missing prices
```

### HALF/MAX

```text
balance / 2
balance
```

### Reverse

```text
asset reversal
underlying receive amount
precision preservation
quote recalculation
```

### Review

```text
valid snapshot
immutable snapshot
invalid review
```

### Execution

```text
successful execution
failed execution
balance transition
duplicate execution prevention
transaction identifier
```

---

# 32. Integration Testing

Integration tests verify collaboration between layers.

Examples:

```text
Infrastructure Price Adapter
      ↓
Application Price Boundary
      ↓
Domain Normalization
      ↓
Quote
```

and:

```text
Application
      ↓
Domain
      ↓
Review Snapshot
      ↓
Execution
      ↓
Balance State
```

Integration tests should verify behavior across meaningful boundaries rather than implementation details.

---

# 33. E2E Testing

E2E tests cover critical user journeys.

Minimum flows:

```text
Load application
→ Select source asset
→ Select destination asset
→ Enter amount
→ Review
→ Confirm
→ Success
```

Additional critical flows:

```text
HALF
MAX
Reverse swap
Slippage change
Invalid amount
Insufficient balance
Same asset
Price refresh
Refresh failure with previous valid data
```

E2E tests should focus on user-visible behavior.

---

# 34. Testability Principles

The architecture must make business logic testable without a browser.

Preferred:

```text
Pure function
      ↓
Input
      ↓
Domain Result
```

Avoid:

```text
React component
      ↓
render
      ↓
click
      ↓
calculate
```

for domain-level tests.

---

# 35. Performance Strategy

Performance principles:

1. Keep global state small.
2. Avoid storing derived values as independent state.
3. Use TanStack Query caching/deduplication for external data.
4. Avoid unnecessary component re-renders.
5. Keep domain functions pure.
6. Use memoization only when profiling or dependency relationships justify it.
7. Avoid premature optimization.
8. Keep UI components focused.
9. Avoid unnecessary network requests.
10. Avoid duplicating normalized price data across multiple stores.

---

# 36. Rendering Strategy

The UI should update from authoritative state and derived domain results.

Conceptually:

```text
Authoritative State
       ↓
Domain/Application Calculation
       ↓
Result
       ↓
UI Render
```

The application should avoid chains of effects where a value can be derived synchronously from current state.

---

# 37. Price Refresh Performance

Price refresh should:

```text
fetch
→ normalize once
→ update normalized data
→ recalculate active quote
```

It should not:

```text
fetch
→ update many unrelated states
→ trigger duplicated calculations
→ trigger duplicated requests
```

---

# 38. Security Considerations

Although this is a simulated frontend challenge:

- do not expose secrets in client-side source;
- do not treat client-side balances as real wallet balances;
- do not present simulated transaction IDs as blockchain transaction hashes;
- do not imply that the challenge price feed represents executable market liquidity;
- validate external response shape/schema before passing data into domain calculations;
- keep business validation and price normalization within the domain.

---

# 39. Observability and Debugging

For local and Dev environments, debugging should make it possible to inspect:

```text
price fetch status
normalized price state
current source/destination
quote result
review snapshot
execution status
```

Debug tooling must not alter domain behavior.

Production debugging should avoid exposing sensitive or unnecessary application state.

---

# 40. Architecture Decision Records

The following decisions are considered architectural decisions for this challenge:

| Decision                      | Choice                                      |
| ----------------------------- | ------------------------------------------- |
| Architecture style            | Pragmatic Clean Architecture                |
| UI organization               | Atomic Design                               |
| External data                 | TanStack Query                              |
| Client state                  | Zustand                                     |
| Domain logic                  | Framework-independent                       |
| Testing                       | Unit + Integration + E2E                    |
| Environments                  | Local + Dev + Prod                          |
| Runtime                       | Native npm + Docker                         |
| Business logic in components  | Prohibited                                  |
| Business logic in Zustand     | Prohibited                                  |
| Balance business rules        | Domain-owned                                |
| Balance client representation | Zustand-owned                               |
| Atomic Design pages           | `app/` route composition                    |
| External capability boundary  | Application ports + Infrastructure adapters |
| Presentation → State          | Allowed                                     |
| Application → Zustand         | Not a required direct dependency            |
| HTTP requests in domain       | Prohibited                                  |

---

# 41. Implementation Constraints

Implementation must preserve the following:

## Domain

- no React dependency;
- no state-management dependency;
- no HTTP dependency;
- no environment dependency;
- no UI formatting logic.

## Application

- orchestrates use cases;
- depends on domain and required application ports/contracts;
- does not require a direct dependency on Zustand;
- does not duplicate domain formulas;
- does not own presentation details.

## Infrastructure

- handles external dependencies;
- validates external response shape/schema before domain use;
- does not apply domain business rules;
- does not redefine business rules.

## Presentation

- renders application/domain results;
- handles user interaction;
- does not implement domain formulas.

## State

- stores authoritative client state where shared client state is required;
- is consumed by Presentation for rendering shared client/application state;
- may use Domain types for client-side representations;
- represents simulated balances after domain operations;
- does not implement balance validation or mutation rules;
- does not own domain business rules;
- avoids duplicated derived state;
- remains lightweight.

---

# 42. Domain Contract Preservation

`architecture.md` must preserve all business rules defined in `domain.md`.

Architecture may decide:

```text
how
where
with which library
with which module
with which runtime
```

Architecture must not change:

```text
what the business rule means
```

For example, architecture may choose how to represent decimal values, but it must preserve:

```text
rate = sourcePrice / destinationPrice
```

Architecture may choose how client state is stored, but it must preserve:

```text
HALF = balance / 2
MAX = balance
```

Architecture may choose how execution is orchestrated, but confirmation must still execute the immutable reviewed snapshot.

---

# 43. End-to-End Architecture Flows

The architecture separates **external data flow** from **user/application flow**.
They are related, but they are not one linear dependency pipeline.

## 43.1 External Price Data Flow

```text
Presentation / Query Hook
        ↓
TanStack Query
        ↓
Application Price Use Case
        ↓
Price Data Port / Contract
        ↓
Infrastructure Price Adapter
        ↓
HTTP
        ↓
External Price Feed

External Price Feed
        ↓
Raw Price Records
        ↓
Domain Normalization
        ↓
Normalized Price Data
        ↓
Quote Calculation
```

TanStack Query manages the external-data lifecycle.
Infrastructure owns transport concerns.
Domain owns normalization and business calculations.

## 43.2 User/Application Flow

```text
Presentation
      ↓
Application Use Case
      ↓
Domain
      ↓
Domain Result
      ↓
State
      ↓
Presentation
```

State stores the resulting client representation where shared state is required.
Presentation consumes that state for rendering.

State does not own business rules, and the Application layer does not require a direct
dependency on the state implementation.

## 43.3 Swap Flow

```text
User Input
      ↓
Application Use Case
      ↓
Domain Validation / Calculation
      ↓
Domain Result
      ↓
Review Snapshot
      ↓
Presentation
```

This prevents the architecture from implying that every operation must pass through
TanStack Query, Zustand, or every architectural layer in sequence.

---

# 44. Swap Execution Flow

```text
User Input
    ↓
Presentation
    ↓
Application Use Case
    ↓
Domain Validation
    ↓
Domain Quote
    ↓
Review Snapshot
    ↓
Review UI
    ↓
User Confirms
    ↓
Application Command
    ↓
Domain executeSwap(snapshot)
    ↓
Balance Transition
    ↓
Transaction Identifier
    ↓
Execution Result
    ↓
Presentation
```

---

# 45. Environment and Runtime Flow

```text
                Source Code
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
    Native Runtime       Docker Runtime
          │                   │
          └─────────┬─────────┘
                    ↓
              Environment
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
      Local        Dev        Prod
```

The same architectural boundaries apply regardless of runtime.

---

# 46. UI Design Reference

The frontend implementation uses the exported Claude Design artifact as
the primary visual and interaction reference.

Reference:

design/claude-design/Currency Swap.dc.html

The design artifact is used to guide:

- layout;
- visual hierarchy;
- spacing;
- typography;
- colors;
- component composition;
- interaction states;
- modal presentation;
- asset selector presentation.

The design reference does not define:

- business rules;
- domain behavior;
- application boundaries;
- state ownership;
- infrastructure behavior.

Those responsibilities remain governed by `prd.md`, `domain.md`,
and this architecture document.

If the design conflicts with an approved product, domain, or
architectural requirement, the conflict must be reported rather than
silently resolved.

---

# 47. Definition of Done — Architecture

Architecture implementation is considered complete when:

- [ ] Clean Architecture boundaries are respected.
- [ ] Domain has no framework dependencies.
- [ ] Application use cases orchestrate domain behavior through explicit application boundaries.
- [ ] Application does not require a direct dependency on Zustand.
- [ ] Presentation has an explicit dependency path to the client-state layer.
- [ ] Infrastructure owns external data access through application ports/contracts.
- [ ] Infrastructure validates response shape/schema without taking over domain business rules.
- [ ] TanStack Query handles external price data lifecycle.
- [ ] Zustand remains lightweight and focused on client state.
- [ ] Derived quote values are not duplicated unnecessarily in global state.
- [ ] Atomic Design is limited to presentation.
- [ ] Next.js route composition remains under `app/`, with no `presentation/pages/` layer.
- [ ] Local, Dev, and Prod environments are supported.
- [ ] Native npm execution works.
- [ ] Docker execution works.
- [ ] Unit tests cover domain rules.
- [ ] Integration tests cover important layer interactions.
- [ ] E2E tests cover critical user journeys.
- [ ] No business logic is implemented directly in UI components.
- [ ] No business logic is implemented inside the state store.
- [ ] Domain contract remains consistent with `domain.md`.

---

# 48. Context Traceability

```text
discovery.md
      ↓
prd.md
      ↓
domain.md
      ↓
architecture.md
      ↓
AI Engineering Setup
      ↓
Implementation Plan
      ↓
Implementation
      ↓
Testing / QA
```

Architecture decisions are derived from:

- product requirements in `prd.md`;
- business rules in `domain.md`;
- frontend implementation requirements defined for this challenge.

Architecture must not introduce product behavior that is not supported by those preceding documents.

---

# 49. Architecture Status

```text
Discovery             ✅ FROZEN
PRD                   ✅ FROZEN
Domain                ✅ FROZEN
Architecture          ✅ FROZEN
AI Engineering Setup  ⏳ NEXT
Implementation Plan   ⏳ AFTER AI SETUP
Implementation        ⏳ AFTER IMPLEMENTATION PLAN
Testing / QA          ⏳ IMPLEMENTATION PHASE
```

The next artifact after architecture is the AI engineering setup.

The AI engineering setup will define the project-level AI instructions,
agent responsibilities, reusable skills, context-loading rules, and
implementation workflow.

The implementation plan will be created after the AI engineering setup
is established.
