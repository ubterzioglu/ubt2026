import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { JobNotClaimableError, executeFinderJob } from "@/lib/finder/run-job";
import type {
  FinderContact,
  FinderJobStatus,
  FinderReviewStatus,
  FinderTemplateRow
} from "@/lib/finder/types";

export type {
  FinderJobStatus,
  FinderReviewStatus,
  FinderContact
} from "@/lib/finder/types";

// ─── UI item tipleri ─────────────────────────────────────────────────────────

export interface FinderJobListItem {
  id: string;
  title: string;
  status: FinderJobStatus;
  templateId: string | null;
  roleKey: string;
  categorySlug: string;
  locationLabel: string;
  city: string;
  costTotalUsd: number;
  softCapUsd: number;
  hardCapUsd: number;
  attempts: number;
  candidateCount: number;
  lastErrorMessage: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface FinderCandidateItem {
  id: string;
  jobId: string;
  jobTitle: string;
  canonicalName: string;
  professionLabel: string;
  organizationName: string;
  categorySlug: string;
  city: string;
  addressLine: string;
  languages: string[];
  services: string[];
  contacts: FinderContact[];
  websiteUrl: string;
  appointmentUrl: string;
  sourceUrls: string[];
  evidence: Array<{ quote: string; source_url?: string }>;
  confidenceScore: number;
  classifierModel: string;
  reviewStatus: FinderReviewStatus;
  reviewNotes: string;
  reviewedAt: string | null;
  createdAt: string;
}

export interface FinderQueryItem {
  id: string;
  stage: string;
  providerKey: string;
  queryText: string;
  resultCount: number;
  estimatedCostUsd: number;
  status: string;
  executedAt: string | null;
}

export interface FinderSourceItem {
  id: string;
  providerKey: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string;
  fetchStatus: string;
  crawlAllowed: boolean | null;
}

export interface FinderEventItem {
  id: number;
  eventType: string;
  eventLevel: "debug" | "info" | "warn" | "error";
  message: string;
  createdAt: string;
}

export interface FinderTemplateItem {
  id: string;
  templateKey: string;
  label: string;
  roleKey: string;
  itemType: string;
  categorySlug: string;
  queryTemplates: string[];
  mustExcludeTerms: string[];
  defaultMaxQueries: number;
  defaultMaxSourceUrls: number;
  defaultMaxExtractUrls: number;
  isActive: boolean;
}

export interface FinderProviderItem {
  id: string;
  providerKey: string;
  providerKind: "search" | "extract" | "classify";
  displayName: string;
  isEnabled: boolean;
  defaultModel: string;
  secretRef: string;
  secretConfigured: boolean;
  monthlyCapUsd: number | null;
}

export interface FinderJobDetail {
  job: FinderJobListItem & {
    languageCode: string;
    countryCode: string;
    freeformTopic: string;
    mustIncludeTerms: string[];
    mustExcludeTerms: string[];
    seedUrls: string[];
    maxQueries: number;
    maxSourceUrls: number;
    maxExtractUrls: number;
    maxCandidates: number;
    lastErrorCode: string;
    progress: Record<string, unknown>;
  };
  queries: FinderQueryItem[];
  sources: FinderSourceItem[];
  candidates: FinderCandidateItem[];
  events: FinderEventItem[];
}

export type FinderJobCounts = Record<FinderJobStatus, number>;
export type FinderCandidateCounts = Record<FinderReviewStatus, number>;

export interface FinderMutationResult {
  ok: boolean;
  errorMessage?: string;
  id?: string;
}

export interface FinderRunResult {
  ok: boolean;
  errorMessage?: string;
  status?: string;
  candidates?: number;
}

const JOB_STATUSES: readonly FinderJobStatus[] = [
  "queued",
  "running",
  "review",
  "completed",
  "failed",
  "cancelled",
  "budget_stopped"
];

const REVIEW_STATUSES: readonly FinderReviewStatus[] = [
  "pending",
  "approved",
  "rejected",
  "needs_edit",
  "published"
];

export function normalizeFinderJobStatus(value: string): FinderJobStatus | "all" {
  return (JOB_STATUSES as readonly string[]).includes(value)
    ? (value as FinderJobStatus)
    : "all";
}

export function normalizeFinderReviewStatus(value: string): FinderReviewStatus {
  return (REVIEW_STATUSES as readonly string[]).includes(value)
    ? (value as FinderReviewStatus)
    : "pending";
}

function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// ─── Yardımcı eşlemeler ──────────────────────────────────────────────────────

function toJobListItem(row: Record<string, unknown>): FinderJobListItem {
  const summary = (row.result_summary as Record<string, unknown> | null) ?? {};
  return {
    id: row.id as string,
    title: row.title as string,
    status: (row.status as FinderJobStatus) ?? "queued",
    templateId: (row.template_id as string | null) ?? null,
    roleKey: (row.role_key as string | null) ?? "",
    categorySlug: (row.category_slug as string | null) ?? "",
    locationLabel: (row.location_label as string | null) ?? "",
    city: (row.city as string | null) ?? "",
    costTotalUsd: Number(row.cost_total_usd ?? 0),
    softCapUsd: Number(row.soft_cap_usd ?? 0),
    hardCapUsd: Number(row.hard_cap_usd ?? 0),
    attempts: Number(row.attempts ?? 0),
    candidateCount: Number(summary["candidates"] ?? 0),
    lastErrorMessage: (row.last_error_message as string | null) ?? "",
    createdAt: row.created_at as string,
    startedAt: (row.started_at as string | null) ?? null,
    finishedAt: (row.finished_at as string | null) ?? null
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function toCandidateItem(
  row: Record<string, unknown>,
  jobTitle = ""
): FinderCandidateItem {
  const contactsRaw = Array.isArray(row.contacts) ? row.contacts : [];
  const evidenceRaw = Array.isArray(row.evidence) ? row.evidence : [];
  return {
    id: row.id as string,
    jobId: row.job_id as string,
    jobTitle,
    canonicalName: (row.canonical_name as string | null) ?? "",
    professionLabel: (row.profession_label as string | null) ?? "",
    organizationName: (row.organization_name as string | null) ?? "",
    categorySlug: (row.category_slug as string | null) ?? "",
    city: (row.city as string | null) ?? "",
    addressLine: (row.address_line as string | null) ?? "",
    languages: asStringArray(row.languages),
    services: asStringArray(row.services),
    contacts: contactsRaw as FinderContact[],
    websiteUrl: (row.website_url as string | null) ?? "",
    appointmentUrl: (row.appointment_url as string | null) ?? "",
    sourceUrls: asStringArray(row.source_urls),
    evidence: evidenceRaw as Array<{ quote: string; source_url?: string }>,
    confidenceScore: Number(row.confidence_score ?? 0),
    classifierModel: (row.classifier_model as string | null) ?? "",
    reviewStatus: normalizeFinderReviewStatus(String(row.review_status ?? "pending")),
    reviewNotes: (row.review_notes as string | null) ?? "",
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    createdAt: row.created_at as string
  };
}

// ─── Okuma ───────────────────────────────────────────────────────────────────

export async function getFinderJobsAdmin(
  status: FinderJobStatus | "all" = "all",
  limit = 40
): Promise<FinderJobListItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("service_finder_jobs")
      .select(
        "id, title, status, template_id, role_key, category_slug, location_label, city, cost_total_usd, soft_cap_usd, hard_cap_usd, attempts, result_summary, last_error_message, created_at, started_at, finished_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status !== "all") {
      query = query.eq("status", status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => toJobListItem(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

/**
 * Tüm işlerden, iş sınırı olmadan tüm adayları tek liste halinde döner —
 * `/dm/rapor` sayfasının tam-genişlik satır listesi için.
 */
export async function getAllFinderCandidatesAdmin(): Promise<FinderCandidateItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data: candidateRows, error: candidateError } = await supabase
      .from("service_finder_candidates")
      .select("*")
      .order("city", { ascending: true })
      .order("confidence_score", { ascending: false })
      .limit(5000);
    if (candidateError) throw candidateError;

    const jobIds = Array.from(
      new Set((candidateRows ?? []).map((row) => row.job_id as string))
    );
    const { data: jobRows, error: jobError } = await supabase
      .from("service_finder_jobs")
      .select("id, title")
      .in("id", jobIds.length > 0 ? jobIds : ["00000000-0000-0000-0000-000000000000"]);
    if (jobError) throw jobError;
    const titleById = new Map(
      (jobRows ?? []).map((row) => [row.id as string, (row.title as string | null) ?? ""])
    );

    return (candidateRows ?? []).map((row) =>
      toCandidateItem(
        row as Record<string, unknown>,
        titleById.get(row.job_id as string) ?? ""
      )
    );
  } catch {
    return [];
  }
}

export async function getFinderJobCountsAdmin(): Promise<FinderJobCounts> {
  const empty: FinderJobCounts = {
    queued: 0,
    running: 0,
    review: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    budget_stopped: 0
  };
  const supabase = createServiceClient();
  if (!supabase) return empty;
  try {
    const counts = await Promise.all(
      JOB_STATUSES.map(async (status) => {
        const { count, error } = await supabase
          .from("service_finder_jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", status);
        if (error) throw error;
        return [status, count ?? 0] as const;
      })
    );
    return counts.reduce<FinderJobCounts>(
      (acc, [status, count]) => ({ ...acc, [status]: count }),
      empty
    );
  } catch {
    return empty;
  }
}

export async function getFinderCandidateCountsAdmin(): Promise<FinderCandidateCounts> {
  const empty: FinderCandidateCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    needs_edit: 0,
    published: 0
  };
  const supabase = createServiceClient();
  if (!supabase) return empty;
  try {
    const counts = await Promise.all(
      REVIEW_STATUSES.map(async (status) => {
        const { count, error } = await supabase
          .from("service_finder_candidates")
          .select("id", { count: "exact", head: true })
          .eq("review_status", status);
        if (error) throw error;
        return [status, count ?? 0] as const;
      })
    );
    return counts.reduce<FinderCandidateCounts>(
      (acc, [status, count]) => ({ ...acc, [status]: count }),
      empty
    );
  } catch {
    return empty;
  }
}

export async function getFinderJobDetailAdmin(
  jobId: string,
  candidateStatus: FinderReviewStatus | "all" = "all"
): Promise<FinderJobDetail | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data: jobRow, error: jobError } = await supabase
      .from("service_finder_jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!jobRow) return null;
    const raw = jobRow as Record<string, unknown>;

    let candidateQuery = supabase
      .from("service_finder_candidates")
      .select("*")
      .eq("job_id", jobId)
      .order("confidence_score", { ascending: false })
      .limit(200);
    if (candidateStatus !== "all") {
      candidateQuery = candidateQuery.eq("review_status", candidateStatus);
    }

    const [queriesRes, sourcesRes, candidatesRes, eventsRes] = await Promise.all([
      supabase
        .from("service_finder_job_queries")
        .select(
          "id, stage, provider_key, query_text, result_count, estimated_cost_usd, status, executed_at"
        )
        .eq("job_id", jobId)
        .order("created_at", { ascending: true })
        .limit(100),
      supabase
        .from("service_finder_job_sources")
        .select("id, provider_key, source_url, source_domain, source_title, fetch_status, crawl_allowed")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true })
        .limit(200),
      candidateQuery,
      supabase
        .from("service_finder_job_events")
        .select("id, event_type, event_level, message, created_at")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })
        .limit(80)
    ]);

    return {
      job: {
        ...toJobListItem(raw),
        languageCode: (raw.language_code as string | null) ?? "de",
        countryCode: (raw.country_code as string | null) ?? "",
        freeformTopic: (raw.freeform_topic as string | null) ?? "",
        mustIncludeTerms: asStringArray(raw.must_include_terms),
        mustExcludeTerms: asStringArray(raw.must_exclude_terms),
        seedUrls: asStringArray(raw.seed_urls),
        maxQueries: Number(raw.max_queries ?? 0),
        maxSourceUrls: Number(raw.max_source_urls ?? 0),
        maxExtractUrls: Number(raw.max_extract_urls ?? 0),
        maxCandidates: Number(raw.max_candidates ?? 0),
        lastErrorCode: (raw.last_error_code as string | null) ?? "",
        progress: (raw.progress as Record<string, unknown> | null) ?? {}
      },
      queries: (queriesRes.data ?? []).map((row) => ({
        id: row.id as string,
        stage: (row.stage as string | null) ?? "",
        providerKey: (row.provider_key as string | null) ?? "",
        queryText: (row.query_text as string | null) ?? "",
        resultCount: Number(row.result_count ?? 0),
        estimatedCostUsd: Number(row.estimated_cost_usd ?? 0),
        status: (row.status as string | null) ?? "",
        executedAt: (row.executed_at as string | null) ?? null
      })),
      sources: (sourcesRes.data ?? []).map((row) => ({
        id: row.id as string,
        providerKey: (row.provider_key as string | null) ?? "",
        sourceUrl: (row.source_url as string | null) ?? "",
        sourceDomain: (row.source_domain as string | null) ?? "",
        sourceTitle: (row.source_title as string | null) ?? "",
        fetchStatus: (row.fetch_status as string | null) ?? "",
        crawlAllowed: (row.crawl_allowed as boolean | null) ?? null
      })),
      candidates: (candidatesRes.data ?? []).map((row) =>
        toCandidateItem(row as Record<string, unknown>)
      ),
      events: (eventsRes.data ?? []).map((row) => ({
        id: Number(row.id),
        eventType: (row.event_type as string | null) ?? "",
        eventLevel: ((row.event_level as string | null) ?? "info") as FinderEventItem["eventLevel"],
        message: (row.message as string | null) ?? "",
        createdAt: row.created_at as string
      }))
    };
  } catch {
    return null;
  }
}

