import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { FooterClientItem, FooterClientStatus } from "@/types/site";

type SourceState = "remote" | "env-missing" | "empty" | "error";

const FOOTER_CLIENT_STATUSES: readonly FooterClientStatus[] = [
  "pending",
  "added",
  "verified"
];

function normalizeStatus(value: string): FooterClientStatus {
  return (FOOTER_CLIENT_STATUSES as readonly string[]).includes(value)
    ? (value as FooterClientStatus)
    : "pending";
}

interface SupabaseFooterClientRow {
  id: string;
  client_name: string;
  domain: string;
  owner: string;
  responsible: string;
  footer_code: string;
  status: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const FOOTER_CLIENT_COLUMNS =
  "id, client_name, domain, owner, responsible, footer_code, status, notes, sort_order, created_at, updated_at";

export interface FooterClientsResult {
  source: SourceState;
  errorMessage?: string;
  items: FooterClientItem[];
}

export interface FooterClientInput {
  clientName: string;
  domain: string;
  owner: string;
  responsible: string;
  footerCode: string;
  status: FooterClientStatus;
  notes: string;
  sortOrder: number;
}

export interface FooterClientMutationResult {
  ok: boolean;
  errorMessage?: string;
}

function toFooterClientItem(row: SupabaseFooterClientRow): FooterClientItem {
  return {
    id: row.id,
    clientName: row.client_name,
    domain: row.domain ?? "",
    owner: row.owner ?? "",
    responsible: row.responsible ?? "",
    footerCode: row.footer_code ?? "",
    status: normalizeStatus(row.status),
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
 * Returns every footer-client record, ordered by owner, then manual
 * sort_order, then creation time. Admin-only (service-role) access.
 */
export async function getAllFooterClientsAdmin(): Promise<FooterClientsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("footer_clients")
      .select(FOOTER_CLIENT_COLUMNS)
      .order("owner", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const items = ((data ?? []) as SupabaseFooterClientRow[]).map(
      toFooterClientItem
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

export async function getFooterClientByIdAdmin(
  id: string
): Promise<FooterClientItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("footer_clients")
      .select(FOOTER_CLIENT_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toFooterClientItem(data as SupabaseFooterClientRow);
  } catch {
    return null;
  }
}

export async function createFooterClient(
  input: FooterClientInput
): Promise<FooterClientMutationResult> {
  const clientName = input.clientName.trim();
  if (clientName.length < 2) {
    return {
      ok: false,
      errorMessage: "Müşteri adı en az 2 karakter olmalı."
    };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  try {
    const { error } = await supabase.from("footer_clients").insert({
      client_name: clientName,
      domain: input.domain.trim(),
      owner: input.owner.trim(),
      responsible: input.responsible.trim(),
      footer_code: input.footerCode,
      status: normalizeStatus(input.status),
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

export async function updateFooterClient(
  id: string,
  input: Partial<FooterClientInput>
): Promise<FooterClientMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  const patch: Record<string, unknown> = {};
  try {
    if (input.clientName !== undefined) {
      const clientName = input.clientName.trim();
      if (clientName.length < 2) {
        return {
          ok: false,
          errorMessage: "Müşteri adı en az 2 karakter olmalı."
        };
      }
      patch.client_name = clientName;
    }
    if (input.domain !== undefined) patch.domain = input.domain.trim();
    if (input.owner !== undefined) patch.owner = input.owner.trim();
    if (input.responsible !== undefined) {
      patch.responsible = input.responsible.trim();
    }
    if (input.footerCode !== undefined) patch.footer_code = input.footerCode;
    if (input.status !== undefined) patch.status = normalizeStatus(input.status);
    if (input.notes !== undefined) patch.notes = input.notes.trim();
    if (input.sortOrder !== undefined) {
      patch.sort_order = Number.isFinite(input.sortOrder) ? input.sortOrder : 0;
    }

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("footer_clients")
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

export async function deleteFooterClient(
  id: string
): Promise<FooterClientMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("footer_clients")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}
