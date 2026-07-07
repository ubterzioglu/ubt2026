-- Service Finder modülü — corteqsmvp /admin/service-finder portu (/dmscraper2).
-- Tablolar: service_finder_provider_configs, service_finder_profession_templates,
--           service_finder_jobs, service_finder_job_queries, service_finder_job_sources,
--           service_finder_candidates, service_finder_job_events, service_finder_cost_ledger.
-- Kaynak projeden farklar:
--   * admin_users/is_admin RPC'si yok — tüm erişim /dmscraper2 gate arkasındaki
--     service-role client ile (RLS açık, anon/authenticated için HİÇ policy yok;
--     radar_news_* / footer_clients paterni).
--   * worker_*/admin_* RPC'leri yok — durum geçişleri server action'larda yapılır.
--   * created_by_user_id nullable (Supabase auth kullanıcısı yok).
--   * Arama hedefi desiremap.de için retarget: Türk diaspora şablonu yerine
--     Almanya yetişkin-eğlence mekan kategorileri (FKK/Bordell/Studio/Privat) seed'lenir.

BEGIN;

-- ─────────────────────────────────────────────
-- 1. service_finder_provider_configs (sır YOK — secret_ref env değişken ADI)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_provider_configs (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key         TEXT        NOT NULL UNIQUE,
  provider_kind        TEXT        NOT NULL CHECK (provider_kind IN ('search', 'extract', 'classify')),
  display_name         TEXT        NOT NULL,
  is_enabled           BOOLEAN     NOT NULL DEFAULT true,
  priority             INTEGER     NOT NULL DEFAULT 100,
  default_model        TEXT,
  base_url             TEXT,
  request_defaults     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  rate_limit_per_min   INTEGER,
  default_soft_cap_usd NUMERIC(12,4),
  default_hard_cap_usd NUMERIC(12,4),
  daily_cap_usd        NUMERIC(12,4),
  monthly_cap_usd      NUMERIC(12,4),
  secret_ref           TEXT        NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.service_finder_provider_configs IS
  'Service Finder dış sağlayıcı ayarları. secret_ref = sunucu ortamındaki env değişken adı; ham API anahtarı asla DB''de tutulmaz.';

-- ─────────────────────────────────────────────
-- 2. service_finder_profession_templates (sorgu üretim girdileri)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_profession_templates (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key             TEXT        NOT NULL UNIQUE,
  label                    TEXT        NOT NULL,
  role_key                 TEXT        NOT NULL,
  item_type                TEXT        NOT NULL,
  category_slug            TEXT,
  language_terms           TEXT[]      NOT NULL DEFAULT '{}'::text[],
  location_terms           TEXT[]      NOT NULL DEFAULT '{}'::text[],
  must_include_terms       TEXT[]      NOT NULL DEFAULT '{}'::text[],
  must_exclude_terms       TEXT[]      NOT NULL DEFAULT '{}'::text[],
  query_templates          JSONB       NOT NULL DEFAULT '[]'::jsonb,
  extraction_hints         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  default_max_queries      INTEGER     NOT NULL DEFAULT 12,
  default_max_source_urls  INTEGER     NOT NULL DEFAULT 40,
  default_max_extract_urls INTEGER     NOT NULL DEFAULT 25,
  is_active                BOOLEAN     NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 3. service_finder_jobs — queue-in-table (senkron server action çalıştırır)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_jobs (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  TEXT        NOT NULL,
  status                 TEXT        NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'review', 'completed', 'failed', 'cancelled', 'budget_stopped')),
  priority               INTEGER     NOT NULL DEFAULT 100,
  created_by_user_id     UUID,
  template_id            UUID REFERENCES public.service_finder_profession_templates(id) ON DELETE SET NULL,
  search_provider_id     UUID REFERENCES public.service_finder_provider_configs(id) ON DELETE SET NULL,
  extract_provider_id    UUID REFERENCES public.service_finder_provider_configs(id) ON DELETE SET NULL,
  classifier_provider_id UUID REFERENCES public.service_finder_provider_configs(id) ON DELETE SET NULL,
  role_key               TEXT        NOT NULL,
  item_type              TEXT        NOT NULL,
  category_slug          TEXT,
  location_label         TEXT        NOT NULL,
  country_code           TEXT,
  region                 TEXT,
  city                   TEXT,
  language_code          TEXT        NOT NULL DEFAULT 'de',
  freeform_topic         TEXT,
  must_include_terms     TEXT[]      NOT NULL DEFAULT '{}'::text[],
  must_exclude_terms     TEXT[]      NOT NULL DEFAULT '{}'::text[],
  seed_queries           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  seed_urls              TEXT[]      NOT NULL DEFAULT '{}'::text[],
  max_queries            INTEGER     NOT NULL DEFAULT 12,
  max_source_urls        INTEGER     NOT NULL DEFAULT 40,
  max_extract_urls       INTEGER     NOT NULL DEFAULT 25,
  max_candidates         INTEGER     NOT NULL DEFAULT 100,
  soft_cap_usd           NUMERIC(12,4) NOT NULL DEFAULT 1.5000,
  hard_cap_usd           NUMERIC(12,4) NOT NULL DEFAULT 3.0000,
  cost_total_usd         NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
  result_summary         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  progress               JSONB       NOT NULL DEFAULT '{}'::jsonb,
  attempts               INTEGER     NOT NULL DEFAULT 0,
  last_error_code        TEXT,
  last_error_message     TEXT,
  locked_by              TEXT,
  started_at             TIMESTAMPTZ,
  finished_at            TIMESTAMPTZ,
  cancelled_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sf_jobs_status_created_idx
  ON public.service_finder_jobs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS sf_jobs_created_at_idx
  ON public.service_finder_jobs (created_at DESC);

-- ─────────────────────────────────────────────
-- 4. service_finder_job_queries — çalıştırılan arama sorguları
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_job_queries (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID        NOT NULL REFERENCES public.service_finder_jobs(id) ON DELETE CASCADE,
  stage               TEXT        NOT NULL CHECK (stage IN ('seed', 'expansion', 'retry')),
  provider_key        TEXT        NOT NULL,
  query_text          TEXT        NOT NULL,
  external_request_id TEXT,
  usage_units         NUMERIC(12,4) NOT NULL DEFAULT 0,
  estimated_cost_usd  NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
  result_count        INTEGER     NOT NULL DEFAULT 0,
  status              TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'skipped')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at         TIMESTAMPTZ,
  UNIQUE (job_id, stage, query_text)
);

