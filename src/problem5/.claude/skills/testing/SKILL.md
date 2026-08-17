# Testing Skill

## Purpose

Design, execute, and evaluate tests that verify the Problem 5 implementation against the approved engineering context.

Testing must verify behavior and system boundaries rather than merely maximize code coverage.

---

## When to Use

Use this skill when:

- implementing a new feature;
- verifying an implementation phase;
- diagnosing a regression;
- preparing the project for review;
- performing final quality verification.

---

## Required Context

Read the relevant documents under:

```text
src/problem5/context/
```

At minimum, use:

```text
domain.md
architecture.md
api-contract.md
database.md
```

Also consult:

```text
prd.md
discovery.md
```

when the test scope depends on product requirements or challenge constraints.

---

## Inputs

- implementation code;
- approved context;
- implementation plan, if available;
- existing tests;
- test configuration;
- reported bug or expected behavior.

---

## Test Strategy

Testing should cover the appropriate layers:

```text
Domain
    ↓
Application
    ↓
Persistence
    ↓
API
```

Not every change requires every layer. Select the smallest test scope that provides sufficient confidence.

---

## Procedure

### 1. Identify Expected Behavior

Determine expected behavior from:

- PRD;
- Domain;
- API Contract;
- Database Design.

Do not infer expected behavior solely from the current implementation.

### 2. Inspect Existing Tests

Before adding tests:

- identify existing test conventions;
- reuse existing helpers;
- avoid duplicate coverage;
- preserve established test organization.

### 3. Define Test Cases

For each behavior, cover relevant:

```text
Happy Path
Validation Failure
Not Found
Boundary Conditions
Persistence Behavior
Error Handling
```

### 4. Domain Testing

Where applicable, verify:

- valid Ticket state;
- supported status values;
- supported priority values;
- initial `open` status;
- immutable attributes;
- mutable attributes;
- domain invariants.

### 5. Application Testing

Where applicable, verify:

- create;
- list;
- filtering;
- get;
- update;
- delete;
- missing Ticket behavior.

### 6. Persistence Testing

Where applicable, verify:

- Ticket persistence;
- retrieval;
- update;
- deletion;
- status filtering;
- priority filtering;
- relevant database constraints.

### 7. API Testing

Where applicable, verify:

- endpoint routing;
- request validation;
- response structure;
- HTTP status codes;
- filtering;
- error responses;
- server-controlled fields.

### 8. Execute Tests

Run the narrowest relevant tests first.

Then run broader tests when appropriate.

Record:

```text
Command
Result
Failures
Relevant Error
```

### 9. Diagnose Failures

For each failure determine whether it is:

```text
Test Defect
Implementation Defect
Environment Problem
Context Conflict
```

Do not weaken a test merely to make the implementation pass.

### 10. Report Results

Summarize:

```text
Tests Run
Tests Passed
Tests Failed
Known Issues
Context Deviations
Recommendation
```

---

## Rules

1. Test approved behavior, not accidental implementation behavior.
2. Do not invent requirements through tests.
3. Do not remove or weaken a valid test simply because implementation fails.
4. Prefer deterministic tests.
5. Keep tests isolated and repeatable.
6. Avoid unnecessary external dependencies.
7. Do not expose secrets or sensitive data in tests.
8. Match the testing architecture defined by `architecture.md`.
9. If behavior is ambiguous in the context, escalate rather than guessing.
10. Coverage percentage alone is not a definition of quality.

---

## Output

Depending on the task, produce:

- test cases;
- test code;
- test execution results;
- failure analysis;
- quality assessment.

For final verification, provide a concise report:

```text
Testing Status: PASS / FAIL / BLOCKED

Unit Tests:
...

Integration Tests:
...

API Tests:
...

Known Issues:
...

Context Compliance:
...

Recommendation:
...
```

---

## Validation

Before declaring testing complete:

- relevant tests exist;
- important behavior is covered;
- tests pass;
- failures are understood;
- no valid requirement was weakened;
- API behavior is verified where applicable;
- persistence behavior is verified where applicable;
- no unexplained context deviation remains.

---

## Failure / Escalation

Escalate when:

- expected behavior cannot be determined from approved context;
- tests reveal a likely context conflict;
- implementation requires violating an approved domain or API rule;
- environment failures prevent meaningful verification;
- a security-sensitive behavior cannot be confidently verified.
