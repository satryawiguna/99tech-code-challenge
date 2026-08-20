---
name: ui-implementation
description: "Use when implementing or changing Nocturne Swap React UI, responsive interactions, dialogs, asset selection, and presentation states against the approved design."
---

# UI Implementation Skill

## Purpose

Implement frontend UI behavior using the approved product requirements,
architecture, and Claude Design reference without moving business rules into
the presentation layer.

## Inputs

- `context/prd.md`
- `context/architecture.md`
- `design/README.md`
- Relevant `design/claude-design/*.html`
- `context/domain.md` when the UI touches domain behavior.
- Existing implementation.

## Procedure

1. Load the required context using the Context Loader skill.
2. Identify the relevant screen, component, and interaction state in the
   Claude Design reference.
3. Map the design to the approved component architecture.
4. Identify which values are:
   - presentation-only;
   - client state;
   - server/external data;
   - domain-derived.
5. Keep business rules out of React components and client-state stores.
6. Invoke approved Application/Domain behavior for calculations and business
   rules.
7. Implement responsive and accessible UI behavior.
8. Preserve existing approved behavior unless the task explicitly changes it.
9. Compare the implementation against the relevant design reference.
10. Run the relevant tests and checks.

## Required Constraints

- Do not invent product behavior that is absent from the PRD.
- Do not implement Domain formulas directly in UI components.
- Do not implement HALF/MAX arithmetic directly in UI components.
- Do not make client state the owner of Domain business rules.
- Do not treat the Claude Design HTML as a replacement for PRD, Domain, or
  Architecture.
- Do not introduce an unrelated architectural change.

## Design Handling

Use Claude Design as the primary visual and interaction reference.

Check, where applicable:

- layout;
- spacing;
- typography;
- hierarchy;
- token/icon presentation;
- responsive behavior;
- empty/loading/error states;
- modal and review interactions.

When design and approved requirements conflict, stop and report the conflict.

## Output

Provide:

- Implemented UI behavior.
- Relevant design artifact used.
- Tests/checks performed.
- Any intentional visual deviation and its reason.
