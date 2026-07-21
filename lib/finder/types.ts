// Service Finder engine types — corteqsmvp workers/service-finder portu.
// Arama hedefi desiremap.de için retarget edildi (Almanya mekan kategorileri).

export type FinderJobStatus =
  | "queued"
  | "running"
  | "review"
  | "completed"
  | "failed"
  | "cancelled"
  | "budget_stopped";

export type FinderReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_edit"
  | "published";

export interface FinderJobRow {
  id: string;
  title: string;
  status: FinderJobStatus;
  priority: number;
  template_id: string | null;
  search_provider_id: string | null;
  extract_provider_id: string | null;
  classifier_provider_id: string | null;
  role_key: string;
  item_type: string;
  category_slug: string | null;
  location_label: string;
  country_code: string | null;
  region: string | null;
  city: string | null;
  language_code: string;
  freeform_topic: string | null;
  must_include_terms: string[];
  must_exclude_terms: string[];
  seed_queries: unknown;
  seed_urls: string[];
  max_queries: number;
  max_source_urls: number;
  max_extract_urls: number;
  max_candidates: number;
  soft_cap_usd: number;
  hard_cap_usd: number;
  cost_total_usd: number;
  result_summary: Record<string, unknown>;
  progress: Record<string, unknown>;
  attempts: number;
  last_error_code: string | null;
  last_error_message: string | null;
  locked_by: string | null;
  started_at: string | null;
  finished_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinderProviderConfigRow {
  id: string;
  provider_key: string;
  provider_kind: "search" | "extract" | "classify";
  display_name: string;
  is_enabled: boolean;
  priority: number;
  default_model: string | null;
  base_url: string | null;
  request_defaults: Record<string, unknown>;
  rate_limit_per_min: number | null;
  monthly_cap_usd: number | null;
  secret_ref: string;
  updated_at: string;
}

export interface FinderTemplateRow {
  id: string;
  template_key: string;
  label: string;
  role_key: string;
  item_type: string;
  category_slug: string | null;
  language_terms: string[];
  location_terms: string[];
  must_include_terms: string[];
  must_exclude_terms: string[];
  query_templates: unknown;
  extraction_hints: Record<string, unknown>;
  default_max_queries: number;
  default_max_source_urls: number;
  default_max_extract_urls: number;
  is_active: boolean;
}

export interface FinderContact {
  type: "phone" | "email" | "website" | "appointment_url";
  value: string;
  label?: string | null;
  is_primary?: boolean | null;
}

export interface FinderSelfStatement {
  quote: string;
  source_url?: string | null;
}

export interface FinderServiceEntry {
  label: string;
  source_url?: string | null;
}

/**
 * Sınıflandırıcı çıktısı — Gemini responseSchema ile ayna sözleşme.
 * category_slug YOK: LLM kategori tayin etmiyor, job template'inden geliyor
 * (bkz. lib/finder/run-job.ts upsertCandidate). self_description (=
 * profession_label) işletmenin kendi ham tanımı — sınıflandırma tüketici
 * tarafında yapılır.
 */
export interface CandidateResult {
  is_match: boolean;
  match_reason: string;
  confidence_score: number;
  canonical_name: string | null;
  organization_name: string | null;
  profession_label: string | null;
  role_key: string | null;
  item_type: string | null;
  city: string | null;
  city_raw: string | null;
  country_code: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  languages: string[];
  services: string[];
  contacts: FinderContact[];
  website_url: string | null;
  appointment_url: string | null;
  self_statements: FinderSelfStatement[];
  evidence_quotes: string[];
}

export interface FinderJobSourceRow {
  id: string;
  job_id: string;
  source_url: string;
  normalized_url: string;
  source_domain: string;
  source_title: string | null;
  source_snippet: string | null;
  fetch_status: string;
  extracted_text: string | null;
}
