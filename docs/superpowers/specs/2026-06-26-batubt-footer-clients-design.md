# BatuBT — Müşteri Footer Kodu Yönetim Paneli

**Tarih:** 2026-06-26
**Route:** `ubterzioglu.de/batubt`
**Durum:** Tasarım onaylandı

## Amaç

Batuhan ve site sahibinin yetkili olduğu müşteri domainlerinin, her birine
hangi footer kodunun girileceğini takip ettiği, şifre korumalı bir yönetim
panosu. Panodan kayıt **eklenip / düzenlenip / silinebilir**. Her kayıt için
footer kodunun siteye eklenip eklenmediği durum olarak izlenir.

## Kararlar (onaylanmış)

| Konu | Karar |
|------|-------|
| Route | Top-level `/batubt` (mevcut `/admin/*` panelinden bağımsız) |
| Depolama | Supabase tablosu `footer_clients` (kalıcı, her cihazdan erişilir) |
| Footer kodu | Uzun metin/snippet (HTML/JS gömülebilir) — `textarea` |
| Durum | 3 aşamalı: `pending` (Beklemede) → `added` (Eklendi) → `verified` (Doğrulandı) |
| Giriş | Tek ortak şifre `BATUBT_ADMIN_ACCESS_KEY` (HttpOnly cookie, URL'de görünmez) |
| Tema | Hem giriş hem liste **dark & premium** (cam kart estetiği) |

## Mimari

Mevcut, kanıtlanmış task-board pattern'inin (`/admin/tasks`) footer-client
domain'ine birebir uyarlamasıdır. Yeni mimari icat edilmez; çalışan kalıp
yeniden kullanılır.

```
app/batubt/page.tsx
  ├─ giriş yoksa → AdminGate variant="dark"  (mevcut bileşen, yeniden kullanılır)
  └─ giriş varsa → dark liste görünümü + ekle/düzenle formu + filtreler
        └─ inline server actions (create / update / delete / inline-status)

lib/footer-clients.ts   → service-role CRUD (project-tasks.ts kalıbı)
lib/admin-auth.ts       → +batubt cookie/gate fonksiyonları
app/batubt/_actions.ts  → batubtSignInAction / batubtSignOutAction
types/site.ts           → +FooterClient tipleri
supabase/migrations/... → footer_clients tablosu + trigger + RLS
```

## Veri Modeli — `public.footer_clients`

| Kolon | Tip | Not |
|-------|-----|-----|
| `id` | uuid PK | `gen_random_uuid()` |
| `client_name` | text not null | Müşteri / metin |
| `domain` | text not null default '' | İlgili domain |
| `owner` | text not null default '' | Kime ait (sahip) |
| `responsible` | text not null default '' | Sorumlu kişi |
| `footer_code` | text not null default '' | Gömülecek snippet (uzun) |
| `status` | text not null default 'pending' | check: pending/added/verified |
| `notes` | text not null default '' | Opsiyonel not |
| `sort_order` | integer not null default 0 | Manuel sıra |
| `created_at` | timestamptz not null default now() | |
| `updated_at` | timestamptz not null default now() | trigger ile güncellenir |

- İndeksler: `(owner, sort_order, created_at)`, `(status)`, `(domain)`.
- `updated_at` için `before update` trigger (project_tasks ile aynı kalıp).
- RLS **enable**, anon/authenticated için **hiçbir policy yok** → tüm erişim
  service-role client üzerinden, gate arkasından.

## TypeScript Tipleri (`types/site.ts`)

```ts
export type FooterClientStatus = "pending" | "added" | "verified";

export interface FooterClientItem {
  id: string;
  clientName: string;
  domain: string;
  owner: string;
  responsible: string;
  footerCode: string;
  status: FooterClientStatus;
  notes: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

## Veri Erişim Katmanı (`lib/footer-clients.ts`)

`project-tasks.ts` kalıbında, `server-only`, service-role client:

- `getAllFooterClientsAdmin(): Promise<FooterClientsResult>` — owner, sort_order,
  created_at sıralı.
- `getFooterClientByIdAdmin(id): Promise<FooterClientItem | null>`
- `createFooterClient(input): Promise<FooterClientMutationResult>` —
  `client_name` en az 2 karakter doğrulaması.
- `updateFooterClient(id, partialInput): Promise<...>` — immutable patch.
- `deleteFooterClient(id): Promise<...>`

Status normalize edilir (geçersiz → `pending`). Env eksikse `env-missing`.

## Auth Katmanı (`lib/admin-auth.ts` eklemeleri)

Task-board fonksiyonlarının birebir ikizi:

- `BATUBT_ADMIN_ACCESS_COOKIE = "ubt_batubt_access"` (path `/batubt`).
- `getBatubtAdminAccessKey()` → `BATUBT_ADMIN_ACCESS_KEY` okur (fallback yok).
- `isBatubtAuthenticated()` → key yoksa gate açık; varsa cookie karşılaştırır.
- `signInBatubt(candidate)` → doğru ise HttpOnly cookie yazar.
- `signOutBatubt()` → cookie siler.

8 saatlik cookie, `secure` production'da, `sameSite: lax`.

## Server Actions (`app/batubt/_actions.ts`)

- `batubtSignInAction(formData)` → `signInBatubt` + `/batubt`'a redirect.
- `batubtSignOutAction()` → `signOutBatubt` + `/batubt`'a redirect.

CRUD action'ları `page.tsx` içinde inline (`"use server"`), her biri başında
`isBatubtAuthenticated()` kontrolü yapar; `revalidatePath("/batubt")` + redirect.

## UI (`app/batubt/page.tsx`)

### Giriş ekranı
Mevcut `AdminGate variant="dark"` yeniden kullanılır:
- `brand="BatuBT"`, `eyebrow="Yönetim erişimi"`,
  `title="Footer kod yönetimi"`, açıklama + kilit ikonu.
- `signInAction={batubtSignInAction}`, `redirectTo="/batubt"`.

> Not: `AdminGate` dark variant'ında alt başlık ("Todo Dashboard") ve footer
> caption ("desiremap.de · internal") sabit. BatuBT için doğru görünmesi adına
> bu iki sabiti prop'a çıkaracağız (`subtitle`, `footerCaption`) — task board
> mevcut varsayılanları korur, yeni props opsiyonel.

### Liste ekranı (dark & premium — yeni)
Task board listesi *light* tema; biz gate ile aynı koyu cam estetiğini
kullanan yeni bir dark liste yazıyoruz:

- **Arka plan:** gate'teki ambient glow + grid texture katmanları (aynı dil).
- **Üst bar:** BatuBT marka bloğu + "Çıkış yap" + istatistik rozetleri
  (Toplam / Beklemede / Eklendi / Doğrulandı sayıları).
- **Ekle / düzenle formu** (cam panel): Müşteri adı*, Domain, Sahip,
  Sorumlu, Footer kodu (textarea, monospace), Durum (select), Not, Sıra.
- **Filtreler:** Sahip ve Durum için chip filtreleri (query-string ile).
- **Kayıt kartları:**
  - Domain başlık (varsa `https://` linki), müşteri adı.
  - Sahip + Sorumlu rozetleri.
  - Durum rozeti (renkli): pending=amber, added=sky, verified=emerald.
  - Footer kodu: `<details>` ile aç/kapa + monospace kod bloğu.
  - Hızlı durum değiştir (inline select + "Uygula"), Düzenle, Sil.
- **Feedback:** `?created=1` / `?updated=1` → "eklendi/güncellendi" bannerı.

Renk paleti gate ile tutarlı: `#070b10` zemin, `accent` (teal), beyaz/şeffaf
cam yüzeyler. Tailwind inline class'lar (gate gibi self-contained, light-tema
`page-shell`/`section-panel` katmanına bağımlı değil).

