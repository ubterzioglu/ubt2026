# detrbridge Logo Seçimi Paneli Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new standalone, single-password-gated board at `/detrbridge` with a left sidebar (currently one item) whose first panel, "Logo Seçimi", lets the user upload logo candidates, name them, rate them 1-5 stars, and mark exactly one as "seçildi".

**Architecture:** Follows the exact `/detr` and `/dm` conventions already in this codebase: a cookie-based single-password gate added to `lib/admin-auth.ts`, a service-role Supabase data layer (no direct Postgres, RLS on with no policies), private Storage bucket with signed URLs, and a server-component page with inline server actions (no client-side JS/state).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@supabase/supabase-js`, Tailwind classes (utility-only, no new deps).

## Global Constraints

- Auth env var name is exactly `DETRBRIDGE` (already present in `.env.local`, value already set by the user) — do not rename it or introduce `DETRBRIDGE_PASSWORD`.
- Cookie name: `ubt_detrbridge_access`, scoped to `path: "/detrbridge"`.
- Fail-closed: if `DETRBRIDGE` is unset/empty, the gate must never authenticate anyone.
- Sign-out must re-set the cookie with identical attributes (`httpOnly`, `sameSite: "lax"`, `secure` in prod, same `path`) and `maxAge: 0` — never use `cookies().delete()`.
- Max attachment size: 10 MB (matches `/detr`). No MIME-type restriction (matches `/detr` — confirmed with user).
- Rating: integer 1-5 only.
- Selection ("seçildi") is manual and independent of rating; selecting one row must clear `is_selected` on every other row in the same operation.
- All DB access via service-role Supabase client; RLS enabled with **no** anon/authenticated policies.
- No test framework exists in this repo (verified: no `.test.`/`.spec.` files, no test runner in `package.json`). Verification is `npm run typecheck`, `npm run lint`, `npm run build` — matching how `/detr` and `/dm` were verified. This plan uses that same verification method instead of unit tests.
- DB migration is written in this plan but **applied by the user's collaborator (Claude) in a follow-up step outside this plan** per existing project convention ([[handle-supabase-sql-migrations]]) — actually, per plan execution, the assistant applies migrations directly using the Supabase MCP/CLI once this plan reaches that task; do not ask the user to run SQL manually.

---

### Task 1: Database migration — table + storage bucket

**Files:**
- Create: `supabase/migrations/20260719090000_create_detrbridge_logos.sql`

**Interfaces:**
- Produces table `public.detrbridge_logos` with columns: `id uuid`, `name text`, `rating smallint`, `is_selected boolean`, `storage_path text`, `file_name text`, `size_bytes bigint`, `created_at timestamptz`.
- Produces private Storage bucket `detrbridge-logos`.

- [ ] **Step 1: Write the migration file**

```sql
-- Logo candidates for the /detrbridge board. Standalone board behind its
-- own single-password gate (DETRBRIDGE); admin-managed only, not exposed to
-- anon/authenticated.
create table if not exists public.detrbridge_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating smallint not null
    check (rating between 1 and 5),
  is_selected boolean not null default false,
  -- Storage object path inside the detrbridge-logos bucket.
  storage_path text not null,
  -- Original file name, kept for display (storage path is sanitized).
  file_name text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_logos_rating_idx
  on public.detrbridge_logos (rating desc, created_at);

-- RLS on, with NO policy for anon/authenticated — service-role only,
-- matching detr_todos and detr_todo_attachments.
alter table public.detrbridge_logos enable row level security;

-- Private bucket for logo files. Service-role uploads + signed URLs.
insert into storage.buckets (id, name, public)
values ('detrbridge-logos', 'detrbridge-logos', false)
on conflict (id) do nothing;
```

- [ ] **Step 2: Apply the migration**

Apply via the Supabase MCP/CLI against the project's remote database (same
mechanism used for prior migrations in this repo — do not ask the user to
run this by hand). Verify with a read-only query that `detrbridge_logos`
exists and the `detrbridge-logos` bucket is listed.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260719090000_create_detrbridge_logos.sql
git commit -m "feat(db): add detrbridge_logos table and storage bucket"
```

---

### Task 2: Auth — `lib/admin-auth.ts` gate functions

**Files:**
- Modify: `lib/admin-auth.ts` (append after the `signOutBakcakanat` function, end of file)

**Interfaces:**
- Produces: `DETRBRIDGE_ACCESS_COOKIE: string`, `isDetrbridgeAuthenticated(): Promise<boolean>`, `signInDetrbridge(candidate: string): Promise<boolean>`, `signOutDetrbridge(): Promise<void>`.
- Consumes: `cookies` from `next/headers` (already imported at top of file).

