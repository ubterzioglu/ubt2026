import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  FindingComment,
  TestFindingItem,
  TestFindingSeverity,
  TestFindingStatus
} from "@/types/site";

type SourceState = "remote" | "env-missing" | "empty" | "error";

const FINDING_STATUSES: readonly TestFindingStatus[] = [
  "open",
  "investigating",
  "resolved",
  "wontfix"
];
const FINDING_SEVERITIES: readonly TestFindingSeverity[] = [
  "low",
  "normal",
  "high",
  "critical"
];

const SCREENSHOT_BUCKET = "dm-screenshots";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 8; // 8 hours, matches the admin session
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB

export function normalizeFindingStatus(value: string): TestFindingStatus {
  return (FINDING_STATUSES as readonly string[]).includes(value)
    ? (value as TestFindingStatus)
    : "open";
}

export function normalizeFindingSeverity(value: string): TestFindingSeverity {
  return (FINDING_SEVERITIES as readonly string[]).includes(value)
    ? (value as TestFindingSeverity)
    : "normal";
}

interface SupabaseFindingRow {
  id: string;
  title: string;
  area: string;
  owner: string;
  status: string;
  severity: string;
  screenshot_path: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SupabaseCommentRow {
  id: string;
  finding_id: string;
  body: string;
  author: string;
  created_at: string;
}

const FINDING_COLUMNS =
  "id, title, area, owner, status, severity, screenshot_path, sort_order, created_at, updated_at";
const COMMENT_COLUMNS = "id, finding_id, body, author, created_at";

export interface TestFindingsResult {
  source: SourceState;
  errorMessage?: string;
  items: TestFindingItem[];
}

export interface TestFindingInput {
  title: string;
  area: string;
  owner: string;
  status: TestFindingStatus;
  severity: TestFindingSeverity;
  sortOrder: number;
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

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

/** Resolve a Storage object path to a signed URL (null on failure/empty). */
async function signScreenshot(
  supabase: SupabaseClient,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage
      .from(SCREENSHOT_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (error) return null;
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

async function toFindingItem(
  supabase: SupabaseClient,
  row: SupabaseFindingRow,
  commentCount: number
): Promise<TestFindingItem> {
  return {
    id: row.id,
    title: row.title,
    area: row.area ?? "",
    owner: row.owner,
    status: normalizeFindingStatus(row.status),
    severity: normalizeFindingSeverity(row.severity),
    screenshotUrl: await signScreenshot(supabase, row.screenshot_path),
    commentCount,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Returns every finding ordered by owner, then manual sort_order, then
 * creation time, each with its signed screenshot URL and comment count.
 */
export async function getAllFindingsAdmin(): Promise<TestFindingsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("test_findings")
      .select(FINDING_COLUMNS)
      .order("owner", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;

    const rows = (data ?? []) as SupabaseFindingRow[];

    // One grouped count query for all findings, then map id -> count.
    const counts = new Map<string, number>();
    if (rows.length > 0) {
      const { data: commentRows } = await supabase
        .from("finding_comments")
        .select("finding_id");
      for (const c of (commentRows ?? []) as { finding_id: string }[]) {
        counts.set(c.finding_id, (counts.get(c.finding_id) ?? 0) + 1);
      }
    }

    const items = await Promise.all(
      rows.map((row) => toFindingItem(supabase, row, counts.get(row.id) ?? 0))
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

export async function getFindingByIdAdmin(
  id: string
): Promise<TestFindingItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("test_findings")
      .select(FINDING_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toFindingItem(supabase, data as SupabaseFindingRow, 0);
  } catch {
    return null;
  }
}

export async function getFindingCommentsAdmin(
  findingId: string
): Promise<FindingComment[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("finding_comments")
      .select(COMMENT_COLUMNS)
      .eq("finding_id", findingId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as SupabaseCommentRow[]).map((row) => ({
      id: row.id,
      findingId: row.finding_id,
      body: row.body,
      author: row.author,
      createdAt: row.created_at
    }));
  } catch {
    return [];
  }
}

/** Validate + upload a screenshot. Returns the stored path or an error. */
async function uploadScreenshot(
  supabase: SupabaseClient,
  findingId: string,
  file: File
): Promise<{ ok: true; path: string } | { ok: false; errorMessage: string }> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, errorMessage: "Sadece resim dosyası yüklenebilir." };
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    return { ok: false, errorMessage: "Görsel en fazla 5 MB olabilir." };
  }
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "png";
  // Date.now() keeps successive uploads for the same finding distinct.
  const path = `findings/${findingId}/${Date.now()}.${ext || "png"}`;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(SCREENSHOT_BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (error) throw error;
    return { ok: true, path };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Yükleme başarısız."
    };
  }
}

async function removeScreenshot(
  supabase: SupabaseClient,
  path: string | null
): Promise<void> {
  if (!path) return;
  try {
    await supabase.storage.from(SCREENSHOT_BUCKET).remove([path]);
  } catch {
    // Best-effort cleanup; a dangling object is harmless.
  }
}

export async function createFinding(
  input: TestFindingInput,
  screenshot?: File | null
): Promise<MutationResult> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Bulgu başlığı en az 2 karakter olmalı." };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  try {
    const { data, error } = await supabase
      .from("test_findings")
      .insert({
        title,
        area: input.area.trim(),
        owner: input.owner.trim() || "Ortak",
        status: normalizeFindingStatus(input.status),
        severity: normalizeFindingSeverity(input.severity),
        sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0
      })
      .select("id")
      .single();
    if (error) throw error;

