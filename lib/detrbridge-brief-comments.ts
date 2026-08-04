import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { DETRBRIDGE_BRIEF_ITEM_KEYS } from "@/content/detrbridge-brief";

type SourceState = "remote" | "env-missing" | "empty" | "error";

/** "Toplantı Özeti" sekmesindeki bir maddeye bırakılmış tek yorum. */
export interface BriefComment {
  id: string;
  /** content/detrbridge-brief.ts içindeki madde anahtarı (ör. "task-04"). */
  itemKey: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface BriefCommentsResult {
  source: SourceState;
  errorMessage?: string;
  /** Madde anahtarı -> o maddenin yorumları (eskiden yeniye). */
  byItemKey: Record<string, BriefComment[]>;
  /** Tüm yorumların toplam sayısı. */
  totalCount: number;
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

interface SupabaseBriefCommentRow {
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

function toComment(row: SupabaseBriefCommentRow): BriefComment {
  return {
    id: row.id,
    itemKey: row.item_key,
    body: row.body,
    author: row.author,
    createdAt: row.created_at
  };
}

function emptyResult(source: SourceState, errorMessage?: string): BriefCommentsResult {
  return { source, errorMessage, byItemKey: {}, totalCount: 0 };
}

/**
 * Tüm brifing yorumlarını tek sorguda çeker ve madde anahtarına göre gruplar.
 * Sekme onlarca maddeyi tek seferde bastığı için madde başına ayrı sorgu
 * atmak yerine hepsi bir kerede alınır.
 *
 * Grup yapısı düz bir nesne — sonuç bir client component'e prop olarak
 * geçtiği için Map yerine serileştirmesi sorunsuz olan Record kullanılıyor.
 */
export async function getAllBriefComments(): Promise<BriefCommentsResult> {
  const supabase = createServiceClient();
  if (!supabase) return emptyResult("env-missing");
  try {
    const { data, error } = await supabase
      .from("detrbridge_brief_comments")
      .select(COMMENT_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const rows = (data ?? []) as SupabaseBriefCommentRow[];
    const byItemKey: Record<string, BriefComment[]> = {};
    for (const row of rows) {
      const list = byItemKey[row.item_key] ?? [];
      list.push(toComment(row));
      byItemKey[row.item_key] = list;
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
 * Bir brifing maddesine yorum ekler. `itemKey` koddaki madde listesine karşı
 * doğrulanır, böylece tabloya hiçbir maddeye bağlanmayan satır yazılamaz.
 */
export async function addBriefComment(
  itemKey: string,
  body: string,
  author: string
): Promise<MutationResult> {
  const key = itemKey.trim();
  if (!DETRBRIDGE_BRIEF_ITEM_KEYS.has(key)) {
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
    const { error } = await supabase.from("detrbridge_brief_comments").insert({
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
export async function deleteBriefComment(
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
      .from("detrbridge_brief_comments")
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
