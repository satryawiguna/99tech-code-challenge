---
name: code-review
description: "Use after implementation and evidence are available to perform an integrated Problem 5 correctness and quality review."
argument-hint: "Describe the diff or implementation slice to review"
user-invocable: true
---

# Code Review Skill

## Purpose

Review the implementation against the approved Problem 5 engineering context and identify correctness, architecture, security, testing, maintainability, and scope issues.

The primary question is:

> Does the implementation correctly realize the approved engineering decisions?

---

## When to Use

Use this skill when:

- an implementation phase is complete;
- a pull request or diff is ready for review;
- testing has completed;
- final verification is required;
- a significant implementation change needs independent review.

---

## Required Context

Read the relevant documents under:

```text
src/problem5/context/
```

For a broad review, use all six:

```text
discovery.md
prd.md
domain.md
architecture.md
api-contract.md
database.md
```

Use `context-loader` followed by `context-review` before performing the review.
Use `domain-validation` when the change affects Ticket semantics or their
enforcement path. Use `security-review` when the change affects HTTP input,
SQLite, configuration, dependencies, error handling, or exposed documentation.

---

## Inputs

- code diff;
- changed files;
- test results;
- human-approved implementation draft, if available;
- approved context;
- project configuration where relevant.

---

## Review Procedure

### 1. Establish Review Scope

Identify:

- changed files;
- changed behavior;
- affected layers;
- related tests;
- relevant context documents.

Do not review unrelated areas unless a broader issue is discovered.

### 2. Review Context Compliance

Check that implementation matches:

- approved product scope;
- domain rules;
- architecture;
- API contract;
- database design;
- security baseline.

Incorporate focused domain or security findings when those specialized reviews
are relevant. Do not duplicate them merely as workflow ceremony.

### 3. Review Correctness

Check:

- functional behavior;
- edge cases;
- error handling;
- validation;
- state handling;
- persistence behavior.

### 4. Review Architecture

Check:

- layer boundaries;
- dependency direction;
- repository abstraction;
- domain independence;
- application responsibilities;
- infrastructure responsibilities.

Flag:

- direct database access from domain logic;
- business logic hidden in controllers;
- unnecessary coupling;
- unnecessary abstractions.

### 5. Review API Contract

Check:

- routes;
- HTTP methods;
- request shape;
- response shape;
- status codes;
- filtering;
- error structure;
- server-controlled fields.

The implementation must not silently change externally observable behavior.

### 6. Review Database Integration

Check:

- schema alignment;
- repository behavior;
- constraints;
- indexes where relevant;
- transaction behavior;
- parameterized/safe queries;
- timestamp handling;
- ID handling.

### 7. Review Security

At minimum check:

- input validation;
- safe database operations;
- secret handling;
- error exposure;
- unnecessary data exposure;
- request-size handling where applicable;
- dependency risks where relevant.

Authentication and authorization are outside the current Problem 5 scope unless explicitly added to approved context.

### 8. Review Testing

Check:

- relevant tests exist;
- important behavior is covered;
- tests are meaningful;
- failures are not hidden;
- tests match approved behavior.

### 9. Review Scope and Complexity

Check for:

- unnecessary dependencies;
- unnecessary infrastructure;
- speculative abstractions;
- unrelated features;
- complexity disproportionate to the challenge.

### 10. Classify Findings

Use:

```text
BLOCKER
HIGH
MEDIUM
LOW
NIT
```

Prioritize findings by impact rather than stylistic preference.

---

## Review Rules

1. Approved context is the primary review reference.
2. Do not require behavior that is not supported by approved context.
3. Do not approve code that knowingly violates approved context.
4. Distinguish correctness issues from style preferences.
5. Prefer actionable findings.
6. Explain why each significant finding matters.
7. Do not request unnecessary complexity.
8. Security findings should be treated according to their actual risk.
9. If the reviewer discovers a context problem, report it separately from an implementation defect.
10. A clean review does not mean the code is perfect; it means no material issue was identified within the review scope.

---

## Output

Produce a review report:

```markdown
# Code Review

## Status

APPROVED / CHANGES REQUESTED / BLOCKED

## Summary

...

## Findings

### [SEVERITY] Finding Title

**Location**
...

**Issue**
...

**Why it matters**
...

**Recommendation**
...

## Context Compliance

...

## Security

...

## Testing

...

## Scope / Complexity

...

## Final Recommendation

...
```

---

## Validation

Before completing the review:

- relevant context was reviewed;
- changed files were inspected;
- important behavior was checked;
- architecture boundaries were checked;
- API/database behavior was checked where applicable;
- security baseline was checked;
- tests/results were reviewed;
- findings were classified;
- no material context deviation was ignored.

---

## Failure / Escalation

Escalate when:

- implementation conflicts with approved context;
- a context decision itself appears contradictory;
- security risk cannot be assessed confidently;
- tests are insufficient to establish correctness;
- the change requires a product or architecture decision outside the reviewer's authority.
