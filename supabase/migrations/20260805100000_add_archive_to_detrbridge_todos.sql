-- Arşivleme: /detrbridge görev panolarında "sil" yerine "arşivle".
--
-- Neden ayrı bir kolon, status'a yeni bir değer değil: status ('open'|'done')
-- görevin İŞ durumu, arşiv ise GÖRÜNÜRLÜK durumu. İkisi bağımsız — tamamlanmış
-- bir görev de, hiç başlanmamış bir görev de arşivlenebilir ve arşivden
-- çıkınca eski iş durumunu aynen korur. status'a 'archived' eklemek bu bilgiyi
-- geri dönülemez şekilde ezerdi.
alter table public.detrbridge_todos
  add column if not exists archived_at timestamptz;

alter table public.detrbridge_todos2
  add column if not exists archived_at timestamptz;

-- Aktif liste her sayfa yüklemesinde archived_at is null ile filtreleniyor.
create index if not exists detrbridge_todos_archived_idx
  on public.detrbridge_todos (archived_at);

create index if not exists detrbridge_todos2_archived_idx
  on public.detrbridge_todos2 (archived_at);
