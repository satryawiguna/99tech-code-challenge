---
name: implementation-planning
description: "Use after context review to translate approved Problem 5 decisions into an ordered implementation plan."
argument-hint: "Describe the implementation objective to plan"
user-invocable: true
---

# Implementation Planning Skill

## Purpose

Translate the approved Problem 5 engineering context into a concise, ordered implementation draft presented for human approval before implementation.

The draft describes how the approved system will be built without redefining the product, domain, architecture, API contract, or database design.

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

### 8. Present the Draft

Present a concise, ordered draft for human approval. Do not write or edit a plan file.

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

## Draft Format

Keep the draft concise and directly actionable:

```text
Context reviewed
Scope
Ordered steps
Target modules
Validation plan
Assumptions / risks
```

End with `Awaiting human approval`.

---

## Output

Present a concise, approval-ready draft in chat:

```text
Context reviewed
Scope
Ordered steps
Target modules
Validation plan
Assumptions / risks
```

End with `Awaiting human approval`. Do not write or edit a plan file.

---

## Validation

Before presenting the draft:

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