-- ─────────────────────────────────────────────
-- 5. service_finder_job_sources — keşfedilen URL'ler (robots kararı dahil)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_job_sources (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID        NOT NULL REFERENCES public.service_finder_jobs(id) ON DELETE CASCADE,
  discovery_query_id  UUID REFERENCES public.service_finder_job_queries(id) ON DELETE SET NULL,
  provider_key        TEXT        NOT NULL,
  source_url          TEXT        NOT NULL,
  normalized_url      TEXT        NOT NULL,
  source_domain       TEXT        NOT NULL,
  source_title        TEXT,
  source_snippet      TEXT,
  crawl_allowed       BOOLEAN,
  robots_evaluated_at TIMESTAMPTZ,
  fetch_status        TEXT        NOT NULL DEFAULT 'discovered'
    CHECK (fetch_status IN ('discovered', 'queued', 'fetched', 'blocked_robots', 'failed', 'duplicate', 'irrelevant')),
  extracted_text      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  fetched_at          TIMESTAMPTZ,
  UNIQUE (job_id, normalized_url)
);

CREATE INDEX IF NOT EXISTS sf_sources_job_fetch_idx
  ON public.service_finder_job_sources (job_id, fetch_status, source_domain);

-- ─────────────────────────────────────────────
-- 6. service_finder_candidates — sınıflandırıcı çıktısı + inceleme durumu
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_candidates (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id             UUID        NOT NULL REFERENCES public.service_finder_jobs(id) ON DELETE CASCADE,
  primary_source_id  UUID REFERENCES public.service_finder_job_sources(id) ON DELETE SET NULL,
  canonical_name     TEXT        NOT NULL,
  profession_label   TEXT,
  organization_name  TEXT,
  role_key           TEXT        NOT NULL,
  item_type          TEXT        NOT NULL,
  category_slug      TEXT,
  country_code       TEXT,
  region             TEXT,
  city               TEXT,
  address_line       TEXT,
  languages          TEXT[]      NOT NULL DEFAULT '{}'::text[],
  services           TEXT[]      NOT NULL DEFAULT '{}'::text[],
  contacts           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  website_url        TEXT,
  appointment_url    TEXT,
  source_urls        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  evidence           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  normalized_payload JSONB       NOT NULL DEFAULT '{}'::jsonb,
  duplicate_key      TEXT        NOT NULL,
  confidence_score   NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  classifier_model   TEXT,
  review_status      TEXT        NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_edit', 'published')),
  review_notes       TEXT,
  reviewed_at        TIMESTAMPTZ,
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, duplicate_key)
);

