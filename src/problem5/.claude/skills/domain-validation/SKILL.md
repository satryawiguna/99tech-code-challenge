---
name: domain-validation
description: "Use when a Problem 5 change affects Ticket rules or their enforcement path and must preserve approved domain semantics."
user-invocable: true
---

# Domain Validation Skill

## Purpose

Verify that an implementation preserves the approved Ticket domain rules and
keeps those rules in the domain/application boundaries defined by architecture.

## Inputs

- `context/domain.md`;
- `context/prd.md` and `context/architecture.md`;
- `context/api-contract.md` or `context/database.md` when the enforcement path
  crosses HTTP or persistence;
- changed implementation and relevant tests.

## Procedure

1. Identify the Ticket rules and enforcement paths affected by the change.
2. Verify DR-01 through DR-10 in `domain.md` where relevant.
3. Verify allowed statuses: `open`, `in_progress`, `resolved`, `closed`.
4. Verify allowed priorities: `low`, `medium`, `high`.
5. Verify new Tickets always start `open`, regardless of client input.
6. Verify `id` and `createdAt` remain immutable, and `updatedAt` remains
   server-controlled and changes only with a successfully persisted update.
7. Verify no strict status-transition matrix has been introduced.
8. Verify Ticket business rules do not move into HTTP controllers or SQLite
   repository code.
9. Report rule violations, boundary leakage, or unclear ownership for human
   escalation.

## Rules

1. Do not invent new Ticket rules.
2. Do not make UI, HTTP, or database representation authoritative over the domain.
3. Do not duplicate domain validation merely to make a layer convenient.
4. If context is ambiguous or conflicting, report it through `context-review`.

## Output

```text
Rules Checked:
Enforcement Paths Checked:
Boundary Findings:
Violations:
Required Action:
```