- [ ] **Step 1: Add the DETRBRIDGE gate block**

Append to the end of `lib/admin-auth.ts`:

```typescript
/**
 * The `/detrbridge` logo-selection board has its own single-password gate,
 * scoped to /detrbridge so it can be shared independently of every other
 * admin key. Password comes from the DETRBRIDGE env var (already present in
 * .env.local; the name is intentionally NOT renamed to *_PASSWORD).
 */
export const DETRBRIDGE_ACCESS_COOKIE = "ubt_detrbridge_access";

/**
 * Reads the detrbridge board password (empty string if not configured).
 * No fallback: the board is gated solely by DETRBRIDGE.
 */
function getDetrbridgePassword(): string {
  return process.env.DETRBRIDGE?.trim() ?? "";
}

/**
 * True when the current request carries a valid detrbridge session cookie.
 *
 * Fails CLOSED: if DETRBRIDGE is not configured, nobody gets in — the board
 * must never be publicly reachable just because an env var was forgotten.
 */
export async function isDetrbridgeAuthenticated(): Promise<boolean> {
  const password = getDetrbridgePassword();
  if (!password) return false;
  const cookieStore = await cookies();
  const candidate = cookieStore.get(DETRBRIDGE_ACCESS_COOKIE)?.value ?? "";
  return candidate.trim() === password;
}

/**
 * Validates the supplied password and, when correct, persists it in an
 * HttpOnly cookie scoped to /detrbridge. Returns whether sign-in succeeded.
 */
export async function signInDetrbridge(candidate: string): Promise<boolean> {
  const password = getDetrbridgePassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return false;
  if (candidate.trim() !== password) return false;

  const cookieStore = await cookies();
  cookieStore.set(DETRBRIDGE_ACCESS_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detrbridge",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the detrbridge session cookie (sign out). Expires it with the
 * exact attributes used at sign-in — see signOutBakcakanat for why.
 */
export async function signOutDetrbridge(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DETRBRIDGE_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detrbridge",
    maxAge: 0
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/admin-auth.ts
git commit -m "feat(auth): add detrbridge single-password gate"
```

---

### Task 3: Data layer — `lib/detrbridge-logos.ts`

**Files:**
- Create: `lib/detrbridge-logos.ts`

**Interfaces:**
- Produces: `DetrbridgeLogo` type, `DetrbridgeLogosResult` type, `MutationResult` type (local copy, same shape as `lib/detr-todos.ts`'s `MutationResult`), `getAllLogosAdmin(): Promise<DetrbridgeLogosResult>`, `createLogo(input: { name: string; rating: number }, file: File): Promise<MutationResult>`, `updateLogoRating(id: string, rating: number): Promise<MutationResult>`, `selectLogo(id: string): Promise<MutationResult>`, `deleteLogo(id: string): Promise<MutationResult>`.
- Consumes: `@supabase/supabase-js` `createClient`, env vars `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 1: Write the data layer file**

```typescript
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

export interface DetrbridgeLogo {
  id: string;
  name: string;
  rating: number;
  isSelected: boolean;
  fileName: string;
  sizeBytes: number;
  /** Signed download URL (null when signing failed). */
  url: string | null;
  createdAt: string;
}

export interface DetrbridgeLogosResult {
  source: SourceState;
  errorMessage?: string;
  items: DetrbridgeLogo[];
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

interface SupabaseLogoRow {
  id: string;
  name: string;
  rating: number;
  is_selected: boolean;
  storage_path: string;
  file_name: string;
  size_bytes: number;
  created_at: string;
}

const LOGO_COLUMNS =
  "id, name, rating, is_selected, storage_path, file_name, size_bytes, created_at";

const LOGO_BUCKET = "detrbridge-logos";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 8; // 8 hours, matches the admin session
const MAX_LOGO_BYTES = 10 * 1024 * 1024; // 10 MB

function getServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function createServiceClient(): SupabaseClient | null {
  const env = getServiceEnv();
  if (!env) return null;
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function toLogo(row: SupabaseLogoRow, url: string | null): DetrbridgeLogo {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    isSelected: row.is_selected,
    fileName: row.file_name,
    sizeBytes: row.size_bytes,
    url,
    createdAt: row.created_at
  };
}

/** Validate + upload one logo file. Returns the stored path or an error. */
async function uploadLogoFile(
  supabase: SupabaseClient,
  file: File
): Promise<{ ok: true; path: string } | { ok: false; errorMessage: string }> {
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, errorMessage: "Dosya en fazla 10 MB olabilir." };
  }
  // Storage keys must be ASCII-safe; the original name is kept in the table.
  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "logo";
  // Date.now() keeps successive uploads distinct.
  const path = `logos/${Date.now()}-${safeName}`;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: true
      });
    if (error) throw error;
    return { ok: true, path };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Yükleme başarısız."
    };
  }
}

