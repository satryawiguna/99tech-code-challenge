---
name: code-review
description: "Use when independently reviewing Problem 2 changes for defects, regressions, domain and architecture violations, design alignment, test gaps, and unnecessary complexity."
---

# Code Review Skill

## Purpose

Review implementation changes against the approved product, domain,
architecture, design, and AI execution rules.

## Inputs

- `CLAUDE.md`
- Relevant `context/*.md`
- Relevant `design/` reference.
- Changed files.
- Tests and test results.

## Procedure

1. Identify the scope of the change.
2. Load only the approved context relevant to that scope.
3. Identify the decision owner for each significant behavior.
4. Inspect dependency direction and architectural boundaries.
5. Inspect state ownership.
6. Inspect business-rule placement.
7. Inspect UI/design alignment where applicable.
8. Inspect error, loading, and edge-case behavior.
9. Inspect tests and test adequacy.
10. Inspect unnecessary complexity and unrelated changes.
11. Report findings by severity.

## Review Priorities

Check for:

- business logic leakage into Presentation;
- business logic leakage into State;
- dependency-direction violations;
- incorrect state ownership;
- duplicated Domain rules;
- incorrect HALF/MAX behavior;
- incorrect balance transition behavior;
- review-snapshot violations;
- confirmation/execution semantic violations;
- deviation from approved product behavior;
- significant design deviation;
- missing tests;
- unnecessary architectural changes.

## Severity

Use:

- **BLOCKER** — violates an approved requirement, Domain rule, or architectural
  boundary, or creates a serious security/correctness problem.
- **MAJOR** — likely causes incorrect behavior, significant maintainability
  problems, or missing required coverage.
- **MINOR** — localized quality or consistency issue that does not change
  approved behavior.
- **NOTE** — optional improvement or observation.

## Conflict Rule

If the implementation exposes a conflict between authoritative sources, do
not resolve it by preference. Identify the conflict and request clarification.

## Output

Return:

1. Summary.
2. Findings ordered by severity.
3. File/location for each finding.
4. Why the finding matters.
5. Recommended correction.
6. Final status:
   - Approved
   - Approved with minor issues
   - Changes required