export async function getFinderTemplatesAdmin(): Promise<FinderTemplateItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("service_finder_profession_templates")
      .select("*")
      .order("label", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      templateKey: (row.template_key as string | null) ?? "",
      label: (row.label as string | null) ?? "",
      roleKey: (row.role_key as string | null) ?? "",
      itemType: (row.item_type as string | null) ?? "",
      categorySlug: (row.category_slug as string | null) ?? "",
      queryTemplates: asStringArray(row.query_templates),
      mustExcludeTerms: asStringArray(row.must_exclude_terms),
      defaultMaxQueries: Number(row.default_max_queries ?? 12),
      defaultMaxSourceUrls: Number(row.default_max_source_urls ?? 40),
      defaultMaxExtractUrls: Number(row.default_max_extract_urls ?? 25),
      isActive: row.is_active === true
    }));
  } catch {
    return [];
  }
}

export async function getFinderProvidersAdmin(): Promise<FinderProviderItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("service_finder_provider_configs")
      .select(
        "id, provider_key, provider_kind, display_name, is_enabled, default_model, secret_ref, monthly_cap_usd"
      )
      .order("provider_kind", { ascending: true })
      .order("priority", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const secretRef = (row.secret_ref as string | null) ?? "";
      return {
        id: row.id as string,
        providerKey: (row.provider_key as string | null) ?? "",
        providerKind: ((row.provider_kind as string | null) ??
          "search") as FinderProviderItem["providerKind"],
        displayName: (row.display_name as string | null) ?? "",
        isEnabled: row.is_enabled === true,
        defaultModel: (row.default_model as string | null) ?? "",
        secretRef,
        // Yalnızca "tanımlı mı" bilgisi UI'a gider — anahtarın kendisi asla.
        secretConfigured: Boolean(secretRef && process.env[secretRef]),
        monthlyCapUsd:
          row.monthly_cap_usd === null || row.monthly_cap_usd === undefined
            ? null
            : Number(row.monthly_cap_usd)
      };
    });
  } catch {
    return [];
  }
}

