---
name: security-review
description: "Use when reviewing Problem 5 HTTP input, SQLite persistence, configuration, dependencies, or error handling for security risks."
user-invocable: true
---

# Security Review Skill

## Purpose

Perform a focused security review of the Support Ticket API within its approved
scope. This does not add authentication or authorization requirements.

## Inputs

- `context/architecture.md`, `context/api-contract.md`, and `context/database.md`;
- relevant configuration and changed implementation;
- relevant tests and dependency manifests.

## Procedure

1. Identify the security-sensitive surface changed or under review.
2. Verify external HTTP input is validated before use-case or persistence work.
3. Verify server-controlled fields (`id`, `createdAt`, `updatedAt`, and initial
   `status`) are never trusted from client input.
4. Verify SQLite statements are parameterized and schema constraints remain in
   place where applicable.
5. Verify error responses do not disclose stack traces, database details,
   configuration, or secrets.
6. Verify request-size limits, environment configuration, and secret handling.
7. Verify OpenAPI and Swagger exposure do not disclose internal-only data.
8. Inspect relevant dependency or configuration risks proportionately.
9. Report findings by severity and re-run relevant checks after remediation.

## Required Constraints

- Never commit secrets or hard-code environment-specific credentials.
- Do not weaken validation or error handling to simplify a change.
- Authentication and authorization remain out of scope unless approved context changes.
- Do not report an unsupported feature as a security requirement.

## Output

```text
Scope Reviewed:
Checks Performed:
Findings:
Required Remediation:
Status: PASS / PASS WITH MINOR ISSUES / CHANGES REQUIRED
```
