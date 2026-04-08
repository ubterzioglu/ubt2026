# Plan: Private Projects Layout Change

## Overview
Update the Private Projects section so it matches the structure and visual rhythm of the Corporate Projects section. The new layout should use stacked horizontal cards with optional project logos from the existing `public/private/` directory.

---

## 1. Layout Refactor

**Files:** `app/page.tsx:230-246`

### Changes:
- Change the section wrapper from a grid layout to `flex flex-col gap-4`.
- Update each project card to follow the same horizontal structure used by Corporate Projects.
- Preserve the existing project label, title, and summary content hierarchy.

### Target Structure
```tsx
<article className="flex flex-col gap-4 rounded-[1.35rem] border border-line/80 bg-white/82 p-5 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex-1 sm:pr-4">...</div>
  {project.image && (
    <Image
      src={`/private/${project.image}`}
      ...
      className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ..."
    />
  )}
</article>
```

---

## 2. Image Handling

**Files:** `app/page.tsx`, `content/profile.ts`

### Changes:
- Use the existing assets in `public/private/` such as `logoubtest.png` and `logoallin2min.png`.
- Keep image resolution logic pointed at `/private/`; do not introduce a new `public/ppimage/` directory.
- Continue using the existing `project.image` field from `privateProjects`.

---

## 3. Data Validation

**Files:** `content/profile.ts:193-236`

### Checks:
- Confirm each private project entry already includes the expected `image` field.
- Keep the current content shape unless an entry is missing an image, in which case the card must still render correctly without the image block.

---

## Implementation Order

1. Convert the Private Projects section wrapper to `flex flex-col gap-4`.
2. Refactor each `<article>` to match the Corporate Projects structure.
3. Wire project images to `/private/${project.image}`.
4. Verify projects without images still render cleanly.

---

## Notes

- This plan intentionally reuses the existing `public/private/` asset directory.
- Run `npm run lint` and `npm run typecheck` after implementation.
