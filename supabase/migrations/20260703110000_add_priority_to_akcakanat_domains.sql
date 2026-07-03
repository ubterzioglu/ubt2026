-- Importance ranking for the /bakcakanat domain board: 1 = most important,
-- 10 = least important. The board lists rows by this value first.
alter table public.akcakanat_domains
  add column if not exists priority integer not null default 5
    check (priority between 1 and 10);

create index if not exists akcakanat_domains_priority_idx
  on public.akcakanat_domains (priority, sort_order, created_at);
