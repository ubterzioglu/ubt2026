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
