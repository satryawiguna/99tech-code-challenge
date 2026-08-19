---
name: context-review
description: "Use after context-loader to determine whether a Problem 5 task is aligned, ambiguous, conflicting, or out of scope."
argument-hint: "Describe the task or planned change to assess"
user-invocable: true
---

# Context Review Skill

## Purpose

Review and validate work against the approved Problem 5 engineering context before implementation, planning, testing, or review.

This skill ensures that AI agents understand the established decisions and do not silently redefine requirements, domain rules, architecture, API behavior, database behavior, or scope.

---

## When to Use

Use this skill when:

- starting a new implementation task;
- creating or reviewing an implementation plan;
- reviewing tests;
- reviewing code;
- investigating a potential implementation conflict;
- determining whether a proposed change is supported by the approved context.

Use it before making decisions that could affect externally observable behavior or architectural boundaries.

---

## Required Context

Use `context-loader` first to select the minimum governing documents. The
approved context is:

```text
src/problem5/context/
├── discovery.md
├── prd.md
├── domain.md
├── architecture.md
├── api-contract.md
└── database.md
```

Read the documents in dependency order when `context-loader` identifies that
the task requires broad context:

```text
Discovery
    ↓
PRD
    ↓
Domain
    ↓
Architecture
    ↓
API Contract
    ↓
Database Design
```

For a narrowly scoped task, use the source set selected by `context-loader`,
but do not skip an upstream document when its decision affects the task.

---

## Inputs

- current task or request;
- relevant source code, if implementation already exists;
- approved context documents;
- existing implementation plan, if one exists.

---

## Procedure

### 1. Identify the Task

Determine:

- what is being requested;
- which part of the system it affects;
- whether it changes behavior, structure, persistence, or testing;
- which context documents govern the work.

### 2. Read the Relevant Context

Read the applicable context documents.

Do not rely on memory or assumptions when the context contains the authoritative decision.

### 3. Extract Applicable Decisions

Identify:

- requirements;
- scope boundaries;
- domain rules;
- architectural boundaries;
- API behavior;
- persistence constraints;
- testing expectations;
- security expectations.

### 4. Check for Conflicts

Compare the requested work against the approved context.

Classify findings as:

```text
ALIGNED
AMBIGUOUS
CONFLICT
OUT OF SCOPE
```

### 5. Check Decision Ownership

Determine whether an unresolved point is:

- already decided by context;
- an implementation-level detail;
- a genuine product/domain/architecture decision.

Do not elevate ordinary implementation details into new architecture decisions unnecessarily.

### 6. Report the Result

Produce a concise context review containing:

```text
Context Reviewed
Applicable Decisions
Scope Constraints
Relevant Rules
Conflicts / Ambiguities
Required Escalations
```

---

## Rules

1. The approved context is the source of truth.
2. Do not silently modify approved context.
3. Do not invent requirements.
4. Do not treat implementation details as product requirements.
5. Do not expand scope without an explicit decision.
6. Preserve terminology used by the approved context.
7. If two approved documents appear to conflict, report the conflict instead of choosing silently.
8. Prefer the smallest implementation consistent with the approved context.

---

## Conflict Handling

If a conflict is found:

```text
Detected Conflict
      ↓
Identify Affected Context
      ↓
Explain Impact
      ↓
Propose Resolution
      ↓
Human Decision
      ↓
Update Context if Approved
```

Do not proceed with an implementation that knowingly violates an approved decision unless the task explicitly authorizes that change.

---

## Output

The skill should produce a context assessment suitable for the next agent.

Example:

```text
Status: ALIGNED

Applicable Context:
- PRD: Ticket update behavior
- Domain: mutable Ticket attributes
- API Contract: PATCH /api/v1/tickets/:id
- Database: tickets persistence

Scope:
- Within approved scope

Conflicts:
- None

Execution Guidance:
- Proceed with implementation planning
```

---

## Validation

Before completing the skill:

- relevant context documents were read;
- applicable decisions were identified;
- scope was checked;
- domain rules were checked;
- architecture boundaries were checked;
- API/database implications were checked where applicable;
- conflicts were explicitly reported.

---

## Failure / Escalation

Escalate to the human when:

- approved context contains conflicting decisions;
- the requested behavior is outside approved scope;
- implementation requires changing an approved product or architecture decision;
- the context does not provide enough information to make a safe decision;
- the task would materially change externally observable behavior.
