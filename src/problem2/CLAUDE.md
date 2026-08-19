# CLAUDE.md

## 1. Purpose

This file defines the operating rules for Claude Code when working on the
frontend for **Problem 2 — Fancy Form / Nocturne Swap**.

`CLAUDE.md` is an **AI engineering and execution contract**. It governs:

- how agents load context;
- how agents interpret source-of-truth responsibilities;
- how agents plan and implement changes;
- how agents use specialized agents and skills;
- how agents handle conflicts;
- how agents verify completed work.

It does **not** replace or redefine the approved product, domain,
architecture, or design documents.

---

## 2. Workspace Structure

The Problem 2 workspace is organized around the following approved
context and design-reference structure:

```text
workspace-root/
├── context/
│   ├── discovery.md
│   ├── prd.md
│   ├── domain.md
│   └── architecture.md
│
├── design/
│   ├── README.md
│   └── claude-design/
│       └── *.html
│
└── CLAUDE.md
```

Implementation-specific directories may be added according to the approved
architecture and implementation plan.

### REQUIRED

- Treat the approved files under `context/` as the project context.
- Do not move or rename approved context files without explicit approval.
- Treat `design/claude-design/` as the visual and interaction design-reference
  area.
- Treat `CLAUDE.md` as the AI execution/governance contract.
- Do not assume implementation directories exist until they are created or
  defined by the approved architecture/implementation plan.

---

## 3. Decision Ownership

Each approved document owns a different kind of decision.

| Source                        | Decision Ownership                                                               |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `context/discovery.md`        | Problem context, scope, constraints, discovery findings                          |
| `context/prd.md`              | Product requirements and user behavior                                           |
| `context/domain.md`           | Business rules, invariants, calculations, validation, domain lifecycle           |
| `context/architecture.md`     | Technical architecture, dependencies, state ownership, runtime, testing strategy |
| `design/README.md`            | Design-reference usage and artifact guidance                                     |
| `design/claude-design/*.html` | Visual and interaction reference                                                 |
| `CLAUDE.md`                   | AI execution rules, workflow, governance, and conflict handling                  |
| `.claude/agents/`             | Specialized task ownership                                                       |
| `.claude/skills/`             | Reusable task procedures                                                         |

### REQUIRED

1. Follow the source that owns the decision being implemented.
2. Do not silently redefine an approved requirement or decision.
3. Do not use `CLAUDE.md` to override an approved product, domain,
   architecture, or design decision.
4. Do not make implementation code the source of truth for product,
   business, or architectural decisions.
5. If two authoritative sources materially conflict, stop and report the
   conflict before implementing behavior that depends on it.

### GUIDANCE

Load only the sources relevant to the task, while preserving enough context
to make a correct decision.

---

## 4. Required vs Guidance

This document intentionally distinguishes between mandatory rules and
recommended engineering practices.

### REQUIRED

A **REQUIRED** rule is mandatory.

Agents must not intentionally violate a REQUIRED rule unless an explicit
approved change modifies the relevant requirement.

### GUIDANCE

A **GUIDANCE** item is a recommended engineering practice.

Guidance should normally be followed, but may be adapted when the approved
context, accessibility, technical constraints, or implementation plan provides
a better justified approach.

### Conflict Resolution

There is no universal precedence between `prd.md`, `domain.md`, and
`architecture.md`. Each owns a different class of decisions.

Use this process:

```text
Implementation Decision
        ↓
Identify the decision type
        ↓
Identify the document that owns that decision
        ↓
Follow the owning document
        ↓
Check related approved documents for consistency
        ↓
Conflict remains?
   ┌────┴────┐
  No        Yes
  ↓          ↓
Proceed    STOP + REPORT
```

Examples:

```text
Product behavior
    → prd.md

Business rule
    → domain.md

Technical structure
    → architecture.md

Visual / interaction reference
    → design/

AI execution behavior
    → CLAUDE.md
```

`CLAUDE.md` governs **how the agent works**; it does not become a higher
authority over decisions owned by the approved context.

---

## 5. Context Loading Rules

### 5.1 UI / Presentation Task

### REQUIRED

Read:

```text
context/prd.md
context/architecture.md
design/README.md
```

Then inspect the relevant artifact under:

```text
design/claude-design/
```

Also read `context/domain.md` when the UI task involves:

