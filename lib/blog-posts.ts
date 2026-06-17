import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { BlogPostItem } from "@/types/site";

type SourceState = "remote" | "env-missing" | "empty" | "error";

interface SupabaseBlogPostRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const BLOG_POST_COLUMNS =
  "id, slug, title, summary, content, cover_image_url, is_published, published_at, created_at, updated_at";

export interface BlogPostsResult {
  source: SourceState;
  errorMessage?: string;
  items: BlogPostItem[];
}

export interface BlogPostInput {
  slug?: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  isPublished: boolean;
}

export interface BlogPostMutationResult {
  ok: boolean;
  errorMessage?: string;
}

function toBlogPostItem(row: SupabaseBlogPostRow): BlogPostItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    coverImageUrl: row.cover_image_url?.trim() || null,
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Converts a title into a URL-safe slug: lowercased, diacritics stripped,
 * non-alphanumerics collapsed to single dashes, trimmed.
 */
export function slugify(value: string): string {
  return value
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getAnonEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function createAnonClient() {
  const env = getAnonEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
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

export async function getBlogPosts(): Promise<BlogPostsResult> {
  const supabase = createAnonClient();
  if (!supabase) return { source: "env-missing", items: [] };

  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_POST_COLUMNS)
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const items = ((data ?? []) as SupabaseBlogPostRow[]).map(toBlogPostItem);
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown blog error",
      items: []
    };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  const supabase = createAnonClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_POST_COLUMNS)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return toBlogPostItem(data as SupabaseBlogPostRow);
  } catch {
    return null;
  }
}

export async function getAllBlogPostsAdmin(): Promise<BlogPostsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_POST_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const items = ((data ?? []) as SupabaseBlogPostRow[]).map(toBlogPostItem);
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

export async function getBlogPostByIdAdmin(id: string): Promise<BlogPostItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_POST_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toBlogPostItem(data as SupabaseBlogPostRow);
  } catch {
    return null;
  }
}

/**
 * Ensures the candidate slug is unique by appending -2, -3, ... when needed.
 * Optionally excludes a row id (so updating a post keeps its own slug).
 */
async function ensureUniqueSlug(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  candidate: string,
  excludeId?: string
): Promise<string> {
  const base = candidate || "post";
  let slug = base;
  let suffix = 2;

  // Cap iterations so a misconfigured DB can never spin forever.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    let query = supabase.from("blog_posts").select("id").eq("slug", slug).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now()}`;
}

export async function createBlogPost(
  input: BlogPostInput
): Promise<BlogPostMutationResult> {
  const title = input.title.trim();
  const summary = input.summary.trim();
  const content = input.content.trim();
  if (title.length < 2) return { ok: false, errorMessage: "Title must be at least 2 characters." };
  if (summary.length < 5) return { ok: false, errorMessage: "Summary must be at least 5 characters." };
  if (content.length < 1) return { ok: false, errorMessage: "Content must not be empty." };

  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };

  try {
    const desired = slugify(input.slug?.trim() || title) || "post";
    const slug = await ensureUniqueSlug(supabase, desired);
    const { error } = await supabase.from("blog_posts").insert({
      slug,
      title,
      summary,
      content,
      cover_image_url: input.coverImageUrl || null,
      is_published: input.isPublished,
      published_at: input.isPublished ? new Date().toISOString() : null
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Create failed." };
  }
}

export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>
): Promise<BlogPostMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };

  const patch: Record<string, unknown> = {};
  try {
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.summary !== undefined) patch.summary = input.summary.trim();
    if (input.content !== undefined) patch.content = input.content.trim();
    if ("coverImageUrl" in input) patch.cover_image_url = input.coverImageUrl || null;
    if (input.slug !== undefined) {
      const desired = slugify(input.slug.trim()) || "post";
      patch.slug = await ensureUniqueSlug(supabase, desired, id);
    }
    if (input.isPublished !== undefined) {
      patch.is_published = input.isPublished;
      // Stamp published_at on the first publish; clear it when unpublishing.
      if (input.isPublished) {
        const current = await getBlogPostByIdAdmin(id);
        patch.published_at = current?.publishedAt ?? new Date().toISOString();
      } else {
        patch.published_at = null;
      }
    }

    const { error } = await supabase.from("blog_posts").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function deleteBlogPost(id: string): Promise<BlogPostMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, errorMessage: error instanceof Error ? error.message : "Delete failed." };
  }
}
