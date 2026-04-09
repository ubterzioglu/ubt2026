create extension if not exists "pgcrypto";

create table if not exists public.cv_review_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp_number text not null,
  linkedin_url text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cv_review_requests_status_check check (status in ('new'))
);

create index if not exists cv_review_requests_created_at_idx
on public.cv_review_requests (created_at desc);

create or replace function public.set_cv_review_request_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cv_review_request_updated_at on public.cv_review_requests;
create trigger set_cv_review_request_updated_at
before update on public.cv_review_requests
for each row
execute function public.set_cv_review_request_updated_at();

alter table public.cv_review_requests enable row level security;
