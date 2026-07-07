create extension if not exists "pgcrypto";

-- DETR todo board (/detr). Standalone board behind its own password gate
-- (ADMIN_QASS_DETR); admin-managed only, not exposed to anon/authenticated.
create table if not exists public.detr_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  -- Who the todo belongs to / who will do it.
  assignee text not null default 'Ortak',
  -- Deadline; null when the todo has no due date.
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists detr_todos_status_idx
  on public.detr_todos (status, due_date, created_at);

-- Thread comments attached to a todo. Cascade-deleted with their todo.
create table if not exists public.detr_todo_comments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null
    references public.detr_todos(id) on delete cascade,
  body text not null,
  author text not null default 'Ortak',
  created_at timestamptz not null default now()
);

create index if not exists detr_todo_comments_todo_idx
  on public.detr_todo_comments (todo_id, created_at);

create or replace function public.set_detr_todo_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_detr_todo_updated_at on public.detr_todos;
create trigger set_detr_todo_updated_at
before update on public.detr_todos
for each row
execute function public.set_detr_todo_updated_at();

-- RLS on, with NO select/insert/update/delete policy for anon/authenticated.
-- All access goes through the service-role client behind the admin gate.
alter table public.detr_todos enable row level security;
alter table public.detr_todo_comments enable row level security;
