create extension if not exists "pgcrypto";

create table if not exists public.news_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  image_url text,
  detail_href text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_news_update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_news_update_updated_at on public.news_updates;
create trigger set_news_update_updated_at
before update on public.news_updates
for each row
execute function public.set_news_update_updated_at();

alter table public.news_updates enable row level security;

grant select on public.news_updates to anon, authenticated;

drop policy if exists "Published news updates are readable by everyone" on public.news_updates;
create policy "Published news updates are readable by everyone"
on public.news_updates
for select
to anon, authenticated
using (is_published = true);
