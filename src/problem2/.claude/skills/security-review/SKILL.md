---
name: security-review
description: "Use when reviewing Problem 2 external data handling, environment configuration, client-side security, and simulated swap semantics for security risks."
---

# Security Review Skill

## Purpose

Perform a focused security review of the frontend implementation while
respecting the fact that Problem 2 is a simulated frontend challenge.

## Inputs

- `context/architecture.md`
- Relevant `context/prd.md`
- Relevant implementation.
- Environment/configuration files.
- Build/runtime configuration.

## Procedure

1. Identify the changed security-sensitive surface.
2. Inspect environment and configuration handling.
3. Check for secrets or credentials exposed to client-side code.
4. Check external-data handling and response validation.
5. Check unsafe rendering or injection risks.
6. Check client-side persistence and sensitive-data handling where applicable.
7. Check simulated transaction and balance semantics.
8. Check that implementation does not falsely present simulated behavior as
   real blockchain execution.
9. Report findings by severity.
10. Re-run relevant tests/checks after remediation.

## Required Constraints

- Never commit secrets.
- Never expose server-only credentials to client-side code.
- Do not treat simulated balances as real wallet balances.
- Do not present simulated transaction identifiers as real blockchain hashes.
- Do not imply that the challenge price feed represents executable market
  liquidity.
- Validate external response shape/schema before using it in business
  calculations.
- Do not weaken security controls merely to simplify implementation.

## Review Areas

Check, where applicable:

- environment variables;
- public vs server-only configuration;
- external API responses;
- URL handling;
- HTML/content rendering;
- user-controlled input;
- dependency/configuration risks;
- simulated transaction messaging;
- client-side data exposure.

## Output

Report:

- Scope reviewed.
- Checks performed.
- Findings by severity.
- Remediation required.
- Final status:
  - Pass
  - Pass with minor issues
  - Changes required

This skill does not replace a dedicated security audit when one is explicitly
required.
