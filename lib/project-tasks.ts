import "server-only";

import { createClient } from "@supabase/supabase-js";

import type {
  ProjectTaskItem,
  ProjectTaskPriority,
  ProjectTaskStatus
} from "@/types/site";

type SourceState = "remote" | "env-missing" | "empty" | "error";

const TASK_STATUSES: readonly ProjectTaskStatus[] = [
  "todo",
  "in_progress",
  "done",
  "blocked"
];
const TASK_PRIORITIES: readonly ProjectTaskPriority[] = [
  "low",
  "normal",
  "high",
  "top5"
];

function normalizeStatus(value: string): ProjectTaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value)
    ? (value as ProjectTaskStatus)
    : "todo";
}

function normalizePriority(value: string): ProjectTaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
    ? (value as ProjectTaskPriority)
    : "normal";
}

interface SupabaseProjectTaskRow {
  id: string;
  title: string;
  owner: string;
  category: string;
  status: string;
  priority: string;
  due_target: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const PROJECT_TASK_COLUMNS =
  "id, title, owner, category, status, priority, due_target, notes, sort_order, created_at, updated_at";

export interface ProjectTasksResult {
  source: SourceState;
  errorMessage?: string;
  items: ProjectTaskItem[];
}

export interface ProjectTaskInput {
  title: string;
  owner: string;
  category: string;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  dueTarget: string;
  notes: string;
  sortOrder: number;
}

export interface ProjectTaskMutationResult {
  ok: boolean;
  errorMessage?: string;
}

function toProjectTaskItem(row: SupabaseProjectTaskRow): ProjectTaskItem {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner,
    category: row.category,
    status: normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    dueTarget: row.due_target ?? "",
    notes: row.notes ?? "",
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
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

/**
 * Returns every task, grouped-friendly: ordered by owner, then manual
 * sort_order, then creation time. Admin-only (service-role) access.
 */
export async function getAllProjectTasksAdmin(): Promise<ProjectTasksResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("project_tasks")
      .select(PROJECT_TASK_COLUMNS)
      .order("owner", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const items = ((data ?? []) as SupabaseProjectTaskRow[]).map(
      toProjectTaskItem
    );
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

export async function getProjectTaskByIdAdmin(
  id: string
): Promise<ProjectTaskItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("project_tasks")
      .select(PROJECT_TASK_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toProjectTaskItem(data as SupabaseProjectTaskRow);
  } catch {
    return null;
  }
}

export async function createProjectTask(
  input: ProjectTaskInput
): Promise<ProjectTaskMutationResult> {
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, errorMessage: "Görev metni en az 2 karakter olmalı." };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  try {
    const { error } = await supabase.from("project_tasks").insert({
      title,
      owner: input.owner.trim() || "Ortak",
      category: input.category.trim(),
      status: normalizeStatus(input.status),
      priority: normalizePriority(input.priority),
      due_target: input.dueTarget.trim(),
      notes: input.notes.trim(),
      sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0
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

export async function updateProjectTask(
  id: string,
  input: Partial<ProjectTaskInput>
): Promise<ProjectTaskMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  const patch: Record<string, unknown> = {};
  try {
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (title.length < 2) {
        return { ok: false, errorMessage: "Görev metni en az 2 karakter olmalı." };
      }
      patch.title = title;
    }
    if (input.owner !== undefined) patch.owner = input.owner.trim() || "Ortak";
    if (input.category !== undefined) patch.category = input.category.trim();
    if (input.status !== undefined) patch.status = normalizeStatus(input.status);
    if (input.priority !== undefined) {
      patch.priority = normalizePriority(input.priority);
    }
    if (input.dueTarget !== undefined) patch.due_target = input.dueTarget.trim();
    if (input.notes !== undefined) patch.notes = input.notes.trim();
    if (input.sortOrder !== undefined) {
      patch.sort_order = Number.isFinite(input.sortOrder) ? input.sortOrder : 0;
    }

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("project_tasks")
      .update(patch)
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

export async function deleteProjectTask(
  id: string
): Promise<ProjectTaskMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("project_tasks").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}
