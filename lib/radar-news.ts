import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { runRadarScan, ScanLockError } from "@/lib/radar/scan";
import { validateSourceUrl } from "@/lib/radar/source-security";
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
  termsChecked: boolean;
  endpointUrl: string;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string;
}

/** Kaynak düzenleme formunun ihtiyaç duyduğu tüm alanlar. */
export interface RadarSourceDetailItem extends RadarSourceItem {
  adapterKey: string;
  websiteUrl: string;
  country: string;
  categoryDefault: string;
  queryText: string;
  /** config->>'query' — query_text boşken gdelt adaptörünün kullandığı yedek. */
  configQuery: string;
  maxItemsPerScan: number;
  timeoutMs: number;
  termsCheckedAt: string | null;
  termsNotes: string;
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
  city: string;
  category: string;
  publishedAt: string | null;
  relevanceScore: number;
  relevanceReasons: RelevanceReason[];
  reviewStatus: RadarReviewStatus;
  reviewNote: string;
  reviewedAt: string | null;
  duplicateOfCandidateId: string | null;
  createdAt: string;
}

export interface RadarKeywordItem {
  id: string;
  keyword: string;
  language: string;
  category: string;
  weight: number;
  isNegative: boolean;
  isEnabled: boolean;
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
        "id, name, source_type, trust_level, language, is_enabled, terms_checked, endpoint_url, last_success_at, last_error_at, last_error_message"
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
      termsChecked: Boolean(row.terms_checked),
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
        "id, title, summary, canonical_url, source_name, language, country, city, category, published_at, relevance_score, relevance_reasons, review_status, review_note, reviewed_at, duplicate_of_candidate_id, created_at"
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
      city: (row.city as string | null) ?? "",
      category: (row.category as string | null) ?? "",
      publishedAt: (row.published_at as string | null) ?? null,
      relevanceScore: Number(row.relevance_score ?? 0),
      relevanceReasons: (row.relevance_reasons as RelevanceReason[]) ?? [],
      reviewStatus: normalizeRadarReviewStatus(String(row.review_status)),
      reviewNote: (row.review_note as string | null) ?? "",
      reviewedAt: (row.reviewed_at as string | null) ?? null,
      duplicateOfCandidateId: (row.duplicate_of_candidate_id as string | null) ?? null,
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

// ─── Kaynak CRUD (/dmscraper Kaynaklar bölümü) ──────────────────────────────

const VALID_ADAPTER_KEYS = ["rss", "atom", "gdelt_doc_v2"] as const;
const VALID_SOURCE_TYPES: readonly RadarSourceType[] = ["rss", "atom", "gdelt", "json_api"];
const VALID_TRUST_LEVELS: readonly RadarTrustLevel[] = [
  "official",
  "high",
  "standard",
  "discovery_only"
];

const clampNumber = (value: number, min: number, max: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
};

export interface RadarSourceInput {
  name: string;
  endpointUrl: string;
  websiteUrl?: string;
  sourceType: string;
  adapterKey: string;
  language?: string;
  country?: string;
  categoryDefault?: string;
  trustLevel?: string;
  queryText?: string;
  maxItemsPerScan?: number;
  timeoutMs?: number;
  termsChecked: boolean;
  termsNotes?: string;
  isEnabled: boolean;
}

function validateSourceInput(input: RadarSourceInput): string | null {
  if (input.name.trim().length < 2) return "Kaynak adı en az 2 karakter olmalı.";
  const security = validateSourceUrl(input.endpointUrl.trim());
  if (!security.ok) return `Endpoint reddedildi: ${security.reason}`;
  if (!(VALID_ADAPTER_KEYS as readonly string[]).includes(input.adapterKey)) {
    // json_api için adapter yok — motor çalıştıramayacağı kaynağı kabul etme.
    return `Geçersiz adapter: ${input.adapterKey} (rss / atom / gdelt_doc_v2)`;
  }
  if (!(VALID_SOURCE_TYPES as readonly string[]).includes(input.sourceType)) {
    return `Geçersiz kaynak tipi: ${input.sourceType}`;
  }
  return null;
}

export async function getRadarSourceAdmin(
  id: string
): Promise<RadarSourceDetailItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("radar_news_sources")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const config = (data.config as Record<string, unknown> | null) ?? {};
    return {
      id: data.id as string,
      name: data.name as string,
      sourceType: data.source_type as RadarSourceType,
      trustLevel: data.trust_level as RadarTrustLevel,
      language: (data.language as string | null) ?? "",
      isEnabled: Boolean(data.is_enabled),
      termsChecked: Boolean(data.terms_checked),
      endpointUrl: (data.endpoint_url as string | null) ?? "",
      lastSuccessAt: (data.last_success_at as string | null) ?? null,
      lastErrorAt: (data.last_error_at as string | null) ?? null,
      lastErrorMessage: (data.last_error_message as string | null) ?? "",
      adapterKey: (data.adapter_key as string | null) ?? "",
      websiteUrl: (data.website_url as string | null) ?? "",
      country: (data.country as string | null) ?? "",
      categoryDefault: (data.category_default as string | null) ?? "",
      queryText: (data.query_text as string | null) ?? "",
      configQuery: typeof config["query"] === "string" ? (config["query"] as string) : "",
      maxItemsPerScan: Number(data.max_items_per_scan ?? 100),
      timeoutMs: Number(data.timeout_ms ?? 12000),
      termsCheckedAt: (data.terms_checked_at as string | null) ?? null,
      termsNotes: (data.terms_notes as string | null) ?? ""
    };
  } catch {
    return null;
  }
}

