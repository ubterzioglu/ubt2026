# Plan: Tech Stack Logo Integration

## Overview
Upgrade the Tech Stack section from text-only pills to logo-enhanced pills. The section should remain lightweight and readable while adding recognizable SVG marks for each technology.

---

## 1. Asset Preparation

**Files:** `public/tech-logos/`

### Changes:
- Create the `public/tech-logos/` directory.
- Add SVG assets for the current stack items, sourced from simpleicons.org:
  - `selenium.svg`
  - `ranorex.svg`
  - `java.svg`
  - `csharp.svg`
  - `python.svg`
  - `typescript.svg`
  - `jenkins.svg`
  - `docker.svg`
  - `git.svg`
  - `jira.svg`
  - `postman.svg`
  - `maven.svg`
  - `testng.svg`
  - `junit.svg`
  - `cucumber.svg`
  - `rest.svg`
  - `soapui.svg`
  - `xray.svg`
  - `polarion.svg`

---

## 2. Type Model Update

**Files:** `types/site.ts`

### Changes:
- Change `StackGroup.items` from `string[]` to `{name: string; logo?: string}[]`.
- Keep `logo` optional so items without an asset can still render.

### Target Shape
```ts
interface StackGroup {
  title: string;
  items: Array<{
    name: string;
    logo?: string;
  }>;
}
```

---

## 3. Content Data Update

**Files:** `content/profile.ts`

### Changes:
- Update `stackGroups` entries so each item becomes an object with `name` and `logo`.
- Point logos to the filenames stored in `public/tech-logos/`.
- Preserve the current group titles and grouping order.

---

## 4. Component Rendering Update

**Files:** `components/tech-stack.tsx`

### Changes:
- Update the pill renderer to support the new object-based item shape.
- Add the logo before the label text inside each pill.

### Target Structure
```tsx
<span className="inline-flex items-center gap-1.5 rounded-full ...">
  {item.logo && <img src={`/tech-logos/${item.logo}`} className="h-4 w-4" />}
  {item.name}
</span>
```

---

## Implementation Order

1. Create `public/tech-logos/` and add the SVG files.
2. Update `StackGroup` in `types/site.ts`.
3. Update `stackGroups` in `content/profile.ts`.
4. Refactor `components/tech-stack.tsx` to render logos and labels together.

---

## Notes

- `StackGroup` cleanup is also referenced in the cleanup plan, but the primary implementation belongs here.
- Run `npm run lint` and `npm run typecheck` after implementation.