- business behavior;
- validation;
- calculations;
- execution;
- balances;
- domain-derived values.

### 5.2 Business Logic / Domain Task

### REQUIRED

Read:

```text
context/prd.md
context/domain.md
context/architecture.md
```

Do not place framework-specific behavior into the Domain.

### 5.3 Application / Use Case Task

### REQUIRED

Read:

```text
context/prd.md
context/domain.md
context/architecture.md
```

Focus on orchestration and application boundaries.

Do not duplicate Domain formulas in Application use cases.

### 5.4 State Management Task

### REQUIRED

Read:

```text
context/domain.md
context/architecture.md
```

Follow the state ownership and dependency direction defined by
`context/architecture.md`.

Do not redefine state ownership in the implementation.

### 5.5 Infrastructure / Price Feed Task

### REQUIRED

Read:

```text
context/prd.md
context/domain.md
context/architecture.md
```

Follow the infrastructure and external-data boundaries defined by
`context/architecture.md`.

Do not move transport concerns into the Domain.

### 5.6 Testing Task

### REQUIRED

Read:

```text
context/prd.md
context/domain.md
context/architecture.md
```

Then inspect the implementation under test.

Follow the approved testing strategy defined by `context/architecture.md`.

---

## 6. Architecture Governance

The complete technical architecture is defined by:

```text
context/architecture.md
```

### REQUIRED

- Treat `context/architecture.md` as the authoritative source for technical
  architecture.
- Before making an architectural change, inspect the relevant architecture
  section.
- Do not silently redesign an approved architectural boundary.
- Do not redefine dependency direction, state ownership, layer boundaries,
  runtime strategy, or testing architecture in this file.
- Obtain explicit approval before redefining an approved architectural
  decision.

### GUIDANCE

Use:

```text
CLAUDE.md
    → how the agent should work

context/architecture.md
    → what the approved architecture is
```

Avoid duplicating architectural matrices, complete dependency diagrams,
detailed layer responsibilities, or implementation-specific architecture
rules in `CLAUDE.md`.

---

## 7. Domain and Business-Rule Governance

The business rules are defined by:

```text
context/domain.md
```

### REQUIRED

- Do not independently reproduce Domain formulas in Presentation, State, or
  unrelated Application code.
- Use approved Domain/Application behavior for business calculations.
- Keep Domain logic framework-independent.
- Do not move business rules into React components or client-state stores.
- Do not invent alternate semantics for approved domain behavior.

This includes business behavior such as:

- price normalization;
- quote calculation;
- USD value calculation;
- minimum received;
- validation;
- reverse swap;
- review snapshot;
- execution;
- balance transition;
- transaction-result semantics.

The exact technical organization of these rules is defined by
`context/architecture.md`.

---

## 8. HALF and MAX Governance

HALF and MAX are user actions backed by approved Domain rules.

### REQUIRED

- HALF/MAX arithmetic must not be implemented directly in UI components.
- HALF/MAX arithmetic must not be implemented inside Zustand or another
  client-state store.
- Use the approved Domain/Application boundaries.
- Do not invent alternate HALF/MAX semantics.
- Follow the concrete invocation path defined by `context/architecture.md`
  and the implementation plan.

### GUIDANCE

Keep the conceptual responsibility flow:

```text
User Action
    ↓
Approved Application Boundary
    ↓
Approved Domain Rule
    ↓
Amount Result
    ↓
Client State / UI Representation
```

Concrete function or method names are implementation details.

---

## 9. Balance Governance

Balance transition rules belong to the Domain.

The authoritative client-side balance representation follows
the ownership defined by architecture.md.

### REQUIRED

- Do not implement balance validation or balance-transition calculations in
  UI components.
- Do not make client state the owner of balance business rules.
- Use the approved Domain/Application behavior for balance transitions.
- Preserve the reviewed snapshot and execution semantics defined by
  `context/domain.md`.

Do not create a second balance business-rule implementation merely because
the UI or state layer needs a representation of the current balance.

---

## 10. Review and Execution Governance

The product and domain semantics for review and execution are defined by:

```text
context/prd.md
context/domain.md
```

The technical implementation boundary is defined by:

```text
context/architecture.md
```

### REQUIRED

- Preserve the approved review snapshot semantics.
- Treat confirmation according to the approved Application/Domain boundary.
- Do not silently rebuild a reviewed business decision from mutable form
  state.
