import "server-only";

import { createClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

interface SupabaseAkcakanatDomainRow {
  id: string;
  site: string;
  domain_info: string;
  hosting: string;
  email: string;
  comment: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AKCAKANAT_DOMAIN_COLUMNS =
  "id, site, domain_info, hosting, email, comment, sort_order, created_at, updated_at";

export interface AkcakanatDomainItem {
  id: string;
  site: string;
  domainInfo: string;
  hosting: string;
  email: string;
  comment: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AkcakanatDomainsResult {
  source: SourceState;
  errorMessage?: string;
  items: AkcakanatDomainItem[];
}

export interface AkcakanatDomainInput {
  site: string;
  domainInfo: string;
  hosting: string;
  email: string;
  comment: string;
  sortOrder: number;
}

export interface AkcakanatDomainMutationResult {
  ok: boolean;
  errorMessage?: string;
}

function toAkcakanatDomainItem(
  row: SupabaseAkcakanatDomainRow
): AkcakanatDomainItem {
  return {
    id: row.id,
    site: row.site,
    domainInfo: row.domain_info ?? "",
    hosting: row.hosting ?? "",
    email: row.email ?? "",
    comment: row.comment ?? "",
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
 * Returns every Akçakanat domain record ordered by manual sort_order, then
 * creation time. Admin-only (service-role) access behind the /backcakanat gate.
 */
export async function getAllAkcakanatDomainsAdmin(): Promise<AkcakanatDomainsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("akcakanat_domains")
      .select(AKCAKANAT_DOMAIN_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const items = ((data ?? []) as SupabaseAkcakanatDomainRow[]).map(
      toAkcakanatDomainItem
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

export async function createAkcakanatDomain(
  input: AkcakanatDomainInput
): Promise<AkcakanatDomainMutationResult> {
  const site = input.site.trim();
  if (site.length < 3) {
    return { ok: false, errorMessage: "Site adı en az 3 karakter olmalı." };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  try {
    const { error } = await supabase.from("akcakanat_domains").insert({
      site,
      domain_info: input.domainInfo.trim(),
      hosting: input.hosting.trim(),
      email: input.email.trim(),
      comment: input.comment.trim(),
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

export async function updateAkcakanatDomain(
  id: string,
  input: Partial<AkcakanatDomainInput>
): Promise<AkcakanatDomainMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  const patch: Record<string, unknown> = {};
  try {
    if (input.site !== undefined) {
      const site = input.site.trim();
      if (site.length < 3) {
        return { ok: false, errorMessage: "Site adı en az 3 karakter olmalı." };
      }
      patch.site = site;
    }
    if (input.domainInfo !== undefined) {
      patch.domain_info = input.domainInfo.trim();
    }
    if (input.hosting !== undefined) patch.hosting = input.hosting.trim();
    if (input.email !== undefined) patch.email = input.email.trim();
    if (input.comment !== undefined) patch.comment = input.comment.trim();
    if (input.sortOrder !== undefined) {
      patch.sort_order = Number.isFinite(input.sortOrder) ? input.sortOrder : 0;
    }

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("akcakanat_domains")
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

export async function deleteAkcakanatDomain(
  id: string
): Promise<AkcakanatDomainMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("akcakanat_domains")
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
