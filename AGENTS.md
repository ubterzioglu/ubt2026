# AGENTS.md

## Project Overview

Personal portfolio site for UBT (Umut Barış Terzioğlu), built with **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 3**, and **Supabase** as the data backend. Deployed via Docker (standalone output).

## Build / Lint / Typecheck Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (zero warnings allowed: --max-warnings=0)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
```

**Always run `npm run lint` and `npm run typecheck` after making changes.** Both must pass with zero errors.

There is no test framework configured. No test runner, no test files, and no test-related dependencies exist in this project.

## Project Structure

```
app/              # Next.js App Router pages, layouts, globals.css
components/       # Reusable React components (PascalCase .tsx)
content/          # Static/fallback content data (site metadata, profile, featured items)
lib/              # Utility functions and data-fetching logic (Supabase client)
types/            # Shared TypeScript interfaces and type definitions
supabase/         # Database migrations and seed SQL
public/           # Static assets (images, favicons)
```

Paths alias: `@/*` maps to project root.

## Code Style Guidelines

### TypeScript

- **Strict mode** enabled (`strict: true` in tsconfig). No `any` types.
- Use `interface` for object shapes, `type` for unions/intersections.
- Prefer `as const` for literal arrays/objects that should be narrowed (see `content/site.ts`, `content/profile.ts`).
- Use `satisfies` when you need type checking without widening (see `app/page.tsx` contact icon map).
- Use `Readonly<>` for component props that should not be mutated.
- Target: ES2017, module: esnext, moduleResolution: bundler.

### Imports

- Use `@/` path alias for all intra-project imports (e.g., `@/types/site`, `@/components/hero-section`).
- Group imports: (1) external packages, (2) `@/` internal imports, (3) relative imports.
- Separate groups with a blank line (see `app/page.tsx` for the canonical style).
- Import React types with `import type { ... } from "react"` (or inline `import type { ReactNode }`).
- Never use default React import; Next.js handles JSX transform automatically.

### Components

- Use **named function exports** (not default exports) for components: `export function HeroSection()`.
- Exception: page components in `app/` use `export default function PageName()`.
- Add `"use client"` directive only when state, effects, or event handlers are needed (see `site-header.tsx`, `scroll-to-top.tsx`).
- Keep components as server components by default.
- Props interfaces defined above the component in the same file.
- Component files are PascalCase: `hero-section.tsx`, `featured-grid.tsx`.

### Naming Conventions

- **Files**: kebab-case for all files (`featured-items.ts`, `scroll-to-top.tsx`).
- **Components**: PascalCase (`HeroSection`, `FeaturedGrid`).
- **Types/Interfaces**: PascalCase (`FeaturedItem`, `SectionShellProps`).
- **Constants**: camelCase for objects (`siteMeta`, `navigationItems`), UPPER_SNAKE_CASE for const arrays used as enum-like values (`SECTION_IDS`).
- **CSS custom properties**: kebab-case (`--accent-soft`, `--font-display`).
- **Tailwind theme keys**: camelCase (`accentSoft`, `fontDisplay`).

### Styling (Tailwind CSS)

- Use Tailwind utility classes exclusively. No inline styles, no CSS modules.
- Custom design tokens defined as CSS variables in `globals.css` (`:root` block).
- Tailwind theme extensions in `tailwind.config.ts` map to these CSS variables using `rgb(var(--name) / <alpha-value>)` pattern for opacity support.
- Use semantic color names from the theme: `text-ink`, `bg-paper`, `text-accent`, `border-line`, `bg-mist`, `text-sunrise`.
- Use `font-body` and `font-display` for typography (Manrope and Newsreader respectively).
- Component-level CSS classes live in `globals.css` under `@layer components` (`.page-shell`, `.section-panel`, `.accent-dot`).
- Responsive design: mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints.

### Error Handling

- Supabase calls: wrap in try/catch, return a fallback result object with an error source state (see `lib/featured-items.ts`).
- Never throw from data-fetching functions that serve page rendering; always return a safe default.
- Use discriminated union or tagged literal types for state tracking (`SourceState = "remote" | "env-missing" | "empty" | "error"`).

### Data Layer

- Supabase is the primary data source for featured items (tools, articles, bookmarks, apps).
- Fallback data lives in `content/featured.ts` and is used when Supabase is unavailable.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`). See `.env.local.example`.
- Database rows use `snake_case`; map to `camelCase` in TypeScript via transform functions (`toFeaturedItem` in `lib/featured-items.ts`).

### Next.js Configuration

- `typedRoutes: true` — route refs are type-checked.
- `output: "standalone"` — optimized for Docker deployment.
- No API routes or middleware currently.
- `next.config.ts` uses TypeScript (not JS).

### ESLint

- Extends `next/core-web-vitals`.
- Zero warnings policy enforced via `--max-warnings=0`.

### Docker

- Multi-stage build (base → deps → builder → runner).
- Node 20 Alpine, non-root user in production stage.
- Health check on port 3000.

### General Rules

- No comments in code unless explicitly asked.
- No emojis in code or UI text.
- Keep components focused and small; extract reusable pieces into `components/`.
- Content data (profile info, featured items, navigation) belongs in `content/`, not hardcoded in components.
- Type definitions shared across files go in `types/`.
- Data-fetching and external service logic goes in `lib/`.
- Do not modify files in `firmascope/` or `ubterzioglude/` (excluded from tsconfig).
