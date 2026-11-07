import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { SourceState } from "@/types/source-state";
import { toErrorMessage } from "@/lib/error-message";
import { createServiceClient, SERVICE_CREDENTIALS_MISSING } from "@/lib/supabase-server";

export type DetrbridgeTodoStatus = "open" | "done";

export type DetrbridgeTodoBoard = "todos" | "todos2";

interface TodoBoardStorage {
  todos: string;
  comments: string;
  attachments: string;
  bucket: string;
}

const BOARD_STORAGE: Record<DetrbridgeTodoBoard, TodoBoardStorage> = {
  todos: {
    todos: "detrbridge_todos",
    comments: "detrbridge_todo_comments",
    attachments: "detrbridge_todo_attachments",
    bucket: "detrbridge-files"
  },
  todos2: {
    todos: "detrbridge_todos2",
    comments: "detrbridge_todo2_comments",
    attachments: "detrbridge_todo2_attachments",
    bucket: "detrbridge-files2"
  }
};

const TODO_STATUSES: readonly DetrbridgeTodoStatus[] = ["open", "done"];

export function normalizeDetrbridgeStatus(value: string): DetrbridgeTodoStatus {
  return (TODO_STATUSES as readonly string[]).includes(value)
    ? (value as DetrbridgeTodoStatus)
    : "open";
}

