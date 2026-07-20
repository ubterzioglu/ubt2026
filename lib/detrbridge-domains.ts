import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

export interface DetrbridgeDomain {
  id: string;
  domainName: string;
  uploaderName: string;
  isSelected: boolean;
  /** Average of all cast votes (null when nobody has voted yet). */
  averageRating: number | null;
  voteCount: number;
  createdAt: string;
}

export interface DetrbridgeDomainsResult {
  source: SourceState;
  errorMessage?: string;
  items: DetrbridgeDomain[];
}

export interface MutationResult {
  ok: boolean;
  errorMessage?: string;
}

interface SupabaseDomainRow {
  id: string;
  domain_name: string;
  uploader_name: string;
  is_selected: boolean;
  created_at: string;
}

interface SupabaseVoteRow {
  domain_id: string;
  rating: number;
}

const DOMAIN_COLUMNS = "id, domain_name, uploader_name, is_selected, created_at";

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

function toDomain(row: SupabaseDomainRow, votes: number[]): DetrbridgeDomain {
  const voteCount = votes.length;
  const averageRating =
    voteCount > 0 ? votes.reduce((sum, v) => sum + v, 0) / voteCount : null;
  return {
    id: row.id,
    domainName: row.domain_name,
    uploaderName: row.uploader_name,
    isSelected: row.is_selected,
    averageRating,
    voteCount,
    createdAt: row.created_at
  };
}

/**
 * Returns every domain suggestion with its vote average, sorted by average
 * rating (highest first, unvoted domains last), then by creation time.
 */
export async function getAllDomainsAdmin(): Promise<DetrbridgeDomainsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("detrbridge_domains")
      .select(DOMAIN_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as SupabaseDomainRow[];

    const votesByDomain = new Map<string, number[]>();
    if (rows.length > 0) {
      const { data: voteRows, error: voteError } = await supabase
        .from("detrbridge_domain_votes")
        .select("domain_id, rating");
      if (voteError) throw voteError;
      for (const vote of (voteRows ?? []) as SupabaseVoteRow[]) {
        const list = votesByDomain.get(vote.domain_id) ?? [];
        list.push(vote.rating);
        votesByDomain.set(vote.domain_id, list);
      }
    }

    const items = rows
      .map((row) => toDomain(row, votesByDomain.get(row.id) ?? []))
      .sort((a, b) => {
        if (a.averageRating === null && b.averageRating === null) return 0;
        if (a.averageRating === null) return 1;
        if (b.averageRating === null) return -1;
        return b.averageRating - a.averageRating;
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

export async function createDomain(
  uploaderName: string,
  domainName: string
): Promise<MutationResult> {
  const name = domainName.trim();
  if (name.length < 3) {
    return { ok: false, errorMessage: "Domain adı en az 3 karakter olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("detrbridge_domains").insert({
      domain_name: name,
      uploader_name: uploaderName
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

/**
 * Casts (or updates) one voter's rating for a domain. A voter can vote each
 * domain at most once — re-voting under the same name replaces their prior
 * rating rather than adding a second vote (enforced by the unique
 * (domain_id, voter_name) constraint via upsert).
 */
export async function castDomainVote(
  domainId: string,
  voterName: string,
  rating: number
): Promise<MutationResult> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return { ok: false, errorMessage: "Puan 1 ile 10 arasında olmalı." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("detrbridge_domain_votes")
      .upsert(
        { domain_id: domainId, voter_name: voterName, rating },
        { onConflict: "domain_id,voter_name" }
      );
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Oy kaydedilemedi."
    };
  }
}

/**
 * Marks one domain as selected and clears the flag on every other row, so
 * exactly one domain is ever selected at a time.
 */
export async function selectDomain(id: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error: clearError } = await supabase
      .from("detrbridge_domains")
      .update({ is_selected: false })
      .neq("id", id);
    if (clearError) throw clearError;
    const { error } = await supabase
      .from("detrbridge_domains")
      .update({ is_selected: true })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Select failed."
    };
  }
}

export async function deleteDomain(id: string): Promise<MutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase.from("detrbridge_domains").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}