async function removeLogoObjects(
  supabase: SupabaseClient,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(LOGO_BUCKET).remove(paths);
  } catch {
    // Best-effort cleanup; a dangling object is harmless.
  }
}

/**
 * Returns every logo candidate with a signed preview URL, sorted by rating
 * (highest first), then by creation time.
 */
export async function getAllLogosAdmin(): Promise<DetrbridgeLogosResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("detrbridge_logos")
      .select(LOGO_COLUMNS)
      .order("rating", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseLogoRow[];

    const urlByPath = new Map<string, string>();
    if (rows.length > 0) {
      try {
        const { data: signed } = await supabase.storage
          .from(LOGO_BUCKET)
          .createSignedUrls(
            rows.map((row) => row.storage_path),
            SIGNED_URL_TTL_SECONDS
          );
        for (const entry of signed ?? []) {
          if (entry.path && entry.signedUrl) {
            urlByPath.set(entry.path, entry.signedUrl);
          }
        }
      } catch {
        // Signing failed as a whole; every logo falls back to url: null.
      }
    }

    const items = rows.map((row) =>
      toLogo(row, urlByPath.get(row.storage_path) ?? null)
    );
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

export async function createLogo(
  input: { name: string; rating: number },
  file: File
): Promise<MutationResult> {
  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, errorMessage: "İsim en az 2 karakter olmalı." };
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, errorMessage: "Puan 1 ile 5 arasında olmalı." };
  }
  if (!file || file.size === 0) {
    return { ok: false, errorMessage: "Dosya seçilmedi." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  const uploaded = await uploadLogoFile(supabase, file);
  if (!uploaded.ok) return uploaded;
  try {
    const { error } = await supabase.from("detrbridge_logos").insert({
      name,
      rating: input.rating,
      storage_path: uploaded.path,
      file_name: file.name || "logo",
      size_bytes: file.size
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    // Row insert failed — don't leave the freshly uploaded object dangling.
    await removeLogoObjects(supabase, [uploaded.path]);
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Create failed."
    };
  }
}

export async function updateLogoRating(
  id: string,
  rating: number
): Promise<MutationResult> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, errorMessage: "Puan 1 ile 5 arasında olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detrbridge_logos")
      .update({ rating })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Update failed."
    };
  }
}

/**
 * Marks one logo as selected and clears the flag on every other row, so
 * exactly one logo is ever selected at a time.
 */
export async function selectLogo(id: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error: clearError } = await supabase
      .from("detrbridge_logos")
      .update({ is_selected: false })
      .neq("id", id);
    if (clearError) throw clearError;
    const { error } = await supabase
      .from("detrbridge_logos")
      .update({ is_selected: true })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Select failed."
    };
  }
}