export interface DetrbridgeTodoComment {
  id: string;
  todoId: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface DetrbridgeTodoAttachment {
  id: string;
  todoId: string;
  fileName: string;
  sizeBytes: number;
  /** Signed download URL (null when signing failed). */
  url: string | null;
  createdAt: string;
}

export interface DetrbridgeTodoItem {
  id: string;
  title: string;
  assignee: string;
  /** ISO date (yyyy-mm-dd) or null when the todo has no deadline. */
  dueDate: string | null;
  status: DetrbridgeTodoStatus;
  comments: DetrbridgeTodoComment[];
  attachments: DetrbridgeTodoAttachment[];
  createdAt: string;
  updatedAt: string;
  /** Arşivlenme anı; null ise görev aktif listede. */
  archivedAt: string | null;
}

export interface DetrbridgeTodosResult {
  source: SourceState;
  errorMessage?: string;
  items: DetrbridgeTodoItem[];
}

export interface DetrbridgeTodoInput {
  title: string;
  assignee: string;
  /** Empty string means "no due date". */
  dueDate: string;
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

interface SupabaseTodoRow {
  id: string;
  title: string;
  assignee: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

interface SupabaseCommentRow {
  id: string;
  todo_id: string;
  body: string;
  author: string;
  created_at: string;
}

interface SupabaseAttachmentRow {
  id: string;
  todo_id: string;
  storage_path: string;
  file_name: string;
  size_bytes: number;
  created_at: string;
}

const TODO_COLUMNS =
  "id, title, assignee, due_date, status, created_at, updated_at, archived_at";
const COMMENT_COLUMNS = "id, todo_id, body, author, created_at";
const ATTACHMENT_COLUMNS = "id, todo_id, storage_path, file_name, size_bytes, created_at";

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 8; // 8 hours, matches the admin session
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

/** Returns the due date normalized to yyyy-mm-dd, or null when absent/invalid. */
function normalizeDueDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return DUE_DATE_PATTERN.test(trimmed) ? trimmed : null;
}

function toTodoItem(
  row: SupabaseTodoRow,
  comments: DetrbridgeTodoComment[],
  attachments: DetrbridgeTodoAttachment[]
): DetrbridgeTodoItem {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    dueDate: row.due_date,
    status: normalizeDetrbridgeStatus(row.status),
    comments,
    attachments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at
  };
}

function toComment(row: SupabaseCommentRow): DetrbridgeTodoComment {
  return {
    id: row.id,
    todoId: row.todo_id,
    body: row.body,
    author: row.author,
    createdAt: row.created_at
  };
}

/**
 * Signs every attachment row's storage path in one batch and groups the
 * results by todo id. Signing failures degrade to url: null per file.
 */
async function loadAttachmentsByTodo(
  supabase: SupabaseClient,
  storage: TodoBoardStorage
): Promise<Map<string, DetrbridgeTodoAttachment[]>> {
  const byTodo = new Map<string, DetrbridgeTodoAttachment[]>();
  const { data, error } = await supabase
    .from(storage.attachments)
    .select(ATTACHMENT_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as SupabaseAttachmentRow[];
  if (rows.length === 0) return byTodo;

  const urlByPath = new Map<string, string>();
  try {
    const { data: signed } = await supabase.storage
      .from(storage.bucket)
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
    // Signing failed as a whole; every attachment falls back to url: null.
  }

  for (const row of rows) {
    const list = byTodo.get(row.todo_id) ?? [];
    list.push({
      id: row.id,
      todoId: row.todo_id,
      fileName: row.file_name,
      sizeBytes: row.size_bytes,
      url: urlByPath.get(row.storage_path) ?? null,
      createdAt: row.created_at
    });
    byTodo.set(row.todo_id, list);
  }
  return byTodo;
}

/**
 * Returns every todo with its full comment thread and signed attachment
 * links. Open todos come first, ordered by deadline (todos without a
 * deadline last), then by creation time.
 */
export async function getAllTodosAdmin(
  board: DetrbridgeTodoBoard
): Promise<DetrbridgeTodosResult> {
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from(storage.todos)
      .select(TODO_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseTodoRow[];

    const commentsByTodo = new Map<string, DetrbridgeTodoComment[]>();
    let attachmentsByTodo = new Map<string, DetrbridgeTodoAttachment[]>();
    if (rows.length > 0) {
      const { data: commentRows, error: commentError } = await supabase
        .from(storage.comments)
        .select(COMMENT_COLUMNS)
        .order("created_at", { ascending: true });
      if (commentError) throw commentError;
      for (const row of (commentRows ?? []) as SupabaseCommentRow[]) {
        const list = commentsByTodo.get(row.todo_id) ?? [];
        list.push(toComment(row));
        commentsByTodo.set(row.todo_id, list);
      }
      attachmentsByTodo = await loadAttachmentsByTodo(supabase, storage);
    }

    const items = rows
      .map((row) =>
        toTodoItem(
          row,
          commentsByTodo.get(row.id) ?? [],
          attachmentsByTodo.get(row.id) ?? []
        )
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "open" ? -1 : 1;
        if (a.dueDate !== b.dueDate) {
          if (a.dueDate === null) return 1;
          if (b.dueDate === null) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return a.createdAt.localeCompare(b.createdAt);
      });

    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: toErrorMessage(error, "Unknown error"),
      items: []
    };
  }
}

/** Arşivde olmayan görev sayısı — sekme rozetleri için. */
export async function getActiveTodoCount(board: DetrbridgeTodoBoard): Promise<number> {
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from(storage.todos)
    .select("id", { count: "exact", head: true })
    .is("archived_at", null);
  if (error) return 0;
  return count ?? 0;
}

export async function getTodoByIdAdmin(
  board: DetrbridgeTodoBoard,
  id: string
): Promise<DetrbridgeTodoItem | null> {
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(storage.todos)
      .select(TODO_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toTodoItem(data as SupabaseTodoRow, [], []);
  } catch {
    return null;
  }
}

/** Validate + upload one attachment. Returns the stored path or an error. */
async function uploadAttachment(
  supabase: SupabaseClient,
  bucket: string,
  todoId: string,
  file: File
): Promise<{ ok: true; path: string } | { ok: false; errorMessage: string }> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, errorMessage: "Dosya en fazla 10 MB olabilir." };
  }
  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "dosya";
  const path = `todos/${todoId}/${Date.now()}-${safeName}`;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: true
      });
    if (error) throw error;
    return { ok: true, path };
  } catch (error) {
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Yükleme başarısız.")
    };
  }
}

async function removeAttachmentObjects(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(bucket).remove(paths);
  } catch {
    // Best-effort cleanup; a dangling object is harmless.
  }
}

