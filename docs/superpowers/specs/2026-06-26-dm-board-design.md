# Move task board to `/dm` + dark ultra-premium redesign

**Date:** 2026-06-26
**Status:** Approved

## Goal

The project task board currently lives at `/admin/tasks` as part of the
appointment-admin section. Move it to its own standalone route `/dm`
(`ubterzioglu.de/dm`), fully decoupled from `/admin`, and redesign the board UI
to the same dark, ultra-premium aesthetic already used by the board's sign-in
gate (`DarkAdminGate`).

## Decisions

- New standalone route `app/dm/page.tsx`. No dependency on `/admin`.
- `/admin/tasks` is **deleted** (returns 404). No redirect.
- All task-board references **removed** from `/admin`: the "Görev panosu"
  button, the "Açık görev" stat card, and the `getAllProjectTasksAdmin` fetch.
- The two task server actions move out of `app/admin/_actions.ts` into a new
  `app/dm/_actions.ts`, so the admin actions file no longer mentions tasks.
- Board list/form/header UI **redesigned dark + ultra-premium** to match the
  existing `DarkAdminGate` visual language.
- `dmgorsel/hero.png` is **out of scope** (not served from `public/`).

## Architecture

### 1. New route — `app/dm/page.tsx`
Port the logic from `app/admin/tasks/page.tsx` verbatim (server-action CRUD,
status/priority parsing, owner→category grouping, filters, stats), changing
only:
- Every `/admin/tasks` URL string → `/dm` (auth redirects, `filterHref`,
  `?edit=`, `?created=1`, `?updated=1`).
- Remove the "Panoya dön" (back-to-admin) button. Keep "Çıkış yap".
- Replace light `page-shell` / `section-panel` markup with self-contained dark
  theme markup (see UI section).
- Auth still gates via `AdminGate variant="dark"`; `signInAction` points at the
  relocated `tasksSignInAction`.

### 2. Auth — `lib/admin-auth.ts`
Task-board cookie (`TASKS_ADMIN_ACCESS_COOKIE`) currently uses
`path: "/admin"`. Change its **set** (line ~115) and **delete** (line ~127) to
`path: "/dm"` so the browser sends it on `/dm`. The appointment-admin cookie
(`ADMIN_ACCESS_COOKIE`, lines ~74/~86) is left untouched. The key and env var
(`DESIREMAPTODO_ADMIN_ACCESS_KEY`, with the `APPOINTMENT_ADMIN_ACCESS_KEY`
fallback) are unchanged — only the cookie path moves.

### 3. New actions file — `app/dm/_actions.ts`
Move `tasksSignInAction` and `tasksSignOutAction` here. Both redirect to `/dm`
(was `/admin/tasks`). They keep re-validating via `signInTasksAdmin` /
`signOutTasksAdmin` from `lib/admin-auth`.

### 4. `app/admin/_actions.ts`
- Remove `tasksSignInAction` and `tasksSignOutAction`.
- Remove `signInTasksAdmin` / `signOutTasksAdmin` from the import.
- Remove `/admin/tasks` from the `ADMIN_PATHS` tuple.

### 5. `app/admin/page.tsx`
Remove: the `getAllProjectTasksAdmin` import and its entry in the
`Promise.all`, the `openTasks` derivation, the "Açık görev" stat card, and the
"Görev panosu" link. Change the stat grid from `xl:grid-cols-7` → `xl:grid-cols-6`.

### 6. Delete `app/admin/tasks/`
Remove the directory and its `page.tsx`.

## Dark ultra-premium board UI

Same visual language as `DarkAdminGate`:
- Base `bg-[#070b10]`; layered radial accent/sunrise glows; fine grid texture
  with a radial mask; floating `animate-float` / `animate-drift` accent orbs;
  `animate-reveal` entrance.
- **Header**: glass bar with the "D / DesireMap · Todo Dashboard" brand lockup
  and a "Secure" pulse pill; "Çıkış yap" as a subtle outlined dark button.
- **Stat cards** (Toplam görev / Bitti / İlk 5 / Sorumlu): glass tiles
  (`bg-[#0b1118]/85`, gradient border, `backdrop-blur`), large white numerals,
  accent uppercase labels.
- **Add/Edit form**: dark glass panel; inputs use the gate's input treatment
  (`bg-white/[0.04]`, `border-white/10`, accent focus ring, white text);
  selects/textarea match; accent-gradient submit button.
- **Filter chips** (owner/status): pills — active = accent gradient, idle =
  `border-white/10 bg-white/[0.04] text-white/70`.
- **Task list**: per-owner → per-category glass cards. Status/priority badges
  recolored for dark using translucent tinted fills
  (e.g. `bg-emerald-400/10 text-emerald-300`). Done rows dimmed + strikethrough
  (as today). Inline status `<select>` + Düzenle/Sil buttons restyled dark.

All styling is inline in `app/dm/page.tsx` (self-contained like the gate). No
changes to `globals.css` or the `section-panel` layer. Reuses existing Tailwind
tokens (`accent`, `sunrise`) and animations (`float`, `drift`, `reveal`) already
in `tailwind.config.ts`.

## Out of scope / unchanged
- Data layer `lib/project-tasks.ts`, task types in `types/site`, CRUD behavior,
  filtering/grouping logic.
- The gate's appearance (`DarkAdminGate`).
- Env var name and value.
- `dmgorsel/hero.png`.

## Error handling
Each server action re-verifies `isTasksAdminAuthenticated()` before mutating and
redirects to `/dm` if not authenticated — preserved exactly from the current
implementation.

## Verification
- `npm run build` — `/dm` route compiles; no broken `next` typed-route
  references after removing `/admin/tasks` from `ADMIN_PATHS`.
- Manual: visiting `/dm` shows the dark gate → correct key signs in → board
  loads dark → create/edit/inline-status/delete all work and stay on `/dm` →
  `/admin/tasks` returns 404 → `/admin` shows no task button, no "Açık görev"
  card, 6-column stat grid.
