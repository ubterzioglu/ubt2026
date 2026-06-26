create extension if not exists "pgcrypto";

-- Internal planning board for the DesireMap project. Admin-managed only;
-- not exposed to anon/authenticated readers (no public select policy).
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner text not null default 'Ortak',
  category text not null default '',
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'top5')),
  due_target text not null default '',
  notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_tasks_owner_idx
  on public.project_tasks (owner, sort_order, created_at);

create index if not exists project_tasks_status_idx
  on public.project_tasks (status);

create or replace function public.set_project_task_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_project_task_updated_at on public.project_tasks;
create trigger set_project_task_updated_at
before update on public.project_tasks
for each row
execute function public.set_project_task_updated_at();

-- RLS on, with NO select/insert/update/delete policy for anon/authenticated.
-- All access goes through the service-role client behind the admin gate.
alter table public.project_tasks enable row level security;