export async function deleteLogo(id: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { data: existing } = await supabase
      .from("detrbridge_logos")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    const { error } = await supabase
      .from("detrbridge_logos")
      .delete()
      .eq("id", id);
    if (error) throw error;
    const path = (existing as { storage_path: string } | null)?.storage_path ?? null;
    if (path) await removeLogoObjects(supabase, [path]);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/detrbridge-logos.ts
git commit -m "feat(detrbridge): add logo data layer with Supabase service-role client"
```

---

### Task 4: Theme tokens

**Files:**
- Create: `app/detrbridge/_components/theme.ts`

**Interfaces:**
- Produces: `DETRBRIDGE_NAVY: string`, `DETRBRIDGE_GOLD: string`, `DETRBRIDGE_BRAND_GRADIENT: string`, `DETRBRIDGE_AMBIENT_BACKGROUND: string`, `DETRBRIDGE_GRID_TEXTURE: { backgroundImage: string; backgroundSize: string; maskImage: string; WebkitMaskImage: string }`.

- [ ] **Step 1: Write the theme file**

```typescript
/**
 * detrbridge board theme tokens. Palette: navy (1) · gold (2), with white
 * text — deliberately distinct from every other board (DETR orange/rose, DM
 * magenta/cyan, BatuBT yellow/violet, Akçakanat emerald/sky). Scoped to the
 * `/detrbridge` route so it never touches the global site theme.
 */

/** Core accent hexes (kept as named constants so JSX can reference them). */
export const DETRBRIDGE_NAVY = "#1E3A8A";
export const DETRBRIDGE_GOLD = "#F5B700";

/**
 * Brand gradient used for borders, the logo tile and the CTA.
 * Navy-led, resolving into gold.
 */
export const DETRBRIDGE_BRAND_GRADIENT =
  "linear-gradient(115deg, #1E3A8A 0%, #3B5FC4 50%, #F5B700 100%)";

/** Full-page ambient background: navy glow top-left, gold bottom-right. */
export const DETRBRIDGE_AMBIENT_BACKGROUND =
  "radial-gradient(55% 50% at 16% 10%, rgba(30,58,138,0.22), transparent 60%)," +
  "radial-gradient(48% 48% at 88% 6%, rgba(245,183,0,0.14), transparent 58%)," +
  "radial-gradient(70% 75% at 52% 120%, rgba(59,95,196,0.12), transparent 60%)," +
  "linear-gradient(180deg, #0a0c12 0%, #07080d 55%, #050609 100%)";

/** Subtle grid texture, masked toward the top so it fades into the glow. */
export const DETRBRIDGE_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)"
} as const;
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/detrbridge/_components/theme.ts
git commit -m "feat(detrbridge): add navy/gold theme tokens"
```

---

### Task 5: Sign-in/sign-out server actions

**Files:**
- Create: `app/detrbridge/_actions.ts`

**Interfaces:**
- Consumes: `signInDetrbridge`, `signOutDetrbridge` from `@/lib/admin-auth` (Task 2).
- Produces: `detrbridgeSignInAction(formData: FormData): Promise<void>`, `detrbridgeSignOutAction(): Promise<void>`.

- [ ] **Step 1: Write the actions file**

```typescript
"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInDetrbridge, signOutDetrbridge } from "@/lib/admin-auth";

/**
 * detrbridge gate sign-in. Validates the password against DETRBRIDGE and, on
 * success, stores it in an HttpOnly cookie. Credentials never appear in the
 * URL.
 */
export async function detrbridgeSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInDetrbridge(candidate);
  redirect("/detrbridge" as Route);
}

/**
 * Sign out of the detrbridge board and return to its gate.
 */
export async function detrbridgeSignOutAction(): Promise<void> {
  await signOutDetrbridge();
  redirect("/detrbridge" as Route);
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/detrbridge/_actions.ts
git commit -m "feat(detrbridge): add sign-in/sign-out server actions"
```

---

### Task 6: Login screen component

**Files:**
- Create: `app/detrbridge/_components/detrbridge-login.tsx`

**Interfaces:**
- Consumes: theme tokens from `@/app/detrbridge/_components/theme` (Task 4).
- Produces: `DetrbridgeLogin({ signIn }: { signIn: (formData: FormData) => void | Promise<void> })` React component (default export not used — named export, matching `DetrLogin`).

- [ ] **Step 1: Write the login component**

Adapt `app/detr/_components/detr-login.tsx` by removing the e-mail field
(single-password gate has no allowlist) and swapping theme tokens/copy:

```typescript
import {
  DETRBRIDGE_AMBIENT_BACKGROUND,
  DETRBRIDGE_BRAND_GRADIENT,
  DETRBRIDGE_GRID_TEXTURE,
  DETRBRIDGE_GOLD
} from "@/app/detrbridge/_components/theme";

interface DetrbridgeLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
}

/**
 * detrbridge gate: a single glass auth card on the board's navy · gold
 * palette. All treatment is inline so it never touches the global site theme
 * nor the shared admin gates used elsewhere.
 */