## Hata Yönetimi

- Service env eksik → liste yerine "Supabase bağlantısı yapılandırılmamış"
  uyarı paneli (dark stilinde).
- `createFooterClient` doğrulama hatası → action redirect ile `?error=...`
  yerine basit: boş/kısa müşteri adı `required minLength={2}` ile formda
  engellenir; sunucu tarafı da 2-karakter kontrolü yapar (defense in depth).
- Tüm CRUD action'ları auth kontrolüyle başlar; cookie düşmüşse `/batubt`'a
  (gate'e) döner.

## Test / Doğrulama (e2e bitirme kriterleri)

Otomatik test altyapısı bu projede yok; doğrulama derleyici + manuel akışla:

1. `npm run typecheck` — sıfır tip hatası.
2. `npm run lint` — sıfır uyarı (`--max-warnings=0`).
3. `npm run build` — başarılı production build.
4. Migration SQL'i Supabase'e uygulanır (tablo + trigger + RLS oluşur).
5. Manuel akış: `/batubt` → yanlış şifre reddedilir → doğru şifre girer →
   kayıt ekler ("eklendi") → durum değiştirir → düzenler → siler → çıkış yapar.

## Kapsam Dışı (YAGNI)

- Kişi bazlı ayrı şifreler / audit log.
- Footer kodunu otomatik siteye enjekte etme (bu pano sadece *kayıt/takip*).
- Public/okuma API'si. Pano tamamen internal.
