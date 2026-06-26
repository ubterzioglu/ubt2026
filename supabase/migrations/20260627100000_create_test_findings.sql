create extension if not exists "pgcrypto";

-- Test findings board for the DesireMap project. Sibling of project_tasks;
-- admin-managed only, not exposed to anon/authenticated readers.
create table if not exists public.test_findings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text not null default '',
  owner text not null default 'Ortak',
  status text not null default 'open'
    check (status in ('open', 'investigating', 'resolved', 'wontfix')),
  severity text not null default 'normal'
    check (severity in ('low', 'normal', 'high', 'critical')),
  -- Storage object path inside the dm-screenshots bucket; signed URL is
  -- generated server-side at read time. Null when no screenshot attached.
  screenshot_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists test_findings_owner_idx
  on public.test_findings (owner, sort_order, created_at);

create index if not exists test_findings_status_idx
  on public.test_findings (status);

-- Thread comments attached to a finding. Cascade-deleted with their finding.
create table if not exists public.finding_comments (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null
    references public.test_findings(id) on delete cascade,
  body text not null,
  author text not null default 'Ortak',
  created_at timestamptz not null default now()
);

create index if not exists finding_comments_finding_idx
  on public.finding_comments (finding_id, created_at);

create or replace function public.set_test_finding_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_test_finding_updated_at on public.test_findings;
create trigger set_test_finding_updated_at
before update on public.test_findings
for each row
execute function public.set_test_finding_updated_at();

-- RLS on, with NO select/insert/update/delete policy for anon/authenticated.
-- All access goes through the service-role client behind the admin gate.
alter table public.test_findings enable row level security;
alter table public.finding_comments enable row level security;

-- Private bucket for finding screenshots. Service-role uploads + signed URLs.
insert into storage.buckets (id, name, public)
values ('dm-screenshots', 'dm-screenshots', false)
on conflict (id) do nothing;