export function DetrbridgeLogin({ signIn }: DetrbridgeLoginProps) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: DETRBRIDGE_AMBIENT_BACKGROUND }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={DETRBRIDGE_GRID_TEXTURE}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(30,58,138,0.35)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 bottom-8 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(245,183,0,0.22)" }}
      />

      <div
        className="animate-reveal w-full max-w-md rounded-[2rem] p-[1.5px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
      >
        <div className="overflow-hidden rounded-[1.92rem] bg-[#07080d]/90 px-7 py-9 backdrop-blur-2xl sm:px-10 sm:py-11">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/20"
                style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
              >
                <span className="font-body text-base font-extrabold tracking-tight text-black">
                  B
                </span>
              </span>
              <div className="leading-tight">
                <p className="font-body text-sm font-bold tracking-tight text-white">
                  detrbridge
                </p>
                <p className="text-[11px] font-medium text-white/45">
                  Logo Seçimi
                </p>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: "rgba(245,183,0,0.35)",
                background: "rgba(245,183,0,0.10)",
                color: DETRBRIDGE_GOLD
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full"
                  style={{ background: "rgba(245,183,0,0.7)" }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: DETRBRIDGE_GOLD }}
                />
              </span>
              Secure
            </span>
          </div>

          <p
            className="text-[11px] font-semibold uppercase tracking-[0.34em]"
            style={{ color: "#93c5fd" }}
          >
            Yönetim erişimi
          </p>
          <h1 className="mt-3 font-body text-[clamp(1.55rem,4vw,2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
            detrbridge paneli
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-white/55">
            Logo adaylarını yükle, puanla ve seç. Devam etmek için şifreyi
            gir.
          </p>

          <form action={signIn} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Şifre
              </span>
              <div className="group relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-[#F5B700]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="access"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/15"
                />
              </div>
            </label>
            <button
              type="submit"
              className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3.5 text-sm font-bold tracking-tight text-black shadow-[0_16px_50px_-12px_rgba(30,58,138,0.6)] ring-1 ring-inset ring-white/20 transition duration-300 hover:shadow-[0_20px_60px_-12px_rgba(245,183,0,0.6)] focus:outline-none focus:ring-2 focus:ring-[#F5B700]/60"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              Panoyu aç
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-white/35">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Şifre HttpOnly bir çerezde saklanır — URL&apos;de asla görünmez.
          </p>
          <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
            ubterzioglu.de · internal
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/detrbridge/_components/detrbridge-login.tsx
git commit -m "feat(detrbridge): add single-password login screen"
```

---

### Task 7: Sidebar navigation component

**Files:**
- Create: `app/detrbridge/_components/bridge-nav.tsx`

**Interfaces:**
- Produces: `BridgeTabKey` type (union, currently `"logos"`), `BridgeNavItem` interface (`{ key: BridgeTabKey; label: string; count?: number }`), `BridgeNav({ activeTab, items, cardClass, cardInnerClass, signOutAction }: BridgeNavProps)` component.
- Consumes: `DETRBRIDGE_BRAND_GRADIENT` from `@/app/detrbridge/_components/theme` (Task 4).

- [ ] **Step 1: Write the sidebar component**

Adapt `app/dm/_components/dm-nav.tsx`: same responsive structure (desktop
sticky sidebar, mobile top bar + horizontal strip), swap brand copy/gradient,
and generalize the tab key type so adding a second panel later is a one-line
union extension.

```typescript
import { DETRBRIDGE_BRAND_GRADIENT } from "@/app/detrbridge/_components/theme";

export type BridgeTabKey = "logos";

export interface BridgeNavItem {
  key: BridgeTabKey;
  label: string;
  count?: number;
}

interface BridgeNavProps {
  activeTab: BridgeTabKey;
  items: BridgeNavItem[];
  cardClass: string;
  cardInnerClass: string;
  signOutAction: () => Promise<void>;
}

/** Compact brand block shared by the sidebar and the mobile top bar. */
function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`relative flex items-center justify-center rounded-xl shadow-lg shadow-[#1E3A8A]/30 ring-1 ring-white/15 ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
        style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
      >
        <span
          className={`font-body font-extrabold tracking-tight text-black ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          B
        </span>
        <span className="absolute -inset-px rounded-xl ring-1 ring-inset ring-white/10" />
      </span>
      <div className="leading-tight">
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "#93c5fd" }}
        >
          detrbridge
        </p>
        <p
          className={`mt-0.5 font-body font-bold tracking-[-0.03em] text-white ${
            compact ? "text-sm" : "text-lg"
          }`}
        >
          Panel
        </p>
      </div>
    </div>
  );
}

/** Live "Secure" badge. */
function SecureBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      Secure
    </span>
  );
}

function countBadge(isActive: boolean): string {
  return `rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
    isActive ? "bg-white/20 text-white" : "bg-white/[0.06] text-white/50"
  }`;
}

/**
 * `/detrbridge` navigation. Desktop (lg+): sticky left sidebar with brand
 * block, vertical menu and sign-out. Mobile: compact top bar plus a
 * horizontally scrollable tab strip. Plain links (?tab=) — no client JS
 * needed. Currently a single item ("Logo Seçimi"); adding a panel later
 * means extending BridgeTabKey and this items list, nothing structural.
 */