export interface FinderCostSummaryRow {
  providerKey: string;
  eventType: string;
  totalAmountUsd: number;
  callCount: number;
}

export async function getFinderCostSummaryAdmin(
  sinceIso?: string
): Promise<FinderCostSummaryRow[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("service_finder_cost_ledger")
      .select("provider_key, event_type, amount_usd")
      .limit(10_000);
    if (sinceIso) {
      query = query.gte("created_at", sinceIso);
    }
    const { data, error } = await query;
    if (error) throw error;

    const buckets = new Map<string, FinderCostSummaryRow>();
    for (const row of (data ?? []) as Array<{
      provider_key: string;
      event_type: string;
      amount_usd: number;
    }>) {
      const key = `${row.provider_key}:${row.event_type}`;
      const existing = buckets.get(key);
      if (existing) {
        buckets.set(key, {
          ...existing,
          totalAmountUsd: existing.totalAmountUsd + Number(row.amount_usd),
          callCount: existing.callCount + 1
        });
      } else {
        buckets.set(key, {
          providerKey: row.provider_key,
          eventType: row.event_type,
          totalAmountUsd: Number(row.amount_usd),
          callCount: 1
        });
      }
    }
    return Array.from(buckets.values()).sort((a, b) => b.totalAmountUsd - a.totalAmountUsd);
  } catch {
    return [];
  }
}

