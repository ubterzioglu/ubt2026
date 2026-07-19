# DETR Görevlerini /detrbridge'e Taşıma + Eski DB Temizliği (tasarım)

## Amaç

`/detr` kaldırılırken (`63112fa`) DB tabloları kasıtlı olarak dokunulmadan
bırakılmıştı (`detr_todos`, `detr_todo_comments`, `detr_todo_attachments`,
`detr-files` bucket). Şimdi bu görev listesini `/detrbridge`'e yeni bir
"Görevler" sekmesi olarak taşıyıp, veri taşındığı doğrulandıktan SONRA eski
tabloları/bucket'ı kalıcı olarak siliyoruz.

Bu iş **premium tema değişikliğinden önce** yapılır (yeni sekme yeni temayı
zaten miras alır, iki kez renk güncellemesi yapılmaz).

## Veri taşıma

Yeni migration `supabase/migrations/20260719150000_migrate_detr_todos_to_detrbridge.sql`:

1. `detrbridge_todos`, `detrbridge_todo_comments`, `detrbridge_todo_attachments`
   tabloları — `detr_todos`/`detr_todo_comments`/`detr_todo_attachments`
   şemasının birebir kopyası (aynı kolonlar, aynı tipler, aynı constraint'ler,
   aynı trigger — `set_detrbridge_todo_updated_at`).
2. Aynı migration içinde veri kopyalama: `insert into detrbridge_todos select
   * from detr_todos` (ve comments/attachments için aynısı) — id'ler (UUID)
   korunur, böylece attachment/comment foreign key'leri geçerli kalır.
3. Private bucket `detrbridge-files` oluşturulur (henüz boş).

Storage objelerinin gerçek dosya içeriği SQL ile taşınamaz (Supabase Storage
API gerektirir). Bu yüzden ayrı, tek seferlik bir Node/TS script
(`scripts/migrate-detr-files.ts`) yazılır: `detr-files` bucket'ındaki her
objeyi indirip `detrbridge-files` bucket'ına aynı path ile yükler, ve
`detrbridge_todo_attachments.storage_path` zaten `detr_todo_attachments`
ile birebir aynı olduğu için ekstra bir path güncellemesi gerekmez. Script
ben tarafımdan çalıştırılır, çıktısında kaç dosya kopyalandığı ve kaynak/
hedef bucket'taki obje sayılarının eşleştiği raporlanır.

**Doğrulama adımı (temizlikten önce zorunlu):** kopyalanan satır sayıları
(`detrbridge_todos` count = `detr_todos` count, aynısı comments/attachments
için) ve Storage obje sayıları eşleşmeden temizlik migration'ı yazılmaz.

## Yeni "Görevler" sekmesi

- `lib/detrbridge-todos.ts` — `lib/detr-todos.ts`'in (silinmeden önceki hali,
  `git show 01cce15^:lib/detr-todos.ts` ile geri alınabilir) yeni tablo/bucket
  adlarıyla uyarlanmış hali: `getAllTodosAdmin`, `getTodoByIdAdmin`,
  `createTodo`, `updateTodo`, `setTodoStatus`, `deleteTodo`, `addComment`,
  `deleteComment`, `addAttachment`, `deleteAttachment`. Bucket adı
  `detrbridge-files`, tablo adları `detrbridge_todos` vb.
- `app/detrbridge/_components/bridge-nav.tsx` — `BridgeTabKey` union'ına
  `"todos"` eklenir, `NAV_ITEMS`'e "Görevler" girdisi eklenir (Logo Seçimi ve
  Giriş Logları'nın yanına, sırası: Logo Seçimi, Görevler, Giriş Logları).
- `app/detrbridge/_components/todos-tab.tsx` — DETR'daki `page.tsx` içindeki
  görev listesi UI'sinin (accordion ekleme formu, satır: durum toggle/isim/
  kim/tarih/aksiyonlar, dosya + yorum collapsible bölümleri) component'e
  çıkarılmış hali, tema token'larını (turkuaz/mavi/kırmızı) kullanır.
- `app/detrbridge/page.tsx` — `activeTab === "todos"` dalı eklenir, DETR'daki
  server action'lar (createAction/updateAction/toggleAction/deleteAction/
  commentAction/deleteCommentAction/attachAction/deleteAttachmentAction)
  aynı isimlendirme deseniyle eklenir, hepsi `isDetrbridgeAuthenticated()`
  kontrolüyle başlar.
- "Kim" alanı serbest metin olarak kalır (DETR'daki oturum e-postasından
  otomatik doldurma özelliği kalkar, çünkü detrbridge'de e-posta/oturum ismi
  kavramı yok — tek şifre gate). Varsayılan değer boş bırakılır.

## Temizlik (SONRAKİ ayrı adım, sadece doğrulama geçtikten sonra)

Yeni migration `supabase/migrations/20260719160000_drop_detr_legacy.sql`:

```sql
drop table if exists public.detr_todo_attachments;
drop table if exists public.detr_todo_comments;
drop table if exists public.detr_todos;
```

Bucket temizliği (`detr-files` ve içindeki objeler) SQL migration'ı ile değil,
`scripts/migrate-detr-files.ts` script'inin bir parçası olarak veya ayrı bir
script ile Storage API üzerinden yapılır (migration dosyaları bucket
silemez, sadece `storage.buckets` tablosuna satır silme/insert edebilir —
objelerin kendisi ayrı bir API çağrısı gerektirir).

## Kapsam dışı

- Premium tema değişikliği (ayrı, sonraki iş — mevcut onaylı spec:
  `2026-07-19-detrbridge-premium-theme-design.md`).
- E-posta allowlist'in geri getirilmesi (kasıtlı olarak yok).
- `detr_todos` tablolarının RLS/policy davranışının değişmesi.

## Doğrulama

Migration sonrası satır/obje sayısı eşleşmesi (yukarıda), sonra
`tsc --noEmit` + `eslint --max-warnings=0` + `next build`. Temizlik
migration'ı sadece taşıma doğrulaması geçtikten sonra ayrı bir adımda
uygulanır — aynı otururumda ama ayrı, geri dönüşsüz bir işlem olarak
işaretlenir.
