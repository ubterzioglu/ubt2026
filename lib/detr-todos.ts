import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

export type DetrTodoStatus = "open" | "done";

const TODO_STATUSES: readonly DetrTodoStatus[] = ["open", "done"];

export function normalizeDetrStatus(value: string): DetrTodoStatus {
  return (TODO_STATUSES as readonly string[]).includes(value)
    ? (value as DetrTodoStatus)
    : "open";
}

export interface DetrTodoComment {
  id: string;
  todoId: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface DetrTodoItem {
  id: string;
  title: string;
  assignee: string;
  /** ISO date (yyyy-mm-dd) or null when the todo has no deadline. */
  dueDate: string | null;
  status: DetrTodoStatus;
  comments: DetrTodoComment[];
  createdAt: string;
  updatedAt: string;
}

export interface DetrTodosResult {
  source: SourceState;
  errorMessage?: string;
  items: DetrTodoItem[];
}

export interface DetrTodoInput {
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
}

interface SupabaseCommentRow {
  id: string;
  todo_id: string;
  body: string;
  author: string;
  created_at: string;
}

const TODO_COLUMNS = "id, title, assignee, due_date, status, created_at, updated_at";
const COMMENT_COLUMNS = "id, todo_id, body, author, created_at";

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

/** Returns the due date normalized to yyyy-mm-dd, or null when absent/invalid. */
function normalizeDueDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return DUE_DATE_PATTERN.test(trimmed) ? trimmed : null;
}

function toTodoItem(row: SupabaseTodoRow, comments: DetrTodoComment[]): DetrTodoItem {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    dueDate: row.due_date,
    status: normalizeDetrStatus(row.status),
    comments,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toComment(row: SupabaseCommentRow): DetrTodoComment {
  return {
    id: row.id,
    todoId: row.todo_id,
    body: row.body,
    author: row.author,
    createdAt: row.created_at
  };
}

/**
 * Returns every todo with its full comment thread. Open todos come first,
 * ordered by deadline (todos without a deadline last), then by creation time.
 */
export async function getAllDetrTodosAdmin(): Promise<DetrTodosResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("detr_todos")
      .select(TODO_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseTodoRow[];

    const commentsByTodo = new Map<string, DetrTodoComment[]>();
    if (rows.length > 0) {
      const { data: commentRows, error: commentError } = await supabase
        .from("detr_todo_comments")
        .select(COMMENT_COLUMNS)
        .order("created_at", { ascending: true });
      if (commentError) throw commentError;
      for (const row of (commentRows ?? []) as SupabaseCommentRow[]) {
        const list = commentsByTodo.get(row.todo_id) ?? [];
        list.push(toComment(row));
        commentsByTodo.set(row.todo_id, list);
      }
    }

    const items = rows
      .map((row) => toTodoItem(row, commentsByTodo.get(row.id) ?? []))
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
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

export async function getDetrTodoByIdAdmin(id: string): Promise<DetrTodoItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("detr_todos")
      .select(TODO_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toTodoItem(data as SupabaseTodoRow, []);
  } catch {
    return null;
  }
}

export async function createDetrTodo(input: DetrTodoInput): Promise<MutationResult> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Görev başlığı en az 2 karakter olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("detr_todos").insert({
      title,
      assignee: input.assignee.trim() || "Ortak",
      due_date: normalizeDueDate(input.dueDate),
      status: "open"
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Create failed."
    };
  }
}

export async function updateDetrTodo(
  id: string,
  input: DetrTodoInput
): Promise<MutationResult> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Görev başlığı en az 2 karakter olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detr_todos")
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
      errorMessage: error instanceof Error ? error.message : "Update failed."
    };
  }
}

export async function setDetrTodoStatus(
  id: string,
  status: DetrTodoStatus
): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detr_todos")
      .update({ status: normalizeDetrStatus(status) })
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

export async function deleteDetrTodo(id: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("detr_todos").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}

export async function addDetrComment(
  todoId: string,
  body: string,
  author: string
): Promise<MutationResult> {
  const text = body.trim();
  if (text.length < 1) {
    return { ok: false, errorMessage: "Yorum boş olamaz." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("detr_todo_comments").insert({
      todo_id: todoId,
      body: text,
      author: author.trim() || "Ortak"
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

export async function deleteDetrComment(commentId: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detr_todo_comments")
      .delete()
      .eq("id", commentId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}