// ─── Mutasyonlar ─────────────────────────────────────────────────────────────

const clampInt = (value: number, min: number, max: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
};

export interface FinderJobCreateInput {
  title: string;
  templateId?: string;
  locationLabel: string;
  city?: string;
  countryCode?: string;
  languageCode?: string;
  freeformTopic?: string;
  mustIncludeTerms?: string[];
  mustExcludeTerms?: string[];
  seedUrls?: string[];
  maxQueries?: number;
  maxSourceUrls?: number;
  maxExtractUrls?: number;
  maxCandidates?: number;
  softCapUsd?: number;
  hardCapUsd?: number;
}

export async function createFinderJobAdmin(
  input: FinderJobCreateInput
): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };

  const title = input.title.trim();
  if (title.length < 3) {
    return { ok: false, errorMessage: "Başlık en az 3 karakter olmalı." };
  }
  const locationLabel = input.locationLabel.trim();
  if (locationLabel.length < 2) {
    return { ok: false, errorMessage: "Lokasyon zorunlu." };
  }

  try {
    let template: FinderTemplateRow | null = null;
    if (input.templateId) {
      const { data, error } = await supabase
        .from("service_finder_profession_templates")
        .select("*")
        .eq("id", input.templateId)
        .maybeSingle();
      if (error) throw error;
      template = (data as FinderTemplateRow | null) ?? null;
      if (!template) {
        return { ok: false, errorMessage: "Seçilen şablon bulunamadı." };
      }
    }

    if (!template && !input.freeformTopic?.trim()) {
      return {
        ok: false,
        errorMessage: "Şablon seçilmediyse serbest konu (freeform topic) zorunlu."
      };
    }

    const softCap = Number.isFinite(input.softCapUsd) && Number(input.softCapUsd) > 0
      ? Number(input.softCapUsd)
      : 1.5;
    const hardCap = Number.isFinite(input.hardCapUsd) && Number(input.hardCapUsd) > 0
      ? Number(input.hardCapUsd)
      : 3;
    if (hardCap < softCap) {
      return { ok: false, errorMessage: "Hard cap, soft cap'ten küçük olamaz." };
    }

    const seedUrls = (input.seedUrls ?? [])
      .map((url) => url.trim())
      .filter((url) => /^https?:\/\//i.test(url))
      .slice(0, 20);

    const { data, error } = await supabase
      .from("service_finder_jobs")
      .insert({
        title,
        template_id: template?.id ?? null,
        role_key: template?.role_key ?? "freeform",
        item_type: template?.item_type ?? "venue",
        category_slug: template?.category_slug ?? null,
        location_label: locationLabel,
        country_code: input.countryCode?.trim().toUpperCase().slice(0, 2) || "DE",
        city: input.city?.trim() || null,
        language_code: input.languageCode?.trim() || "de",
        freeform_topic: input.freeformTopic?.trim() || null,
        must_include_terms: (input.mustIncludeTerms ?? []).slice(0, 20),
        must_exclude_terms: [
          ...(template?.must_exclude_terms ?? []),
          ...(input.mustExcludeTerms ?? [])
        ].slice(0, 30),
        seed_urls: seedUrls,
        max_queries: clampInt(Number(input.maxQueries), 1, 50, template?.default_max_queries ?? 12),
        max_source_urls: clampInt(
          Number(input.maxSourceUrls),
          1,
          200,
          template?.default_max_source_urls ?? 40
        ),
        max_extract_urls: clampInt(
          Number(input.maxExtractUrls),
          1,
          100,
          template?.default_max_extract_urls ?? 25
        ),
        max_candidates: clampInt(Number(input.maxCandidates), 1, 500, 100),
        soft_cap_usd: softCap,
        hard_cap_usd: hardCap
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, id: data.id as string };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "İş oluşturulamadı."
    };
  }
}

