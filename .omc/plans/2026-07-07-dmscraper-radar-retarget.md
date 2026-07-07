# /dmscraper — Radar scraper'ın bağımsız route'a taşınması + desiremap.de retarget

> Durum: UYGULANDI (2026-07-07) — migration 20260707140000 uzak Supabase'e basıldı, /dmscraper canlı, /dm scraper sekmesi kaldırıldı.
> Karar özeti: tam corteqs modülü · eski /dm sekmesi kaldırılıp redirect · mevcut /dm anahtarı · route adı `/dmscraper`.

## Context

corteqsmvp'deki radar haber scraper'ı bu projeye zaten port edilmiş durumda (`/dm?tab=scraper`, commit 5c81060) ama tek sekmelik kısıtlı bir UI ile. İstenen:

1. **Tam modül** (corteqs'teki admin deneyimi: kuyruk + kaynak ekleme/düzenleme + koşu geçmişi + keyword yönetimi) bağımsız `/dmscraper` route'unda.
2. Eski `/dm` scraper sekmesi **kaldırılacak**; `/dm?tab=scraper` → `/dmscraper` redirect.
3. Giriş **mevcut /dm anahtarıyla** (`DESIREMAPTODO_ADMIN_ACCESS_KEY`) korunacak — yeni env YOK.
4. Scraper **desiremap.de için retarget** edilecek (Almanya'daki yasal yetişkin-eğlence mekan rehberi): diaspora kaynak/keyword'leri emekli edilir, Almanca regülasyon/sektör/şehir odaklı yeni set seed edilir.

**Kritik bulgu:** `lib/radar/relevance-score.ts`'deki hardcode negatif liste ("erotik", "pornografi", −40) DB keyword seti doluyken bile uygulanıyor — desiremap için tam da ilgili haberleri boğar. Düzeltilmesi zorunlu.

## 1. Auth — `lib/admin-auth.ts`

Tasks üçlüsünün klonu, aynı anahtar (`getTasksAdminAccessKey()` private helper zaten var), farklı cookie:

- `DMSCRAPER_ACCESS_COOKIE = "ubt_dmscraper_access"`, `path: "/dmscraper"`.
- `isDmscraperAuthenticated()` — **fail closed** (anahtar tanımsızsa `false`).
- `signInDmscraper(candidate)` — httpOnly, sameSite lax, secure prod, maxAge 8h.
- `signOutDmscraper()` — **öznitelik pariteli expire** (`maxAge: 0`, asla `cookies().delete()`).

RFC 6265 path-match: `/dmscraper` cookie'si `/dmscraperX`'e sızmaz; `/dm` cookie'si `/dmscraper`'a gitmez → aynı şifre ikinci kez girilir (kabul edilen maliyet; path'i genişletme).

## 2. Yeni route — `app/dmscraper/`

`/dm` idiyomu birebir: server component + inline `"use server"` action'lar (her biri `isDmscraperAuthenticated()` re-check → `revalidatePath("/dmscraper")` → `redirect`), URL-state plain link, neon DM teması (`@/app/dm/_components/theme`'den import), `DmLogin` yeniden kullanımı (props: title "Radar haber scraper'ı", subtitle "Radar scraper").

- **`_actions.ts`**: `dmscraperSignInAction` / `dmscraperSignOutAction` (app/dm/_actions.ts kalıbı).
- **`page.tsx`**: `export const maxDuration = 300` (tarama ~2 dk server action içinde) + `metadata.robots noindex`. Bölümler `?sec=` ile: `kuyruk` (default, `&rstatus=` filtre — `duplicate` dahil), `kaynaklar` (`&edit=<id>`), `kosular`, `keywords` (`&edit=<id>`). Flash paramlar: `scanok/created/updated/deleted/error`.
- Action'lar: `scanAction` (runRadarScanAdmin), `candidateStatusAction` (status=`duplicate` ise `markRadarCandidateDuplicateAdmin`, değilse `setRadarCandidateStatusAdmin` + not), `sourceToggleAction`, `sourceCreateAction`/`sourceUpdateAction` (**server-side terms gate**: `terms_checked !== "1"` ise `is_enabled=false` zorla), `keywordCreate/Update/DeleteAction`. `redirect()` asla try/catch içinde değil.

### `_components/`
- **`scraper-nav.tsx`** — dm-nav.tsx'in uyarlanmış kopyası (DmNav generalize EDİLMEZ); `ScraperSectionKey = "kuyruk" | "kaynaklar" | "kosular" | "keywords"`; Kuyruk rozeti = `counts.pending`.
- **`queue-section.tsx`** — scraper-tab.tsx'ten başla, genişlet: skor barı (0–100 clamp), `relevanceReasons` etiketleri (+/− renkli), dil/kategori/ülke/şehir rozetleri, kart başına TEK form (hidden `id`+`rstatus`, `note` textarea, çoklu submit `name="status" value="approved|rejected|duplicate|archived"`; pending-dışı kartta "Kuyruğa geri al" → `pending`).
- **`sources-section.tsx`** — create accordion (`<details>`, /dm kalıbı) + kaynak başına düzenleme. Alanlar: name, endpoint_url, website_url, source_type (rss/atom/gdelt/json_api), adapter_key, language, country, trust_level, **query (query_text)**, max_items_per_scan, terms_checked (is_enabled'ı kapılar), terms_notes, is_enabled. Satırda son başarı/hata + Aç/Kapat + "Düzenle" linki.
- **`runs-section.tsx`** — 50 koşu tablosu: durum rozeti, tetik, başlangıç, süre, kaynak/çekilen/yeni/kopya/elenen/hatalı sayıları, hata mesajı.
- **`keywords-section.tsx`** — CRUD: keyword, language, category, weight, is_negative, is_enabled; silme yerine devre-dışı önerisi (silme = typo için).

## 3. Veri katmanı — `lib/radar-news.ts` (ek fonksiyonlar, mevcutlar dokunulmaz)

Mevcut konvansiyonlar: `createServiceClient()`, `RadarMutationResult {ok, errorMessage}`, boundary validation.

- `getRadarSourceAdmin(id)` → `RadarSourceDetailItem` (tüm kolonlar + `configQuery = config->>'query'`).
- `createRadarSourceAdmin(input)` / `updateRadarSourceAdmin(id, patch)` — `validateSourceUrl` (lib/radar/source-security.ts, SSRF gate) ile endpoint doğrula; adapter_key `ADAPTERS` ile uyumlu olmalı (`rss|atom|gdelt_doc_v2`; json_api'yi adapter'sız reddet); clamp max_items 1–500, timeout 1000–60000; **config merge = read-modify-write** (`config.query` güncellenirken diğer key'ler — timespan, allowedLanguages vb. — klonlanır, asla komple obje yazılmaz); terms_checked false→true geçişinde `terms_checked_at=now()`, true→false'ta null.
- `markRadarCandidateDuplicateAdmin(id, duplicateOfId, note?)` — `review_status='duplicate'` + `duplicate_of_candidate_id` + review_log `mark_duplicate`. (id === duplicateOfId reddi; hedef varlık kontrolü.)
- `getRadarCandidatesAdmin` select'ine `duplicate_of_candidate_id` ekle; `RadarCandidateItem`'a `duplicateOfCandidateId` (+ varsa eksik `city`).
- Keyword CRUD: `getRadarKeywordsAdmin(includeDisabled=true)` (sıralama: is_negative, category, weight desc), `createRadarKeywordAdmin` (keyword+language zorunlu, weight clamp 0–100 default 20, case-insensitive app-layer duplicate kontrolü — tabloda unique yok), `updateRadarKeywordAdmin(id, patch)`, `deleteRadarKeywordAdmin(id)` (FK referansı yok, hard delete güvenli).

## 4. Motor düzeltmeleri

- **`lib/radar/relevance-score.ts`** (satır ~155): hardcode `NEGATIVE_KEYWORDS` yalnızca **tam fallback modunda** (`(dbKeywords ?? []).length === 0`) uygulanır; DB'de herhangi bir keyword varsa negatifleri yalnız DB kontrol eder. `CLICKBAIT_PATTERNS` aynen kalır. Başlık + satır 155 yorumları güncellenir. (DB boşken davranış bugünkünün birebir aynısı → fallback güvenli.)
- **`lib/radar/adapters/gdelt.ts`** (satır ~31): query kaynağı `source.query_text` → yoksa `config.query`; ikisi de boşsa **throw** ("Turkish diaspora" varsayılanı kaldırılır — yanlış konfigürasyonlu kaynak sessizce diaspora taramasın; hata `last_error_message`'a düşer, UI gösterir).

## 5. Migration — `supabase/migrations/20260707120000_retarget_radar_for_desiremap.sql`

Silme YOK (candidates → sources FK `ON DELETE RESTRICT`); idempotent (`config->>'target'='desiremap'` etiketi + yeni kategori sözlüğü ile korunur):

1. Desiremap etiketi taşımayan tüm kaynaklar `is_enabled=false`.
2. Yeni kategori setinde (`regulierung/stadt/venue/branche/recht/negativ`) olmayan keyword'ler `is_enabled=false`.
3. Seed kaynaklar: **GDELT** (aktif, terms OK; `query_text = '(Bordell OR Prostituiertenschutzgesetz OR Sperrbezirk OR Laufhaus OR Rotlichtviertel OR Prostitutionsgewerbe OR "FKK-Club") sourcecountry:GM sourcelang:ger'`) + 4 Almanca RSS adayı (**is_enabled=false, terms_checked=false** — URL/ToS manuel doğrulanana dek inert: BSD e.V., kostenlose-urteile.de, Google News DE arama feed'i, BMFSFJ basın).
4. Seed keyword'ler (~30, Almanca): regulierung (prostituiertenschutz 35, sperrbezirk 30…), stadt (rotlicht 25, ordnungsamt 20…), venue (bordell/laufhaus/fkk-club 30…), branche (sexarbeit/erotikbranche 30…), recht (verwaltungsgericht 15…), negativ (bundesliga, fußball, bitcoin, gewinnspiel, casino… — motor ilk eşleşmede düz −40). "erotik/pornografi" negatiflere bilerek ALINMAZ.

Migration'ı uygulayan: Claude (bkz. memory: handle-supabase-sql-migrations). Not: `(lower(keyword), language)` unique index EKLEME — kopyalanan corteqs satırlarında duplicate olabilir.

## 6. /dm temizliği

- **`app/dm/page.tsx`**: `params` okunduktan hemen sonra, auth check'ten ÖNCE `if (readParam(params.tab) === "scraper") redirect("/dmscraper")`. Silinecekler: ScraperTab importu (14), radar-news importları (40–50), `maxDuration` (58–60, artık gerekmiyor), SECTION_META.scraper (114–117), activeTab scraper dalı (214–215), radar fetch bloğu (247–262), 3 radar action (484–532), scanok banner'ı (630–634), nav item (593), render'daki ScraperTab dalı (913–928 → InfoTab else olur).
- **`dm-nav.tsx`**: `DmTabKey`'den `"scraper"` düşer.
- **`scraper-tab.tsx`**: yeni bölümler hazır olunca silinir (tek importer page.tsx; silmeden önce Grep ile doğrula).

## Uygulama sırası

1. Migration + `relevance-score.ts` + `gdelt.ts` düzeltmeleri
2. `lib/admin-auth.ts` + `lib/radar-news.ts` ekleri
3. `app/dmscraper/` (page, actions, 5 bileşen)
4. `/dm` temizliği + scraper-tab.tsx silme
5. Migration'ı Supabase'e uygula

## Doğrulama

- `npx tsc --noEmit` + `eslint --max-warnings=0` + `next build` (dm-board-architecture konvansiyonu).
- Manuel: `/dmscraper` girişsiz → DmLogin; yanlış anahtar → kapıda; doğru anahtar → Kuyruk. `/dm?tab=scraper` → redirect. `/dm`'de Scraper nav'ı yok. Kaynak oluştur/düzenle (terms gate), keyword CRUD, duplicate işaretleme, `rstatus` filtreleri.
- Cookie: DevTools'ta `ubt_dmscraper_access` `Path=/dmscraper`; `/dm` isteklerinde görünmez (ve tersi); çıkış yalnız kendi cookie'sini düşürür.
- Uçtan uca: `RADAR_NEWS_MIN_SCORE=0` ile bir manuel tarama (~GDELT tek kaynak, kısa), kuyrukta Almanca adayları gör; skor dağılımına göre eşiği 20–25'e çek (öneri: 25 — güven+tazelik bonusu tek başına 20 eder, 25 en az bir gerçek keyword eşleşmesi garantiler).
- Bilinen risk: scan lock süresiz — koşu yarıda ölürse `status='running'` satırı manuel `failed`'e çekilir (plan dışı iyileştirme: 15 dk stale-lock auto-fail).

## Deploy notu

Yeni env YOK (aynı anahtar). Migration uzak Supabase'e uygulanacak; deploy dış ortamda olduğundan uygulama restartı kullanıcıda.
