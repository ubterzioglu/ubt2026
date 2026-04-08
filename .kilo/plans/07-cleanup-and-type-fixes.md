# Plan: Cleanup and Type Fixes

## Overview
Handle the remaining cleanup items that are not large enough for their own feature plan but still matter for consistency, type safety, and stale section removal. This plan also tracks cross-plan cleanup that should be validated after related work lands.

---

## 1. `types/site.ts` Cleanup

**Files:** `types/site.ts`

### Changes:
- Remove `useful-apps` from `SECTION_IDS`.
- Merge the duplicated `ExperienceItem` definitions (currently listed twice).
- Validate the `StackGroup` type update for logo support.

### Cross-Plan Note
- `StackGroup` logo support is implemented primarily via the Tech Stack logo integration plan.
- This cleanup plan should confirm the final type shape remains coherent after that work is done.

---

## 2. `lib/featured-items.ts` Cleanup

**Files:** `lib/featured-items.ts`

### Changes:
- Remove the `apps` category from `defaultCollections` if it is still present.

### Cross-Plan Note
- Treat this as a residual cleanup check following the earlier removal of the `useful-apps` section.

---

## 3. Verification Pass

### Checks:
- Confirm `SECTION_IDS` reflects the current homepage sections only.
- Confirm there is only one `ExperienceItem` definition.
- Confirm `StackGroup` matches the object-based item shape introduced by the Tech Stack work.
- Confirm `defaultCollections` no longer includes obsolete `apps` handling.

---

## Implementation Order

1. Clean up `SECTION_IDS`.
2. Merge the duplicate `ExperienceItem` definitions.
3. Validate `StackGroup` after the Tech Stack logo changes are in place.
4. Remove any stale `apps` collection handling in `lib/featured-items.ts`.

---

## Notes

- This file stays standalone and should not be folded into the feature plans, even when items overlap them.
- Run `npm run lint` and `npm run typecheck` after implementation.
