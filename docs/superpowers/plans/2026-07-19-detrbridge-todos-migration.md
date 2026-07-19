# DETR Todos → detrbridge "Görevler" Sekmesi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Copy the surviving `/detr` todo data (tasks, comments, file attachments) into new `detrbridge_*` tables and a new Storage bucket, expose it as a "Görevler" tab inside `/detrbridge`, then — only after verifying the copy is complete — drop the legacy `detr_*` tables and `detr-files` bucket.

**Architecture:** Follows the exact `/detr` data-layer and page patterns already used for `/detrbridge`'s logos and visits features: a service-role Supabase data layer (`lib/detrbridge-todos.ts`), a presentational tab component (`todos-tab.tsx`), and inline server actions added to `app/detrbridge/page.tsx`. Data migration is a SQL migration (schema + row copy) plus a one-off Node script (Storage objects can't be copied via SQL).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@supabase/supabase-js`, Supabase CLI (`db push`) for migrations.

## Global Constraints

- New tables: `detrbridge_todos`, `detrbridge_todo_comments`, `detrbridge_todo_attachments` — identical schema to `detr_todos`/`detr_todo_comments`/`detr_todo_attachments`, same UUIDs preserved on copy (so attachment/comment foreign keys stay valid).
- New bucket: `detrbridge-files` (private), object paths copied byte-identical from `detr-files` (same `storage_path` values already stored in the copied attachment rows — no path rewrite needed).
- RLS enabled, no anon/authenticated policies — service-role only, matching every other `/detrbridge` table.
- The "Görevler" tab has no e-mail allowlist and no session-based "kim" prefill (detrbridge is single-password, no per-user session identity) — the assignee field starts empty, unlike DETR's `sessionName` default.
- Sidebar order: Logo Seçimi, Görevler, Giriş Logları (`BridgeTabKey` gets a new `"todos"` member between the two).
- **Do NOT drop `detr_*` tables or the `detr-files` bucket until the row-count/object-count verification in Task 2 passes.** This is a two-phase rollout: Tasks 1–5 build and ship the new tab; Task 6 (cleanup) is a separate, explicitly-gated final step.
- Verification method (no test framework in this repo): `npm run typecheck`, `npm run lint`, `npm run build`, plus manual curl/browser checks against the real Supabase project — matching how every other `/detrbridge` feature in this codebase was verified.
- Migrations are applied by the assistant directly via `npx supabase db push --password $DB_PASS` (env vars read from `.env.local`), not left for the user to run by hand — matching this session's established practice.

---

### Task 1: Schema migration — new tables + bucket + row copy

**Files:**
- Create: `supabase/migrations/20260719150000_migrate_detr_todos_to_detrbridge.sql`

**Interfaces:**
- Produces tables `public.detrbridge_todos`, `public.detrbridge_todo_comments`, `public.detrbridge_todo_attachments` (schema identical to the `detr_*` originals) and Storage bucket `detrbridge-files`.
- Produces trigger function `public.set_detrbridge_todo_updated_at()`.

- [ ] **Step 1: Write the migration file**

```sql
-- Schema copy of detr_todos/detr_todo_comments/detr_todo_attachments under
-- the detrbridge_ prefix, plus a row copy of all surviving data. The old
-- detr_* tables and detr-files bucket are dropped in a LATER migration
-- (20260719160000) only after the copy is verified — see that file's
-- header comment for the verification this depends on.
create table if not exists public.detrbridge_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assignee text not null default 'Ortak',
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists detrbridge_todos_status_idx
  on public.detrbridge_todos (status, due_date, created_at);

create table if not exists public.detrbridge_todo_comments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detrbridge_todos(id) on delete cascade,
  body text not null,
  author text not null default 'Ortak',
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_todo_comments_todo_idx
  on public.detrbridge_todo_comments (todo_id, created_at);

