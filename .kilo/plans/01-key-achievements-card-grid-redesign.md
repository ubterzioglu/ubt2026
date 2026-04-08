# Plan: Key Achievements Card Grid Redesign

## Overview
Redesign the Key Achievements section from a simple text list into a responsive card grid. Each card should pair achievement text with a visual placeholder so the section feels more structured and consistent with the rest of the homepage.

---

## 1. Component Creation

**Files:** `components/achievement-card.tsx`

### Changes:
- Create `components/achievement-card.tsx` for a reusable achievement card.
- The card should render:
  - a top visual area using `aspect-square rounded-2xl`
  - a bottom text area with the achievement content
- Use a static placeholder treatment for now instead of remote images.

### Visual Structure
```tsx
<article>
  <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/20 to-sunrise/20" />
  <div className="p-4 text-sm">{achievement.text}</div>
</article>
```

---

## 2. Data Shape Updates

**Files:** `content/profile.ts`, `types/site.ts`

### Changes:
- Update `keyAchievements` in `content/profile.ts` to support an `image` field (`string | undefined`).
- Update the `AchievementItem` type in `types/site.ts` to include the optional image property.
- Keep the field optional so the section works with the placeholder strategy even when no image is supplied.

---

## 3. Page Integration

**Files:** `app/page.tsx:154-171`

### Changes:
- Remove the current `<ul>`-based list in the Key Achievements section.
- Replace it with a responsive grid that renders `<AchievementCard>`.
- Use this grid layout:
  - `grid-cols-1`
  - `sm:grid-cols-2`
  - `lg:grid-cols-3`

---

## 4. Image Strategy

### Decision:
- Use a static visual placeholder instead of dynamic image sourcing.
- Apply `bg-gradient-to-br from-accent/20 to-sunrise/20` in the image area for visual consistency.
- Keep the `image` field in the data model so real images can be introduced later without another type redesign.

---

## Implementation Order

1. Create `components/achievement-card.tsx`.
2. Update `AchievementItem` in `types/site.ts`.
3. Extend `keyAchievements` in `content/profile.ts`.
4. Replace the existing Key Achievements list in `app/page.tsx` with the new card grid.

---

## Notes

- This plan only covers the Key Achievements redesign.
- Run `npm run lint` and `npm run typecheck` after implementation.
