# detrbridge Logo Voting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the admin-only "Logo Seçimi" panel on `/detrbridge` into a
one-vote-per-name public rating system: every logo gets a 1-5 star vote per
voter name, the list sorts by live average rating, and the 21 images in
`docs/logodetrbridge/` are bulk-uploaded once via script.

**Architecture:** New `detrbridge_logo_votes` table (one row per
logo+voter, unique constraint enforces one vote per name per logo). The
old single `rating` column on `detrbridge_logos` and its admin "Puanı
güncelle" control are removed. `lib/detrbridge-logos.ts` gains
`castLogoVote` and computes `avgRating`/`voteCount` per logo for sorting.
`LogosTab` becomes a client component so it can read/write
`localStorage` for the voter name and the set of already-voted logo ids.
A one-off script (`scripts/bulk-upload-detrbridge-logos.ts`) uploads the
21 JPEGs.

**Tech Stack:** Next.js 15 App Router, React 19 server actions, Supabase
(service-role client, Storage), Tailwind CSS, `tsx` for one-off scripts.

## Global Constraints

- Board stays behind the existing single `/detrbridge` password gate
  (`isDetrbridgeAuthenticated`) — no new auth layer.
- `is_selected` / "Seç" button stays admin-only and unaffected by voting.
- Server-side uniqueness (DB constraint) is the real guard against double
  voting; `localStorage` is UX-only, not a security boundary.
- Turkish UI copy, matching existing tone in `logos-tab.tsx` /
  `detrbridge-login.tsx`.
- All new/modified Supabase-facing code uses the service-role client
  pattern already in `lib/detrbridge-logos.ts` (`createServiceClient`),
  never exposes the table to anon/authenticated roles.

---

### Task 1: Migration — votes table + drop `rating` column

**Files:**
- Create: `supabase/migrations/20260719180000_create_detrbridge_logo_votes.sql`

**Interfaces:**
- Produces: table `public.detrbridge_logo_votes(id uuid pk, logo_id uuid fk
  → detrbridge_logos.id on delete cascade, voter_name text, rating
  smallint, created_at timestamptz)` with `unique (logo_id, voter_name)`
  and `check (rating between 1 and 5)`. Drops `detrbridge_logos.rating`
  and its index.

- [ ] **Step 1: Write the migration file**

```sql
-- Public voting for /detrbridge logo candidates: one row per (logo,
-- voter name). Replaces the old admin-set detrbridge_logos.rating
-- column — the displayed/sorted rating is now the average of these
-- rows. RLS on, no anon/authenticated policy — service-role only,
-- matching detrbridge_logos.
create table if not exists public.detrbridge_logo_votes (
  id uuid primary key default gen_random_uuid(),
  logo_id uuid not null references public.detrbridge_logos (id) on delete cascade,
  voter_name text not null,
  rating smallint not null
    check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (logo_id, voter_name)
);

create index if not exists detrbridge_logo_votes_logo_id_idx
  on public.detrbridge_logo_votes (logo_id);

alter table public.detrbridge_logo_votes enable row level security;

-- The old admin-set single rating is replaced by the average of
-- detrbridge_logo_votes; drop the column and its now-unused index.
drop index if exists public.detrbridge_logos_rating_idx;
alter table public.detrbridge_logos drop column if exists rating;
```

- [ ] **Step 2: Apply the migration**

