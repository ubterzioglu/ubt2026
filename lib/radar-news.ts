import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { runRadarScan, ScanLockError } from "@/lib/radar/scan";
import type {
  RadarReviewStatus,
  RadarScanStatus,
  RadarSourceType,
  RadarTriggerType,
  RadarTrustLevel,
  RelevanceReason,
  ScanSummary
} from "@/lib/radar/types";

export type { RadarReviewStatus } from "@/lib/radar/types";

// ─── UI item tipleri ─────────────────────────────────────────────────────────

export interface RadarSourceItem {
  id: string;
  name: string;
  sourceType: RadarSourceType;
  trustLevel: RadarTrustLevel;
  language: string;
  isEnabled: boolean;
  endpointUrl: string;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string;
}

export interface RadarRunItem {
  id: string;
  triggerType: RadarTriggerType;
  status: RadarScanStatus;
  startedAt: string;
  completedAt: string | null;
  sourceCount: number;
  fetchedCount: number;
  insertedCount: number;
  duplicateCount: number;
  filteredCount: number;
  failedSourceCount: number;
  errorMessage: string;
}

export interface RadarCandidateItem {
  id: string;
  title: string;
  summary: string;
  canonicalUrl: string;
  sourceName: string;
  language: string;
  country: string;
  category: string;
  publishedAt: string | null;
  relevanceScore: number;
  relevanceReasons: RelevanceReason[];
  reviewStatus: RadarReviewStatus;
  reviewNote: string;
  reviewedAt: string | null;
  createdAt: string;
}

export type RadarCandidateCounts = Record<RadarReviewStatus, number>;

export interface RadarMutationResult {
  ok: boolean;
  errorMessage?: string;
}

export interface RadarScanResult {
  ok: boolean;
  errorMessage?: string;
  summary?: ScanSummary;
}

const CANDIDATE_STATUSES: readonly RadarReviewStatus[] = [
  "pending",
  "approved",
  "rejected",
  "duplicate",
  "archived"
];

export function normalizeRadarReviewStatus(value: string): RadarReviewStatus {
  return (CANDIDATE_STATUSES as readonly string[]).includes(value)
    ? (value as RadarReviewStatus)
    : "pending";
}

// review_status -> audit log action eşlemesi
const REVIEW_LOG_ACTION: Partial<Record<RadarReviewStatus, string>> = {
  approved: "approve_to_pool",
  rejected: "reject",
  archived: "archive",
  pending: "restore"
};

function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// ─── Okuma ───────────────────────────────────────────────────────────────────

export async function getRadarSourcesAdmin(): Promise<RadarSourceItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("radar_news_sources")
      .select(
        "id, name, source_type, trust_level, language, is_enabled, endpoint_url, last_success_at, last_error_at, last_error_message"
      )
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      sourceType: row.source_type as RadarSourceType,
      trustLevel: row.trust_level as RadarTrustLevel,
      language: (row.language as string | null) ?? "",
      isEnabled: Boolean(row.is_enabled),
      endpointUrl: (row.endpoint_url as string | null) ?? "",
      lastSuccessAt: (row.last_success_at as string | null) ?? null,
      lastErrorAt: (row.last_error_at as string | null) ?? null,
      lastErrorMessage: (row.last_error_message as string | null) ?? ""
    }));
  } catch {
    return [];
  }
}

export async function getRadarRunsAdmin(limit = 8): Promise<RadarRunItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("radar_news_scan_runs")
      .select(
        "id, trigger_type, status, started_at, completed_at, source_count, fetched_count, inserted_count, duplicate_count, filtered_count, failed_source_count, error_message"
      )
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      triggerType: row.trigger_type as RadarTriggerType,
      status: row.status as RadarScanStatus,
      startedAt: row.started_at as string,
      completedAt: (row.completed_at as string | null) ?? null,
      sourceCount: Number(row.source_count ?? 0),
      fetchedCount: Number(row.fetched_count ?? 0),
      insertedCount: Number(row.inserted_count ?? 0),
      duplicateCount: Number(row.duplicate_count ?? 0),
      filteredCount: Number(row.filtered_count ?? 0),
      failedSourceCount: Number(row.failed_source_count ?? 0),
      errorMessage: (row.error_message as string | null) ?? ""
    }));
  } catch {
    return [];
  }
}

export async function getRadarCandidatesAdmin(
  status: RadarReviewStatus | "all" = "pending",
  limit = 60
): Promise<RadarCandidateItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("radar_news_candidates")
      .select(
        "id, title, summary, canonical_url, source_name, language, country, category, published_at, relevance_score, relevance_reasons, review_status, review_note, reviewed_at, created_at"
      )
      .order("relevance_score", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(limit);
    if (status !== "all") {
      query = query.eq("review_status", status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      summary: (row.summary as string | null) ?? "",
      canonicalUrl: row.canonical_url as string,
      sourceName: row.source_name as string,
      language: (row.language as string | null) ?? "",
      country: (row.country as string | null) ?? "",
      category: (row.category as string | null) ?? "",
      publishedAt: (row.published_at as string | null) ?? null,
      relevanceScore: Number(row.relevance_score ?? 0),
      relevanceReasons: (row.relevance_reasons as RelevanceReason[]) ?? [],
      reviewStatus: normalizeRadarReviewStatus(String(row.review_status)),
      reviewNote: (row.review_note as string | null) ?? "",
      reviewedAt: (row.reviewed_at as string | null) ?? null,
      createdAt: row.created_at as string
    }));
  } catch {
    return [];
  }
}

export async function getRadarCandidateCountsAdmin(): Promise<RadarCandidateCounts> {
  const empty: RadarCandidateCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    duplicate: 0,
    archived: 0
  };
  const supabase = createServiceClient();
  if (!supabase) return empty;
  try {
    const counts = await Promise.all(
      CANDIDATE_STATUSES.map(async (status) => {
        const { count, error } = await supabase
          .from("radar_news_candidates")
          .select("id", { count: "exact", head: true })
          .eq("review_status", status);
        if (error) throw error;
        return [status, count ?? 0] as const;
      })
    );
    return counts.reduce<RadarCandidateCounts>(
      (acc, [status, count]) => ({ ...acc, [status]: count }),
      empty
    );
  } catch {
    return empty;
  }
}

// ─── Mutasyonlar ─────────────────────────────────────────────────────────────

export async function setRadarCandidateStatusAdmin(
  id: string,
  status: RadarReviewStatus,
  note?: string
): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase
      .from("radar_news_candidates")
      .update({
        review_status: status,
        reviewed_at: new Date().toISOString(),
        review_note: note?.trim() || null
      })
      .eq("id", id);
    if (error) throw error;

    const action = REVIEW_LOG_ACTION[status];
    if (action) {
      await supabase.from("radar_news_review_logs").insert({
        candidate_id: id,
        action,
        note: note?.trim() || null
      });
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Update failed."
    };
  }
}

export async function setRadarSourceEnabledAdmin(
  id: string,
  isEnabled: boolean
): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase
      .from("radar_news_sources")
      .update({ is_enabled: isEnabled })
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

// ─── Tarama tetikleme ────────────────────────────────────────────────────────

export async function runRadarScanAdmin(
  triggerType: RadarTriggerType = "manual"
): Promise<RadarScanResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const summary = await runRadarScan(supabase, { triggerType });
    return { ok: true, summary };
  } catch (error) {
    if (error instanceof ScanLockError) {
      return { ok: false, errorMessage: "Zaten çalışan bir tarama var." };
    }
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Tarama başarısız."
    };
  }
}
