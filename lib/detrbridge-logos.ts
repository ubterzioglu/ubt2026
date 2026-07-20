import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

export interface DetrbridgeLogo {
  id: string;
  uploaderName: string;
  isSelected: boolean;
  fileName: string;
  sizeBytes: number;
  /** Signed download URL (null when signing failed). */
  url: string | null;
  /** Average of all cast votes (null when nobody has voted yet). */
  averageRating: number | null;
  voteCount: number;
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
  uploader_name: string;
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

const LOGO_COLUMNS =
  "id, uploader_name, is_selected, storage_path, file_name, size_bytes, created_at";

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

function toLogo(
  row: SupabaseLogoRow,
  url: string | null,
  votes: number[]
): DetrbridgeLogo {
  const voteCount = votes.length;
  const averageRating =
    voteCount > 0 ? votes.reduce((sum, v) => sum + v, 0) / voteCount : null;
  return {
    id: row.id,
    uploaderName: row.uploader_name,
    isSelected: row.is_selected,
    fileName: row.file_name,
    sizeBytes: row.size_bytes,
    url,
    averageRating,
    voteCount,
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
 * Returns every logo candidate with a signed preview URL and its vote
 * average, sorted by average rating (highest first, unvoted logos last),
 * then by creation time.
 */
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

    const votesByLogo = new Map<string, number[]>();
    if (rows.length > 0) {
      const { data: voteRows, error: voteError } = await supabase
        .from("detrbridge_logo_votes")
        .select("logo_id, rating");
      if (voteError) throw voteError;
      for (const vote of (voteRows ?? []) as SupabaseVoteRow[]) {
        const list = votesByLogo.get(vote.logo_id) ?? [];
        list.push(vote.rating);
        votesByLogo.set(vote.logo_id, list);
      }
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

    const items = rows
      .map((row) =>
        toLogo(
          row,
          urlByPath.get(row.storage_path) ?? null,
          votesByLogo.get(row.id) ?? []
        )
      )
      .sort((a, b) => {
        if (a.averageRating === null && b.averageRating === null) return 0;
        if (a.averageRating === null) return 1;
        if (b.averageRating === null) return -1;
        return b.averageRating - a.averageRating;
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

export async function createLogo(
  input: { uploaderName: string },
  file: File
): Promise<MutationResult> {
  const uploaderName = input.uploaderName.trim();
  if (uploaderName.length < 2) {
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
      uploader_name: uploaderName,
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

/**
 * Casts (or updates) one voter's rating for a logo. A voter can vote each
 * logo at most once — re-voting under the same name replaces their prior
 * rating rather than adding a second vote (enforced by the unique
 * (logo_id, voter_name) constraint via upsert).
 */
export async function castVote(
  logoId: string,
  voterName: string,
  rating: number
): Promise<MutationResult> {
  const name = voterName.trim();
  if (name.length < 2) {
    return { ok: false, errorMessage: "İsim en az 2 karakter olmalı." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, errorMessage: "Puan 1 ile 5 arasında olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detrbridge_logo_votes")
      .upsert(
        { logo_id: logoId, voter_name: name, rating },
        { onConflict: "logo_id,voter_name" }
      );
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Oy kaydedilemedi."
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
