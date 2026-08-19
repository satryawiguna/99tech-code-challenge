---
name: domain-validation
description: "Use when validating that a Problem 2 change preserves swap domain rules and does not duplicate calculations, validation, balances, or execution logic in UI or state."
---

# Domain Validation Skill

## Purpose

Verify that frontend implementation respects the approved Domain rules and
does not duplicate business logic in Presentation or State.

## Inputs

- `context/domain.md`
- `context/prd.md`
- `context/architecture.md`
- Changed implementation.

## Procedure

1. Load the relevant approved context.
2. Identify every business rule affected by the change.
3. Trace the implementation path from UI/Application to Domain and back to the
   required client representation.
4. Check that business calculations are performed at the approved boundary.
5. Check that the implementation preserves approved validation semantics.
6. Check domain-derived values for semantic consistency.
7. Check balance transition behavior where applicable.
8. Check review snapshot and confirmation semantics where applicable.
9. Check HALF/MAX behavior where applicable.
10. Report any business-rule duplication, leakage, or semantic deviation.

## Validation Areas

When relevant, verify:

- price normalization;
- quote calculation;
- USD value calculation;
- minimum received;
- validation;
- HALF;
- MAX;
- reverse swap;
- review snapshot;
- execution;
- balance transition;
- transaction-result semantics.

## Required Constraints

- Do not invent alternate Domain semantics.
- Do not move Domain rules into React components.
- Do not move Domain rules into Zustand/client state.
- Do not silently change approved validation terminology or semantics.
- Do not treat UI-derived state as authoritative Domain state.
- If the concrete invocation path is unclear, consult `architecture.md`
  rather than inventing one.

## Output

Report:

- Rules checked.
- Implementation boundaries checked.
- Violations, if any.
- Required corrective action, if any.

If no violation is found, state that explicitly.
