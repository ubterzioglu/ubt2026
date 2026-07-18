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