create table if not exists public.detrbridge_todo_attachments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detrbridge_todos(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists detrbridge_todo_attachments_todo_idx
  on public.detrbridge_todo_attachments (todo_id, created_at);

create or replace function public.set_detrbridge_todo_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_detrbridge_todo_updated_at on public.detrbridge_todos;
create trigger set_detrbridge_todo_updated_at
before update on public.detrbridge_todos
for each row
execute function public.set_detrbridge_todo_updated_at();

alter table public.detrbridge_todos enable row level security;
alter table public.detrbridge_todo_comments enable row level security;
alter table public.detrbridge_todo_attachments enable row level security;

insert into storage.buckets (id, name, public)
values ('detrbridge-files', 'detrbridge-files', false)
on conflict (id) do nothing;

-- Row copy — preserves UUIDs so comment/attachment foreign keys stay valid.
-- No-op (0 rows copied) if detr_todos no longer exists (already cleaned up).
do $$
begin
  if to_regclass('public.detr_todos') is not null then
    insert into public.detrbridge_todos
      select * from public.detr_todos
      on conflict (id) do nothing;
  end if;

  if to_regclass('public.detr_todo_comments') is not null then
    insert into public.detrbridge_todo_comments
      select * from public.detr_todo_comments
      on conflict (id) do nothing;
  end if;

  if to_regclass('public.detr_todo_attachments') is not null then
    insert into public.detrbridge_todo_attachments
      select * from public.detr_todo_attachments
      on conflict (id) do nothing;
  end if;
end $$;
```

- [ ] **Step 2: Apply the migration**

```bash
cd c:\temp_private\ubt2026
DB_PASS=$(grep -m1 '^DB_PASS=' .env.local | cut -d= -f2-)
export SUPABASE_ACCESS_TOKEN=$(grep -m1 '^SUPABASE_ACCESS_TOKEN=' .env.local | cut -d= -f2-)
npx supabase db push --password "$DB_PASS"
```
Expected: prompts to push `20260719150000_migrate_detr_todos_to_detrbridge.sql`, confirm, then "Finished supabase db push."

- [ ] **Step 3: Verify row counts match via the Supabase REST API**

```bash
cd c:\temp_private\ubt2026
NEXT_PUBLIC_SUPABASE_URL=$(grep -m1 '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2-)
SERVICE_KEY=$(grep -m1 '^SUPABASE_SERVICE_ROLE_KEY=' .env.local | cut -d= -f2-)
for pair in "detr_todos:detrbridge_todos" "detr_todo_comments:detrbridge_todo_comments" "detr_todo_attachments:detrbridge_todo_attachments"; do
  old="${pair%%:*}"; new="${pair##*:}"
  old_count=$(curl -s -X HEAD -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Prefer: count=exact" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/$old?select=id" -D - -o /dev/null | grep -i content-range)
  new_count=$(curl -s -X HEAD -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Prefer: count=exact" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/$new?select=id" -D - -o /dev/null | grep -i content-range)
  echo "$old: $old_count | $new: $new_count"
done
```
Expected: for each pair, the total count after the `/` in `content-range` matches between old and new table. Record these numbers — Task 6 re-checks them before dropping anything.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260719150000_migrate_detr_todos_to_detrbridge.sql
git commit -m "feat(db): copy detr_todos data into new detrbridge_todos tables"
```

---

### Task 2: Storage object migration script

**Files:**
- Create: `scripts/migrate-detr-files.ts`

**Interfaces:**
- Produces a standalone script (not imported elsewhere) run once via `npx tsx scripts/migrate-detr-files.ts` (or `node --loader ts-node/esm` if `tsx` isn't installed — check `package.json` devDependencies first).

- [ ] **Step 1: Check what TS-execution tool is available**

```bash
cd c:\temp_private\ubt2026
cat package.json | grep -E '"tsx"|"ts-node"'
```
If neither is present, install `tsx` as a dev dependency: `npm install -D tsx`.

- [ ] **Step 2: Write the migration script**

```typescript
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

const SOURCE_BUCKET = "detr-files";
const TARGET_BUCKET = "detrbridge-files";

interface AttachmentRow {
  storage_path: string;
}

async function main(): Promise<void> {
  const { data, error } = await supabase
    .from("detrbridge_todo_attachments")
    .select("storage_path");
  if (error) throw error;

  const paths = (data as AttachmentRow[]).map((row) => row.storage_path);
  console.log(`Found ${paths.length} attachment row(s) to copy.`);

  let copied = 0;
  let skipped = 0;
  let failed = 0;

  for (const path of paths) {
    const { data: file, error: downloadError } = await supabase.storage
      .from(SOURCE_BUCKET)
      .download(path);
    if (downloadError || !file) {
      console.error(`FAILED to download ${path}:`, downloadError?.message);
      failed += 1;
      continue;
    }

    const { error: uploadError } = await supabase.storage
      .from(TARGET_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      console.error(`FAILED to upload ${path}:`, uploadError.message);
      failed += 1;
      continue;
    }

    copied += 1;
  }

  console.log(
    `Done. Copied: ${copied}, skipped: ${skipped}, failed: ${failed}, total expected: ${paths.length}.`
  );
  if (failed > 0) {
    throw new Error(`${failed} object(s) failed to copy — do not proceed to cleanup.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 3: Run it against the real project**

```bash
cd c:\temp_private\ubt2026
set -a; source .env.local; set +a
npx tsx scripts/migrate-detr-files.ts
```
Expected: `Done. Copied: N, skipped: 0, failed: 0, total expected: N` where N matches the `detrbridge_todo_attachments` row count from Task 1 Step 3. If any failures print, STOP — do not proceed to Task 6 until re-run with 0 failures.

- [ ] **Step 4: Spot-check one copied file via a signed URL**

```bash
cd c:\temp_private\ubt2026
set -a; source .env.local; set +a
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data } = await supabase.from('detrbridge_todo_attachments').select('storage_path').limit(1).maybeSingle();
  if (!data) { console.log('no attachments to check'); return; }
  const { data: signed, error } = await supabase.storage.from('detrbridge-files').createSignedUrl(data.storage_path, 60);
  console.log(signed, error);
})();
"
```
Expected: a signed URL is returned with no error. Optionally `curl -sI <url>` it to confirm HTTP 200.

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate-detr-files.ts
git commit -m "chore: add one-off script to copy detr-files objects to detrbridge-files"
```

---

### Task 3: Data layer — `lib/detrbridge-todos.ts`

**Files:**
- Create: `lib/detrbridge-todos.ts`

**Interfaces:**
- Produces: `DetrbridgeTodoStatus` type, `normalizeDetrbridgeStatus(value: string): DetrbridgeTodoStatus`, `DetrbridgeTodoComment`, `DetrbridgeTodoAttachment`, `DetrbridgeTodoItem`, `DetrbridgeTodosResult`, `DetrbridgeTodoInput`, `MutationResult` (local copy — do NOT import from `lib/detrbridge-logos.ts`, keep modules independent per this codebase's existing convention of duplicating this small type per feature file), `getAllTodosAdmin(): Promise<DetrbridgeTodosResult>`, `getTodoByIdAdmin(id: string): Promise<DetrbridgeTodoItem | null>`, `createTodo(input: DetrbridgeTodoInput): Promise<MutationResult & { id?: string }>`, `updateTodo(id: string, input: DetrbridgeTodoInput): Promise<MutationResult>`, `setTodoStatus(id: string, status: DetrbridgeTodoStatus): Promise<MutationResult>`, `deleteTodo(id: string): Promise<MutationResult>`, `addComment(todoId: string, body: string, author: string): Promise<MutationResult>`, `deleteComment(commentId: string): Promise<MutationResult>`, `addAttachment(todoId: string, file: File): Promise<MutationResult>`, `deleteAttachment(attachmentId: string): Promise<MutationResult>`.

This is `lib/detr-todos.ts` (recovered at `git show 63112fa^:lib/detr-todos.ts`) with every `detr_` table name → `detrbridge_`, `Detr` type prefix → `Detrbridge`, and the bucket constant changed.

- [ ] **Step 1: Write the data layer file**

```typescript
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

export type DetrbridgeTodoStatus = "open" | "done";

const TODO_STATUSES: readonly DetrbridgeTodoStatus[] = ["open", "done"];

export function normalizeDetrbridgeStatus(value: string): DetrbridgeTodoStatus {
  return (TODO_STATUSES as readonly string[]).includes(value)
    ? (value as DetrbridgeTodoStatus)
    : "open";
}

export interface DetrbridgeTodoComment {
  id: string;
  todoId: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface DetrbridgeTodoAttachment {
  id: string;
  todoId: string;
  fileName: string;
  sizeBytes: number;
  /** Signed download URL (null when signing failed). */
  url: string | null;
  createdAt: string;
}

export interface DetrbridgeTodoItem {
  id: string;
  title: string;
  assignee: string;
  /** ISO date (yyyy-mm-dd) or null when the todo has no deadline. */
  dueDate: string | null;
  status: DetrbridgeTodoStatus;
  comments: DetrbridgeTodoComment[];
  attachments: DetrbridgeTodoAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface DetrbridgeTodosResult {
  source: SourceState;
  errorMessage?: string;
  items: DetrbridgeTodoItem[];
}

export interface DetrbridgeTodoInput {
  title: string;
  assignee: string;
  /** Empty string means "no due date". */
  dueDate: string;
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

interface SupabaseTodoRow {
  id: string;
  title: string;
  assignee: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseCommentRow {
  id: string;
  todo_id: string;
  body: string;
  author: string;
  created_at: string;
}

interface SupabaseAttachmentRow {
  id: string;
  todo_id: string;
  storage_path: string;
  file_name: string;
  size_bytes: number;
  created_at: string;
}

const TODO_COLUMNS = "id, title, assignee, due_date, status, created_at, updated_at";
const COMMENT_COLUMNS = "id, todo_id, body, author, created_at";
const ATTACHMENT_COLUMNS = "id, todo_id, storage_path, file_name, size_bytes, created_at";

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const ATTACHMENT_BUCKET = "detrbridge-files";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 8; // 8 hours, matches the admin session
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

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

/** Returns the due date normalized to yyyy-mm-dd, or null when absent/invalid. */
function normalizeDueDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return DUE_DATE_PATTERN.test(trimmed) ? trimmed : null;
}

function toTodoItem(
  row: SupabaseTodoRow,
  comments: DetrbridgeTodoComment[],
  attachments: DetrbridgeTodoAttachment[]
): DetrbridgeTodoItem {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    dueDate: row.due_date,
    status: normalizeDetrbridgeStatus(row.status),
    comments,
    attachments,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toComment(row: SupabaseCommentRow): DetrbridgeTodoComment {
  return {
    id: row.id,
    todoId: row.todo_id,
    body: row.body,
    author: row.author,
    createdAt: row.created_at
  };
}

/**
 * Signs every attachment row's storage path in one batch and groups the
 * results by todo id. Signing failures degrade to url: null per file.
 */
async function loadAttachmentsByTodo(
  supabase: SupabaseClient
): Promise<Map<string, DetrbridgeTodoAttachment[]>> {
  const byTodo = new Map<string, DetrbridgeTodoAttachment[]>();
  const { data, error } = await supabase
    .from("detrbridge_todo_attachments")
    .select(ATTACHMENT_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as SupabaseAttachmentRow[];
  if (rows.length === 0) return byTodo;

  const urlByPath = new Map<string, string>();
  try {
    const { data: signed } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
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
    // Signing failed as a whole; every attachment falls back to url: null.
  }

  for (const row of rows) {
    const list = byTodo.get(row.todo_id) ?? [];
    list.push({
      id: row.id,
      todoId: row.todo_id,
      fileName: row.file_name,
      sizeBytes: row.size_bytes,
      url: urlByPath.get(row.storage_path) ?? null,
      createdAt: row.created_at
    });
    byTodo.set(row.todo_id, list);
  }
  return byTodo;
}

/**
 * Returns every todo with its full comment thread and signed attachment
 * links. Open todos come first, ordered by deadline (todos without a
 * deadline last), then by creation time.
 */
export async function getAllTodosAdmin(): Promise<DetrbridgeTodosResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("detrbridge_todos")
      .select(TODO_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseTodoRow[];

    const commentsByTodo = new Map<string, DetrbridgeTodoComment[]>();
    let attachmentsByTodo = new Map<string, DetrbridgeTodoAttachment[]>();
    if (rows.length > 0) {
      const { data: commentRows, error: commentError } = await supabase
        .from("detrbridge_todo_comments")
        .select(COMMENT_COLUMNS)
        .order("created_at", { ascending: true });
      if (commentError) throw commentError;
      for (const row of (commentRows ?? []) as SupabaseCommentRow[]) {
        const list = commentsByTodo.get(row.todo_id) ?? [];
        list.push(toComment(row));
        commentsByTodo.set(row.todo_id, list);
      }
      attachmentsByTodo = await loadAttachmentsByTodo(supabase);
    }

    const items = rows
      .map((row) =>
        toTodoItem(
          row,
          commentsByTodo.get(row.id) ?? [],
          attachmentsByTodo.get(row.id) ?? []
        )
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "open" ? -1 : 1;
        if (a.dueDate !== b.dueDate) {
          if (a.dueDate === null) return 1;
          if (b.dueDate === null) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
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

export async function getTodoByIdAdmin(id: string): Promise<DetrbridgeTodoItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("detrbridge_todos")
      .select(TODO_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toTodoItem(data as SupabaseTodoRow, [], []);
  } catch {
    return null;
  }
}

/** Validate + upload one attachment. Returns the stored path or an error. */
async function uploadAttachment(
  supabase: SupabaseClient,
  todoId: string,
  file: File
): Promise<{ ok: true; path: string } | { ok: false; errorMessage: string }> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, errorMessage: "Dosya en fazla 10 MB olabilir." };
  }
  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "dosya";
  const path = `todos/${todoId}/${Date.now()}-${safeName}`;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
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

async function removeAttachmentObjects(
  supabase: SupabaseClient,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove(paths);
  } catch {
    // Best-effort cleanup; a dangling object is harmless.
  }
}

export async function addAttachment(
  todoId: string,
  file: File
): Promise<MutationResult> {
  if (!file || file.size === 0) {
    return { ok: false, errorMessage: "Dosya seçilmedi." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  const uploaded = await uploadAttachment(supabase, todoId, file);
  if (!uploaded.ok) return uploaded;
  try {
    const { error } = await supabase.from("detrbridge_todo_attachments").insert({
      todo_id: todoId,
      storage_path: uploaded.path,
      file_name: file.name || "dosya",
      size_bytes: file.size
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    await removeAttachmentObjects(supabase, [uploaded.path]);
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Attach failed."
    };
  }
}

export async function deleteAttachment(
  attachmentId: string
): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { data: existing } = await supabase
      .from("detrbridge_todo_attachments")
      .select("storage_path")
      .eq("id", attachmentId)
      .maybeSingle();
    const { error } = await supabase
      .from("detrbridge_todo_attachments")
      .delete()
      .eq("id", attachmentId);
    if (error) throw error;
    const path =
      (existing as { storage_path: string } | null)?.storage_path ?? null;
    if (path) await removeAttachmentObjects(supabase, [path]);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}

export async function createTodo(
  input: DetrbridgeTodoInput
): Promise<MutationResult & { id?: string }> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Görev başlığı en az 2 karakter olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { data, error } = await supabase
      .from("detrbridge_todos")
      .insert({
        title,
        assignee: input.assignee.trim() || "Ortak",
        due_date: normalizeDueDate(input.dueDate),
        status: "open"
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, id: (data as { id: string }).id };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Create failed."
    };
  }
}

export async function updateTodo(
  id: string,
  input: DetrbridgeTodoInput
): Promise<MutationResult> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Görev başlığı en az 2 karakter olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detrbridge_todos")
      .update({
        title,
        assignee: input.assignee.trim() || "Ortak",
        due_date: normalizeDueDate(input.dueDate)
      })
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

export async function setTodoStatus(
  id: string,
  status: DetrbridgeTodoStatus
): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detrbridge_todos")
      .update({ status: normalizeDetrbridgeStatus(status) })
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

export async function deleteTodo(id: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { data: attachmentRows } = await supabase
      .from("detrbridge_todo_attachments")
      .select("storage_path")
      .eq("todo_id", id);
    const { error } = await supabase.from("detrbridge_todos").delete().eq("id", id);
    if (error) throw error;
    await removeAttachmentObjects(
      supabase,
      ((attachmentRows ?? []) as { storage_path: string }[]).map(
        (row) => row.storage_path
      )
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}

export async function addComment(
  todoId: string,
  body: string,
  author: string
): Promise<MutationResult> {
  const text = body.trim();
  if (text.length < 1) {
    return { ok: false, errorMessage: "Yorum boş olamaz." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("detrbridge_todo_comments").insert({
      todo_id: todoId,
      body: text,
      author: author.trim() || "Ortak"
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Comment failed."
    };
  }
}

export async function deleteComment(commentId: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detrbridge_todo_comments")
      .delete()
      .eq("id", commentId);
    if (error) throw error;
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
git add lib/detrbridge-todos.ts
git commit -m "feat(detrbridge): add todos data layer (adapted from lib/detr-todos.ts)"
```

---

### Task 4: Sidebar — add "Görevler" tab

**Files:**
- Modify: `app/detrbridge/_components/bridge-nav.tsx`

**Interfaces:**
- Modifies: `BridgeTabKey` union (adds `"todos"`).

- [ ] **Step 1: Extend the tab key union**

In `app/detrbridge/_components/bridge-nav.tsx`, find:
```typescript
export type BridgeTabKey = "logos" | "visits";
```
Replace with:
```typescript
export type BridgeTabKey = "logos" | "todos" | "visits";
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: errors in `app/detrbridge/page.tsx` about `activeTab` narrowing are expected and fixed in Task 6 — do not treat these as this task's failure. Confirm the error is ONLY in `page.tsx` and only about the `activeTab` switch not yet handling `"todos"`.

- [ ] **Step 3: Commit**

```bash
git add app/detrbridge/_components/bridge-nav.tsx
git commit -m "feat(detrbridge): add todos tab key to BridgeTabKey union"
```

---

### Task 5: "Görevler" tab component

**Files:**
- Create: `app/detrbridge/_components/todos-tab.tsx`

**Interfaces:**
- Consumes: `DetrbridgeTodoItem` from `@/lib/detrbridge-todos` (Task 3); `DETRBRIDGE_GOLD`, `DETRBRIDGE_BRAND_GRADIENT` from `@/app/detrbridge/_components/theme` (color names may change once the premium-theme spec lands — this task uses the CURRENT theme.ts exports; do not invent new ones here).
- Produces: `TodosTab({ todos, createAction, updateAction, toggleAction, deleteAction, commentAction, deleteCommentAction, attachAction, deleteAttachmentAction, editingId }: TodosTabProps)` component. All eight action props are `(formData: FormData) => void | Promise<void>`.

This is DETR's `page.tsx` UI (recovered at `git show 63112fa^:app/detr/page.tsx`) extracted into a standalone component, with the session-based `sessionName` prefill removed (detrbridge has no per-user identity) and theme tokens swapped.

- [ ] **Step 1: Write the tab component**

```typescript
import type { DetrbridgeTodoItem } from "@/lib/detrbridge-todos";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface TodosTabProps {
  todos: DetrbridgeTodoItem[];
  editingId: string | null;
  createAction: ServerFormAction;
  updateAction: ServerFormAction;
  toggleAction: ServerFormAction;
  deleteAction: ServerFormAction;
  commentAction: ServerFormAction;
  deleteCommentAction: ServerFormAction;
  attachAction: ServerFormAction;
  deleteAttachmentAction: ServerFormAction;
}

const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12";
const formLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

const TIMESTAMP_FORMAT = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin"
});
const DUE_DATE_FORMAT = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC"
});

function formatTimestamp(iso: string): string {
  try {
    return TIMESTAMP_FORMAT.format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDueDate(date: string): string {
  try {
    return DUE_DATE_FORMAT.format(new Date(`${date}T00:00:00Z`));
  } catch {
    return date;
  }
}

function todayInBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * "Görevler" panel: add/edit accordion form, then a list of todo rows each
 * with a status toggle, collapsible attachments and comment thread.
 * Ported from the retired /detr board — same CRUD surface, no per-session
 * "kim" prefill (detrbridge has no per-user identity, single shared gate).
 */
export function TodosTab({
  todos,
  editingId,
  createAction,
  updateAction,
  toggleAction,
  deleteAction,
  commentAction,
  deleteCommentAction,
  attachAction,
  deleteAttachmentAction
}: TodosTabProps) {
  const editing = editingId ? todos.find((item) => item.id === editingId) ?? null : null;
  const today = todayInBerlin();
  const openCount = todos.filter((item) => item.status === "open").length;
  const doneCount = todos.length - openCount;
  const overdueCount = todos.filter(
    (item) => item.status === "open" && item.dueDate !== null && item.dueDate < today
  ).length;
  const formOpen = Boolean(editing);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Toplam", value: todos.length },
          { label: "Açık", value: openCount },
          { label: "Tamamlanan", value: doneCount },
          { label: "Geciken", value: overdueCount }
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: DETRBRIDGE_GOLD }}
            >
              {stat.label}
            </p>
            <p className="mt-1.5 font-body text-2xl font-bold text-white">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <details
        open={formOpen}
        className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
          <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              +
            </span>
            {editing ? `Görevi düzenle · ${editing.title}` : "Yeni görev ekle"}
          </h2>
          <span className="flex items-center gap-3">
            {editing ? (
              <a
                href="/detrbridge?tab=todos"
                className="text-[13px] font-semibold"
                style={{ color: DETRBRIDGE_GOLD }}
              >
                İptal
              </a>
            ) : null}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/40 transition-transform duration-200 group-open:rotate-180"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </summary>
        <form
          action={editing ? updateAction : createAction}
          className="space-y-4 px-6 pb-6 pt-1 sm:px-8"
        >
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block sm:col-span-2 lg:col-span-1">
              <span className={formLabel}>
                Görev <span style={{ color: DETRBRIDGE_GOLD }}>*</span>
              </span>
              <input
                type="text"
                name="title"
                required
                minLength={2}
                maxLength={300}
                defaultValue={editing?.title ?? ""}
                placeholder="Ne yapılacak?"
                className={darkInput}
              />
            </label>
            <label className="block">
              <span className={formLabel}>Kim</span>
              <input
                type="text"
                name="assignee"
                maxLength={100}
                defaultValue={editing?.assignee ?? ""}
                placeholder="Sorumlu kişi"
                className={darkInput}
              />
            </label>
            <label className="block">
              <span className={formLabel}>Ne zamana kadar</span>
              <input
                type="date"
                name="dueDate"
                defaultValue={editing?.dueDate ?? ""}
                className={`${darkInput} [color-scheme:dark]`}
              />
            </label>
            {!editing && (
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className={formLabel}>Dosya (opsiyonel · en fazla 10 MB)</span>
                <input
                  type="file"
                  name="file"
                  className={`${darkInput} file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-white/80`}
                />
              </label>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(30,58,138,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(245,183,0,0.6)]"
            style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
          >
            {editing ? "Değişiklikleri kaydet" : "Görev ekle"}
          </button>
        </form>
      </details>

      <section className="space-y-2">
        {todos.length === 0 ? (
          <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
            Henüz görev yok. Yukarıdan ilk görevi ekle.
          </p>
        ) : (
          todos.map((item) => (
            <TodoRow
              key={item.id}
              item={item}
              today={today}
              toggleAction={toggleAction}
              deleteAction={deleteAction}
              commentAction={commentAction}
              deleteCommentAction={deleteCommentAction}
              attachAction={attachAction}
              deleteAttachmentAction={deleteAttachmentAction}
            />
          ))
        )}
      </section>
    </div>
  );
}

interface TodoRowProps {
  item: DetrbridgeTodoItem;
  today: string;
  toggleAction: ServerFormAction;
  deleteAction: ServerFormAction;
  commentAction: ServerFormAction;
  deleteCommentAction: ServerFormAction;
  attachAction: ServerFormAction;
  deleteAttachmentAction: ServerFormAction;
}

function TodoRow({
  item,
  today,
  toggleAction,
  deleteAction,
  commentAction,
  deleteCommentAction,
  attachAction,
  deleteAttachmentAction
}: TodoRowProps) {
  const isDone = item.status === "done";
  const isOverdue = !isDone && item.dueDate !== null && item.dueDate < today;

  return (
    <article
      className={`rounded-[0.95rem] border bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20 ${
        isOverdue ? "border-rose-400/30" : "border-white/10"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:flex-nowrap">
        <form action={toggleAction} className="shrink-0">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="next" value={isDone ? "open" : "done"} />
          <button
            type="submit"
            title={isDone ? "Geri aç" : "Tamamlandı olarak işaretle"}
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-bold transition ${
              isDone
                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                : "border-white/15 bg-white/[0.05] text-transparent hover:border-emerald-400/50 hover:text-emerald-300/60"
            }`}
          >
            ✓
          </button>
        </form>

        <span
          className={`min-w-0 flex-1 truncate font-body text-[14px] font-semibold ${
            isDone ? "text-white/40 line-through" : "text-white"
          }`}
          title={item.title}
        >
          {item.title}
        </span>

        <span
          className="inline-flex max-w-[140px] shrink-0 items-center truncate rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-300"
          title={`Sorumlu: ${item.assignee}`}
        >
          {item.assignee}
        </span>

        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
            isOverdue
              ? "border-rose-400/40 bg-rose-400/15 text-rose-300"
              : item.dueDate
                ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-white/40"
          }`}
          title={
            item.dueDate
              ? `Teslim: ${formatDueDate(item.dueDate)}${isOverdue ? " (gecikti)" : ""}`
              : "Teslim tarihi yok"
          }
        >
          {item.dueDate
            ? `${isOverdue ? "⚠ " : ""}${formatDueDate(item.dueDate)}`
            : "tarih —"}
        </span>

        <span
          className="hidden shrink-0 text-[11px] text-white/40 lg:inline"
          title={`Yazıldı: ${formatTimestamp(item.createdAt)}`}
        >
          {formatTimestamp(item.createdAt)}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={`/detrbridge?tab=todos&edit=${item.id}`}
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#F5B700]/40 hover:text-[#F5B700]"
          >
            Düzenle
          </a>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
            >
              Sil
            </button>
          </form>
        </div>
      </div>

      <details className="group/files border-t border-white/[0.06]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2 text-[11px] font-semibold text-white/45 transition hover:text-white/70 [&::-webkit-details-marker]:hidden">
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
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          Dosyalar ({item.attachments.length})
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/30 transition-transform duration-200 group-open/files:rotate-180"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div className="space-y-2 px-4 pb-3">
          {item.attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-[0.7rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              {file.url ? (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-[13px] font-semibold text-sky-300 transition hover:text-sky-200"
                  title={file.fileName}
                >
                  {file.fileName}
                </a>
              ) : (
                <span
                  className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/40"
                  title={`${file.fileName} (bağlantı üretilemedi)`}
                >
                  {file.fileName}
                </span>
              )}
              <span className="shrink-0 text-[11px] text-white/35">
                {formatFileSize(file.sizeBytes)} · {formatTimestamp(file.createdAt)}
              </span>
              <form action={deleteAttachmentAction} className="shrink-0">
                <input type="hidden" name="attachmentId" value={file.id} />
                <button
                  type="submit"
                  title="Dosyayı sil"
                  className="text-[11px] font-semibold text-white/30 transition hover:text-rose-300"
                >
                  Sil
                </button>
              </form>
            </div>
          ))}
          <form
            action={attachAction}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input type="hidden" name="todoId" value={item.id} />
            <input
              type="file"
              name="file"
              required
              className={`${darkInput} file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-white/80`}
            />
            <button
              type="submit"
              className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-[0.7rem] px-4 py-1.5 text-[12px] font-bold text-black ring-1 ring-inset ring-white/15"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              Yükle
            </button>
          </form>
        </div>
      </details>

      <details className="group/comments border-t border-white/[0.06]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2 text-[11px] font-semibold text-white/45 transition hover:text-white/70 [&::-webkit-details-marker]:hidden">
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Yorumlar ({item.comments.length})
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/30 transition-transform duration-200 group-open/comments:rotate-180"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div className="space-y-2 px-4 pb-3">
          {item.comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-3 rounded-[0.7rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-white/60">
                  {comment.author}
                  <span className="ml-2 font-normal text-white/35">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-5 text-white/80">
                  {comment.body}
                </p>
              </div>
              <form action={deleteCommentAction} className="shrink-0">
                <input type="hidden" name="commentId" value={comment.id} />
                <button
                  type="submit"
                  title="Yorumu sil"
                  className="text-[11px] font-semibold text-white/30 transition hover:text-rose-300"
                >
                  Sil
                </button>
              </form>
            </div>
          ))}
          <form
            action={commentAction}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input type="hidden" name="todoId" value={item.id} />
            <input
              type="text"
              name="author"
              maxLength={100}
              placeholder="İsim"
              className={`${darkInput} sm:max-w-[130px]`}
            />
            <input
              type="text"
              name="body"
              required
              maxLength={1000}
              placeholder="Yorum yaz…"
              className={darkInput}
            />
            <button
              type="submit"
              className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-[0.7rem] px-4 py-1.5 text-[12px] font-bold text-black ring-1 ring-inset ring-white/15"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              Gönder
            </button>
          </form>
        </div>
      </details>
    </article>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors (this file doesn't touch `page.tsx` yet).

- [ ] **Step 3: Commit**

```bash
git add app/detrbridge/_components/todos-tab.tsx
git commit -m "feat(detrbridge): add Görevler tab component (ported from /detr)"
```

---

### Task 6: Wire the tab into `page.tsx`

**Files:**
- Modify: `app/detrbridge/page.tsx`

**Interfaces:**
- Consumes: `getAllTodosAdmin`, `getTodoByIdAdmin`, `createTodo`, `updateTodo`, `setTodoStatus`, `deleteTodo`, `addComment`, `deleteComment`, `addAttachment`, `deleteAttachment` from `@/lib/detrbridge-todos` (Task 3); `TodosTab` from `@/app/detrbridge/_components/todos-tab` (Task 5); `"todos"` member of `BridgeTabKey` (Task 4).

- [ ] **Step 1: Read the current file to get exact line numbers**

```bash
cd c:\temp_private\ubt2026
cat -n app/detrbridge/page.tsx
```

- [ ] **Step 2: Add imports**

Add after the existing `getAllLogosAdmin, ...` import block:
```typescript
import { TodosTab } from "@/app/detrbridge/_components/todos-tab";
import {
  getAllTodosAdmin,
  getTodoByIdAdmin,
  createTodo,
  updateTodo,
  setTodoStatus,
  deleteTodo,
  addComment,
  deleteComment,
  addAttachment,
  deleteAttachment
} from "@/lib/detrbridge-todos";
```

- [ ] **Step 3: Update `NAV_ITEMS` to insert "Görevler" between the existing two entries**

Replace:
```typescript
const NAV_ITEMS: BridgeNavItem[] = [
  { key: "logos", label: "Logo Seçimi" },
  { key: "visits", label: "Giriş Logları" }
];
```
With:
```typescript
const NAV_ITEMS: BridgeNavItem[] = [
  { key: "logos", label: "Logo Seçimi" },
  { key: "todos", label: "Görevler" },
  { key: "visits", label: "Giriş Logları" }
];
```

- [ ] **Step 4: Update tab resolution and data fetching**

Replace:
```typescript
const requestedTab = readParam(params.tab);
const activeTab: BridgeTabKey = requestedTab === "visits" ? "visits" : "logos";

const errorParam = readParam(params.error);
const firstVisit = await recordDetrbridgeVisit();
const result = activeTab === "logos" ? await getAllLogosAdmin() : null;
const visits = activeTab === "visits" ? await getDetrbridgeVisits() : [];
```
With:
```typescript
const requestedTab = readParam(params.tab);
const activeTab: BridgeTabKey =
  requestedTab === "visits" ? "visits" : requestedTab === "todos" ? "todos" : "logos";

const errorParam = readParam(params.error);
const editTodoId = readParam(params.edit) || null;
const firstVisit = await recordDetrbridgeVisit();
const result = activeTab === "logos" ? await getAllLogosAdmin() : null;
const visits = activeTab === "visits" ? await getDetrbridgeVisits() : [];
const todosResult = activeTab === "todos" ? await getAllTodosAdmin() : null;
```

Note: `getTodoByIdAdmin` is imported for parity with the old `/detr` page but is NOT called here — the edit target is resolved from the already-fetched `todosResult.items` list inside `TodosTab` via its `editingId` prop, avoiding a second round-trip. If a future task needs a direct single-todo fetch (e.g. deep-linking without loading the full list), `getTodoByIdAdmin` is already available.

- [ ] **Step 5: Add the eight todo server actions**

Insert after the existing `deleteAction` function (the one that calls `deleteLogo`), before the closing of the four logo actions and before the `return (`:

```typescript
  async function createTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const outcome = await createTodo({
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    let attachError: string | null = null;
    const file = formData.get("file");
    if (outcome.ok && outcome.id && file instanceof File && file.size > 0) {
      const attached = await addAttachment(outcome.id, file);
      if (!attached.ok) {
        attachError = attached.errorMessage ?? "Dosya yüklenemedi.";
      }
    }
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? attachError
          ? `/detrbridge?tab=todos&error=${encodeURIComponent(`Görev eklendi ama dosya yüklenemedi: ${attachError}`)}`
          : "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Görev eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function updateTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
    }
    const outcome = await updateTodo(id, {
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Görev güncellenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function toggleTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const next =
      ((formData.get("next") as string | null) ?? "open") === "done" ? "done" : "open";
    if (id) {
      await setTodoStatus(id, next);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }

  async function deleteTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteTodo(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }

  async function commentTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const todoId = (formData.get("todoId") as string | null) ?? "";
    const body = (formData.get("body") as string | null) ?? "";
    const author = (formData.get("author") as string | null) ?? "";
    if (!todoId) {
      redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
    }
    const outcome = await addComment(todoId, body, author);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Yorum eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteCommentTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const commentId = (formData.get("commentId") as string | null) ?? "";
    if (commentId) {
      await deleteComment(commentId);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }

  async function attachTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const todoId = (formData.get("todoId") as string | null) ?? "";
    const file = formData.get("file");
    if (!todoId || !(file instanceof File) || file.size === 0) {
      redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
    }
    const outcome = await addAttachment(todoId, file as File);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Dosya yüklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteAttachmentTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const attachmentId = (formData.get("attachmentId") as string | null) ?? "";
    if (attachmentId) {
      await deleteAttachment(attachmentId);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }
```

- [ ] **Step 6: Render `TodosTab` when `activeTab === "todos"`**

Find:
```typescript
          {activeTab === "visits" ? <VisitsTab visits={visits} /> : null}
```
Replace with:
```typescript
          {activeTab === "todos" && todosResult ? (
            <>
              {todosResult.source === "env-missing" && (
                <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
                  Supabase bağlantısı yapılandırılmamış
                  (SUPABASE_SERVICE_ROLE_KEY eksik). Görevler yüklenemiyor.
                </div>
              )}
              {todosResult.source === "error" && (
                <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
                  Görevler yüklenirken hata oluştu: {todosResult.errorMessage}
                </div>
              )}
              <TodosTab
                todos={todosResult.items}
                editingId={editTodoId}
                createAction={createTodoAction}
                updateAction={updateTodoAction}
                toggleAction={toggleTodoAction}
                deleteAction={deleteTodoAction}
                commentAction={commentTodoAction}
                deleteCommentAction={deleteCommentTodoAction}
                attachAction={attachTodoAction}
                deleteAttachmentAction={deleteAttachmentTodoAction}
              />
            </>
          ) : null}

          {activeTab === "visits" ? <VisitsTab visits={visits} /> : null}
```

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Lint**

Run: `npm run lint`
Expected: no errors/warnings.

- [ ] **Step 9: Build**

Run: `npm run build`
Expected: succeeds, `/detrbridge` listed as a route.

- [ ] **Step 10: Manual verification**

```bash
cd c:\temp_private\ubt2026
(npm run dev > /tmp_detrbridge_dev.log 2>&1 &) ; sleep 4
DBRIDGE=$(grep -m1 '^DETRBRIDGE=' .env.local | cut -d= -f2-)
curl -s -c /tmp_jar.txt -b "ubt_detrbridge_access=$DBRIDGE" "http://localhost:3000/detrbridge?tab=todos" -o /tmp_todos.html -w "%{http_code}\n"
grep -c "Görevler\|Yeni görev ekle\|Henüz görev yok" /tmp_todos.html
```
Expected: HTTP 200, at least one match — confirms the tab renders and, if the migrated data has rows, the todo list should show real titles instead of the empty state. Cross-check the count against the Task 1 Step 3 row-count for `detrbridge_todos`.

- [ ] **Step 11: Commit**

```bash
git add app/detrbridge/page.tsx
git commit -m "feat(detrbridge): wire Görevler tab into page.tsx with full CRUD actions"
```

---

### Task 7: Cleanup — drop legacy `detr_*` tables and bucket (GATED)

**Do not start this task until Tasks 1–6 are complete, deployed, and you have personally confirmed in the live `/detrbridge?tab=todos` UI that every task, comment, and attachment from the old `/detr` board is visible and its files open correctly.** This step is irreversible.

**Files:**
- Create: `supabase/migrations/20260719160000_drop_detr_legacy.sql`
- Create: `scripts/delete-detr-files-bucket.ts`

**Interfaces:**
- None (cleanup only, nothing downstream depends on this).

- [ ] **Step 1: Re-verify row counts one more time (repeat Task 1 Step 3)**

```bash
cd c:\temp_private\ubt2026
NEXT_PUBLIC_SUPABASE_URL=$(grep -m1 '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2-)
SERVICE_KEY=$(grep -m1 '^SUPABASE_SERVICE_ROLE_KEY=' .env.local | cut -d= -f2-)
for pair in "detr_todos:detrbridge_todos" "detr_todo_comments:detrbridge_todo_comments" "detr_todo_attachments:detrbridge_todo_attachments"; do
  old="${pair%%:*}"; new="${pair##*:}"
  old_count=$(curl -s -X HEAD -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Prefer: count=exact" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/$old?select=id" -D - -o /dev/null | grep -i content-range)
  new_count=$(curl -s -X HEAD -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Prefer: count=exact" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/$new?select=id" -D - -o /dev/null | grep -i content-range)
  echo "$old: $old_count | $new: $new_count"
done
```
Expected: identical to Task 1 Step 3's numbers (nothing should have drifted — if `detr_todos` gained rows since Task 1, someone used the old board after the copy; STOP and re-run Task 1's insert before proceeding).

- [ ] **Step 2: Write the Storage bucket deletion script**

```typescript
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

const BUCKET = "detr-files";

async function main(): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list("todos", { limit: 1000 });
  if (listError) throw listError;

  // detr-files objects are stored as todos/<todoId>/<file> — list() is not
  // recursive, so walk one level of todo-id subfolders.
  const allPaths: string[] = [];
  for (const entry of files ?? []) {
    if (!entry.id) {
      // entry.id is null for "folders" in Supabase Storage's list() output.
      const { data: nested, error: nestedError } = await supabase.storage
        .from(BUCKET)
        .list(`todos/${entry.name}`, { limit: 1000 });
      if (nestedError) throw nestedError;
      for (const file of nested ?? []) {
        allPaths.push(`todos/${entry.name}/${file.name}`);
      }
    }
  }

  console.log(`Found ${allPaths.length} object(s) in ${BUCKET} to remove.`);
  if (allPaths.length > 0) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(allPaths);
    if (removeError) throw removeError;
  }

  const { error: bucketDeleteError } = await supabase.storage.deleteBucket(BUCKET);
  if (bucketDeleteError) throw bucketDeleteError;

  console.log(`Bucket ${BUCKET} deleted.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 3: Run the bucket deletion script**

```bash
cd c:\temp_private\ubt2026
set -a; source .env.local; set +a
npx tsx scripts/delete-detr-files-bucket.ts
```
Expected: `Found N object(s)...` then `Bucket detr-files deleted.`

- [ ] **Step 4: Write the table-drop migration**

```sql
-- Drops the legacy /detr todo tables. Safe to run ONLY after confirming
-- (see Task 7 in docs/superpowers/plans/2026-07-19-detrbridge-todos-migration.md)
-- that every row was copied into detrbridge_todos/detrbridge_todo_comments/
-- detrbridge_todo_attachments and the detr-files Storage bucket was already
-- emptied and deleted via scripts/delete-detr-files-bucket.ts.
drop table if exists public.detr_todo_attachments;
drop table if exists public.detr_todo_comments;
drop table if exists public.detr_todos;
drop function if exists public.set_detr_todo_updated_at();
```

- [ ] **Step 5: Apply the migration**

```bash
cd c:\temp_private\ubt2026
DB_PASS=$(grep -m1 '^DB_PASS=' .env.local | cut -d= -f2-)
export SUPABASE_ACCESS_TOKEN=$(grep -m1 '^SUPABASE_ACCESS_TOKEN=' .env.local | cut -d= -f2-)
npx supabase db push --password "$DB_PASS"
```
Expected: "Finished supabase db push."

- [ ] **Step 6: Final re-verification against the live site**

Visit `/detrbridge?tab=todos` in a real browser (or repeat the curl check from Task 6 Step 10) and confirm the task list, comments, and file links still work — they now read from `detrbridge_todos`/`detrbridge-files` exclusively, so this also proves Tasks 1–6 didn't accidentally read from the now-deleted `detr_*` tables.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260719160000_drop_detr_legacy.sql scripts/delete-detr-files-bucket.ts
git commit -m "chore(db): drop legacy detr_* tables and detr-files bucket after verified migration"
```

---

## Self-Review Notes

- **Spec coverage:** Schema + row copy (Task 1), Storage object copy (Task 2), data layer (Task 3), sidebar tab (Task 4), UI component (Task 5), page wiring with full CRUD (Task 6), gated cleanup (Task 7) — every spec section has a task. The "kim" field no longer auto-fills from a session identity, matching the spec's note that detrbridge has no per-user session.
- **Placeholder scan:** No TBD/TODO; every step has complete code or an exact command with expected output.
- **Type consistency:** `DetrbridgeTodoItem`/`DetrbridgeTodoInput`/`MutationResult` (Task 3) match the props and calls used in `todos-tab.tsx` (Task 5) and `page.tsx` (Task 6). Action prop names (`createAction`, `updateAction`, `toggleAction`, `deleteAction`, `commentAction`, `deleteCommentAction`, `attachAction`, `deleteAttachmentAction`) are consistent between Task 5's `TodosTabProps` and Task 6's `<TodosTab .../>` call.
- **Gating:** Task 7 explicitly refuses to proceed without re-verifying row counts and requires a manual live-site confirmation first — this satisfies the spec's "verification before cleanup" requirement.
