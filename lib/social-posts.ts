import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { SocialPlatform, SocialPostItem } from "@/types/site";
import { SOCIAL_PLATFORMS } from "@/types/site";

type SourceState = "remote" | "env-missing" | "empty" | "error";

/** Column that stores the shared flag for each platform. */
const SHARED_COLUMN: Record<SocialPlatform, string> = {
  instagram: "shared_instagram",
  facebook: "shared_facebook",
  x: "shared_x",
  tiktok: "shared_tiktok"
};

const POST_COLUMNS =
  "id, post_number, category, title, summary, canva_prompt, instagram_caption, " +
  "shared_instagram, shared_facebook, shared_x, shared_tiktok, created_at, updated_at";

interface SupabaseSocialPostRow {
  id: string;
  post_number: number;
  category: string;
  title: string;
  summary: string | null;
  canva_prompt: string;
  instagram_caption: string;
  shared_instagram: boolean;
  shared_facebook: boolean;
  shared_x: boolean;
  shared_tiktok: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialPostsResult {
  source: SourceState;
  errorMessage?: string;
  items: SocialPostItem[];
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

/** Narrow an arbitrary string to a known SocialPlatform (or null). */
export function normalizeSocialPlatform(value: string): SocialPlatform | null {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(value)
    ? (value as SocialPlatform)
    : null;
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

function toSocialPostItem(row: SupabaseSocialPostRow): SocialPostItem {
  return {
    id: row.id,
    postNumber: row.post_number,
    category: row.category ?? "",
    title: row.title,
    summary: row.summary ?? "",
    canvaPrompt: row.canva_prompt,
    instagramCaption: row.instagram_caption,
    shared: {
      instagram: row.shared_instagram,
      facebook: row.shared_facebook,
      x: row.shared_x,
      tiktok: row.shared_tiktok
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/** Returns every content post ordered by its post number (1..50). */
export async function getAllSocialPostsAdmin(): Promise<SocialPostsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("social_posts")
      .select(POST_COLUMNS)
      .order("post_number", { ascending: true });
    if (error) throw error;

    const rows = (data ?? []) as unknown as SupabaseSocialPostRow[];
    const items = rows.map(toSocialPostItem);
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

/**
 * Set whether a post has been shared on a given platform. `shared=true` marks
 * it green; `shared=false` clears it. Platform is validated against the
 * whitelist before any DB write.
 */
export async function setPostShared(
  id: string,
  platform: string,
  shared: boolean
): Promise<MutationResult> {
  const normalized = normalizeSocialPlatform(platform);
  if (!normalized) {
    return { ok: false, errorMessage: "Geçersiz platform." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("social_posts")
      .update({ [SHARED_COLUMN[normalized]]: shared })
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
