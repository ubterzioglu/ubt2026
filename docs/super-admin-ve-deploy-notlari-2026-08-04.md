# Süper admin, deploy ve migration notları — 2026-08-04

Bu oturumda yapılanlar ve sonrasında hatırlanması gerekenler. Commit'ler:
`0f9efe5`, `210ebd1`, `a05afe7`.

---

## 1. Süper admin

**Tek credential: `APPOINTMENT_ADMIN_ACCESS_KEY`.** `/admin`'de bu anahtarla giriş
yapınca aşağıdaki panoların hepsi şifresiz açılıyor:

`/dm` · `/batubt` · `/bakcakanat` · `/detrbridge` · `/ubtsa` · `/elif` → `/zelifs`

Diğer pano şifreleri (`DETRBRIDGE`, `BAKCAKANAT_PASSWORD`, `UBTSA_PASSWORD` …)
silinmedi — senin dışındaki kişiler kendi panolarına hâlâ onlarla giriyor.

### Nasıl çalışıyor

Panoların çerezleri yola göre kapsanmış (`path=/admin`, `/dm`, `/batubt` …), yani
admin çerezi diğer panolara zaten hiç gönderilmiyordu. Giriş artık ikinci bir çerez
basıyor: `ubt_super_admin`, `path=/`. Her kapı bunu OR'luyor.

Çerezin değeri ham anahtar değil, anahtarla imzalanmış bir HMAC token. Sonuçları:

- Çerez sızsa bile `APPOINTMENT_ADMIN_ACCESS_KEY` açığa çıkmıyor.
- Anahtarı değiştirmek **tüm** süper admin oturumlarını anında düşürüyor.
- Anahtar hiç tanımlı değilse kimse giremiyor (fail-closed).

### Sürpriz olmaması gereken davranışlar

| Davranış | Not |
|---|---|
| Oturum **8 saat** | Sonra tekrar giriş gerekiyor. |
| **Herhangi** bir panodan "Çıkış" | Süper admin oturumunu tamamen bitiriyor, sadece o panoyu değil. Bilerek: aksi hâlde `/dm`'de çıkışa basmak hiçbir şey yapmamış gibi görünürdü. |
| `/detrbridge` ve `/ubtsa`'da kimlik | Süper admin **`ubt`** olarak görünür, yorumlar bu adla kaydedilir. `ubt` zaten iki allowlist'te de vardı. |

### Yan fayda: düzelen bir hata

`middleware.ts`, `elif_auth` çerezini `=== "1"` diye karşılaştırıyordu; ama
`/api/elif-auth` oraya bir HMAC token yazıyor. Yani doğru şifreyle bile `/zelifs`
her zaman `/elif`'e geri atıyordu. Düzeldi.

Middleware edge runtime'da çalıştığı için `node:crypto` kullanamıyor —
`lib/edge-session-token.ts` aynı HMAC'i Web Crypto ile üretiyor. **Bu iki
implementasyon bayt bayt aynı kalmalı**; çerez Node tarafında basılıp edge'de
doğrulanıyor.

---

## 2. `/admin` düzeni

Sıra: sayı kartları → route'lar satır satır → üç kart alt alta akordeon.

- Akordeonlar native `<details name="admin-overview">` — aynı anda tek biri açık,
  hepsi kapalı başlıyor, client JS yok.
- Route listesinde her satırda ad + `/path` + rozet (kapılı / açık).
- `/ubtsa` listede hiç yoktu, eklendi.

## 3. `/detrbridge` nav

Sekme şeridi 7 sekmeye çıkıp telefonda taşıyor, "Çıkış" butonunu ekran dışına
itiyordu. Artık sadece aktif sekme barda; kalanlar "Diğer ⌄" dropdown'unda
(yine `<details>`, JS yok).

Bilinen sınır: dropdown dışarı tıklayınca kapanmıyor. Sekme seçince sayfa
değiştiği için pratikte sorun çıkarmıyor; değiştirmek client component'e
çevirmek demek.

---

## 4. Deploy

**Otomatik tetikleniyor.** Repo'da `.github/workflows` yok ve sunucu yanıtında
Vercel/CDN header'ı yok — bu yüzden ilk bakışta "otomatik deploy yok" sanmıştım,
yanlıştı. Tetikleyici sunucu tarafında.

Yani: push → bekle → canlıda. Elle yapılacak bir şey yok.

---

## 5. Migration — en önemli kısım

### Neydi

`package.json`'daki `migrate` script'i `scripts/apply-migration.js`'e işaret
ediyordu. O dosya repo'da **hiç var olmamış** (git geçmişinde yok, silinmemiş).
Komut `MODULE_NOT_FOUND` ile patlıyordu.