/** Kuyruktaki işi çalıştırır (senkron; page.tsx maxDuration=300 gerektirir). */
export async function runFinderJobAdmin(jobId: string): Promise<FinderRunResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const summary = await executeFinderJob(supabase, jobId);
    if (summary.status === "failed") {
      return { ok: false, errorMessage: summary.errorMessage ?? "İş başarısız." };
    }
    return { ok: true, status: summary.status, candidates: summary.candidates };
  } catch (error) {
    if (error instanceof JobNotClaimableError) {
      return { ok: false, errorMessage: error.message };
    }
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "İş çalıştırılamadı."
    };
  }
}

/** failed / budget_stopped / cancelled işleri yeniden kuyruğa alır. */
export async function requeueFinderJobAdmin(
  jobId: string,
  patch?: { softCapUsd?: number; hardCapUsd?: number }
): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const update: Record<string, unknown> = {
      status: "queued",
      locked_by: null,
      finished_at: null,
      cancelled_at: null,
      last_error_code: null,
      last_error_message: null
    };
    if (patch?.softCapUsd && patch.softCapUsd > 0) update.soft_cap_usd = patch.softCapUsd;
    if (patch?.hardCapUsd && patch.hardCapUsd > 0) update.hard_cap_usd = patch.hardCapUsd;

    const { data, error } = await supabase
      .from("service_finder_jobs")
      .update(update)
      .eq("id", jobId)
      .in("status", ["failed", "budget_stopped", "cancelled"])
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { ok: false, errorMessage: "İş bu durumda yeniden kuyruğa alınamaz." };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "İş kuyruğa alınamadı."
    };
  }
}

