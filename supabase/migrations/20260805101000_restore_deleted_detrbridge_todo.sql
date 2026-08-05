-- 05.08.2026'da fark edilen veri kaybının geri alınması.
--
-- "Görevler" panosunda (detrbridge_todos) 11.07.2026 19:23 itibarıyla 15 görev
-- ve 8 yorum vardı; bugün 14 görev ve 7 yorum kaldığı görüldü. Eksik olan tek
-- kayıt aşağıdaki görev ve ona bağlı tek yorum (yorum, foreign key cascade ile
-- görevle birlikte silinmişti).
--
-- Değerler, kaydın ilk eklendiği oturumun kayıtlarından birebir alındı:
-- id ve created_at orijinalleriyle aynı, böylece kayıt panoda kronolojik
-- olarak eski yerine döner. Yorumun kendi id'si silinmeyle kaybolduğu için
-- yeni bir uuid üretiliyor; created_at orijinal değerinde bırakıldı.
--
-- on conflict do nothing: migrasyon yeniden çalıştırılırsa (ya da kayıt elle
-- geri alınmışsa) ikinci bir kopya oluşturmaz.
insert into public.detrbridge_todos
  (id, title, assignee, due_date, status, created_at, updated_at)
values (
  'fe7e0e24-dc3b-48a6-a140-8f5103601db7',
  'Batuhan ile Cumartesi toplantısı — SEO/GEO konusunu anlatmak',
  'Umut',
  '2026-07-11',
  'open',
  '2026-07-08T10:47:41.765015+00:00',
  '2026-07-08T10:47:41.765015+00:00'
)
on conflict (id) do nothing;

insert into public.detrbridge_todo_comments (todo_id, body, author, created_at)
select
  'fe7e0e24-dc3b-48a6-a140-8f5103601db7',
  'Batuhan niş sitelerde 3-4 haftada üst sıraya çıkarabiliyor; yüksek otoriteli sitelerden (Ekşi ~80) backlink mantığı. Toplantıda SEO/GEO iş akışı ve komisyon modeli anlatılacak.',
  'Toplantı notu',
  '2026-07-11T19:23:05.942486+00:00'
where not exists (
  select 1 from public.detrbridge_todo_comments
  where todo_id = 'fe7e0e24-dc3b-48a6-a140-8f5103601db7'
);