export function BridgeNav({
  activeTab,
  items,
  cardClass,
  cardInnerClass,
  signOutAction
}: BridgeNavProps) {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-8 lg:self-start">
      <div className={`lg:hidden ${cardClass}`}>
        <div
          className={`${cardInnerClass} flex items-center justify-between gap-3 px-4 py-3`}
        >
          <BrandBlock compact />
          <div className="flex items-center gap-2">
            <SecureBadge />
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </div>

      <nav className={`lg:hidden ${cardClass}`}>
        <div
          className={`${cardInnerClass} flex gap-1.5 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {items.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <a
                key={item.key}
                href={`/detrbridge?tab=${item.key}`}
                className={`flex shrink-0 items-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-xs font-semibold tracking-tight transition ${
                  isActive
                    ? "text-white shadow-[0_10px_30px_-10px_rgba(30,58,138,0.7)] ring-1 ring-inset ring-white/15"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                }`}
                style={
                  isActive ? { backgroundImage: DETRBRIDGE_BRAND_GRADIENT } : undefined
                }
              >
                {item.label}
                {item.count !== undefined ? (
                  <span className={countBadge(isActive)}>{item.count}</span>
                ) : null}
              </a>
            );
          })}
        </div>
      </nav>

      <div className={`hidden lg:block ${cardClass}`}>
        <div className={`${cardInnerClass} flex flex-col p-4`}>
          <div className="px-1 pb-4">
            <BrandBlock />
          </div>
          <div className="border-t border-white/[0.06]" />

          <nav className="flex flex-col gap-1 py-3">
            {items.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <a
                  key={item.key}
                  href={`/detrbridge?tab=${item.key}`}
                  className={`relative flex items-center justify-between gap-2 rounded-[1rem] px-3.5 py-2.5 text-[13px] font-semibold tracking-tight transition ${
                    isActive
                      ? "text-white shadow-[0_10px_30px_-10px_rgba(30,58,138,0.7)] ring-1 ring-inset ring-white/15"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                  style={
                    isActive ? { backgroundImage: DETRBRIDGE_BRAND_GRADIENT } : undefined
                  }
                >
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-white/85 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    />
                  ) : null}
                  <span className={isActive ? "pl-2" : undefined}>
                    {item.label}
                  </span>
                  {item.count !== undefined ? (
                    <span className={countBadge(isActive)}>{item.count}</span>
                  ) : null}
                </a>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/[0.06] pt-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <SecureBadge />
            </div>
            <form action={signOutAction} className="mt-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
              >
                Çıkış yap
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/detrbridge/_components/bridge-nav.tsx
git commit -m "feat(detrbridge): add expandable left sidebar navigation"
```

---

### Task 8: Logo Seçimi panel component (form + list)

**Files:**
- Create: `app/detrbridge/_components/logos-tab.tsx`

**Interfaces:**
- Consumes: `DetrbridgeLogo` type from `@/lib/detrbridge-logos` (Task 3); `DETRBRIDGE_GOLD`, `DETRBRIDGE_BRAND_GRADIENT` from theme (Task 4).
- Produces: `LogosTab({ logos, createAction, rateAction, selectAction, deleteAction }: LogosTabProps)` component. Server action prop signatures: `(formData: FormData) => void | Promise<void>` for all four.

- [ ] **Step 1: Write the panel component**

```typescript
import type { DetrbridgeLogo } from "@/lib/detrbridge-logos";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface LogosTabProps {
  logos: DetrbridgeLogo[];
  createAction: ServerFormAction;
  rateAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12";
const formLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

/** Human-readable file size (KB below 1 MB, MB otherwise). */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Read-only star rating badge, e.g. ★★★☆☆. */
function StarBadge({ rating }: { rating: number }) {
  const stars = "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em]"
      style={{ color: DETRBRIDGE_GOLD }}
      title={`${rating}/5`}
    >
      {stars}
    </span>
  );
}

/**
 * Logo Seçimi panel: an upload form (file + name + 1-5 star rating) plus a
 * list of candidates sorted by rating, each with an inline rating editor,
 * a manual "Seç" toggle (mutually exclusive across the list), and delete.
 */
export function LogosTab({
  logos,
  createAction,
  rateAction,
  selectAction,
  deleteAction
}: LogosTabProps) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="px-6 py-5 sm:px-8">
          <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              +
            </span>
            Yeni logo ekle
          </h2>
          <form action={createAction} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-1">
                <span className={formLabel}>
                  İsim <span style={{ color: DETRBRIDGE_GOLD }}>*</span>
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Logo adı"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>
                  Puan <span style={{ color: DETRBRIDGE_GOLD }}>*</span>
                </span>
                <select name="rating" required defaultValue="3" className={darkInput}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {"★".repeat(value)} ({value})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2 lg:col-span-1">
                <span className={formLabel}>
                  Dosya <span style={{ color: DETRBRIDGE_GOLD }}>*</span> (en fazla 10 MB)
                </span>
                <input
                  type="file"
                  name="file"
                  required
                  className={`${darkInput} file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-white/80`}
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(30,58,138,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(245,183,0,0.6)]"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              Logo ekle
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-2">
        {logos.length === 0 ? (
          <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
            Henüz logo eklenmedi. Yukarıdan ilk adayı ekle.
          </p>
        ) : (
          logos.map((logo) => (
            <LogoRow
              key={logo.id}
              logo={logo}
              rateAction={rateAction}
              selectAction={selectAction}
              deleteAction={deleteAction}
            />
          ))
        )}
      </section>
    </div>
  );
}