Run (from repo root, requires Supabase CLI already configured for this
project — same tool used for the prior `20260719*` detrbridge
migrations):
```bash
npx supabase db push
```
Expected: output lists `20260719180000_create_detrbridge_logo_votes.sql`
as applied, no errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260719180000_create_detrbridge_logo_votes.sql
git commit -m "feat(db): add detrbridge_logo_votes table, drop logos.rating"
```

---

### Task 2: Data layer — voting, average rating, drop old rating APIs

**Files:**
- Modify: `lib/detrbridge-logos.ts`

**Interfaces:**
- Consumes: `SupabaseClient`, `createServiceClient()` (already in file).
- Produces:
  - `interface DetrbridgeLogo { id: string; name: string; avgRating: number | null; voteCount: number; isSelected: boolean; fileName: string; sizeBytes: number; url: string | null; createdAt: string; }` (replaces `rating: number`)
  - `createLogo(input: { name: string }, file: File): Promise<MutationResult>` (drops `rating` param)
  - `castLogoVote(logoId: string, voterName: string, rating: number): Promise<MutationResult>` (new)
  - Removes `updateLogoRating`.
  - `getAllLogosAdmin(): Promise<DetrbridgeLogosResult>` (same signature, new sort: `avgRating` desc, nulls last, then `createdAt` asc).

- [ ] **Step 1: Update types and row mapping**

Replace lines 7-17 (`DetrbridgeLogo` interface) with:

```typescript
export interface DetrbridgeLogo {
  id: string;
  name: string;
  /** Average of all votes cast for this logo; null when unvoted. */
  avgRating: number | null;
  voteCount: number;
  isSelected: boolean;
  fileName: string;
  sizeBytes: number;
  /** Signed download URL (null when signing failed). */
  url: string | null;
  createdAt: string;
}
```

Replace the `SupabaseLogoRow` interface (lines 30-39) — drop `rating`:

```typescript
interface SupabaseLogoRow {
  id: string;
  name: string;
  is_selected: boolean;
  storage_path: string;
  file_name: string;
  size_bytes: number;
  created_at: string;
}

interface SupabaseVoteRow {
  logo_id: string;
  rating: number;
}
```

Replace `LOGO_COLUMNS` (line 41-42):

```typescript
const LOGO_COLUMNS =
  "id, name, is_selected, storage_path, file_name, size_bytes, created_at";
```

Replace `toLogo` (lines 63-74):

```typescript
function toLogo(
  row: SupabaseLogoRow,
  url: string | null,
  avgRating: number | null,
  voteCount: number
): DetrbridgeLogo {
  return {
    id: row.id,
    name: row.name,
    avgRating,
    voteCount,
    isSelected: row.is_selected,
    fileName: row.file_name,
    sizeBytes: row.size_bytes,
    url,
    createdAt: row.created_at
  };
}
```

- [ ] **Step 2: Rewrite `getAllLogosAdmin` to join votes and sort by average**

Replace the whole function body (lines 123-165):

```typescript
export async function getAllLogosAdmin(): Promise<DetrbridgeLogosResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("detrbridge_logos")
      .select(LOGO_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseLogoRow[];

    const { data: voteData, error: voteError } = await supabase
      .from("detrbridge_logo_votes")
      .select("logo_id, rating");
    if (voteError) throw voteError;
    const votes = (voteData ?? []) as SupabaseVoteRow[];

    const votesByLogo = new Map<string, number[]>();
    for (const vote of votes) {
      const existing = votesByLogo.get(vote.logo_id) ?? [];
      existing.push(vote.rating);
      votesByLogo.set(vote.logo_id, existing);
    }

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

    const items = rows.map((row) => {
      const ratings = votesByLogo.get(row.id) ?? [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : null;
      return toLogo(row, urlByPath.get(row.storage_path) ?? null, avgRating, ratings.length);
    });

    items.sort((a, b) => {
      if (a.avgRating === null && b.avgRating === null) return 0;
      if (a.avgRating === null) return 1;
      if (b.avgRating === null) return -1;
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return a.createdAt.localeCompare(b.createdAt);
    });

    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}
```

- [ ] **Step 3: Drop the `rating` param from `createLogo`**

Replace the `createLogo` signature and its validation block (lines
167-205):

```typescript
export async function createLogo(
  input: { name: string },
  file: File
): Promise<MutationResult> {
  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, errorMessage: "İsim en az 2 karakter olmalı." };
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
```

- [ ] **Step 4: Remove `updateLogoRating`, add `castLogoVote`**

Delete the `updateLogoRating` function (previously lines 207-231).
Add in its place:

```typescript
/**
 * Records one vote for one logo by one named voter. Fails if that name
 * already voted for this logo (unique constraint on logo_id+voter_name) —
 * the DB is the real guard; localStorage on the client is UX-only.
 */
export async function castLogoVote(
  logoId: string,
  voterName: string,
  rating: number
): Promise<MutationResult> {
  const name = voterName.trim();
  if (name.length < 2 || name.length > 60) {
    return { ok: false, errorMessage: "İsim 2-60 karakter olmalı." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, errorMessage: "Puan 1 ile 5 arasında olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("detrbridge_logo_votes").insert({
      logo_id: logoId,
      voter_name: name,
      rating
    });
    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return { ok: false, errorMessage: "Bu logoyu zaten oyladın." };
      }
      throw error;
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Oy kaydedilemedi."
    };
  }
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: fails only on call sites not yet updated (`app/detrbridge/page.tsx`,
`app/detrbridge/_components/logos-tab.tsx`) — confirms the data-layer
edit compiles in isolation once those are fixed in later tasks. Note the
exact error list so Task 3/4 close them.

