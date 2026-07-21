# Desiremap Scraper — Yeniden Yapılandırma Raporu

**Tarih:** 2026-07-21
**Kapsam:** `lib/finder/*`, `lib/service-finder.ts`, `app/dm/_components/scraper/job-detail-section.tsx`, `app/dm/rapor/page.tsx`, yeni DB migration

## Neden

40+ şehir taramasından 407 aday toplandı, ama bunlardan sadece 174'ü (%43) gerçek veri olarak kullanılabildi. Kayıp analizi kullanıcı tarafından yapıldı:

| Kayıp sebebi | Kayıp adet |
|---|---|
| Adres yok (tek string `address_line`, çoğu boş/eksik geldi) | 156 |
| Aynı şehirde tekrar (adres olmadığı için isim+şehir bazlı dedupe yanlış birleştiriyordu) | 47 |
| Şehir eşleşmedi (Frankfurt vs "Frankfurt am Main" vs "Cologne") | 30 |

Ayrıca LLM'in kendi atadığı `category_slug` hatalıydı: Laufhaus, Massage ve Domina gibi işletmeler yanlışlıkla `bordell`/`studio`'ya sıkıştırılmıştı. Kullanıcı, işletmenin kendi tanımını (`profession_label`/`self_description`) kullanarak elle sınıflandırma yapınca bu sorun ortadan kalktı.

## Ne değişti

### 1. Adres yapılandırıldı

**Önce:** LLM tek bir `address_line` string'i üretiyordu, çoğunlukla boş veya eksik geliyordu.

**Sonra:** LLM `street`, `house_number`, `postal_code` alanlarını ayrı ayrı döndürüyor. `address_line` artık server tarafında (`street + house_number`) türetilen bir görüntüleme alanı — LLM'in kendisi bunu artık üretmiyor.

```
// Önce (CandidateResult)
address_line: string | null

// Sonra
street: string | null
house_number: string | null
postal_code: string | null
```

### 2. Şehir normalize edildi

