import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { UBTSA_ITEM_KEYS } from "@/content/ubtsa-konsept";

type SourceState = "remote" | "env-missing" | "empty" | "error";

/** Bir maddeye bırakılmış tek yorum. */
export interface UbtsaComment {
  id: string;
  /** content/ubtsa-konsept.ts içindeki madde anahtarı (ör. "b3-m2"). */
  itemKey: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface UbtsaCommentsResult {
  source: SourceState;
  errorMessage?: string;
  /** Madde anahtarı -> o maddenin yorumları (eskiden yeniye). */
  byItemKey: Map<string, UbtsaComment[]>;
  /** Tüm yorumların toplam sayısı. */
  totalCount: number;
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

interface SupabaseCommentRow {
  id: string;
  item_key: string;
  body: string;
  author: string;
  created_at: string;
}

const COMMENT_COLUMNS = "id, item_key, body, author, created_at";

/** Tek bir yorumun kabul edilen en uzun hali. */
const MAX_COMMENT_LENGTH = 4000;

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

function toComment(row: SupabaseCommentRow): UbtsaComment {
  return {
    id: row.id,
    itemKey: row.item_key,
    body: row.body,
    author: row.author,
    createdAt: row.created_at
  };
}

function emptyResult(source: SourceState, errorMessage?: string): UbtsaCommentsResult {
  return { source, errorMessage, byItemKey: new Map(), totalCount: 0 };
}

/**
 * Tüm yorumları tek sorguda çeker ve madde anahtarına göre gruplar.
 * Sayfa 21 bölüm × ~130 maddeyi tek seferde bastığı için madde başına
 * ayrı sorgu atmak yerine hepsi bir kerede alınır.
 */
export async function getAllUbtsaComments(): Promise<UbtsaCommentsResult> {
  const supabase = createServiceClient();
  if (!supabase) return emptyResult("env-missing");
  try {
    const { data, error } = await supabase
      .from("ubtsa_comments")
      .select(COMMENT_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const rows = (data ?? []) as SupabaseCommentRow[];
    const byItemKey = new Map<string, UbtsaComment[]>();
    for (const row of rows) {
      const list = byItemKey.get(row.item_key) ?? [];
      list.push(toComment(row));
      byItemKey.set(row.item_key, list);
    }

    return {
      source: rows.length > 0 ? "remote" : "empty",
      byItemKey,
      totalCount: rows.length
    };
  } catch (error) {
    return emptyResult(
      "error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Bir maddeye yorum ekler. `itemKey` koddaki madde listesine karşı
 * doğrulanır, böylece tabloya hiçbir maddeye bağlanmayan satır yazılamaz.
 */
export async function addUbtsaComment(
  itemKey: string,
  body: string,
  author: string
): Promise<MutationResult> {
  const key = itemKey.trim();
  if (!UBTSA_ITEM_KEYS.has(key)) {
    return { ok: false, errorMessage: "Geçersiz madde." };
  }

  const text = body.trim();
  if (text.length < 1) {
    return { ok: false, errorMessage: "Yorum boş olamaz." };
  }
  if (text.length > MAX_COMMENT_LENGTH) {
    return {
      ok: false,
      errorMessage: `Yorum en fazla ${MAX_COMMENT_LENGTH} karakter olabilir.`
    };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("ubtsa_comments").insert({
      item_key: key,
      body: text,
      author: author.trim() || "ubt"
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

/**
 * Yorumu siler. Yalnızca yorumun sahibi silebilir: `author` eşleşmezse
 * satır dokunulmadan kalır ve çağıran hata alır.
 */
export async function deleteUbtsaComment(
  commentId: string,
  author: string
): Promise<MutationResult> {
  const id = commentId.trim();
  if (!id) return { ok: false, errorMessage: "Yorum bulunamadı." };

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { data, error } = await supabase
      .from("ubtsa_comments")
      .delete()
      .eq("id", id)
      .eq("author", author.trim())
      .select("id");
    if (error) throw error;
    if ((data ?? []).length === 0) {
      return { ok: false, errorMessage: "Sadece kendi yorumunu silebilirsin." };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}
