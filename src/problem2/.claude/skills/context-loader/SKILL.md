---
name: context-loader
description: "Use when loading approved Problem 2 context for UI, domain, application, state, infrastructure, testing, review, or security work."
user-invocable: false
---

# Context Loader Skill

## Purpose

Load only the approved project context required for the current task while
preserving the decision ownership defined by `CLAUDE.md`.

## Inputs

- Current task or user request.
- Approved context under `context/`.
- Design reference under `design/` when relevant.
- `CLAUDE.md`.

## Procedure

1. Read `CLAUDE.md` first when the task is a non-trivial implementation task.
2. Classify the task:
   - UI / Presentation
   - Domain / Business Logic
   - Application / Use Case
   - State Management
   - Infrastructure / Price Feed
   - Testing
   - Review / Security
3. Load the minimum approved context required by the task.
4. For UI tasks, inspect `design/README.md` and the relevant Claude Design
   HTML artifact.
5. Identify the source that owns each decision being implemented:
   - Discovery → problem context, scope, constraints.
   - PRD → product requirements and user behavior.
   - Domain → business rules and invariants.
   - Architecture → technical architecture and implementation boundaries.
   - Design → visual and interaction reference.
   - CLAUDE.md → AI execution governance.
6. If relevant sources conflict, stop and report the conflict.
7. Do not invent missing requirements.

## Task Loading Matrix

| Task                        | Required Context                                                          |
| --------------------------- | ------------------------------------------------------------------------- |
| UI / Presentation           | `prd.md`, `architecture.md`, `design/README.md`, relevant design artifact |
| Business Logic / Domain     | `prd.md`, `domain.md`, `architecture.md`                                  |
| Application / Use Case      | `prd.md`, `domain.md`, `architecture.md`                                  |
| State Management            | `domain.md`, `architecture.md`                                            |
| Infrastructure / Price Feed | `prd.md`, `domain.md`, `architecture.md`                                  |
| Testing                     | `prd.md`, `domain.md`, `architecture.md`                                  |
| Review                      | Relevant context plus changed implementation                              |
| Security Review             | `architecture.md`, relevant implementation, environment configuration     |

Load `domain.md` for UI work when the UI touches validation, calculations,
execution, balances, or other domain-derived behavior.

## Output

Produce a concise context summary containing:

- Task classification.
- Sources loaded.
- Decision ownership relevant to the task.
- Relevant constraints.
- Any unresolved conflict.

Do not reproduce complete source documents in the output.
