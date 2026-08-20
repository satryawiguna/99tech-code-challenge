---
name: testing
description: "Use when adding, updating, running, or diagnosing tests for Problem 2 frontend, domain, application, infrastructure, or user-critical swap behavior."
---

# Testing Skill

## Purpose

Design, implement, and verify tests for changed frontend behavior according
to the approved testing strategy.

## Inputs

- `context/prd.md`
- `context/domain.md`
- `context/architecture.md`
- Changed implementation.
- Existing tests and test configuration.

## Procedure

1. Load the approved testing strategy from `architecture.md`.
2. Identify the behavior changed by the task.
3. Identify the appropriate test layer.
4. Reuse existing testing patterns before introducing new infrastructure.
5. Add or update tests for the changed behavior.
6. Include business-rule tests when Domain behavior is involved.
7. Include integration coverage when boundaries between modules are affected.
8. Include E2E coverage when user-critical flows require it.
9. Run the relevant test suite.
10. Investigate failures rather than weakening assertions merely to make tests
    pass.

## Business Behaviors to Cover When Applicable

- price normalization;
- quote calculation;
- validation;
- HALF;
- MAX;
- reverse swap;
- review snapshot;
- execution;
- balance transition;
- transaction-result semantics.

## Required Constraints

- Testing is mandatory for changed behavior.
- Do not consider implementation complete only because the UI renders.
- Do not test private implementation details when behavior can be tested
  through a stable contract.
- Do not remove meaningful assertions merely to accommodate an implementation.
- Do not introduce a new testing framework without an approved reason.

## Output

Report:

- Tests added or changed.
- Test layer used.
- Commands/checks executed.
- Results.
- Known limitations or uncovered cases.