Prompt artık şehir adının **resmi Almanca yazımını** zorluyor ("Frankfurt am Main" değil "Frankfurt", "Köln" değil "Cologne"). LLM'in kaçırdığı durumlar için `run-job.ts`'de küçük bir `CITY_ALIASES` haritası son güvenlik ağı olarak eklendi (Cologne→Köln, Munich→München, vb.). Ham/orijinal sayfa metni ayrıca `city_raw` alanında tutuluyor (debug/doğrulama amaçlı, DB'ye persist edilmiyor — sadece LLM çıktısında).

### 3. Kategori artık LLM'in işi değil

**Önce:** LLM hem eşleşme kararını hem kategori sınıflandırmasını (`category_slug: fkk|bordell|studio|privat`) yapıyordu — bu, hatalı kategorizasyonun kaynağıydı.

**Sonra:** `category_slug` şemadan tamamen kaldırıldı. LLM sadece işletmenin **kendi ham tanımını** (`profession_label`, DB'de ayrıca `self_description` olarak da saklanıyor) veriyor. Gerçek `category_slug`, taramanın hangi job template'inden (FKK/Bordell/Studio/Privat) geldiğinden set ediliyor:

```ts
// lib/finder/run-job.ts — upsertCandidate
category_slug: job.category_slug   // LLM çıktısı hiç kullanılmıyor
```

Sınıflandırma artık tamamen tüketici (kullanıcı) tarafında, `self_description`'a bakarak yapılıyor.

### 4. Hizmetler ham kaldı, kaynağıyla birlikte

`services` alanı hâlâ düz string dizisi (LLM'den geldiği gibi, normalize/birleştirme yok — "diskrete Massagen" gibi ham etiketler korunuyor). Yeni `services_raw` sütunu, her etiketi hangi sayfadan geldiğiyle eşleştiriyor:

```json
"services_raw": [
  { "label": "Saunalandschaft", "source_url": "https://..." },
  { "label": "diskrete Massagen", "source_url": "https://..." }
]
```

### 5. Öz-tanım (self_statements) — hukuki güvenlik katmanı

Yeni bir alan: `self_statements`. Prompt açıkça talimatlandırıyor: **sadece işletmenin birinci ağızdan, açık şekilde kendini tanımladığı cümleler** (ör. "Wir sind ein Club für Paare", "Nur für Herren") alınır. Fotoğraf, fiyatlandırma veya belirsiz ifadelerden **dolaylı çıkarım yapılmaz** — böyle bir ipucu varsa dizi boş bırakılır.

Bu, Ausrichtung/yönelim gibi hassas bir alanın **kanıtsız, olgu gibi yayınlanmasını** engelliyor — her iddia, kaynak URL'i ile birlikte alıntı olarak geliyor.

### 6. Dedupe mantığı güncellendi

`lib/finder/dedupe.ts` — `makeDuplicateKey` önceliği:

```
telefon > website domain > (yeni) postal_code + isim > isim + şehir
```

`postal_code` artık ayrıştırılmış olduğu için, aynı şehirde farklı adreste iki farklı işletme artık yanlışlıkla tek kayda birleştirilmiyor (47 kayıplı senaryonun kök nedeni).

## Korunan hukuki güvenceler

| Kontrol | Durum |
|---|---|
| `source_urls` + `evidence` provenance | ✅ Korundu — her iddia kaynağa bağlı |
| Görsel/fotoğraf çekilmiyor | ✅ Korundu — bu turun kapsamı dışında (belirtildi, bir sonraki tur konusu) |
| Kopyalanmış tam açıklama metni yok | ✅ Korundu — `evidence`/`self_statements` kısa alıntı, tam metin değil |

## Migration

`supabase/migrations/20260721100000_restructure_finder_candidates.sql` — `service_finder_candidates` tablosuna 7 yeni sütun eklendi (`street`, `house_number`, `postal_code`, `self_description`, `services_raw`, `self_statements`, `scraped_at`), hepsi `ADD COLUMN IF NOT EXISTS` ile idempotent. Mevcut sütunlar (`city`, `address_line`, `category_slug`) korundu — geriye dönük uyumluluk için.

**Mevcut 409 kayıt dokunulmadı.** Yeni sütunlar bu satırlarda boş/NULL kalıyor (eski şemayla toplanmışlardı, yeniden taranmadılar — maliyet gerekçesiyle). Yeni taramalar (Bonn/Münster + sıradaki genişlemeler) yeni şemayla toplanacak.

## Doğrulama

1. **Tip kontrolü:** `npx tsc --noEmit -p .` — temiz geçti, hata yok.
2. **Prompt/şema testi:** Sabit bir örnek metinle (`Saunaclub Samya` mock verisi) doğrudan Gemini'ye karşı test edildi — `street`/`house_number`/`postal_code` doğru ayrıştı, `self_statements` sadece 3 açık ifadeyi yakaladı (dolaylı çıkarım yapmadı), `category_slug` hiç dönmedi.
3. **Uçtan uca DB yazma testi:** Search/extract aşamaları atlanıp (Tavily kotası tükenmişti) mock bir "fetched" kaynak ile gerçek `executeFinderJob` akışı çalıştırıldı — `category_slug: "fkk"` job template'inden geldi, `services_raw`/`self_statements` doğru `source_url` ile DB'ye yazıldı, `address_line` server tarafında doğru türetildi. Test job'ı sonrasında temizlendi.
4. **UI:** `app/dm/rapor/page.tsx` ve `job-detail-section.tsx` yeni adres formatını (`street house_number · postal_code city`) ve "Öz-tanım" accordion'unu gösterecek şekilde güncellendi.

## Beklenen kazanç

Kullanıcının tahminine göre: adres + şehir düzeltmesi tek başına önceki 174 kullanılabilir kayıttan **~360'a** çıkarmalı (yeni taramalarda). Kategori artık kullanıcı tarafında self_description'dan çıkarıldığı için, önceki turda kaybolan Laufhaus/Massage/Domina gibi kategoriler de artık doğru ayrıştırılabilir olacak.

## Kapsam dışı (sıradaki tur)

- Fotoğraf/görsel çekme
- Kopyalanmış açıklama metni çekme
- SCRAPED işaretleme akışı
- Eksik şehirlerin taranması (Bonn, Münster — Tavily kotası nedeniyle bekliyor)
- Frontend doğrulama akışı
