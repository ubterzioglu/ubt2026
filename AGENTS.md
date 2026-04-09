# AGENTS.md

## Project Overview

Personal portfolio site for UBT (Umut Barış Terzioglu), built with **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 3**, and **Supabase** as the data backend. Features an appointment booking system, CV review request intake, email notifications via Resend, and a key-gated admin dashboard. Deployed via Docker (standalone output).

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
  admin/          # Admin dashboard (appointments, slots, cv-reviews) — key-gated
  book-appointment/ # Redirect-only page → /#book-appointment
components/       # Reusable React components (PascalCase .tsx)
  appointment/    # BookingForm, SlotSelector
content/          # Static/fallback content data (site metadata, profile, featured items)
lib/              # Utility functions, data-fetching, mutations (Supabase + Resend)
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
- All `lib/` files that access Supabase or external APIs must begin with `import "server-only"`.

### Components

- Use **named function exports** (not default exports) for components: `export function HeroSection()`.
- Exception: page components in `app/` use `export default function PageName()`.
- Add `"use client"` directive only when state, effects, or event handlers are needed (see `site-header.tsx`, `scroll-to-top.tsx`).
- Keep components as server components by default.
- Props interfaces defined above the component in the same file.
- Component files are PascalCase: `hero-section.tsx`, `featured-grid.tsx`.
- Server components may receive server actions as props (`action: (formData: FormData) => Promise<void>`). See `components/appointment/booking-form.tsx`.

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
- Use discriminated union or tagged literal types for state tracking. All domains use the same shape: `"remote" | "env-missing" | "empty" | "error"`. See `AppointmentSourceState` in `types/appointment.ts`.

### Data Layer

- Supabase is the primary data source for all dynamic data (featured items, appointment slots, appointments, CV review requests).
- Fallback data lives in `content/featured.ts` (featured items only).
- **Two Supabase client patterns:**
  - Anon/public key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`): used only for public reads like featured items.
  - Service role key (`SUPABASE_SERVICE_ROLE_KEY`): used for all mutations and admin reads in `lib/appointments.ts` and `lib/cv-reviews.ts`. Bypasses RLS — validation must happen at the lib layer.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `SUPABASE_SERVICE_ROLE_KEY`. See `.env.local.example`.
- Service role clients use `persistSession: false, autoRefreshToken: false`.
- Database rows use `snake_case`; map to `camelCase` in TypeScript via transform functions (e.g., `toAppointmentSlot`, `toCvReviewRequest`). Canonical pattern: one transform function per table in the lib file.
- If env vars are absent, `getSupabaseEnv()` returns `null` and callers return `source: "env-missing"` — never throw.

### Server Actions

- Server actions are defined inline in page files (`app/page.tsx`), not in separate `actions.ts` files.
- Use `revalidatePath` (from `next/cache`) and `redirect` (from `next/navigation`) inside server actions after mutations.
- Input validation (regex patterns, normalizers) lives in the lib file, not in the server action.
- No external schema validation library (no Zod). Inline regex validators in lib files.

### Next.js 15 Async APIs

- `searchParams` in page components is a `Promise` — always `await` it:
  ```tsx
  const params = searchParams ? await searchParams : {};
  ```
- See `app/page.tsx` and `app/admin/page.tsx` for the canonical pattern.

### Email (Resend)

- `lib/email.ts` sends via direct `fetch` to `https://api.resend.com/emails` — no Resend SDK.
- If `RESEND_API_KEY` is absent, returns `state: "skipped"` silently.
- Uses `Idempotency-Key: appointment-{id}` header to prevent duplicate sends.
- Email is fire-and-forget: a send failure does not fail the booking flow.

### Admin Dashboard

- Route: `/admin` with sub-routes `/admin/appointments`, `/admin/slots`, `/admin/cv-reviews`.
- Access gated by `?access=<key>` query param checked against `APPOINTMENT_ADMIN_ACCESS_KEY` env var.
- **If `APPOINTMENT_ADMIN_ACCESS_KEY` is unset, admin is open to all requests.** Always set this in production.
- No sessions, cookies, or middleware involved.

### URL Utilities

- `lib/appointment-url.ts`: builds `/?status=...&message=...&slot=...#book-appointment` feedback URLs.
- `lib/cv-review-url.ts`: builds CV review feedback URLs and WhatsApp deep links.
- `/book-appointment` route is a redirect-only page — it forwards all query params to `/#book-appointment`. Do not add content there.

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

## Environment Variables

| Variable | Where | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients | Yes | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public/anon reads | Yes | Legacy alias: `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/appointments.ts`, `lib/cv-reviews.ts` | For mutations | Server-only. Bypasses RLS. Never expose client-side. |
| `RESEND_API_KEY` | `lib/email.ts` | Optional | If absent, email silently skipped |
| `APPOINTMENT_NOTIFICATION_TO` | `lib/email.ts` | Optional | Recipient address for booking alerts |
| `APPOINTMENT_NOTIFICATION_FROM` | `lib/email.ts` | Optional | Defaults to `onboarding@resend.dev` |
| `APPOINTMENT_NOTIFICATION_REPLY_TO` | `lib/email.ts` | Optional | Defaults to booker's email |
| `APPOINTMENT_ADMIN_ACCESS_KEY` | `lib/appointments.ts` | **Required in prod** | If unset, admin is open to all |

## Key Exemplar Files

| Pattern | File |
|---|---|
| Supabase service-role client + SourceState pattern | `lib/appointments.ts` |
| Server action + revalidate + redirect inline in page | `app/page.tsx` |
| SourceState discriminated union type | `types/appointment.ts` |
| Admin key-gate pattern | `app/admin/page.tsx` |
| Email via Resend (raw fetch, idempotency) | `lib/email.ts` |
| URL utility / feedback param builder | `lib/appointment-url.ts` |
| Server component receiving server action as prop | `components/appointment/booking-form.tsx` |
| `as const` + `satisfies` patterns | `content/site.ts`, `content/profile.ts` |
