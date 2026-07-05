import "server-only";

import { createClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

interface SupabaseAkcakanatDomainRow {
  id: string;
  site: string;
  domain_info: string;
  hosting: string;
  email: string;
  has_email: boolean;
  redirect_to: string;
  payment_days: string;
  payment_method: string;
  comment: string;
  priority: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AKCAKANAT_DOMAIN_COLUMNS =
  "id, site, domain_info, hosting, email, has_email, redirect_to, payment_days, payment_method, comment, priority, sort_order, created_at, updated_at";

export interface AkcakanatDomainItem {
  id: string;
  site: string;
  domainInfo: string;
  hosting: string;
  email: string;
  /** Whether the domain has a mailbox (var/yok). */
  hasEmail: boolean;
  /** Forwarding target; empty string means no redirect. */
  redirectTo: string;
  /** Renewal/payment due dates, free text. */
  paymentDays: string;
  /** How the domain is paid, e.g. "sanal kart". */
  paymentMethod: string;
  comment: string;
  /** Importance rank: 1 = most important, 10 = least important. */
  priority: number;
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
  hasEmail: boolean;
  redirectTo: string;
  paymentDays: string;
  paymentMethod: string;
  comment: string;
  /** Importance rank: 1 = most important, 10 = least important. */
  priority: number;
  sortOrder: number;
}

/** Clamps an importance rank into the 1-10 range (5 when not a number). */
export function clampAkcakanatPriority(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(10, Math.max(1, Math.trunc(value)));
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
    hasEmail: Boolean(row.has_email),
    redirectTo: row.redirect_to ?? "",
    paymentDays: row.payment_days ?? "",
    paymentMethod: row.payment_method ?? "",
    comment: row.comment ?? "",
    priority: clampAkcakanatPriority(row.priority),
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
 * Returns every Akçakanat domain record ordered by importance (1 first), then
 * manual sort_order, then creation time. Admin-only (service-role) access
 * behind the /bakcakanat gate.
 */
export async function getAllAkcakanatDomainsAdmin(): Promise<AkcakanatDomainsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("akcakanat_domains")
      .select(AKCAKANAT_DOMAIN_COLUMNS)
      .order("priority", { ascending: true })
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
      has_email: input.hasEmail,
      redirect_to: input.redirectTo.trim(),
      payment_days: input.paymentDays.trim(),
      payment_method: input.paymentMethod.trim(),
      comment: input.comment.trim(),
      priority: clampAkcakanatPriority(input.priority),
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
    if (input.hasEmail !== undefined) patch.has_email = input.hasEmail;
    if (input.redirectTo !== undefined) {
      patch.redirect_to = input.redirectTo.trim();
    }
    if (input.paymentDays !== undefined) {
      patch.payment_days = input.paymentDays.trim();
    }
    if (input.paymentMethod !== undefined) {
      patch.payment_method = input.paymentMethod.trim();
    }
    if (input.comment !== undefined) patch.comment = input.comment.trim();
    if (input.priority !== undefined) {
      patch.priority = clampAkcakanatPriority(input.priority);
    }
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
