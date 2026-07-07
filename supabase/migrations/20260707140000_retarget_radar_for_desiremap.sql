-- Radar haber pipeline'ının desiremap.de için retarget edilmesi (/dmscraper).
-- Silme YOK (radar_news_candidates → sources FK ON DELETE RESTRICT); idempotent:
-- desiremap kaynakları config->>'target'='desiremap' etiketiyle, keyword'ler
-- yeni kategori sözlüğüyle korunur — migration tekrar koşarsa diaspora setini
-- yeniden kapatır, desiremap setine dokunmaz.
-- NOT: (lower(keyword), language) unique index bilerek EKLENMEDİ — corteqs'ten
-- kopyalanan satırlarda duplicate olabilir.

BEGIN;

-- ─────────────────────────────────────────────
-- 1. Desiremap etiketi taşımayan tüm kaynaklar kapatılır (diaspora seti emekli)
-- ─────────────────────────────────────────────
UPDATE public.radar_news_sources
SET is_enabled = false
WHERE COALESCE(config->>'target', '') <> 'desiremap';

-- ─────────────────────────────────────────────
-- 2. Yeni kategori setinde olmayan keyword'ler kapatılır
-- ─────────────────────────────────────────────
UPDATE public.radar_news_keywords
SET is_enabled = false
WHERE COALESCE(category, '') NOT IN
  ('regulierung', 'stadt', 'venue', 'branche', 'recht', 'negativ');

-- ─────────────────────────────────────────────
-- 3. Seed kaynaklar
--    GDELT aktif (terms OK — GDELT API'si kamusal, ToS uyumlu kullanım);
--    4 Almanca RSS adayı is_enabled=false + terms_checked=false ile INERT:
--    URL/ToS admin tarafından /dmscraper Kaynaklar bölümünde doğrulanana dek
--    tarama motoru bunları asla çekmez (scan.ts terms_checked=true filtreler).
-- ─────────────────────────────────────────────
INSERT INTO public.radar_news_sources
  (name, source_type, adapter_key, endpoint_url, website_url, language, country,
   category_default, query_text, trust_level, is_enabled, terms_checked,
   terms_checked_at, terms_notes, max_items_per_scan, timeout_ms, config)
SELECT
  'GDELT — Rotlicht & Regulierung (DE)', 'gdelt', 'gdelt_doc_v2',
  'https://api.gdeltproject.org/api/v2/doc/doc',
  'https://www.gdeltproject.org', 'de', 'DE',
  'regulierung',
  '(Bordell OR Prostituiertenschutzgesetz OR Sperrbezirk OR Laufhaus OR Rotlichtviertel OR Prostitutionsgewerbe OR "FKK-Club") sourcecountry:GM sourcelang:ger',
  'standard', true, true, now(),
  'GDELT DOC 2.0 API — kamusal API, atıf yeterli.',
  100, 20000,
  '{"target": "desiremap", "timespan": "3d", "allowedLanguages": "german"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.radar_news_sources
  WHERE name = 'GDELT — Rotlicht & Regulierung (DE)'
);

INSERT INTO public.radar_news_sources
  (name, source_type, adapter_key, endpoint_url, website_url, language, country,
   category_default, trust_level, is_enabled, terms_checked, terms_notes,
   max_items_per_scan, timeout_ms, config)
SELECT * FROM (
  VALUES
    (
      'BSD e.V. — Berufsverband Sexarbeit', 'rss', 'rss',
      'https://berufsverband-sexarbeit.de/feed/',
      'https://berufsverband-sexarbeit.de', 'de', 'DE',
      'branche', 'high', false, false,
      'URL ve ToS doğrulanmadı — etkinleştirmeden önce feed adresini ve kullanım koşullarını kontrol et.',
      50, 15000, '{"target": "desiremap"}'::jsonb
    ),
    (
      'kostenlose-urteile.de — Urteile', 'rss', 'rss',
      'https://www.kostenlose-urteile.de/rss.xml',
      'https://www.kostenlose-urteile.de', 'de', 'DE',
      'recht', 'standard', false, false,
      'URL ve ToS doğrulanmadı — feed adresi tahmini; etkinleştirmeden önce doğrula.',
      50, 15000, '{"target": "desiremap"}'::jsonb
    ),
    (
      'Google News DE — Rotlicht araması', 'rss', 'rss',
      'https://news.google.com/rss/search?q=(Bordell%20OR%20Prostitutionsgewerbe%20OR%20%22FKK-Club%22%20OR%20Sperrbezirk)&hl=de&gl=DE&ceid=DE:de',
      'https://news.google.com', 'de', 'DE',
      'stadt', 'discovery_only', false, false,
      'Google News RSS — ToS gereği yalnızca keşif amaçlı; içerik orijinal kaynaktan doğrulanmalı. Etkinleştirmeden önce koşulları kontrol et.',
      50, 15000, '{"target": "desiremap"}'::jsonb
    ),
    (
      'BMFSFJ — Basın bültenleri', 'rss', 'rss',
      'https://www.bmfsfj.de/SiteGlobals/Functions/RSSFeed/DE/RSSNewsfeed/RSSNewsfeed.xml',
      'https://www.bmfsfj.de', 'de', 'DE',
      'regulierung', 'official', false, false,
      'Resmî bakanlık feed''i — URL doğrulanmadı; etkinleştirmeden önce kontrol et.',
      50, 15000, '{"target": "desiremap"}'::jsonb
    )
) AS seed
  (name, source_type, adapter_key, endpoint_url, website_url, language, country,
   category_default, trust_level, is_enabled, terms_checked, terms_notes,
   max_items_per_scan, timeout_ms, config)