interface LogoRowProps {
  logo: DetrbridgeLogo;
  rateAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

function LogoRow({ logo, rateAction, selectAction, deleteAction }: LogoRowProps) {
  return (
    <article
      className={`overflow-hidden rounded-[1.1rem] border bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20 ${
        logo.isSelected ? "border-emerald-400/40" : "border-white/10"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] border border-white/10 bg-white/[0.04]">
          {logo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.url}
              alt={logo.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-white/30">yok</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-[14px] font-semibold text-white" title={logo.name}>
            {logo.name}
          </p>
          <p className="mt-0.5 text-[11px] text-white/40">
            {logo.fileName} · {formatFileSize(logo.sizeBytes)}
          </p>
        </div>

        <StarBadge rating={logo.rating} />

        <form action={rateAction} className="flex shrink-0 items-center gap-1.5">
          <input type="hidden" name="id" value={logo.id} />
          <select
            name="rating"
            defaultValue={String(logo.rating)}
            className="rounded-[0.6rem] border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] text-white outline-none focus:border-[#F5B700]/55"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#F5B700]/40 hover:text-[#F5B700]"
          >
            Puanı güncelle
          </button>
        </form>

        {logo.isSelected ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            ✓ Seçildi
          </span>
        ) : (
          <form action={selectAction} className="shrink-0">
            <input type="hidden" name="id" value={logo.id} />
            <button
              type="submit"
              className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-emerald-400/40 hover:text-emerald-300"
            >
              Seç
            </button>
          </form>
        )}

        <form action={deleteAction} className="shrink-0">
          <input type="hidden" name="id" value={logo.id} />
          <button
            type="submit"
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
          >
            Sil
          </button>
        </form>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/detrbridge/_components/logos-tab.tsx
git commit -m "feat(detrbridge): add logo upload form and rated list panel"
```

---

### Task 9: Page — wiring, gate, and server actions

**Files:**
- Create: `app/detrbridge/page.tsx`

**Interfaces:**
- Consumes: `isDetrbridgeAuthenticated` (Task 2); `detrbridgeSignInAction`, `detrbridgeSignOutAction` (Task 5); `DetrbridgeLogin` (Task 6); `BridgeNav`, `BridgeTabKey`, `BridgeNavItem` (Task 7); `LogosTab` (Task 8); `getAllLogosAdmin`, `createLogo`, `updateLogoRating`, `selectLogo`, `deleteLogo` (Task 3); `DETRBRIDGE_AMBIENT_BACKGROUND`, `DETRBRIDGE_GRID_TEXTURE` (Task 4).
- Produces: default-exported `DetrbridgePage` React Server Component, route `/detrbridge`.

- [ ] **Step 1: Write the page**

```typescript
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDetrbridgeAuthenticated } from "@/lib/admin-auth";
import { DetrbridgeLogin } from "@/app/detrbridge/_components/detrbridge-login";
import {
  detrbridgeSignInAction,
  detrbridgeSignOutAction
} from "@/app/detrbridge/_actions";
import {
  BridgeNav,
  type BridgeNavItem,
  type BridgeTabKey
} from "@/app/detrbridge/_components/bridge-nav";
import { LogosTab } from "@/app/detrbridge/_components/logos-tab";
import {
  DETRBRIDGE_AMBIENT_BACKGROUND,
  DETRBRIDGE_GRID_TEXTURE
} from "@/app/detrbridge/_components/theme";
import {
  getAllLogosAdmin,
  createLogo,
  updateLogoRating,
  selectLogo,
  deleteLogo
} from "@/lib/detrbridge-logos";

export const metadata = {
  title: "detrbridge · Logo Seçimi",
  robots: { index: false, follow: false }
};

interface DetrbridgePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

const NAV_ITEMS: BridgeNavItem[] = [{ key: "logos", label: "Logo Seçimi" }];

const cardClass = "overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl";
const cardInnerClass = "";

export default async function DetrbridgePage({ searchParams }: DetrbridgePageProps) {
  const params = searchParams ? await searchParams : {};
  const authenticated = await isDetrbridgeAuthenticated();

  if (!authenticated) {
    return <DetrbridgeLogin signIn={detrbridgeSignInAction} />;
  }

  const tabParam = readParam(params.tab);
  const activeTab: BridgeTabKey = "logos"; // only tab today; tabParam reserved for future panels
  void tabParam;

  const errorParam = readParam(params.error);
  const result = await getAllLogosAdmin();

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const name = (formData.get("name") as string | null) ?? "";
    const rating = Number((formData.get("rating") as string | null) ?? "0");
    const file = formData.get("file");
    if (!(file instanceof File)) {
      redirect(
        `/detrbridge?error=${encodeURIComponent("Dosya seçilmedi.")}` as Parameters<
          typeof redirect
        >[0]
      );
    }
    const outcome = await createLogo({ name, rating }, file as File);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge"
        : `/detrbridge?error=${encodeURIComponent(outcome.errorMessage ?? "Logo eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function rateAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const rating = Number((formData.get("rating") as string | null) ?? "0");
    if (id) {
      await updateLogoRating(id, rating);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge" as Parameters<typeof redirect>[0]);
  }

  async function selectAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await selectLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge" as Parameters<typeof redirect>[0]);
  }

  return (
    <main
      className="relative isolate min-h-screen overflow-x-clip px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: DETRBRIDGE_AMBIENT_BACKGROUND }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.3]"
        style={DETRBRIDGE_GRID_TEXTURE}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[260px_1fr]">
        <BridgeNav
          activeTab={activeTab}
          items={NAV_ITEMS}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          signOutAction={detrbridgeSignOutAction}
        />

        <div className="space-y-4">
          {errorParam && (
            <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
              Hata: {errorParam}
            </div>
          )}
          {result.source === "env-missing" && (
            <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
              Supabase bağlantısı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY
              eksik). Logolar yüklenemiyor.
            </div>
          )}
          {result.source === "error" && (
            <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
              Logolar yüklenirken hata oluştu: {result.errorMessage}
            </div>
          )}

          <LogosTab
            logos={result.items}
            createAction={createAction}
            rateAction={rateAction}
            selectAction={selectAction}
            deleteAction={deleteAction}
          />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors/warnings. If `@next/next/no-img-element` still fires
despite the inline disable comment in Task 8, remove that comment and
instead add `/* eslint-disable-next-line @next/next/no-img-element */` on
the line immediately above the `<img` tag (already done in Task 8 — verify
it's positioned correctly relative to the JSX line, not the attribute
lines).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds, `/detrbridge` listed as a route in the output.

- [ ] **Step 5: Manual verification**

Run `npm run dev`, visit `http://localhost:3000/detrbridge`:
1. Confirm the login screen renders (navy/gold theme, password field only, no email field).
2. Enter the `DETRBRIDGE` value from `.env.local` — confirm redirect to the board.
3. Upload a test image with a name and rating — confirm it appears in the list with correct star rating and a working preview thumbnail.
4. Change its rating via the inline selector — confirm the list re-sorts.
5. Click "Seç" on one logo, then "Seç" on a second — confirm only the second carries the "✓ Seçildi" badge.
6. Delete a logo — confirm it disappears and the row count decreases.
7. Click "Çıkış yap" — confirm redirect back to the login screen and that the cookie session is cleared (reload shows login again).

- [ ] **Step 6: Commit**

```bash
git add app/detrbridge/page.tsx
git commit -m "feat(detrbridge): wire up /detrbridge page with logo panel"
```

---

## Self-Review Notes

- **Spec coverage:** Auth (Task 2), sidebar/layout (Task 7, 9), upload form + name + rating (Task 8), list + inline rating edit + manual single-selection (Task 3, 8), storage bucket + table (Task 1), theme (Task 4), login screen (Task 6), server actions (Task 5, 9) — all spec sections have a corresponding task.
- **Placeholder scan:** No TBD/TODO; every step has complete code.
- **Type consistency:** `DetrbridgeLogo.isSelected`/`rating`/`url` (Task 3) match the fields read in `logos-tab.tsx` (Task 8) and `page.tsx` (Task 9). `BridgeTabKey`/`BridgeNavItem` (Task 7) match usage in `page.tsx` (Task 9). Server action signatures (`(formData: FormData) => void | Promise<void>`) are consistent across Tasks 5, 8, 9.
