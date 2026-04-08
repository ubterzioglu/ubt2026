# Plan: Bookmarks Supabase Upgrade

## Overview
Move bookmarks from a fallback-only model into a dedicated Supabase-backed flow. The upgrade should preserve the existing content while enabling structured fields such as category, tags, publishing state, and sorting.

---

## 1. Migration

**Files:** `supabase/migrations/003_bookmarks.sql`

### Changes:
- Create `supabase/migrations/003_bookmarks.sql`.
- Include fields for:
  - `title`
  - `summary`
  - `url`
  - `category`
  - `tags[]`
  - `is_published`
  - `sort_order`

---

## 2. Existing Data Export

**Files:** `content/featured.ts`

### Changes:
- Export the current bookmark fallback data from `content/featured.ts`.
- Keep the exported shape usable for migration input and local fallback behavior.

---

## 3. Seed or Insert Preparation

**Files:** migration-related SQL or supporting seed material

### Changes:
- Prepare an SQL insert script for the existing bookmarks.
- Ensure the initial Supabase dataset matches the current visible bookmark content.

---

## 4. Data Fetching Update

**Files:** `lib/featured-items.ts`

### Changes:
- Add a bookmarks-specific fetch function in `lib/featured-items.ts`.
- Support filtering by:
  - category
  - tags
- Keep fallback behavior safe if Supabase data is unavailable.

---

## 5. Optional UI Enhancement

**Files:** relevant bookmark rendering surface

### Optional Change:
- Add category filter UI on the frontend if the upgraded data shape is exposed in the interface.

---

## Implementation Order

1. Create `supabase/migrations/003_bookmarks.sql`.
2. Export existing bookmark fallback data from `content/featured.ts`.
3. Prepare the SQL insert script.
4. Add the bookmarks-specific fetch logic in `lib/featured-items.ts`.
5. Add category filter UI only if it improves the current section without unnecessary complexity.

---

## Notes

- The filter UI is optional; the migration and data-layer work are the core scope.
- Run `npm run lint` and `npm run typecheck` after implementation.
