create extension if not exists "pgcrypto";

-- Internal management board for the BatuBT footer-code workflow. Tracks which
-- footer snippet goes into which client domain, who owns it and who is
-- responsible, plus whether it has been added/verified on the live site.
-- Admin-managed only; not exposed to anon/authenticated readers.
create table if not exists public.footer_clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  domain text not null default '',
  owner text not null default '',
  responsible text not null default '',
  footer_code text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'added', 'verified')),
  notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists footer_clients_owner_idx
  on public.footer_clients (owner, sort_order, created_at);

create index if not exists footer_clients_status_idx
  on public.footer_clients (status);

create index if not exists footer_clients_domain_idx
  on public.footer_clients (domain);

create or replace function public.set_footer_client_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_footer_client_updated_at on public.footer_clients;
create trigger set_footer_client_updated_at
before update on public.footer_clients
for each row
execute function public.set_footer_client_updated_at();

-- RLS on, with NO select/insert/update/delete policy for anon/authenticated.
-- All access goes through the service-role client behind the /batubt gate.
alter table public.footer_clients enable row level security;
