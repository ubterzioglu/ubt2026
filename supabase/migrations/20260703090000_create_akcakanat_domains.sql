create extension if not exists "pgcrypto";

-- Domain portfolio board for the Akçakanat sites, managed behind the
-- /bakcakanat gate. Left column lists the site; the editable columns track
-- where the domain is registered, where it is hosted, which email provider is
-- attached and a free-form comment.
-- Admin-managed only; not exposed to anon/authenticated readers.
create table if not exists public.akcakanat_domains (
  id uuid primary key default gen_random_uuid(),
  site text not null unique,
  domain_info text not null default '',
  hosting text not null default '',
  email text not null default '',
  comment text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists akcakanat_domains_sort_idx
  on public.akcakanat_domains (sort_order, created_at);

create or replace function public.set_akcakanat_domain_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_akcakanat_domain_updated_at on public.akcakanat_domains;
create trigger set_akcakanat_domain_updated_at
before update on public.akcakanat_domains
for each row
execute function public.set_akcakanat_domain_updated_at();

-- RLS on, with NO select/insert/update/delete policy for anon/authenticated.
-- All access goes through the service-role client behind the /bakcakanat gate.
alter table public.akcakanat_domains enable row level security;

-- Seed the current portfolio. `on conflict do nothing` keeps re-runs safe and
-- never clobbers values edited through the board.
insert into public.akcakanat_domains (site, sort_order) values
  ('corteqs.net', 10),
  ('getstaketurk.com', 20),
  ('londonschoolofcoaching.com', 30),
  ('londonschoolofpsychology.com', 40),
  ('or-ge.com.tr', 50),
  ('payaltr.com', 60),
  ('qualtronsinclair.com', 70),
  ('turkinvestnetwork.com', 80),
  ('shamanlife.com', 90),
  ('bilincsizsiniz.com', 100),
  ('humanconsciousnessdecoded.com', 110),
  ('burakakcakanat.com.tr', 120),
  ('kaanakcakanat.com.tr', 130),
  ('samanakcakanat.com.tr', 140)
on conflict (site) do nothing;
