import "server-only";

import type { SourceState } from "@/types/source-state";
import { toErrorMessage } from "@/lib/error-message";
import { createServiceClient, SERVICE_CREDENTIALS_MISSING } from "@/lib/supabase-server";

export interface ItemComment {
  id: string;
  itemKey: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface ItemCommentsResult {
  source: SourceState;
  errorMessage?: string;
  byItemKey: Record<string, ItemComment[]>;
  totalCount: number;
}

export interface ItemCommentMutationResult {
  ok: boolean;
  errorMessage?: string;
}

interface ItemCommentsConfig {
  table: string;
  itemKeys: ReadonlySet<string>;
}

interface SupabaseItemCommentRow {
  id: string;
  item_key: string;
  body: string;
  author: string;
  created_at: string;
}

const COMMENT_COLUMNS = "id, item_key, body, author, created_at";

const MAX_COMMENT_LENGTH = 4000;

function toComment(row: SupabaseItemCommentRow): ItemComment {
  return {
    id: row.id,
    itemKey: row.item_key,
    body: row.body,
    author: row.author,
    createdAt: row.created_at
  };
}

function emptyResult(source: SourceState, errorMessage?: string): ItemCommentsResult {
  return { source, errorMessage, byItemKey: {}, totalCount: 0 };
}

export function createItemComments({ table, itemKeys }: ItemCommentsConfig) {
  async function getAll(): Promise<ItemCommentsResult> {
    const supabase = createServiceClient();
    if (!supabase) return emptyResult("env-missing");
    try {
      const { data, error } = await supabase
        .from(table)
        .select(COMMENT_COLUMNS)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const rows = (data ?? []) as SupabaseItemCommentRow[];
      const byItemKey: Record<string, ItemComment[]> = {};
      for (const row of rows) {
        const list = Object.hasOwn(byItemKey, row.item_key) ? byItemKey[row.item_key] : [];
        list.push(toComment(row));
        byItemKey[row.item_key] = list;
      }

      return {
        source: rows.length > 0 ? "remote" : "empty",
        byItemKey,
        totalCount: rows.length
      };
    } catch (error) {
      return emptyResult("error", toErrorMessage(error, "Unknown error"));
    }
  }

  async function add(
    itemKey: string,
    body: string,
    author: string
  ): Promise<ItemCommentMutationResult> {
    const key = itemKey.trim();
    if (!itemKeys.has(key)) {
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
      return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
    }
    try {
      const { error } = await supabase.from(table).insert({
        item_key: key,
        body: text,
        author: author.trim() || "ubt"
      });
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        errorMessage: toErrorMessage(error, "Comment failed.")
      };
    }
  }

  async function remove(commentId: string, author: string): Promise<ItemCommentMutationResult> {
    const id = commentId.trim();
    if (!id) return { ok: false, errorMessage: "Yorum bulunamadı." };

    const supabase = createServiceClient();
    if (!supabase) {
      return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
    }
    try {
      const { data, error } = await supabase
        .from(table)
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
        errorMessage: toErrorMessage(error, "Delete failed.")
      };
    }
  }

  return { getAll, add, remove };
}
