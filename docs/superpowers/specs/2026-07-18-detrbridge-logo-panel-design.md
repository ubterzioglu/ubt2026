# detrbridge — Logo Seçimi Paneli (tasarım)

## Amaç

Yeni bağımsız, şifre korumalı bir pano: `/detrbridge`. Sol tarafta genişleyebilir
bir sidebar, ilk (ve şu an tek) panel olarak **Logo Seçimi**: logo adayları
yüklenir, her birine isim + 1-5 yıldız puan verilir, biri elle "seçildi" olarak
işaretlenir.

Tek kullanıcı erişimi (Umut). E-posta allowlist yok — sadece ortak şifre.

## Auth

`/detr`, `/bakcakanat`, `/batubt` ile aynı cookie-tabanlı gate deseni
(`lib/admin-auth.ts`), tek şifre varyantı (Bakçakanat/BatuBT gibi):

- Env: `DETRBRIDGE` (kullanıcı `.env.local`'e zaten girdi; prod'da uzak
  sunucuya ayrıca eklenecek — bu repo sadece okuma tarafını içerir, gerçek
  değeri girmez).
- Cookie: `ubt_detrbridge_access`, `path=/detrbridge`, `httpOnly`, `sameSite=lax`,
  `secure` prod'da, `maxAge` 8 saat (mevcut panolarla aynı).
- **Fail closed:** `DETRBRIDGE` tanımlı değilse gate hep kapalı kalır
  ([[admin-gate-conventions]] kuralı — bakçakanat olayını tekrar etmemek için).
- **Sign-out öznitelik parite:** `cookies().delete()` kullanılmaz; cookie
  giriştekiyle birebir aynı özniteliklerle `maxAge: 0` olarak expire edilir.
- Yeni fonksiyonlar `lib/admin-auth.ts`'e eklenir: `isDetrbridgeAuthenticated()`,
  `signInDetrbridge(candidate)`, `signOutDetrbridge()` — `isBakcakanatAuthenticated`
  ailesinin birebir kopyası, farklı cookie adı/path/env anahtarıyla.

## Layout

- `app/detrbridge/page.tsx`: server component, `/dm` ve `/detr` ile aynı
  glassmorphic kart + ambient glow arka plan deseni, ama lacivert/altın palet.
- Sol sidebar: `app/detrbridge/_components/bridge-nav.tsx`, `dm-nav.tsx`'ten
  uyarlanmış (masaüstünde sticky sol menü + brand block + sign-out; mobilde
  üst bar + yatay tab şeridi). `?tab=` tabanlı, `BridgeTabKey` union tipiyle.
  Şu an tek değer: `"logos"`. Yeni panel eklemek ileride yeni bir union üyesi +
  `page.tsx`'te yeni bir `case` demek.
- Sağ içerik: aktif tab'a göre ilgili bileşen render edilir (şimdilik sadece
  `logos-tab.tsx`).

## Logo Seçimi paneli

**Ekleme formu** (üstte, `/detr`'deki "yeni görev ekle" accordion deseni gibi):
- Dosya seçici (`type=file`, zorunlu, kısıtlama yok — 10 MB sınırı — `/detr`
  attachment sınırıyla aynı).
- İsim (`text`, zorunlu, min 2 karakter).
- Puan: 1-5 arası tam sayı seçimi (radio/yıldız butonları), zorunlu.

Gönderilince: dosya Storage'a yüklenir, `detrbridge_logos` tablosuna satır
eklenir.

**Liste** (puana göre azalan sırayla, sonra `created_at`):
- Her kart: küçük görsel önizleme (imzalı URL ile `<img>`), isim, yıldız
  gösterimi (salt-okunur rozet — puanı değiştirmek ayrı bir mini form/aksiyon
  ile mümkün, `/detr`'deki inline toggle deseni gibi `rateAction`), "Seçildi"
  rozeti (varsa) veya "Seç" butonu, silme butonu.
- **Seçim mantığı:** elle işaretleme, puandan bağımsız. Biri seçilince aynı
  transaction içinde diğer tüm satırların `is_selected` alanı `false`'a
  çekilir (tek seçim garantisi). En yüksek puanlı kart görsel olarak ayrıca
  vurgulanabilir (ör. ince bir "en yüksek puan" etiketi) ama bu otomatik
  "seçili" anlamına gelmez.
- Boş liste durumunda `/detr` deseniyle aynı "Henüz ... yok" mesajı.

## Veri modeli

Yeni Supabase migration (uygulanması ben tarafımdan yapılacak —
[[handle-supabase-sql-migrations]]):

```sql
create table detrbridge_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  is_selected boolean not null default false,
  storage_path text not null,
  file_name text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

alter table detrbridge_logos enable row level security;
-- Kasıtlı olarak policy yok: sadece service-role erişimi (diğer panolarla aynı desen).
```

Storage bucket: `detrbridge-logos` (private, imzalı URL, TTL 8 saat — oturum
süresiyle eşleşir). Dosya adı sanitizasyonu ve 10 MB limiti `lib/detr-todos.ts`
`uploadAttachment` deseniyle birebir aynı.

## Kod dosyaları

- `lib/detrbridge-logos.ts` — veri katmanı: `getAllLogosAdmin`,
  `createLogo(input, file)`, `updateLogoRating(id, rating)`,
  `selectLogo(id)` (diğerlerini `false` yapan tek update), `deleteLogo(id)`
  (satır + storage objesi). `lib/detr-todos.ts` deseninin küçültülmüş hali.
- `app/detrbridge/page.tsx` — data fetch + inline server actions (create/
  rate/select/delete), her biri `isDetrbridgeAuthenticated()` kontrolüyle başlar,
  `revalidatePath('/detrbridge')` + redirect ile biter.
- `app/detrbridge/_actions.ts` — `detrbridgeSignInAction`,
  `detrbridgeSignOutAction`.
- `app/detrbridge/_components/theme.ts` — lacivert `#1E3A8A` · altın `#F5B700`
  brand gradient + ambient background + grid texture (diğer panolardan
  bilinçli ayrık, `/detrbridge`'e scoped).
- `app/detrbridge/_components/detrbridge-login.tsx` — `/detr` login kartının
  tek-şifre varyantı (e-posta alanı yok).
- `app/detrbridge/_components/bridge-nav.tsx` — sol sidebar, tek item.
- `app/detrbridge/_components/logos-tab.tsx` — ekleme formu + liste.

## Doğrulama

`tsc --noEmit` + `eslint --max-warnings=0` + `next build`. DB migration bu
oturumda ben tarafımdan uygulanacak; kullanıcı `.env.local`'e
`DETRBRIDGE_PASSWORD` değerini kendisi girecek (lokal + uzak sunucu), sonra
uzak ortamda restart gerekecek.

## Kapsam dışı

- E-posta allowlist / çoklu kullanıcı desteği.
- Yorum sistemi (DETR'deki gibi).
- Otomatik "en yüksek puanlı = seçili" mantığı.
- İkinci panel/sekme içeriği (sidebar sadece genişlemeye hazır bırakılıyor).