export async function addAttachment(
  board: DetrbridgeTodoBoard,
  todoId: string,
  file: File
): Promise<MutationResult> {
  if (!file || file.size === 0) {
    return { ok: false, errorMessage: "Dosya seçilmedi." };
  }
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  const uploaded = await uploadAttachment(supabase, storage.bucket, todoId, file);
  if (!uploaded.ok) return uploaded;
  try {
    const { error } = await supabase.from(storage.attachments).insert({
      todo_id: todoId,
      storage_path: uploaded.path,
      file_name: file.name || "dosya",
      size_bytes: file.size
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    await removeAttachmentObjects(supabase, storage.bucket, [uploaded.path]);
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Attach failed.")
    };
  }
}

export async function deleteAttachment(
  board: DetrbridgeTodoBoard,
  attachmentId: string
): Promise<MutationResult> {
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  try {
    const { data: existing } = await supabase
      .from(storage.attachments)
      .select("storage_path")
      .eq("id", attachmentId)
      .maybeSingle();
    const { error } = await supabase
      .from(storage.attachments)
      .delete()
      .eq("id", attachmentId);
    if (error) throw error;
    const path =
      (existing as { storage_path: string } | null)?.storage_path ?? null;
    if (path) await removeAttachmentObjects(supabase, storage.bucket, [path]);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Delete failed.")
    };
  }
}

export async function createTodo(
  board: DetrbridgeTodoBoard,
  input: DetrbridgeTodoInput
): Promise<MutationResult & { id?: string }> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Görev başlığı en az 2 karakter olmalı." };
  }
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  try {
    const { data, error } = await supabase
      .from(storage.todos)
      .insert({
        title,
        assignee: input.assignee.trim() || "Ortak",
        due_date: normalizeDueDate(input.dueDate),
        status: "open"
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, id: (data as { id: string }).id };
  } catch (error) {
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Create failed.")
    };
  }
}

export async function updateTodo(
  board: DetrbridgeTodoBoard,
  id: string,
  input: DetrbridgeTodoInput
): Promise<MutationResult> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Görev başlığı en az 2 karakter olmalı." };
  }
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  try {
    const { error } = await supabase
      .from(storage.todos)
      .update({
        title,
        assignee: input.assignee.trim() || "Ortak",
        due_date: normalizeDueDate(input.dueDate)
      })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Update failed.")
    };
  }
}

export async function setTodoStatus(
  board: DetrbridgeTodoBoard,
  id: string,
  status: DetrbridgeTodoStatus
): Promise<MutationResult> {
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  try {
    const { error } = await supabase
      .from(storage.todos)
      .update({ status: normalizeDetrbridgeStatus(status) })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Update failed.")
    };
  }
}

/**
 * Görevi arşive alır ya da arşivden çıkarır. Panoda kalıcı silme yok:
 * arşivlenen görev yorumları, dosyaları ve iş durumuyla birlikte durur,
 * sadece aktif listeden çıkıp sayfa sonundaki arşiv kartına taşınır.
 */
export async function setTodoArchived(
  board: DetrbridgeTodoBoard,
  id: string,
  archived: boolean
): Promise<MutationResult> {
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  try {
    const { error } = await supabase
      .from(storage.todos)
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Archive failed.")
    };
  }
}

export async function addComment(
  board: DetrbridgeTodoBoard,
  todoId: string,
  body: string,
  author: string
): Promise<MutationResult> {
  const text = body.trim();
  if (text.length < 1) {
    return { ok: false, errorMessage: "Yorum boş olamaz." };
  }
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  try {
    const { error } = await supabase.from(storage.comments).insert({
      todo_id: todoId,
      body: text,
      author: author.trim() || "Ortak"
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

export async function deleteComment(
  board: DetrbridgeTodoBoard,
  commentId: string
): Promise<MutationResult> {
  const supabase = createServiceClient();
  const storage = BOARD_STORAGE[board];
  if (!supabase) {
    return { ok: false, errorMessage: SERVICE_CREDENTIALS_MISSING };
  }
  try {
    const { error } = await supabase
      .from(storage.comments)
      .delete()
      .eq("id", commentId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: toErrorMessage(error, "Delete failed.")
    };
  }
}
