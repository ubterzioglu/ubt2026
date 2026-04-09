import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { FeaturedCategory, FeaturedItem } from "@/types/site";

type SourceState = "remote" | "env-missing" | "empty" | "error";

interface SupabaseFeaturedRow {
  id: string;
  slug: string;
  category: FeaturedCategory;
  title: string;
  summary: string;
  image_url: string | null;
  href: string | null;
  badge: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface FeaturedCollectionResult<TCategory extends FeaturedCategory> {
  source: SourceState;
  errorMessage?: string;
  itemsByCategory: Record<TCategory, FeaturedItem[]>;
}

const defaultCollections = <TCategory extends FeaturedCategory>(
  categories: readonly TCategory[]
): Record<TCategory, FeaturedItem[]> => {
  const collections = {} as Record<TCategory, FeaturedItem[]>;

  for (const category of categories) {
    collections[category] = [];
  }

  return collections;
};

const toFeaturedItem = (row: SupabaseFeaturedRow): FeaturedItem => ({
  id: row.id,
  slug: row.slug,
  category: row.category,
  title: row.title,
  summary: row.summary,
  imageUrl: row.image_url?.trim() || null,
  href: row.href,
  badge: row.badge,
  sortOrder: row.sort_order,
  isPublished: row.is_published,
  createdAt: row.created_at
});

export async function getFeaturedCollections<TCategory extends FeaturedCategory>(
  categories: readonly TCategory[]
): Promise<FeaturedCollectionResult<TCategory>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      source: "env-missing",
      itemsByCategory: defaultCollections(categories)
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
      .from("featured_items")
      .select(
        "id, slug, category, title, summary, image_url, href, badge, sort_order, is_published, created_at"
      )
      .in("category", [...categories])
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const mapped = defaultCollections(categories);

    for (const row of (data ?? []) as SupabaseFeaturedRow[]) {
      if (row.category in mapped) {
        mapped[row.category as TCategory].push(toFeaturedItem(row));
      }
    }

    return {
      source: data && data.length > 0 ? "remote" : "empty",
      itemsByCategory: mapped
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase error";
    return {
      source: "error",
      errorMessage: message,
      itemsByCategory: defaultCollections(categories)
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

export interface BookmarkInput {
  title: string;
  summary: string;
  href: string | null;
  badge: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface BookmarkMutationResult {
  ok: boolean;
  errorMessage?: string;
}

export interface BookmarksAdminResult {
  source: SourceState;
  errorMessage?: string;
  items: FeaturedItem[];
}

export async function getAllBookmarksAdmin(): Promise<BookmarksAdminResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("featured_items")
      .select(
        "id, slug, category, title, summary, image_url, href, badge, sort_order, is_published, created_at"
      )
      .eq("category", "bookmarks")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const items = ((data ?? []) as SupabaseFeaturedRow[]).map(toFeaturedItem);
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

export async function createBookmark(input: BookmarkInput): Promise<BookmarkMutationResult> {
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (title.length < 2) return { ok: false, errorMessage: "Title must be at least 2 characters." };
  if (summary.length < 5) return { ok: false, errorMessage: "Summary must be at least 5 characters." };

  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .concat("-", String(Date.now()));

  try {
    const { error } = await supabase.from("featured_items").insert({
      slug,
      category: "bookmarks",
      title,
      summary,
      image_url: null,
      href: input.href?.trim() || null,
      badge: input.badge?.trim() || null,
      sort_order: input.sortOrder,
      is_published: input.isPublished
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Create failed." };
  }
}

export async function updateBookmark(
  id: string,
  input: Partial<BookmarkInput>
): Promise<BookmarkMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.summary !== undefined) patch.summary = input.summary.trim();
  if ("href" in input) patch.href = input.href?.trim() || null;
  if ("badge" in input) patch.badge = input.badge?.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isPublished !== undefined) patch.is_published = input.isPublished;
  try {
    const { error } = await supabase.from("featured_items").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function deleteBookmark(id: string): Promise<BookmarkMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase.from("featured_items").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Delete failed." };
  }
}