/** Kuyruktaki işi iptal eder (yalnızca queued). */
export async function cancelFinderJobAdmin(jobId: string): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { data, error } = await supabase
      .from("service_finder_jobs")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", jobId)
      .eq("status", "queued")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { ok: false, errorMessage: "Yalnızca kuyruktaki işler iptal edilebilir." };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "İş iptal edilemedi."
    };
  }
}

/**
 * running'de sıkışan işi failed'e çeker (koşu yarıda öldüyse — ör. deploy
 * sırasında). Yeniden başlatmak için ardından "Tekrar kuyruğa al" kullanılır.
 */
export async function releaseStuckFinderJobAdmin(
  jobId: string
): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { data, error } = await supabase
      .from("service_finder_jobs")
      .update({
        status: "failed",
        locked_by: null,
        finished_at: new Date().toISOString(),
        last_error_code: "stale_lock",
        last_error_message: "Koşu yarıda kaldı; admin tarafından serbest bırakıldı."
      })
      .eq("id", jobId)
      .eq("status", "running")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { ok: false, errorMessage: "İş çalışır durumda değil." };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "İş serbest bırakılamadı."
    };
  }
}

/** Aday incelemesi: pending / approved / rejected / needs_edit (+ not). */
export async function reviewFinderCandidateAdmin(
  candidateId: string,
  status: FinderReviewStatus,
  note?: string
): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  if (status === "published") {
    // Katalog yok — publish akışı bilinçli olarak devre dışı.
    return { ok: false, errorMessage: "Yayınlama bu panoda desteklenmiyor." };
  }
  try {
    const { error } = await supabase
      .from("service_finder_candidates")
      .update({
        review_status: status,
        reviewed_at: new Date().toISOString(),
        review_notes: note?.trim() || null
      })
      .eq("id", candidateId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Aday güncellenemedi."
    };
  }
}

/** Şablonu açar/kapatır. */
export async function setFinderTemplateActiveAdmin(
  templateId: string,
  isActive: boolean
): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase
      .from("service_finder_profession_templates")
      .update({ is_active: isActive })
      .eq("id", templateId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Şablon güncellenemedi."
    };
  }
}

/** Şablonun sorgu kalıplarını / dışlama terimlerini günceller. */
export async function updateFinderTemplateAdmin(
  templateId: string,
  patch: { label?: string; queryTemplates?: string[]; mustExcludeTerms?: string[] }
): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const update: Record<string, unknown> = {};
    if (patch.label && patch.label.trim().length >= 2) update.label = patch.label.trim();
    if (patch.queryTemplates) {
      const templates = patch.queryTemplates
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, 20);
      if (templates.length === 0) {
        return { ok: false, errorMessage: "En az bir sorgu kalıbı gerekli." };
      }
      update.query_templates = templates;
    }
    if (patch.mustExcludeTerms) {
      update.must_exclude_terms = patch.mustExcludeTerms
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, 30);
    }
    if (Object.keys(update).length === 0) {
      return { ok: false, errorMessage: "Güncellenecek alan yok." };
    }
    const { error } = await supabase
      .from("service_finder_profession_templates")
      .update(update)
      .eq("id", templateId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Şablon güncellenemedi."
    };
  }
}

/** Sağlayıcıyı açar/kapatır. */
export async function setFinderProviderEnabledAdmin(
  providerId: string,
  isEnabled: boolean
): Promise<FinderMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase
      .from("service_finder_provider_configs")
      .update({ is_enabled: isEnabled })
      .eq("id", providerId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Sağlayıcı güncellenemedi."
    };
  }
}
