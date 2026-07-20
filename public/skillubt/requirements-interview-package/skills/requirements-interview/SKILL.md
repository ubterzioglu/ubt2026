---
name: requirements-interview
description: Use when a user pitches a new product, app, website, or feature in a sentence or two and wants to start building right away — before scaffolding or writing any code, interview them with a scaled batch of detailed questions and turn the answers into a spec document that becomes the primary context for implementation.
---

# Requirements Interview

## Overview

A one-line pitch hides a hundred unstated decisions. Left unstated, you fill them with defaults — and the defaults are usually wrong in some detail the user cared about. This skill front-loads those decisions: interview the user with a batch of concrete questions scaled to the project's scope, then compile their answers into a spec document that becomes the main context for every subsequent build step.

**Core principle:** the value isn't the question count — it's writing down decisions *before* code exists, so building doesn't quietly re-decide them one file at a time.

## When to Use

Use when:
- User pitches a new app/website/product/feature in a sentence or two and says "let's build it" / "start building" / "let's start"
- Greenfield work where requirements exist only in the user's head
- The idea is vague enough that three different implementations would all technically satisfy it

Don't use when:
- User already supplied a detailed spec, PRD, or design doc
- It's a small, well-bounded change to existing code (a bug fix, one endpoint, one component)
- User explicitly says to skip questions and go with defaults

If mid-interview the user says to skip ahead, stop and build with stated assumptions — don't insist on finishing the batch.

## Workflow

1. **Scope the batch.** Estimate question count from project size — a script or single page needs ~10-15, a multi-user app needs 30-50+. Don't pad to hit a round number; don't compress a genuinely complex idea into 10 questions either.
2. **Ask in one batch, grouped by category**, not one-at-a-time. Cover, as they apply:
   - **Goals & purpose** — problem being solved, why now, what success looks like
   - **Users** — who they are, how many, technical skill level, how they'll access it
   - **Core features** — the must-have list, explicitly separated from nice-to-haves
   - **Design/UX** — visual style references, tone, accessibility needs, mobile vs desktop
   - **Technical constraints** — existing stack to integrate with, hosting target, budget, timeline
   - **Data & integrations** — what data is stored, third-party services/APIs, auth needs
   - **Edge cases & failure modes** — what happens when things go wrong, empty states, abuse/misuse
   - **Non-goals** — what this explicitly will NOT do (as important as what it will)
3. **Let the user answer loosely.** Partial answers, "you decide" for some items, and skipped questions are fine — note them as open assumptions rather than blocking on them.
4. **Compile a spec document** from the answers (see Output below). Surface any question the user skipped as an explicit assumption, so it's visible rather than silently baked in.
5. **Confirm the spec** with the user before implementing — a short "here's what I heard, correct anything wrong" pass.
6. **Use the spec as primary context** for planning and implementation — pass it to planner/architect agents or keep it open as the reference doc for the whole build, not just the first message.

## Output: The Spec Document

Write the compiled answers to a real file (e.g. `SPEC.md` in the project root), not just as chat text — it needs to survive context compaction and be referenceable across the whole build.

Structure:
```markdown
# [Project Name] — Spec

## Goal
[one paragraph: what and why]

## Users
[who, how many, skill level]

## Features (v1 / must-have)
- ...

## Explicitly out of scope
- ...

## Design & UX
[style, references, accessibility]

## Technical constraints
[stack, hosting, integrations, budget/timeline]

## Data & edge cases
[data model highlights, failure modes, empty states]

## Open assumptions
[anything the user skipped or said "you decide" — call these out so they're visible, not silent defaults]
```

## Quick Reference

| Project size | Question count | Example |
|---|---|---|
| Script / CLI tool | 8-12 | data cleanup script, small automation |
| Single-page app / landing page | 12-20 | portfolio site, waitlist page |
| Multi-page app, single user role | 20-35 | recipe sharing app, todo app |
| Multi-role platform / marketplace | 35-50+ | two-sided marketplace, SaaS with billing |

## Common Mistakes

- **Asking 4 questions and calling it done.** "Tech stack? Features? Deploy target? Database?" is a developer checklist, not a requirements interview — it misses goals, users, design, edge cases, and non-goals entirely.
- **Offering an immediate skip-the-questions escape hatch as the default framing.** It's fine if the user chooses to skip, but don't structure the pitch so skipping is the path of least resistance.
- **Asking one question at a time.** Burns turns and loses the user's attention. Batch by category.
- **Leaving answers in chat only.** If it's not written to a spec file, it won't survive to the implementation phase — you'll re-derive or silently redecide the same details.
- **Treating the spec as done after v1.** Update it when the user changes their mind mid-build; it should stay the living reference, not a one-time artifact.
