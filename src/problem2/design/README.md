# UI Design Reference

This directory contains the UI reference exported from Claude Design.

## Source

The design was created specifically for Problem 2 — Fancy Form / Nocturne Swap.

## Primary Reference

Open:

`claude-design/Currency Swap.dc.html`

The exported HTML and its accompanying assets should be treated as a
single design artifact.

## Purpose

The design is the visual and interaction reference for frontend implementation.

It defines the intended:

- visual hierarchy;
- layout;
- spacing;
- typography;
- colors;
- component composition;
- interaction states;
- modal presentation;
- asset selector presentation;
- responsive intent where represented.

## Important

The design does not override:

- `../context/prd.md` for product requirements;
- `../context/domain.md` for business rules;
- `../context/architecture.md` for technical boundaries.

If a conflict is discovered, do not silently resolve it.
Report the conflict before implementation.

## Main UI States

1. Main swap form
2. Asset selector
3. Confirm swap
4. Swap complete

## Implementation Rule

The implementation should use the design as the primary visual and
interaction reference.

The implementation should preserve the design intent where it is
consistent with the approved PRD, domain rules, architecture, accessibility,
responsiveness, and technical constraints.

Reasonable deviations are allowed when they provide a clear improvement
or are required by product, domain, architectural, accessibility, or
technical constraints.

Any significant deviation from the design should be intentional and
justifiable.