export async function createRadarSourceAdmin(
  input: RadarSourceInput
): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  const validationError = validateSourceInput(input);
  if (validationError) return { ok: false, errorMessage: validationError };
  try {
    const queryText = input.queryText?.trim() || null;
    const { error } = await supabase.from("radar_news_sources").insert({
      name: input.name.trim(),
      endpoint_url: input.endpointUrl.trim(),
      website_url: input.websiteUrl?.trim() || null,
      source_type: input.sourceType,
      adapter_key: input.adapterKey,
      language: input.language?.trim() || null,
      country: input.country?.trim() || null,
      category_default: input.categoryDefault?.trim() || null,
      trust_level: (VALID_TRUST_LEVELS as readonly string[]).includes(input.trustLevel ?? "")
        ? input.trustLevel
        : "standard",
      query_text: queryText,
      max_items_per_scan: clampNumber(Number(input.maxItemsPerScan), 1, 500, 100),
      timeout_ms: clampNumber(Number(input.timeoutMs), 1000, 60000, 12000),
      terms_checked: input.termsChecked,
      terms_checked_at: input.termsChecked ? new Date().toISOString() : null,
      terms_notes: input.termsNotes?.trim() || null,
      // Terms doğrulanmadan kaynak asla aktif olamaz (server-side gate).
      is_enabled: input.termsChecked ? input.isEnabled : false,
      config: queryText ? { query: queryText } : {}
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Kaynak oluşturulamadı."
    };
  }
}

export async function updateRadarSourceAdmin(
  id: string,
  input: RadarSourceInput
): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  const validationError = validateSourceInput(input);
  if (validationError) return { ok: false, errorMessage: validationError };
  try {
    // Config merge = read-modify-write: query dışındaki anahtarlar (timespan,
    // allowedLanguages, target vb.) klonlanır — komple obje asla ezilmez.
    const { data: existing, error: readError } = await supabase
      .from("radar_news_sources")
      .select("terms_checked, terms_checked_at, config")
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) return { ok: false, errorMessage: "Kaynak bulunamadı." };

    const previousTerms = Boolean(existing.terms_checked);
    const config = {
      ...((existing.config as Record<string, unknown> | null) ?? {})
    };
    const queryText = input.queryText?.trim() || null;
    if (queryText) {
      config["query"] = queryText;
    } else {
      delete config["query"];
    }

    const { error } = await supabase
      .from("radar_news_sources")
      .update({
        name: input.name.trim(),
        endpoint_url: input.endpointUrl.trim(),
        website_url: input.websiteUrl?.trim() || null,
        source_type: input.sourceType,
        adapter_key: input.adapterKey,
        language: input.language?.trim() || null,
        country: input.country?.trim() || null,
        category_default: input.categoryDefault?.trim() || null,
        trust_level: (VALID_TRUST_LEVELS as readonly string[]).includes(input.trustLevel ?? "")
          ? input.trustLevel
          : "standard",
        query_text: queryText,
        max_items_per_scan: clampNumber(Number(input.maxItemsPerScan), 1, 500, 100),
        timeout_ms: clampNumber(Number(input.timeoutMs), 1000, 60000, 12000),
        terms_checked: input.termsChecked,
        terms_checked_at: input.termsChecked
          ? previousTerms
            ? ((existing.terms_checked_at as string | null) ?? new Date().toISOString())
            : new Date().toISOString()
          : null,
        terms_notes: input.termsNotes?.trim() || null,
        is_enabled: input.termsChecked ? input.isEnabled : false,
        config
      })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Kaynak güncellenemedi."
    };
  }
}

