-- İkinci Gemini API anahtarı — birincisi kota/rate-limit hatası verdiğinde
-- runClassifyStage otomatik bu sağlayıcıya geçer (bkz. lib/finder/run-job.ts).

BEGIN;

INSERT INTO public.service_finder_provider_configs
  (provider_key, provider_kind, display_name, is_enabled, priority, default_model, base_url, request_defaults, monthly_cap_usd, secret_ref)
VALUES
  (
    'gemini2', 'classify', 'Gemini Classifier (yedek anahtar)', true, 15,
    'gemini-2.5-flash', 'https://generativelanguage.googleapis.com',
    '{"temperature": 0.1, "fallback_model": "gemini-2.5-flash"}'::jsonb,
    50.0000, 'GEMINI_API_KEY_2'
  )
ON CONFLICT (provider_key) DO NOTHING;

COMMIT;
