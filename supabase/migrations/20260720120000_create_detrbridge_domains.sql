-- Domain name suggestions + voting for /detrbridge, mirroring the
-- detrbridge_logos / detrbridge_logo_votes pattern but without any file
-- upload (a domain suggestion is just text).
create table if not exists public.detrbridge_domains (
  id uuid primary key default gen_random_uuid(),
  domain_name text not null,
  uploader_name text not null default 'Ortak',
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.detrbridge_domain_votes (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.detrbridge_domains(id) on delete cascade,
  voter_name text not null,
  rating smallint not null
    check (rating between 1 and 10),
  created_at timestamptz not null default now(),
  unique (domain_id, voter_name)
);

create index if not exists detrbridge_domain_votes_domain_id_idx
  on public.detrbridge_domain_votes (domain_id);

-- RLS on, with NO policy for anon/authenticated — service-role only,
-- matching detrbridge_logos / detrbridge_logo_votes.
alter table public.detrbridge_domains enable row level security;
alter table public.detrbridge_domain_votes enable row level security;