CREATE INDEX IF NOT EXISTS sf_candidates_job_review_idx
  ON public.service_finder_candidates (job_id, review_status, confidence_score DESC);

CREATE INDEX IF NOT EXISTS sf_candidates_review_idx
  ON public.service_finder_candidates (review_status, created_at DESC);

-- ─────────────────────────────────────────────
-- 7. service_finder_job_events — olay günlüğü
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_job_events (
  id            BIGSERIAL   PRIMARY KEY,
  job_id        UUID        NOT NULL REFERENCES public.service_finder_jobs(id) ON DELETE CASCADE,
  candidate_id  UUID REFERENCES public.service_finder_candidates(id) ON DELETE CASCADE,
  event_type    TEXT        NOT NULL,
  event_level   TEXT        NOT NULL DEFAULT 'info'
    CHECK (event_level IN ('debug', 'info', 'warn', 'error')),
  message       TEXT        NOT NULL,
  event_payload JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sf_events_job_created_idx
  ON public.service_finder_job_events (job_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 8. service_finder_cost_ledger — her sağlayıcı çağrısı bir satır
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_finder_cost_ledger (
  id                 BIGSERIAL   PRIMARY KEY,
  job_id             UUID        NOT NULL REFERENCES public.service_finder_jobs(id) ON DELETE CASCADE,
  query_id           UUID REFERENCES public.service_finder_job_queries(id) ON DELETE SET NULL,
  source_id          UUID REFERENCES public.service_finder_job_sources(id) ON DELETE SET NULL,
  candidate_id       UUID REFERENCES public.service_finder_candidates(id) ON DELETE SET NULL,
  provider_config_id UUID REFERENCES public.service_finder_provider_configs(id) ON DELETE SET NULL,
  provider_key       TEXT        NOT NULL,
  event_type         TEXT        NOT NULL
    CHECK (event_type IN ('search', 'extract', 'classify', 'grounding', 'manual_adjustment')),
  billing_unit       TEXT        NOT NULL,
  quantity           NUMERIC(12,4) NOT NULL,
  unit_cost_usd      NUMERIC(12,6) NOT NULL,
  amount_usd         NUMERIC(12,4) NOT NULL,
  currency           TEXT        NOT NULL DEFAULT 'USD',
  model_name         TEXT,
  request_meta       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sf_cost_ledger_job_created_idx
  ON public.service_finder_cost_ledger (job_id, created_at DESC);

CREATE INDEX IF NOT EXISTS sf_cost_ledger_created_idx
  ON public.service_finder_cost_ledger (created_at DESC);

-- ─────────────────────────────────────────────
-- updated_at trigger'ları
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_service_finder_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_sf_provider_configs_updated_at ON public.service_finder_provider_configs;
CREATE TRIGGER trg_sf_provider_configs_updated_at
  BEFORE UPDATE ON public.service_finder_provider_configs
  FOR EACH ROW EXECUTE FUNCTION public.set_service_finder_updated_at();

DROP TRIGGER IF EXISTS trg_sf_templates_updated_at ON public.service_finder_profession_templates;
CREATE TRIGGER trg_sf_templates_updated_at
  BEFORE UPDATE ON public.service_finder_profession_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_service_finder_updated_at();

DROP TRIGGER IF EXISTS trg_sf_jobs_updated_at ON public.service_finder_jobs;
CREATE TRIGGER trg_sf_jobs_updated_at
  BEFORE UPDATE ON public.service_finder_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_service_finder_updated_at();

DROP TRIGGER IF EXISTS trg_sf_candidates_updated_at ON public.service_finder_candidates;
CREATE TRIGGER trg_sf_candidates_updated_at
  BEFORE UPDATE ON public.service_finder_candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_service_finder_updated_at();

-- ─────────────────────────────────────────────
-- RLS: açık, policy YOK — yalnızca service-role erişir (footer_clients paterni)
-- ─────────────────────────────────────────────
ALTER TABLE public.service_finder_provider_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_finder_profession_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_finder_jobs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_finder_job_queries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_finder_job_sources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_finder_candidates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_finder_job_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_finder_cost_ledger           ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.service_finder_provider_configs     FROM anon, authenticated;
REVOKE ALL ON TABLE public.service_finder_profession_templates FROM anon, authenticated;
REVOKE ALL ON TABLE public.service_finder_jobs                 FROM anon, authenticated;
REVOKE ALL ON TABLE public.service_finder_job_queries          FROM anon, authenticated;
REVOKE ALL ON TABLE public.service_finder_job_sources          FROM anon, authenticated;
REVOKE ALL ON TABLE public.service_finder_candidates           FROM anon, authenticated;
REVOKE ALL ON TABLE public.service_finder_job_events           FROM anon, authenticated;
REVOKE ALL ON TABLE public.service_finder_cost_ledger          FROM anon, authenticated;

-- ─────────────────────────────────────────────
-- Seed: sağlayıcı ayarları (anahtarlar env'de — secret_ref yalnız referans)
-- ─────────────────────────────────────────────
INSERT INTO public.service_finder_provider_configs
  (provider_key, provider_kind, display_name, is_enabled, priority, default_model, base_url, request_defaults, monthly_cap_usd, secret_ref)
VALUES
  (
    'tavily', 'search', 'Tavily Search + Extract', true, 10,
    NULL, 'https://api.tavily.com',
    '{"search_depth": "basic", "max_results": 8, "extract_depth": "basic"}'::jsonb,
    100.0000, 'TAVILY_API_KEY'
  ),
  (
    'serpapi', 'search', 'SerpAPI Google Search', true, 20,
    NULL, 'https://serpapi.com',
    '{"gl": "de", "hl": "de", "google_domain": "google.de", "num": 10}'::jsonb,
    75.0000, 'SERPAPI_API_KEY'
  ),
  (
    'gemini', 'classify', 'Gemini Classifier', true, 10,
    'gemini-2.5-flash-lite', 'https://generativelanguage.googleapis.com',
    '{"temperature": 0.1, "fallback_model": "gemini-2.5-flash"}'::jsonb,
    50.0000, 'GEMINI_API_KEY'
  )
ON CONFLICT (provider_key) DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: desiremap.de kategori şablonları (FKK / Bordell / Studio / Privat).
-- language_terms boş — sorgular Almanca kalıplardan üretilir ({{city}} doldurulur).
-- ─────────────────────────────────────────────
INSERT INTO public.service_finder_profession_templates
  (template_key, label, role_key, item_type, category_slug,
   language_terms, must_exclude_terms, query_templates,
   default_max_queries, default_max_source_urls, default_max_extract_urls)
VALUES
  (
    'venue-fkk-club', 'FKK / Sauna Club', 'fkk_club', 'venue', 'fkk',
    '{}'::text[],
    ARRAY['wikipedia', 'stellenangebot', 'job', 'zeitung', 'nachrichten'],
    '[
      "FKK Club {{city}}",
      "Saunaclub {{city}}",
      "FKK Sauna Club {{city}} Öffnungszeiten",
      "Saunaclub {{city}} Preise Eintritt",
      "FKK Club {{city}} Adresse Kontakt"
    ]'::jsonb,
    10, 40, 25
  ),
  (
    'venue-bordell', 'Bordell / Laufhaus', 'bordell', 'venue', 'bordell',
    '{}'::text[],
    ARRAY['wikipedia', 'stellenangebot', 'job', 'zeitung', 'nachrichten'],
    '[
      "Bordell {{city}}",
      "Laufhaus {{city}}",
      "Eroscenter {{city}}",
      "Bordell {{city}} Öffnungszeiten",
      "Laufhaus {{city}} Adresse"
    ]'::jsonb,
    10, 40, 25
  ),
  (
    'venue-studio', 'Erotik Studio', 'studio', 'venue', 'studio',
    '{}'::text[],
    ARRAY['wikipedia', 'stellenangebot', 'job', 'zeitung', 'nachrichten'],
    '[
      "Erotik Studio {{city}}",
      "Erotikstudio {{city}} Kontakt",
      "erotische Massage Studio {{city}}",
      "Massagestudio {{city}} diskret"
    ]'::jsonb,
    10, 40, 25
  ),
  (
    'provider-privat', 'Privat', 'privat', 'provider', 'privat',
    '{}'::text[],
    ARRAY['wikipedia', 'stellenangebot', 'job', 'zeitung', 'nachrichten', 'forum'],
    '[
      "Hostessen {{city}} privat",
      "private Modelle {{city}}",
      "Privatwohnung Erotik {{city}}"
    ]'::jsonb,
    8, 30, 20
  )
ON CONFLICT (template_key) DO NOTHING;

COMMIT;