- Do not move execution rules into React components or client-state stores.
- Preserve the approved balance-transition and transaction-result semantics.

### GUIDANCE

Before changing review or confirmation behavior, trace the existing approved
Domain and Application flow.

---

## 11. Claude Design Governance

The exported Claude Design artifact is the primary visual and interaction
reference for implementation.

Reference area:

```text
design/
├── README.md
└── claude-design/
    └── *.html
```

### REQUIRED

Before implementing a significant UI area:

1. Read `design/README.md`.
2. Identify the relevant HTML artifact.
3. Inspect the relevant layout and interaction states.
4. Use the design as the visual/interaction baseline.
5. Preserve consistency with the approved product, domain, and architecture
   decisions.

The design reference may communicate:

- layout;
- visual hierarchy;
- spacing;
- typography;
- colors;
- component composition;
- interaction states;
- modal presentation;
- asset-selector presentation.

The design does **not** override:

- product requirements;
- Domain rules;
- technical architecture;
- state ownership;
- infrastructure behavior.

If the design conflicts with an approved requirement or technical decision,
report the conflict instead of silently choosing one.

### GUIDANCE

Reasonable visual deviations may be introduced when required by:

- accessibility;
- responsiveness;
- browser/runtime constraints;
- approved product requirements;
- approved architecture;
- technical limitations.

Significant deviations should be intentional and justifiable.

---

## 12. Environment and Runtime Governance

The approved environment and runtime strategy is defined by:

```text
context/architecture.md
```

### REQUIRED

- Follow the approved Local, Dev, and Prod environment model.
- Preserve the approved native and Dockerized runtime behavior.
- Do not hard-code environment-specific configuration.
- The Domain must not read environment variables directly.
- Secrets must never be committed.
- Keep Docker/runtime configuration outside Domain business logic.
- Preserve the approved local development workflow.

Do not redefine environment structure in `CLAUDE.md`.

---

## 13. Testing Governance

Testing is mandatory.

The approved testing strategy is defined by:

```text
context/architecture.md
```

### REQUIRED

- Add or update tests for changed behavior.
- Follow the approved test layers and coverage strategy.
- Do not consider implementation complete merely because the application
  renders successfully.
- Preserve testability of Domain business rules.

Business-rule tests should cover the behavior required by
`context/domain.md`, including where applicable:

- price normalization;
- quote calculation;
- validation;
- HALF;
- MAX;
- reverse swap;
- review snapshot;
- execution;
- balance transition;
- transaction result semantics.

### GUIDANCE

Prefer testing behavior and contracts over implementation details.

---

## 14. Performance Governance

### REQUIRED

Do not introduce performance changes that violate approved architecture or
business behavior.

### GUIDANCE

Prefer:

1. small and focused shared state;
2. derived values instead of unnecessary duplicated state;
3. efficient external-data caching and deduplication;
4. minimal unnecessary re-renders;
5. pure Domain functions;
6. focused UI components;
7. minimal unnecessary network requests.

Use memoization and other optimizations when justified by actual behavior or
measurement.

Avoid premature optimization.

---

## 15. Security and Simulation Rules

This is a simulated frontend challenge.

### REQUIRED

- Never expose secrets in client-side source.
- Never treat simulated balances as real wallet balances.
- Never present simulated transaction identifiers as real blockchain
  transaction hashes.
- Never imply that the challenge price feed represents executable market
  liquidity.
- Validate external response shape/schema before using it in business
  calculations.

---

## 16. Implementation Workflow

The general workflow is:

```text
Approved Context
      ↓
AI Engineering Setup
      ↓
Implementation Plan
      ↓
Implementation
      ↓
Testing
      ↓
Review
```

### REQUIRED

For non-trivial implementation work:

1. inspect the relevant approved context;
2. identify the owning decision source;
3. verify the relevant architectural boundary;
4. prepare or follow the approved implementation plan;
5. implement the requested behavior;
6. add or update relevant tests;
7. run relevant checks;
8. review the result against the approved context and design reference.

Do not skip implementation planning for non-trivial work.

Before changing an architectural boundary:

1. inspect the relevant context;
2. determine whether the change is architectural;
3. identify the affected boundary;
4. report any conflict with the approved architecture;
5. obtain explicit approval before redefining the boundary.