- [ ] **Step 6: Commit**

```bash
git add lib/detrbridge-logos.ts
git commit -m "feat: replace admin rating with per-voter average in detrbridge-logos lib"
```

---

### Task 3: Server actions — vote action, drop rate action

**Files:**
- Modify: `app/detrbridge/page.tsx`

**Interfaces:**
- Consumes: `castLogoVote(logoId, voterName, rating)` from Task 2,
  `createLogo(input: { name: string }, file: File)` from Task 2.
- Produces: `voteAction: (formData: FormData) => Promise<void>` passed
  into `LogosTab` as prop `voteAction`, replacing `rateAction`.

- [ ] **Step 1: Update the `getAllLogosAdmin` / `createLogo` imports and `createAction`**

In the import block (lines 22-28), remove `updateLogoRating` and add
`castLogoVote`:

```typescript
import {
  getAllLogosAdmin,
  createLogo,
  castLogoVote,
  selectLogo,
  deleteLogo
} from "@/lib/detrbridge-logos";
```

Replace `createAction` (lines 71-95) to stop reading `rating`:

```typescript
  async function createAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const name = (formData.get("name") as string | null) ?? "";
    const file = formData.get("file");
    if (!(file instanceof File)) {
      redirect(
        `/detrbridge?error=${encodeURIComponent("Dosya seçilmedi.")}` as Parameters<
          typeof redirect
        >[0]
      );
    }
    const outcome = await createLogo({ name }, file as File);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge"
        : `/detrbridge?error=${encodeURIComponent(outcome.errorMessage ?? "Logo eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }
```

- [ ] **Step 2: Replace `rateAction` with `voteAction`**

Replace the `rateAction` function (lines 97-109):

```typescript
  async function voteAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const voterName = (formData.get("voterName") as string | null) ?? "";
    const rating = Number((formData.get("rating") as string | null) ?? "0");
    if (!id) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const outcome = await castLogoVote(id, voterName, rating);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge"
        : `/detrbridge?error=${encodeURIComponent(outcome.errorMessage ?? "Oy kaydedilemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }
```

- [ ] **Step 3: Wire `voteAction` into `LogosTab`**

In the JSX (lines 183-189), replace the `<LogosTab ... />` call:

```typescript
              <LogosTab
                logos={result.items}
                createAction={createAction}
                voteAction={voteAction}
                selectAction={selectAction}
                deleteAction={deleteAction}
              />
```

- [ ] **Step 4: Typecheck (expect remaining errors only in logos-tab.tsx)**

Run: `npx tsc --noEmit`
Expected: errors confined to `app/detrbridge/_components/logos-tab.tsx`
(prop mismatch, `rating` field access) — fixed in Task 4.

- [ ] **Step 5: Commit**

```bash
git add app/detrbridge/page.tsx
git commit -m "feat: replace detrbridge rateAction with public voteAction"
```

---

### Task 4: Client UI — voter name capture + per-logo voting

**Files:**
- Modify: `app/detrbridge/_components/logos-tab.tsx`

**Interfaces:**
- Consumes: `DetrbridgeLogo` (from Task 2, has `avgRating`/`voteCount`,
  no `rating`), `voteAction: (formData: FormData) => void | Promise<void>`
  prop (from Task 3).
- Produces: `LogosTab` becomes a `"use client"` component; localStorage
  keys `detrbridge_voter_name` (string) and `detrbridge_voted_logos`
  (JSON array of logo id strings).

- [ ] **Step 1: Convert to client component, add voter-name state**

Replace the top of the file (lines 1-23) — add `"use client"`, React
imports, and drop the now-unused `DETRBRIDGE_GOLD`-only star helper
signature change:

```typescript
"use client";

import { useEffect, useState } from "react";

import type { DetrbridgeLogo } from "@/lib/detrbridge-logos";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface LogosTabProps {
  logos: DetrbridgeLogo[];
  createAction: ServerFormAction;
  voteAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

const VOTER_NAME_KEY = "detrbridge_voter_name";
const VOTED_LOGOS_KEY = "detrbridge_voted_logos";

const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12";
const formLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

/** Human-readable file size (KB below 1 MB, MB otherwise). */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Read-only average-rating badge, e.g. "★ 4.2 (7 oy)" or "Henüz oy yok". */
function AverageBadge({ avgRating, voteCount }: { avgRating: number | null; voteCount: number }) {
  if (avgRating === null) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/40">
        Henüz oy yok
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em]"
      style={{ color: DETRBRIDGE_GOLD }}
      title={`${avgRating.toFixed(2)}/5`}
    >
      ★ {avgRating.toFixed(1)} ({voteCount} oy)
    </span>
  );
}

function readVotedLogos(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VOTED_LOGOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Add the voter-name capture block to `LogosTab`**

Replace the `LogosTab` function (previously lines 44-139) with a version
that manages voter name + voted-logo-id state and passes them down:

```typescript
/**
 * Logo Seçimi panel: an upload form (file + name) plus a list of
 * candidates sorted by average public vote, each showing the average
 * rating badge, a 1-5 star vote form (locked out client-side once this
 * browser has voted for that logo), a manual "Seç" toggle, and delete.
 */
export function LogosTab({
  logos,
  createAction,
  voteAction,
  selectAction,
  deleteAction
}: LogosTabProps) {
  const [voterName, setVoterName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [votedIds, setVotedIds] = useState<string[]>([]);

  useEffect(() => {
    const storedName = window.localStorage.getItem(VOTER_NAME_KEY) ?? "";
    setVoterName(storedName);
    setNameInput(storedName);
    setEditingName(storedName.length === 0);
    setVotedIds(readVotedLogos());
  }, []);

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) return;
    window.localStorage.setItem(VOTER_NAME_KEY, trimmed);
    setVoterName(trimmed);
    setEditingName(false);
  }

  function markVoted(logoId: string) {
    const next = Array.from(new Set([...readVotedLogos(), logoId]));
    window.localStorage.setItem(VOTED_LOGOS_KEY, JSON.stringify(next));
    setVotedIds(next);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="px-6 py-5 sm:px-8">
          <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              ★
            </span>
            Oy verirken görünecek adın
          </h2>
          {editingName ? (
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className={formLabel}>Adın</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  minLength={2}
                  maxLength={60}
                  placeholder="Adını yaz"
                  className={darkInput}
                />
              </label>
              <button
                type="button"
                onClick={saveName}
                disabled={nameInput.trim().length < 2}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[0.9rem] px-5 py-2 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(30,58,138,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(245,183,0,0.6)] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
              >
                Kaydet
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[13px] text-white/80">
                <span className="text-white/50">Oy verirken kullanılacak isim:</span>{" "}
                <strong className="text-white">{voterName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-[11px] font-semibold text-white/50 underline decoration-dotted underline-offset-2 transition hover:text-[#F5B700]"
              >
                Değiştir
              </button>
            </div>
          )}
        </div>
      </section>

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
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
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
              voterName={voterName}
              hasVoted={votedIds.includes(logo.id)}
              onVoted={() => markVoted(logo.id)}
              voteAction={voteAction}
              selectAction={selectAction}
              deleteAction={deleteAction}
            />
          ))
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Replace `LogoRow` with a voting-aware version**

Replace the `LogoRowProps` interface and `LogoRow` function (previously
lines 141-229):

```typescript
interface LogoRowProps {
  logo: DetrbridgeLogo;
  voterName: string;
  hasVoted: boolean;
  onVoted: () => void;
  voteAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

function LogoRow({
  logo,
  voterName,
  hasVoted,
  onVoted,
  voteAction,
  selectAction,
  deleteAction
}: LogoRowProps) {
  const [pendingRating, setPendingRating] = useState(5);
  const canVote = voterName.trim().length >= 2 && !hasVoted;

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

        <AverageBadge avgRating={logo.avgRating} voteCount={logo.voteCount} />

        {hasVoted ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/60">
            ✓ Oy verdin
          </span>
        ) : (
          <form
            action={voteAction}
            onSubmit={onVoted}
            className="flex shrink-0 items-center gap-1.5"
          >
            <input type="hidden" name="id" value={logo.id} />
            <input type="hidden" name="voterName" value={voterName} />
            <select
              name="rating"
              value={pendingRating}
              onChange={(event) => setPendingRating(Number(event.target.value))}
              disabled={!canVote}
              className="rounded-[0.6rem] border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] text-white outline-none [color-scheme:dark] focus:border-[#F5B700]/55 disabled:opacity-40"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!canVote}
              title={canVote ? undefined : "Önce yukarıdan adını kaydet"}
              className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#F5B700]/40 hover:text-[#F5B700] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Oy ver
            </button>
          </form>
        )}

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

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `app/detrbridge/**`.

- [ ] **Step 5: Lint**

Run: `npx eslint app/detrbridge/_components/logos-tab.tsx app/detrbridge/page.tsx lib/detrbridge-logos.ts --max-warnings=0`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/detrbridge/_components/logos-tab.tsx
git commit -m "feat: add per-voter logo rating UI with localStorage vote lock"
```

---

### Task 5: Bulk-upload script for the 21 logo files

**Files:**
- Create: `scripts/bulk-upload-detrbridge-logos.ts`

**Interfaces:**
- Consumes: `detrbridge_logos` table schema from Task 1 (post-migration:
  no `rating` column), `detrbridge-logos` storage bucket (already created
  by `20260719090000_create_detrbridge_logos.sql`).
- Produces: 21 rows inserted into `detrbridge_logos` named `Logo 1`..`Logo 21`
  (sorted by filename), each with a matching object in the
  `detrbridge-logos` bucket.

- [ ] **Step 1: Write the script**

```typescript
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (source .env.local first)."
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const SOURCE_DIR = join(process.cwd(), "docs", "logodetrbridge");
const BUCKET = "detrbridge-logos";
const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png"
};

function safeStorageName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "logo";
}

async function main(): Promise<void> {
  const files = readdirSync(SOURCE_DIR)
    .filter((name) => [".jpeg", ".jpg", ".png"].includes(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  console.log(`Found ${files.length} logo file(s) in ${SOURCE_DIR}.`);

  let uploaded = 0;
  let failed = 0;

  for (let index = 0; index < files.length; index += 1) {
    const fileName = files[index];
    const displayName = `Logo ${index + 1}`;
    const bytes = readFileSync(join(SOURCE_DIR, fileName));
    const storagePath = `logos/${Date.now()}-${safeStorageName(fileName)}`;
    const contentType = CONTENT_TYPE_BY_EXT[extname(fileName).toLowerCase()] ?? "application/octet-stream";

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, { contentType, upsert: true });
    if (uploadError) {
      console.error(`FAILED to upload ${fileName}:`, uploadError.message);
      failed += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("detrbridge_logos").insert({
      name: displayName,
      storage_path: storagePath,
      file_name: fileName,
      size_bytes: bytes.byteLength
    });
    if (insertError) {
      console.error(`FAILED to insert row for ${fileName}:`, insertError.message);
      failed += 1;
      continue;
    }

    uploaded += 1;
    console.log(`Uploaded ${displayName} (${fileName}).`);
  }

  console.log(`Done. Uploaded: ${uploaded}, failed: ${failed}, total: ${files.length}.`);
  if (failed > 0) {
    throw new Error(`${failed} file(s) failed — check logs above.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run the script once**

Run (`.env.local` must be sourced or exported first, same precondition
as `migrate-detr-files.ts`):
```bash
npx tsx scripts/bulk-upload-detrbridge-logos.ts
```
Expected: `Found 21 logo file(s)...` then 21 `Uploaded Logo N ...` lines,
ending with `Done. Uploaded: 21, failed: 0, total: 21.`

- [ ] **Step 3: Verify on the live page**

Run the dev server and check `/detrbridge` (Logo Seçimi tab) shows 21
rows named `Logo 1`..`Logo 21`, each with a visible thumbnail and
"Henüz oy yok" badge:
```bash
npm run dev
```
Open `http://localhost:3000/detrbridge`, enter the `DETRBRIDGE` password,
confirm the 21 rows render with images loading (signed URLs resolve) and
no console errors. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add scripts/bulk-upload-detrbridge-logos.ts
git commit -m "chore: add one-off script to bulk-upload detrbridge logo candidates"
```

---

### Task 6: End-to-end manual verification

**Files:** none (verification only).

**Interfaces:** none — exercises the full stack built in Tasks 1-5.

- [ ] **Step 1: Two-voter rating flow**

With the dev server running (`npm run dev`) and signed into
`/detrbridge`:
1. In one browser (or incognito window), set voter name to `Ayşe`, vote
   `5` on `Logo 1`. Confirm the row switches to "✓ Oy verdin" and the
   average badge shows `★ 5.0 (1 oy)`.
2. In a second incognito window, set voter name to `Mehmet`, vote `3` on
   `Logo 1`. Confirm the average badge now shows `★ 4.0 (2 oy)` and
   `Logo 1` moved to/stayed at the top of the sorted list (highest
   average first).

- [ ] **Step 2: Duplicate-vote rejection**

In the `Ayşe` window, clear `localStorage.detrbridge_voted_logos` via
devtools console (`localStorage.removeItem("detrbridge_voted_logos")`),
reload, and attempt to vote on `Logo 1` again with name `Ayşe`. Confirm
the page redirects with `?error=Bu%20logoyu%20zaten%20oyladın.` and the
red error banner renders that text.

- [ ] **Step 3: New logo has no rating param**

Use the "Yeni logo ekle" form to add a small test image with only a name
(no rating field should be present in the form). Confirm it appears in
the list with "Henüz oy yok" and sorts after every rated logo.

- [ ] **Step 4: Seç / Sil unaffected**

Click "Seç" on any logo — confirm it flips to "✓ Seçildi" and every
other row shows the "Seç" button again (mutually exclusive). Click "Sil"
on the test logo added in Step 3 — confirm it disappears from the list
and its storage object is gone (spot-check via Supabase dashboard or
trust the existing `deleteLogo` cascade behavior already covered by
`detrbridge_logo_votes` FK `on delete cascade`).

- [ ] **Step 5: Final typecheck + lint sweep**

```bash
npx tsc --noEmit
npx eslint . --max-warnings=0
```
Expected: both clean.

No commit for this task — it's verification only. If any step fails,
fix the relevant file from Tasks 1-5 and re-run the affected step.