// ─── Kopya işaretleme ────────────────────────────────────────────────────────

export async function markRadarCandidateDuplicateAdmin(
  id: string,
  duplicateOfId: string,
  note?: string
): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  if (!duplicateOfId.trim()) {
    return { ok: false, errorMessage: "Orijinal aday ID'si gerekli." };
  }
  if (id === duplicateOfId.trim()) {
    return { ok: false, errorMessage: "Aday kendisinin kopyası olamaz." };
  }
  try {
    const { data: target, error: targetError } = await supabase
      .from("radar_news_candidates")
      .select("id")
      .eq("id", duplicateOfId.trim())
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target) {
      return { ok: false, errorMessage: "Orijinal aday bulunamadı." };
    }

    const { error } = await supabase
      .from("radar_news_candidates")
      .update({
        review_status: "duplicate",
        duplicate_of_candidate_id: duplicateOfId.trim(),
        reviewed_at: new Date().toISOString(),
        review_note: note?.trim() || null
      })
      .eq("id", id);
    if (error) throw error;

    await supabase.from("radar_news_review_logs").insert({
      candidate_id: id,
      action: "mark_duplicate",
      note: note?.trim() || null
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Kopya işaretlenemedi."
    };
  }
}

// ─── Keyword CRUD (/dmscraper Keywords bölümü) ──────────────────────────────

export async function getRadarKeywordsAdmin(
  includeDisabled = true
): Promise<RadarKeywordItem[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("radar_news_keywords")
      .select("id, keyword, language, category, weight, is_negative, is_enabled")
      .order("is_negative", { ascending: true })
      .order("category", { ascending: true })
      .order("weight", { ascending: false });
    if (!includeDisabled) {
      query = query.eq("is_enabled", true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      keyword: row.keyword as string,
      language: (row.language as string | null) ?? "",
      category: (row.category as string | null) ?? "",
      weight: Number(row.weight ?? 0),
      isNegative: row.is_negative === true,
      isEnabled: row.is_enabled === true
    }));
  } catch {
    return [];
  }
}

export interface RadarKeywordInput {
  keyword: string;
  language: string;
  category?: string;
  weight?: number;
  isNegative?: boolean;
  isEnabled?: boolean;
}

export async function createRadarKeywordAdmin(
  input: RadarKeywordInput
): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  const keyword = input.keyword.trim();
  const language = input.language.trim();
  if (!keyword) return { ok: false, errorMessage: "Keyword zorunlu." };
  if (!language) return { ok: false, errorMessage: "Dil zorunlu." };
  try {
    // Tabloda unique constraint yok — case-insensitive kopya kontrolü uygulama
    // katmanında yapılır (corteqs'ten kopyalanan satırlarda duplicate olabilir).
    const { data: existing, error: readError } = await supabase
      .from("radar_news_keywords")
      .select("id, keyword")
      .eq("language", language)
      .ilike("keyword", keyword);
    if (readError) throw readError;
    if ((existing ?? []).some((row) => String(row.keyword).toLowerCase() === keyword.toLowerCase())) {
      return { ok: false, errorMessage: "Bu keyword bu dilde zaten kayıtlı." };
    }

    const { error } = await supabase.from("radar_news_keywords").insert({
      keyword,
      language,
      category: input.category?.trim() || null,
      weight: clampNumber(Number(input.weight), 0, 100, 20),
      is_negative: input.isNegative === true,
      is_enabled: input.isEnabled !== false
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Keyword eklenemedi."
    };
  }
}

export async function updateRadarKeywordAdmin(
  id: string,
  input: RadarKeywordInput
): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  const keyword = input.keyword.trim();
  const language = input.language.trim();
  if (!keyword) return { ok: false, errorMessage: "Keyword zorunlu." };
  if (!language) return { ok: false, errorMessage: "Dil zorunlu." };
  try {
    const { error } = await supabase
      .from("radar_news_keywords")
      .update({
        keyword,
        language,
        category: input.category?.trim() || null,
        weight: clampNumber(Number(input.weight), 0, 100, 20),
        is_negative: input.isNegative === true,
        is_enabled: input.isEnabled !== false
      })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Keyword güncellenemedi."
    };
  }
}

/** Hard delete — keyword'e FK referansı yok; kalıcı silme typo temizliği için. */
export async function deleteRadarKeywordAdmin(id: string): Promise<RadarMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, errorMessage: "Service credentials missing." };
  try {
    const { error } = await supabase.from("radar_news_keywords").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Keyword silinemedi."
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
