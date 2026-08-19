---
name: implementation-planning
description: "Use after context review to translate approved Problem 5 decisions into an ordered implementation plan."
argument-hint: "Describe the implementation objective to plan"
user-invocable: true
---

# Implementation Planning Skill

## Purpose

Translate the approved Problem 5 engineering context into a concrete, ordered implementation plan.

The plan describes how the approved system will be built without redefining the product, domain, architecture, API contract, or database design.

---

## When to Use

Use this skill when:

- the stable context has been approved;
- implementation work needs to be decomposed into executable tasks;
- dependencies and implementation order need to be defined;
- a new implementation area must be planned before coding.

Do not use this skill to redesign the approved architecture.

---

## Required Context

Read:

```text
src/problem5/context/
├── discovery.md
├── prd.md
├── domain.md
├── architecture.md
├── api-contract.md
└── database.md
```

Use `context-loader`, then:

```text
context-review
```

before producing the implementation plan.

---

## Inputs

- approved context;
- implementation objective;
- existing repository structure, if any;
- existing code, if any;
- technical constraints explicitly provided by the user.

---

## Procedure

### 1. Review Context

Confirm that the implementation objective is supported by the approved context.

Identify relevant:

- requirements;
- domain behavior;
- architectural layers;
- API contracts;
- persistence requirements;
- testing expectations.

### 2. Inspect Existing Project State

If implementation already exists, inspect:

- project structure;
- package configuration;
- source modules;
- tests;
- configuration;
- scripts;
- existing conventions.

Do not plan duplicate work that is already implemented correctly.

### 3. Establish Implementation Boundaries

Map requirements to implementation areas.

For example:

```text
Domain
    ↓
Application
    ↓
Interface / HTTP
    ↓
Infrastructure / Persistence
```

Use the architecture document as the authority for layer boundaries.

### 4. Define Implementation Phases

Break the work into logical phases.

Each phase should have:

- objective;
- prerequisites;
- tasks;
- affected files/modules;
- acceptance criteria;
- tests.

### 5. Define Task Dependencies

Tasks must be ordered according to actual technical dependencies.

Prefer:

```text
foundation
    ↓
domain
    ↓
application
    ↓
persistence
    ↓
HTTP/API
    ↓
tests
    ↓
documentation
```

Adjust the order when the actual project structure requires it.

### 6. Identify Implementation-Level Decisions

For each unspecified detail, determine whether it can be resolved during implementation.

Examples include:

- exact library choice;
- concrete file names;
- internal class/function structure;
- test framework configuration;
- identifier generation library.

Do not turn these into permanent context decisions unless they materially affect approved architecture or behavior.

### 7. Define Verification

Every meaningful implementation phase must have a verification method.

Examples:

```text
Domain behavior
→ unit tests

Repository behavior
→ persistence/integration tests

HTTP behavior
→ API/integration tests
```

### 8. Produce the Plan

The final plan should be actionable by an implementer without requiring architectural reinterpretation.

---

## Rules

1. The approved context is authoritative.
2. Planning must not redefine approved decisions.
3. Prefer the smallest implementation that satisfies the context.
4. Avoid unnecessary dependencies and infrastructure.
5. Do not introduce speculative abstractions.
6. Every task should have a clear completion condition.
7. Dependencies must be explicit where ordering matters.
8. Implementation details may be decided during execution when they do not affect approved context.
9. If planning discovers a genuine context conflict, stop and escalate.
10. Keep the plan proportional to the Problem 5 challenge scope.

---

## Recommended Plan Structure

```markdown
# Implementation Plan

## 1. Objective

## 2. Context References

## 3. Implementation Strategy

## 4. Phases

### Phase 1 — Project Bootstrap

### Phase 2 — Domain

### Phase 3 — Application

### Phase 4 — Persistence

### Phase 5 — API

### Phase 6 — Testing

### Phase 7 — Documentation

## 5. Dependencies

## 6. Acceptance Criteria

## 7. Risks / Escalations
```

The exact phases may differ if the repository already contains implementation.

---

## Output

Produce:

```text
planning/implementation-plan.md
```

The plan should contain:

- implementation phases;
- ordered tasks;
- dependencies;
- affected modules/files;
- acceptance criteria;
- test requirements;
- known implementation-level decisions;
- risks or escalations.

---

## Validation

Before finalizing the plan:

- all relevant context was reviewed;
- every task maps to an approved requirement or implementation need;
- no task introduces an unauthorized feature;
- architecture boundaries are respected;
- API behavior matches the API contract;
- persistence tasks match the database design;
- testing tasks cover important behavior;
- task dependencies are coherent;
- the plan is proportional to the challenge.

---

## Failure / Escalation

Escalate when:

- implementation requires changing an approved architectural decision;
- the API contract is insufficient or contradictory;
- database design conflicts with the API/domain;
- the requested scope exceeds the approved product scope;
- an implementation decision materially changes externally observable behavior.