Repo'da migration uygulayan başka hiçbir şey de yoktu: CI adımı yok, deploy
hook'u yok, Supabase CLI link'i yok. Yani bir migration yazılıp commit'lenebiliyor,
kimse hata görmüyor, ama tablo veritabanında hiç oluşmuyor.

Tam olarak bu oldu: `public.detrbridge_brief_comments`, `20260804140000`'den beri
uygulanmamış duruyordu. Ancak `/detrbridge` → Toplantı Özeti'nde yorum yazmaya
çalışınca **"Comment failed" / "Unknown error"** olarak ortaya çıktı. Tabloyu
`psql` ile elle uyguladım, artık çalışıyor.

### Şimdi ne yapıyorsun

```bash
npm run migrate          # sadece LİSTELER, uygulamaz
npm run migrate:apply    # bekleyenleri sırayla uygular
```

`scripts/db-migrations.ps1` dosya adlarındaki version'ları tek bir sorguda
`supabase_migrations.schema_migrations` ile karşılaştırıyor, eksikleri uyguluyor
ve geçmişe kaydediyor.

> **Kural: bir migration yazdıktan sonra `npm run migrate` çalıştır.**
> `.sql` dosyasını commit'lemek onu veritabanına uygulamıyor.

> **Uyarı: `migrate:apply`'ı "ne olur ne olmaz" diye çalıştırma.** Migration'ların
> bir kısmı veri siliyor/sıfırlıyor (`drop_detr_legacy`,
> `reset_detrbridge_visits_with_names`, `migrate_detr_todos_to_detrbridge`).
> Önce daima `npm run migrate` ile listeye bak; beklemediğin bir dosya çıkarsa
> uygulama.

Son durum: **48 dosya, 48'i de uygulanmış.** Bekleyen yok.

---

## 6. Sunucu env dosyası

```bash
pwsh scripts/build-prod-env.ps1      # .env.local -> .env.production
```

Çıktı repo kökünde `.env.production`, `.gitignore`'da (o satırı bu oturumda
ekledim — `.env` satırı sadece tam adı yakalıyor, `.env.production` **ignore
edilmiyordu**, service-role key'le commit'lenebilirdi).

### Sunucuya konmayanlar ve nedeni

| Değişken | Neden yok |
|---|---|
| `DB_PASS` | Sadece `npm run migrate` kullanıyor, kendi makinenden çalıştırıyorsun. |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI için. Zaten 401 veriyor. |
| `TAVILY_API_KEY_4` | `service_finder_provider_configs`'te kayıtlı değil, kimse okumuyor. |

İkisini de koymamak blast radius'u daraltıyor: sunucu ele geçse bile veritabanına
doğrudan `psql` erişimi ve CLI yetkisi ele geçmiyor.

### Eksik: `ZELIFS_PASSWORD`

`.env.local`'de yorum satırında, dolayısıyla üretilen dosyada da boş. Boş
bırakırsan `/elif`'e normal şifreyle **kimse** giremez (fail-closed); sadece
süper admin `/zelifs`'i açar. Bilinçli tercihse dokunma.

### Kolay kaçırılan nokta

Service finder'ın API anahtarları `process.env[secret_ref]` ile **dinamik**
okunuyor ([lib/finder/run-job.ts:58](../lib/finder/run-job.ts#L58)); `secret_ref`
değeri veritabanından geliyor. Bu yüzden kodda statik `process.env.X` araması
onları **bulmuyor**. Listeye güvenip elenirse `/dm` scraper'ı sunucuda
"Sağlayıcı anahtarı bulunamadı" ile patlar.

Gerçek kaynak:

```sql
select provider_key, secret_ref, is_enabled from service_finder_provider_configs;
```

Şu an 6 sağlayıcı etkin: `TAVILY_API_KEY`, `TAVILY_API_KEY_2`, `TAVILY_API_KEY_3`,
`SERPAPI_API_KEY`, `GEMINI_API_KEY`, `GEMINI_API_KEY_2`. Altısı da dosyada.

---

## 7. Uyanınca yapılacaklar

- [ ] Canlıda `/admin`'e gir, route satırlarındaki 6 kapılı sayfaya tıkla —
      hiçbirinde şifre sorulmamalı. (Lokalde hepsini doğruladım, canlı env
      değerlerini göremiyorum.)
- [ ] `ZELIFS_PASSWORD` sunucuda gerekli mi karar ver.
- [ ] `.env.production`'ı sunucuya taşı, sonra istersen lokalden sil.
