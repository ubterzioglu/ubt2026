import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { NewsUpdateItem } from "@/types/site";

type SourceState = "remote" | "env-missing" | "empty" | "error";

interface SupabaseNewsUpdateRow {
  id: string;
  title: string;
  summary: string;
  image_url: string | null;
  detail_href: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface NewsUpdatesResult {
  source: SourceState;
  errorMessage?: string;
  items: NewsUpdateItem[];
}

function toNewsUpdateItem(row: SupabaseNewsUpdateRow): NewsUpdateItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    imageUrl: row.image_url?.trim() || null,
    detailHref: row.detail_href?.trim() || null,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at
  };
}

export async function getNewsUpdates(): Promise<NewsUpdatesResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      source: "env-missing",
      items: []
    };
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data, error } = await supabase
      .from("news_updates")
      .select(
        "id, title, summary, image_url, detail_href, sort_order, is_published, created_at"
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const items = ((data ?? []) as SupabaseNewsUpdateRow[]).map(toNewsUpdateItem);

    return {
      source: items.length > 0 ? "remote" : "empty",
      items
    };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown news update error",
      items: []
    };
  }
}

function getServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function createServiceClient() {
  const env = getServiceEnv();
  if (!env) return null;
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export interface NewsUpdateInput {
  title: string;
  summary: string;
  imageUrl: string | null;
  detailHref: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface NewsUpdateMutationResult {
  ok: boolean;
  errorMessage?: string;
}

export async function getAllNewsUpdatesAdmin(): Promise<NewsUpdatesResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("news_updates")
      .select("id, title, summary, image_url, detail_href, sort_order, is_published, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const items = ((data ?? []) as SupabaseNewsUpdateRow[]).map(toNewsUpdateItem);
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

export async function createNewsUpdate(input: NewsUpdateInput): Promise<NewsUpdateMutationResult> {
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (title.length < 2) return { ok: false, errorMessage: "Title must be at least 2 characters." };
  if (summary.length < 5) return { ok: false, errorMessage: "Summary must be at least 5 characters." };

  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase.from("news_updates").insert({
      title,
      summary,
      image_url: input.imageUrl || null,
      detail_href: input.detailHref || null,
      sort_order: input.sortOrder,
      is_published: input.isPublished
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Create failed." };
  }
}

export async function updateNewsUpdate(
  id: string,
  input: Partial<NewsUpdateInput>
): Promise<NewsUpdateMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.summary !== undefined) patch.summary = input.summary.trim();
  if ("imageUrl" in input) patch.image_url = input.imageUrl || null;
  if ("detailHref" in input) patch.detail_href = input.detailHref || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isPublished !== undefined) patch.is_published = input.isPublished;
  try {
    const { error } = await supabase.from("news_updates").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function deleteNewsUpdate(id: string): Promise<NewsUpdateMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase.from("news_updates").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Delete failed." };
  }
}
