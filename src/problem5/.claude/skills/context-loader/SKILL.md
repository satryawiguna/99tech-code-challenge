---
name: context-loader
description: "Use when loading the minimum approved Problem 5 context for bootstrap, domain, application, persistence, API, testing, review, or security work."
user-invocable: false
---

# Context Loader Skill

## Purpose

Load only the approved Problem 5 context required for the current task while
preserving the decision ownership defined by `CLAUDE.md`.

This skill selects context. It does not decide whether a requested change is
aligned with that context; `context-review` owns that assessment.

## Inputs

- current task or user request;
- `CLAUDE.md`;
- approved documents under `context/`;
- implementation, plan, configuration, or tests when relevant to the task.

## Procedure

1. Read `CLAUDE.md` for non-trivial work.
2. Classify the task:
   - bootstrap or configuration;
   - domain;
   - application or use case;
   - persistence or SQLite;
   - HTTP or API;
   - testing;
   - review;
   - security.
3. Load the minimum approved context from the matrix below.
4. Identify the document that owns each material decision.
5. Inspect relevant implementation only after the governing context is known.
6. Report the task classification, sources loaded, decision ownership, and any
   apparent source conflict. Do not resolve a conflict by preference.

## Task Loading Matrix

| Task | Required Context |
| --- | --- |
| Bootstrap or configuration | `discovery.md`, `architecture.md`, `database.md` when storage is affected |
| Domain | `prd.md`, `domain.md`, `architecture.md` |
| Application or use case | `prd.md`, `domain.md`, `architecture.md`, `api-contract.md` when HTTP behavior is affected |
| Persistence or SQLite | `domain.md`, `architecture.md`, `database.md`, `api-contract.md` when persistence affects API behavior |
| HTTP or API | `prd.md`, `domain.md`, `architecture.md`, `api-contract.md` |
| Testing | the context documents that define the behavior under test; include `database.md` for persistence tests |
| Review | the context documents governing the changed behavior, plus implementation plan when relevant |
| Security | `architecture.md`, `api-contract.md`, `database.md`, relevant configuration, and affected implementation |

Read `discovery.md` when the task depends on challenge constraints, scope, or
the distinction between challenge requirements and engineering decisions.

## Decision Ownership

```text
discovery.md   -> challenge requirements, scope, engineering decisions
prd.md         -> product behavior and product scope
domain.md      -> Ticket semantics and invariants
architecture.md -> technical boundaries and runtime strategy
api-contract.md -> externally observable HTTP behavior
database.md    -> SQLite schema and persistence behavior
CLAUDE.md      -> AI execution governance
```

## Output

Produce a concise summary:

```text
Task Classification:
Sources Loaded:
Decision Ownership:
Relevant Constraints:
Potential Conflicts:
```

## Rules

1. Load the smallest sufficient source set; do not read all documents by default.
2. Do not invent missing requirements.
3. Do not treat implementation code as the source of truth for approved decisions.
4. Escalate apparent conflicts to `context-review` rather than resolving them.