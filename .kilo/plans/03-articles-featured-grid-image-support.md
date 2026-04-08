# Plan: Articles FeaturedGrid Image Support

## Overview
Extend the shared featured card system so article cards can render a visual area at the top. When image data exists, the card should display it. When it does not, the card should fall back to a gradient placeholder.

---

## 1. Type Updates

**Files:** `types/site.ts`

### Changes:
- Add `imageUrl?: string | null` to the `FeaturedItem` interface.
- Keep the field optional to preserve compatibility with existing collections that do not provide image data.

---

## 2. Data Mapping Updates

**Files:** `lib/featured-items.ts`

### Changes:
- Add `image_url` to `SupabaseFeaturedRow`.
- Update `toFeaturedItem` to map `image_url` to `imageUrl`.
- Ensure the transform still returns valid fallback data when the remote field is empty or missing.

---

## 3. FeaturedGrid UI Update

**Files:** `components/featured-grid.tsx`

### Changes:
- Add an image area to the top of each card.
- Render:
  - an actual image when `item.imageUrl` is available
  - a gradient placeholder when it is not
- Keep the content order as:
  - image area
  - badge
  - title
  - summary

### Rendering Rules
- Image container:
  - `aspect-video overflow-hidden rounded-t-[1.3rem]`
- Fallback placeholder:
  - `aspect-video bg-gradient-to-br from-accent/15 to-sunrise/15`

---

## 4. Compatibility Expectations

### Notes:
- The shared grid should keep working for non-article content even if image data is absent.
- The visual addition should not require a separate articles-only grid component.

---

## Implementation Order

1. Update `FeaturedItem` in `types/site.ts`.
2. Add `image_url` handling in `lib/featured-items.ts`.
3. Refactor `components/featured-grid.tsx` to render the image area and placeholder state.
4. Verify existing collections still render correctly with missing images.

---

## Notes

- This plan is limited to image support in the shared featured card system.
- Run `npm run lint` and `npm run typecheck` after implementation.