### GUIDANCE

For small, isolated changes, use the smallest workflow that still provides
sufficient context and verification.

---

## 17. Agent and Skill Governance

Specialized agents and skills live under:

```text
.claude/
├── agents/
└── skills/
```

### REQUIRED

Agents and skills must:

- follow this `CLAUDE.md`;
- respect the approved context;
- follow the relevant context-loading rules;
- avoid redefining business rules;
- avoid redefining approved architecture without approval;
- report unresolved conflicts;
- keep changes focused on their assigned responsibility.

An agent represents:

```text
who performs a task
```

A skill represents:

```text
how a reusable task is performed
```

Do not create unnecessary agents or skills.

### GUIDANCE

Use a specialized agent or skill when the task matches its defined
responsibility.

Prefer clear, narrow responsibilities over large agents that attempt to
control the entire implementation process.

### Workflow Handoffs

For non-trivial work, use the following responsibility flow:

```text
Context Review
  ↓
Planner
  ↓
Human Approval
  ↓
Implementer
  ↓
Tester
  ↓
Reviewer
  ↓
Human Final Approval
```

The Planner produces a draft plan only. The Implementer may begin a
non-trivial change only after human approval of that plan. Tester and Reviewer
provide evidence and recommendations; neither replaces human approval.

---

## 18. Change Discipline

### REQUIRED

Before changing existing implementation:

1. inspect the current implementation;
2. identify the relevant decision source;
3. identify the affected architectural boundary;
4. understand existing dependencies;
5. make the smallest change that satisfies the requirement;
6. preserve existing behavior unless an approved requirement says otherwise;
7. add or update tests for changed behavior;
8. run relevant checks;
9. report unresolved issues.

Do not introduce unrelated architectural changes.

### GUIDANCE

Prefer abstractions only when they provide a clear responsibility, reuse
benefit, maintainability benefit, or testability benefit.

Avoid abstraction for abstraction's sake.

---

## 19. Conflict Handling

### REQUIRED

When an implementation decision appears to conflict with the approved
context:

```text
Implementation Decision
        ↓
Identify Decision Type
        ↓
Identify Owning Source
        ↓
Check Related Sources
        ↓
Consistent?
   ┌────┴────┐
  Yes       No
   ↓         ↓
Proceed    STOP + REPORT
```

If the conflict remains unresolved:

> Stop and report the conflict.

Do not silently:

- change a PRD requirement;
- change a Domain rule;
- change state ownership;
- change dependency direction;
- reinterpret HALF/MAX;
- move business logic into Presentation;
- move business logic into client state;
- make the Claude Design artifact authoritative over product, domain, or
  architecture decisions.

---

## 20. Definition of Done

A task is complete only when the requested behavior has been implemented and
verified.

### REQUIRED

Before considering implementation complete:

- requested behavior is implemented;
- the owning source of truth remains respected;
- approved architecture boundaries remain intact;
- Domain logic remains framework-independent;
- business rules are not duplicated in UI/state;
- relevant tests are added or updated;
- relevant tests pass;
- UI changes are checked against the Claude Design reference where applicable;
- implementation works in the intended runtime/environment;
- no unrelated architectural changes were introduced.

### GUIDANCE

For larger tasks, provide a concise summary:

```text
Changed
Tested
Known limitations
```

---

## 21. Responsibility Model

Use this model when deciding where a new piece of information or behavior
belongs:

```text
APPROVED CONTEXT
│
├── context/discovery.md
│   └── Problem context, scope, constraints, discovery findings
│
├── context/prd.md
│   └── Product requirements and user behavior
│
├── context/domain.md
│   └── Business rules and invariants
│
└── context/architecture.md
    └── Technical architecture and implementation boundaries

DESIGN REFERENCE
│
└── design/
    └── Visual and interaction reference

AI EXECUTION GOVERNANCE
│
└── CLAUDE.md
    └── Agent workflow, governance, and conflict handling

EXECUTION SUPPORT
│
├── .claude/agents/
│   └── Specialized task ownership
│
├── .claude/skills/
│   └── Reusable task procedures
│
└── Implementation
    └── Concrete code conforming to the approved sources
```

### REQUIRED

Implementation code must conform to the approved sources.

Implementation code must not become the source of truth for product,
business, or architectural decisions.
