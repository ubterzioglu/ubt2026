# Service Finder — Devir Raporu (2026-07-25)

Bu rapor, Claude Code (terminal) oturumundan Claude web'e geçiş için hazırlandı. Yeni oturumda context sıfırdan başlayacağı için tüm gerekli bilgiler burada.

## Proje

- Repo: `c:/temp_private/ubt2026` (GitHub: `ubterzioglu/ubt2026`, branch `main`)
- Modül: Service Finder — `/dm` panosunun "Scraper" sekmesi, desiremap.de için Almanya yetişkin-eğlence mekanlarını (FKK/Sauna Club, Bordell/Laufhaus, Erotik Studio, Privat) Tavily+Gemini ile bulup sınıflandıran pipeline.
- Ana kod: `lib/finder/run-job.ts` (arama → extract → classify aşamaları), `lib/finder/providers/{tavily,gemini,serpapi}.ts`
- DB tabloları: `service_finder_jobs`, `service_finder_candidates`, `service_finder_job_sources`, `service_finder_provider_configs`, vb. (Supabase, service-role client, RLS'siz)

## Bu oturumda yapılanlar

1. **156 adres-eksik kaydın yeniden sınıflandırılması** (2026-07-21 restructure sonrası): 125 kayıt kurtarıldı, 11 kayıt yeni kritere göre artık eşleşme değil, **~30 kayıt Gemini kota tükenmesiyle yarım kaldı** (henüz tekrar denenmedi).
2. **İkinci sağlayıcı anahtarları eklendi ve koda gömüldü:**
   - `TAVILY_API_KEY_2` → `service_finder_provider_configs` tablosuna `tavily2` provider olarak eklendi (migration: `supabase/migrations/20260723180000_add_tavily_secondary_provider.sql`). `run-job.ts`'te hem arama hem extract aşamasında birincil Tavily kota/rate-limit (429 **ve** 432 — plan limiti) hatasında otomatik `tavily2`'ye geçiyor. **Bağımsız çalışıyor, doğrulandı.**
   - `GEMINI_API_KEY_2` → `gemini2` provider olarak eklendi (migration: `supabase/migrations/20260723183000_add_gemini_secondary_provider.sql`). `run-job.ts`'te classify aşamasında fallback mantığı var AMA **⚠️ önemli bulgu: iki Gemini anahtarı aynı Google Cloud projesini (CorteQS) paylaşıyor, dolayısıyla aynı RPM kotasını paylaşıyorlar — ikinci anahtar bağımsız bir kota sağlamıyor.** Gerçek çözüm, mevcut anahtara kredi yüklemek oldu (kullanıcı yaptı, çalıştı).
   - Gemini 2.5 Flash Tier 1 gerçek limiti **RPM 15**. `CLASSIFY_REQUEST_DELAY_MS` 5000ms'e ayarlı (dakikada 12 istek, güvenli marj).
3. **13 büyük şehir için genişletilmiş tarama** (`max_queries` 12→24, `max_source_urls` 40→80): script `scripts/dev-finder-expand-major-cities.ts` idi (bir kereliğine kullanılan geçici script, artık silindi — gerekirse yeniden yazılmalı, mantığı bu raporun sonunda özetlendi).
4. **Sonuç raporu** oluşturuldu ve pushlandı: `docs/service-finder-expansion-report-2026-07-25.html` (commit `321a0a7`, `origin/main`'de).

## ⚠️ Bilinen tuzaklar / ders çıkarılanlar

- **PowerShell `Stop-Process -Id` ile arka plan script'i durdurmaya çalışırken**, `Get-Process` tablo çıktısında PID sütunu dar olduğunda uzun ID'ler `…592` gibi kesiliyor. Yanlış/kısa ID ile `Stop-Process` çağırmak sessizce hiçbir şeyi öldürmez ve `Get-Process -Id <yanlış-id>` boş döner — bu yanlışlıkla "başarıyla durduruldu" sanılabilir. **Her zaman `Select-Object -ExpandProperty Id` ile tam PID'i al, tabloya güvenme.**
- **`npx tsx -e "..."` inline eval bazen stdout'u basmıyor** (muhtemelen process erken çıkıyor / flush sorunu) — güvenilir sonuç için her zaman `scripts/dev-*-temp.ts` dosyası yazıp `npx tsx scripts/dosya.ts` ile çalıştır, satır içi eval'e güvenme.
- Bash tool'un çıktısında her komuttan sonra görünen `/usr/bin/bash: line 1: .../claude-XXXX-cwd: No such file or directory` hatası **zararsız** — harness'in cwd-restore adımından kaynaklanıyor, gerçek komutun başarısını etkilemiyor. Gerçek sonucu görmek için komutun asıl stdout'una bak.
- Geçici/tek kullanımlık script'ler `scripts/dev-*-temp.ts` adlandırmasıyla oluşturulup **iş bitince mutlaka silinmeli** — bu oturumda ikisi (biri git'e bile commit edilmiş halde) unutulup kalmıştı, ai-slop-cleaner geçişiyle temizlendi.

## Şu anki DB durumu (2026-07-25 itibarıyla, canlı)

- Toplam aday: **481**
- Adres eksik: **188**
- Genişletilmiş tur sonuçları (şehir × kategori — FKK/Bordell/Studio/Privat):

| Şehir | Durum | Toplam aday |
|---|---|---|
| Berlin | işlenmedi | — |
| Hamburg | işlenmedi | — |
| München | tamamlandı, **0 aday** | 0 |
| Frankfurt am Main | tamamlandı, **0 aday** | 0 |
| Stuttgart | tamamlandı | 17 |
| Bremen | tamamlandı | 16 |
| Düsseldorf | tamamlandı | 20 |
| Dresden | kısmi (2/4: FKK+Bordell yapıldı, Studio+Privat yok) | 15 |
| Leipzig, Hannover, Dortmund, Nürnberg, Essen | başlanmadı | — |

## Bekleyen işler (öncelik sırasıyla)

1. **Kalan 9 şehir için genişletilmiş tarama** — Berlin, Hamburg, München (tekrar — 0 aday çıkmıştı, muhtemelen kredi tam etkin olmadan çalıştı), Frankfurt am Main (aynı sebep), Dresden'in Erotik Studio + Privat kategorileri, ve hiç başlamamış Leipzig/Hannover/Dortmund/Nürnberg/Essen. ~36 iş.
2. **Kalan ~30 adres-eksik kaydın yeniden sınıflandırılması** — artık Gemini kredili olduğu için tekrar denenebilir.
3. **Şehir normalizasyonu + duplicate_key birleştirme** — dry-run onaylandı (10 şehir adı düzeltmesi: Cologne→Köln, Frankfurt→Frankfurt am Main, vb.; mevcut duplicate_key mantığıyla 0 gerçek duplicate bulundu), **gerçek modda henüz uygulanmadı** — kullanıcı onayı bekliyor.

## Genişletilmiş tarama script'inin mantığı (yeniden yazılacaksa)

Silinen `scripts/dev-finder-expand-major-cities.ts` şunu yapıyordu:
- `CITIES` listesi (13 şehir) × `TEMPLATE_KEYS = ["venue-fkk-club", "venue-bordell", "venue-studio", "provider-privat"]` döngüsü
- Her kombinasyon için `service_finder_jobs`'a `max_queries: 24, max_source_urls: 80, max_extract_urls: 50` ile yeni bir job insert edip `executeFinderJob(supabase, job.id)` çağırıyordu (senkron, `lib/finder/run-job.ts`'ten import)
- **Önemli:** script idempotent değil — her çalıştırmada TÜM kombinasyonlar için yeni job oluşturuyor, var olanları atlamıyor. Yeniden yazılırken sadece eksik/0-adaylı şehir+kategori kombinasyonlarını hedeflemek gerekir (yukarıdaki tablodan).

## Git durumu

- Branch: `main`, `origin/main` ile senkron
- Son commit: `321a0a7` — "docs: add service finder expansion report, remove stray temp script"
