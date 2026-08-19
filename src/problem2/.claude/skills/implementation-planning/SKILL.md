---
name: implementation-planning
description: "Use when planning a non-trivial Nocturne Swap change before implementation. Produces a context-aligned, testable plan and requires human approval before coding."
argument-hint: "Describe the feature, fix, or implementation scope to plan"
user-invocable: true
---

# Implementation Planning

## Purpose

Create an implementation plan that translates approved context into small,
verifiable engineering steps without redefining product, domain, architecture,
or design decisions.

## Procedure

1. Use the Context Loader skill to classify the task and load the required
   approved sources.
2. Confirm that the relevant context is internally consistent. Stop and report
   a material conflict rather than choosing a source by preference.
3. Inspect the existing implementation surface and identify the owning layers.
4. Break the work into ordered, minimal steps. State for each step:
   - target files or modules;
   - owning layer and decision source;
   - behavior to implement;
   - validation or test evidence.
5. Identify risks, dependencies, and decisions that require human approval.
6. Present the draft plan for human approval. Do not edit implementation files
   while acting only as the Planner.

## Required Constraints

- Do not invent requirements or architectural changes.
- Do not duplicate Domain formulas in Application, State, or Presentation.
- Do not turn a plan into implementation without explicit human approval.
- Keep the plan proportional to the requested change.

## Output

Return a concise plan with:

- context and decision sources used;
- ordered implementation steps;
- test and validation plan;
- assumptions, conflicts, or approval requests.
