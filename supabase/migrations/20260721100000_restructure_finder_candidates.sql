-- Desiremap scraper yeniden tasarım — yapılandırılmış adres + ham kanıt alanları.
-- 407 taranan adaydan 174'ü kullanılabilirdi (%43); asıl kayıp sebepleri: tek
-- string adres (156), adres eksikliğinden gelen tekrar (47), şehir eşleşme
-- sorunları (30). Bu migration adresi ayrıştırır, LLM'in kategori tayin etmesini
-- kaldırır (işletmenin kendi tanımı ham kalır), hizmetleri kaynak URL'iyle
-- birlikte tutar, ve "öz-tanım" (self_statements) alıntılarını ayrı bir alana
-- taşır — hassas çıkarımlar (Ausrichtung/yönelim gibi) kanıtsız yayınlanmasın.
--
-- Geriye dönük uyumlu: mevcut sütunlar (city, address_line, category_slug)
-- kalıyor. Mevcut 409 kayıt dokunulmadan kalır, yeni sütunlar bu satırlarda
-- NULL/boş default ile gelir.

BEGIN;

ALTER TABLE public.service_finder_candidates
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS house_number TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS self_description TEXT,
  ADD COLUMN IF NOT EXISTS services_raw JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS self_statements JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ;

COMMENT ON COLUMN public.service_finder_candidates.street IS
  'Sokak adı — LLM çıktısından ayrıştırılmış, ham (yorumsuz).';
COMMENT ON COLUMN public.service_finder_candidates.house_number IS
  'Bina numarası — street''ten ayrı, adres bazlı dedupe için.';
COMMENT ON COLUMN public.service_finder_candidates.postal_code IS
  'PLZ (5 haneli) — şehir doğrulaması ve adres bazlı dedupe için.';
COMMENT ON COLUMN public.service_finder_candidates.self_description IS
  'İşletmenin kendi tanımı, ham/yorumsuz (ör. "Laufhaus und Eroscenter"). ' ||
  'category_slug artık LLM tarafından atanmıyor — sınıflandırma tüketici tarafında yapılır.';
COMMENT ON COLUMN public.service_finder_candidates.services_raw IS
  'Ham hizmet etiketleri + kaynak URL: [{"label": "...", "source_url": "..."}]. Normalize edilmez.';
COMMENT ON COLUMN public.service_finder_candidates.self_statements IS
  'İşletmenin birinci ağızdan öz-tanım cümleleri (alıntı + kaynak): ' ||
  '[{"quote": "...", "source_url": "..."}]. Sadece açık ifadeler — dolaylı çıkarım YOK.';
COMMENT ON COLUMN public.service_finder_candidates.scraped_at IS
  'Bu adayın ilk toplandığı zaman damgası (created_at''ten ayrı — upsert''te değişmez).';

COMMIT;
