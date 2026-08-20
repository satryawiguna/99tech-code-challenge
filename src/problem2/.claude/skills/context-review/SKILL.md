---
name: context-review
description: "Use before planning or implementing a non-trivial Nocturne Swap change to verify approved context completeness, consistency, ownership, and design alignment."
argument-hint: "Describe the planned change whose context should be reviewed"
user-invocable: true
---

# Context Review

## Purpose

Verify that approved context is present, applicable, and consistent before a
non-trivial implementation plan or change begins.

## Procedure

1. Identify the planned behavior and classify its decision types.
2. Load the context required by `CLAUDE.md` for that task type.
3. Verify the relevant source files exist and contain the expected decision
   content, not unrelated or corrupted material.
4. Trace each material decision to its owning source:
   - Discovery for scope and constraints;
   - PRD for user behavior;
   - Domain for business rules;
   - Architecture for technical boundaries;
   - Design for visual and interaction intent.
5. Check related sources for material conflicts, especially ownership,
   validation, calculation, execution, state, and design behavior.
6. Report one of: `Ready for planning`, `Ready with assumptions`, or `Blocked`.

## Required Constraints

- Do not resolve a material conflict by preference.
- Do not edit approved context as part of a review unless the user explicitly
  requests a context correction.
- Do not let design override approved product, domain, or architecture rules.

## Output

Return the loaded sources, relevant decisions, conflicts or assumptions, and
the readiness result.
