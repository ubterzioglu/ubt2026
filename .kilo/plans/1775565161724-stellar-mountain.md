# Plan: Unify Key Achievements Card Style

## Problem
The Key Achievements section (`/html/body/main/section[5]`) renders achievements in two different styles:
- First 4 cards (`achievementHighlights`): Large cards with value, label, and detail
- Remaining 5 bullets (`achievementBullets`): Smaller, simpler cards

## Solution
Render all 9 achievements using the same card style as the first four.

## Changes Required

### File: `app/page.tsx` (lines 149-175)

**Current structure:**
```tsx
<div className="mt-8 grid gap-4 md:grid-cols-2">
  {achievementHighlights.map(...)}  // 4 large cards
  <div className="grid gap-3 md:grid-cols-2">
    {achievementBullets.map(...)}   // 5 smaller cards nested inside
  </div>
</div>
```

**New structure:**
```tsx
<div className="mt-8 grid gap-4 md:grid-cols-2">
  {[...achievementHighlights, ...achievementBullets].map((item) => (
    <article key={item.label} className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5">
      <p className="font-body text-4xl font-semibold text-ink">{item.value}</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">{item.label}</p>
      <p className="mt-3 text-sm leading-6 text-ink/66">{item.detail}</p>
    </article>
  ))}
</div>
```

## Summary
- Merge both arrays into a single grid
- All 9 cards will have identical styling with value, label, and detail
- Remove the nested grid wrapper for bullets
