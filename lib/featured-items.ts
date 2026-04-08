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
