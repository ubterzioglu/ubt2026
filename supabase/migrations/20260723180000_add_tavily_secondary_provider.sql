-- İkinci Tavily API anahtarı — birincisi kota/rate-limit hatası verdiğinde
-- runSearchStage otomatik bu sağlayıcıya geçer (bkz. lib/finder/run-job.ts).
-- priority 15: birincil tavily'den (10) sonra, serpapi'den (20) önce denenir.

BEGIN;

INSERT INTO public.service_finder_provider_configs
  (provider_key, provider_kind, display_name, is_enabled, priority, default_model, base_url, request_defaults, monthly_cap_usd, secret_ref)
VALUES
  (
    'tavily2', 'search', 'Tavily Search + Extract (yedek anahtar)', true, 15,
    NULL, 'https://api.tavily.com',
    '{"search_depth": "basic", "max_results": 8, "extract_depth": "basic"}'::jsonb,
    100.0000, 'TAVILY_API_KEY_2'
  )
ON CONFLICT (provider_key) DO NOTHING;

COMMIT;
