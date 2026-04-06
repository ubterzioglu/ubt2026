create extension if not exists "pgcrypto";

create table if not exists public.featured_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title text not null,
  summary text not null,
  href text,
  badge text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.featured_items enable row level security;

grant select on public.featured_items to anon, authenticated;

drop policy if exists "Published featured items are readable by everyone" on public.featured_items;
create policy "Published featured items are readable by everyone"
on public.featured_items
for select
to anon, authenticated
using (is_published = true);
