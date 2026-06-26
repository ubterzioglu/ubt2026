# DM — Test Bulguları Sekmesi (Tasarım)

Tarih: 2026-06-27
Route: `/dm`

## Amaç

`/dm` panosuna iki sekmeli bir yapı eklemek:

1. **Görevler** — mevcut `project_tasks` listesi (değişmez).
2. **Test bulguları** — yeni. Her bulguya tek bir **screenshot** ve **thread şeklinde
   birden fazla yorum** eklenebilir.

## Kararlar (onaylanan)

- **Veri:** İki yeni tablo (`test_findings` + `finding_comments`) + bir Storage bucket.
  `project_tasks` hiç değişmez (Yaklaşım A).
- **Screenshot:** Tek görsel/bulgu. Supabase Storage'a **server action** ile yüklenir.
  Bucket **private**, server **signed URL** üretip saklar.
- **Yorum:** Thread (çoklu). Ayrı `finding_comments` tablosu, `on delete cascade`.
- **Bulgu alanları:** Başlık + Alan/sayfa (etiket) + Sorumlu + Durum + Severity + Screenshot.
- **Sekme geçişi:** URL tabanlı — `/dm?tab=findings` (default `tasks`).

## Veri modeli

### `test_findings`
```sql
id             uuid pk default gen_random_uuid()
title          text not null
area           text not null default ''
owner          text not null default 'Ortak'
status         text not null default 'open'
               check (status in ('open','investigating','resolved','wontfix'))
severity       text not null default 'normal'
               check (severity in ('low','normal','high','critical'))
screenshot_path text                    -- nullable, Storage object path (signed URL bundan üretilir)
sort_order     integer not null default 0
created_at     timestamptz default now()
updated_at     timestamptz default now()  -- trigger
```
Index: `(owner, sort_order, created_at)`, `(status)`.

### `finding_comments`
```sql
id          uuid pk default gen_random_uuid()
finding_id  uuid not null references public.test_findings(id) on delete cascade
body        text not null
author      text not null default 'Ortak'
created_at  timestamptz default now()
```
Index: `(finding_id, created_at)`.

### Storage bucket: `dm-screenshots`
- Private. Dosya yolu: `findings/{finding_id}/{timestamp}.{ext}`.
- `screenshot_path` DB'de saklanır; sunucu okuma anında uzun ömürlü **signed URL** üretir.
- Eski screenshot değişince/bulgu silinince Storage objesi de silinir (best-effort).

Her iki tablo da **RLS açık, anon/authenticated policy yok** — tüm erişim service-role
client üzerinden (mevcut `project_tasks` deseninin aynısı).

## Etiketler (Türkçe UI)

- **Durum:** open→Açık · investigating→İnceleniyor · resolved→Çözüldü · wontfix→Geçersiz
- **Severity:** low→Düşük · normal→Normal · high→Yüksek · critical→Kritik

## Mimari

### Server katmanı — `lib/test-findings.ts`
`project-tasks.ts` ikizi (service-role client). Fonksiyonlar:
- `getAllFindingsAdmin()` → bulgular + her birinin yorum sayısı + signed screenshot URL.
- `getFindingByIdAdmin(id)` → tek bulgu (düzenleme için).
- `getFindingCommentsAdmin(findingId)` → bir bulgunun yorumları (tarih sırası).
- `createFinding(input, screenshotFile?)` → satır ekle; dosya varsa Storage'a yükle.
- `updateFinding(id, patch, screenshotFile?)` → güncelle; yeni dosya varsa eskiyi sil + yükle.
- `deleteFinding(id)` → satır + Storage objesi sil (yorumlar cascade).
- `addComment(findingId, body, author)` / `deleteComment(commentId)`.
- Dahili `signScreenshot(path)` yardımcı (signed URL).

### Tipler — `types/site.ts`
`TestFindingStatus`, `TestFindingSeverity`, `TestFindingItem`
(`{ id, title, area, owner, status, severity, screenshotUrl, commentCount, sortOrder, createdAt, updatedAt }`),
`FindingComment` (`{ id, findingId, body, author, createdAt }`).

### Sayfa — `app/dm/page.tsx`
- `?tab` okunur (`tasks` | `findings`, default `tasks`).
- Üstte sekme şeridi (iki link, neon aktif/pasif stil) — hero kartının altında.
- `tab=tasks` → mevcut görev akışı (form accordion + `TaskTable`) aynen.
- `tab=findings` → bulgu akışı: ekleme accordion'ı (screenshot input dahil, `enctype` multipart)
  + `FindingTable` (client) + seçili bulgunun yorum paneli.
- Yeni server action'lar: `createFindingAction`, `updateFindingAction`, `deleteFindingAction`,
  `inlineFindingStatusAction`, `addCommentAction`, `deleteCommentAction`. Hepsi auth-gate
  kontrolü yapıp `revalidatePath('/dm')` + `/dm?tab=findings...` redirect eder.

### Client — `app/dm/_components/finding-table.tsx`
`task-table.tsx` ikizi: arama + filtre (Sorumlu/Durum/Severity) + tek satır liste.
Kolonlar: Görev(başlık)+Alan / Sorumlu / Durum+Severity rozetleri / küçük screenshot thumb /
yorum sayısı / işlemler (Düzenle, Sil, çöz/inline durum). Neon palet (theme.ts) yeniden kullanılır.

### Yorum paneli
Bulgu satırında "Yorumlar (N)" → `?tab=findings&finding={id}` ile o bulgu seçilir; sayfada
yorum thread'i (liste + ekleme formu + silme) gösterilir. Tek görsel büyütme: thumb'a tıklayınca
signed URL yeni sekmede açılır (basit, ekstra modal yok — YAGNI).

## Dosya yükleme akışı (server action)

1. Form `multipart/form-data`; `<input type="file" name="screenshot" accept="image/*">`.
2. Server action `formData.get('screenshot')` → `File`. Boşsa atla.
3. Validasyon: tip `image/*`, boyut ≤ ~5MB. Aşarsa hata redirect.
4. `supabase.storage.from('dm-screenshots').upload(path, file)`.
5. `path` DB'ye yazılır. Liste render'ında signed URL üretilir.

## Migration'lar

- `supabase/migrations/<ts>_create_test_findings.sql` — iki tablo + index + trigger + RLS.
- Bucket: migration içinde `insert into storage.buckets ... 'dm-screenshots' ... public=false`
  (idempotent, `on conflict do nothing`).

## Kapsam dışı (YAGNI)

- Çoklu screenshot / galeri (tek görsel kararlaştırıldı).
- Yorum düzenleme (sadece ekle/sil).
- Görevler ile bulgular arası bağ/ilişki.
- Public erişim — board admin-gate arkasında kalır.

## Doğrulama

`tsc --noEmit` + `eslint --max-warnings=0` + `next build` temiz; `/dm?tab=findings`
derlenir. Migration'lar mevcut `project_tasks` deseniyle birebir tutarlı.