WHERE NOT EXISTS (
  SELECT 1 FROM public.radar_news_sources existing
  WHERE existing.name = seed.name
);

-- ─────────────────────────────────────────────
-- 4. Seed keyword'ler (Almanca, ~30). Motor: başlıkta tam ağırlık, özette
--    0.45x; kategori başına en iyi eşleşme sayılır; negatif ilk eşleşmede −40.
--    "erotik/pornografi" negatiflere bilerek ALINMADI (sektörün kendisi).
-- ─────────────────────────────────────────────
INSERT INTO public.radar_news_keywords (keyword, language, category, weight, is_negative, is_enabled)
SELECT * FROM (
  VALUES
    -- regulierung — yasal çerçeve
    ('prostituiertenschutzgesetz', 'de', 'regulierung', 35::numeric, false, true),
    ('prostituiertenschutz',       'de', 'regulierung', 35::numeric, false, true),
    ('prostschg',                  'de', 'regulierung', 30::numeric, false, true),
    ('sperrbezirk',                'de', 'regulierung', 30::numeric, false, true),
    ('sperrgebietsverordnung',     'de', 'regulierung', 30::numeric, false, true),
    ('prostitutionsgewerbe',       'de', 'regulierung', 30::numeric, false, true),
    ('anmeldepflicht prostitution','de', 'regulierung', 25::numeric, false, true),
    ('sexkaufverbot',              'de', 'regulierung', 30::numeric, false, true),
    ('nordisches modell',          'de', 'regulierung', 25::numeric, false, true),
    -- stadt — yerel yönetim / kent
    ('rotlicht',                   'de', 'stadt', 25::numeric, false, true),
    ('rotlichtviertel',            'de', 'stadt', 25::numeric, false, true),
    ('ordnungsamt',                'de', 'stadt', 20::numeric, false, true),
    ('razzia bordell',             'de', 'stadt', 25::numeric, false, true),
    ('genehmigung bordell',        'de', 'stadt', 25::numeric, false, true),
    -- venue — mekan tipleri
    ('bordell',                    'de', 'venue', 30::numeric, false, true),
    ('laufhaus',                   'de', 'venue', 30::numeric, false, true),
    ('fkk-club',                   'de', 'venue', 30::numeric, false, true),
    ('fkk club',                   'de', 'venue', 30::numeric, false, true),
    ('saunaclub',                  'de', 'venue', 30::numeric, false, true),
    ('eroscenter',                 'de', 'venue', 28::numeric, false, true),
    ('swingerclub',                'de', 'venue', 22::numeric, false, true),
    -- branche — sektör
    ('sexarbeit',                  'de', 'branche', 30::numeric, false, true),
    ('sexarbeiterin',              'de', 'branche', 28::numeric, false, true),
    ('erotikbranche',              'de', 'branche', 30::numeric, false, true),
    ('rotlichtmilieu',             'de', 'branche', 22::numeric, false, true),
    ('prostitution',               'de', 'branche', 25::numeric, false, true),
    -- recht — mahkeme/karar
    ('verwaltungsgericht',         'de', 'recht', 15::numeric, false, true),
    ('bundesverwaltungsgericht',   'de', 'recht', 15::numeric, false, true),
    ('urteil bordell',             'de', 'recht', 25::numeric, false, true),
    ('gewerbeuntersagung',         'de', 'recht', 18::numeric, false, true),
    -- negativ — alakasız gürültü (ilk eşleşmede düz −40)
    ('bundesliga',                 'de', 'negativ', 40::numeric, true, true),
    ('fußball',                    'de', 'negativ', 40::numeric, true, true),
    ('bitcoin',                    'de', 'negativ', 40::numeric, true, true),
    ('gewinnspiel',                'de', 'negativ', 40::numeric, true, true),
    ('casino',                     'de', 'negativ', 40::numeric, true, true),
    ('kryptowährung',              'de', 'negativ', 40::numeric, true, true),
    ('horoskop',                   'de', 'negativ', 40::numeric, true, true)
) AS seed (keyword, language, category, weight, is_negative, is_enabled)
WHERE NOT EXISTS (
  SELECT 1 FROM public.radar_news_keywords existing
  WHERE lower(existing.keyword) = lower(seed.keyword)
    AND existing.language = seed.language
);

COMMIT;