    const id = (data as { id: string }).id;
    if (screenshot && screenshot.size > 0) {
      const uploaded = await uploadScreenshot(supabase, id, screenshot);
      if (!uploaded.ok) return uploaded;
      const { error: updateError } = await supabase
        .from("test_findings")
        .update({ screenshot_path: uploaded.path })
        .eq("id", id);
      if (updateError) throw updateError;
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Create failed."
    };
  }
}

export async function updateFinding(
  id: string,
  input: Partial<TestFindingInput>,
  screenshot?: File | null
): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  const patch: Record<string, unknown> = {};
  try {
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (title.length < 2) {
        return {
          ok: false,
          errorMessage: "Bulgu başlığı en az 2 karakter olmalı."
        };
      }
      patch.title = title;
    }
    if (input.area !== undefined) patch.area = input.area.trim();
    if (input.owner !== undefined) patch.owner = input.owner.trim() || "Ortak";
    if (input.status !== undefined) {
      patch.status = normalizeFindingStatus(input.status);
    }
    if (input.severity !== undefined) {
      patch.severity = normalizeFindingSeverity(input.severity);
    }
    if (input.sortOrder !== undefined) {
      patch.sort_order = Number.isFinite(input.sortOrder) ? input.sortOrder : 0;
    }

    if (screenshot && screenshot.size > 0) {
      // Fetch the old path so we can replace it after a successful upload.
      const { data: existing } = await supabase
        .from("test_findings")
        .select("screenshot_path")
        .eq("id", id)
        .maybeSingle();
      const uploaded = await uploadScreenshot(supabase, id, screenshot);
      if (!uploaded.ok) return uploaded;
      patch.screenshot_path = uploaded.path;
      await removeScreenshot(
        supabase,
        (existing as { screenshot_path: string | null } | null)
          ?.screenshot_path ?? null
      );
    }

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("test_findings")
      .update(patch)
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

export async function deleteFinding(id: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    // Read the path first so the Storage object can be removed after the row.
    const { data: existing } = await supabase
      .from("test_findings")
      .select("screenshot_path")
      .eq("id", id)
      .maybeSingle();
    const { error } = await supabase
      .from("test_findings")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await removeScreenshot(
      supabase,
      (existing as { screenshot_path: string | null } | null)
        ?.screenshot_path ?? null
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
  findingId: string,
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
    const { error } = await supabase.from("finding_comments").insert({
      finding_id: findingId,
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
      .from("finding_comments")
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
