create extension if not exists "pgcrypto";

create table if not exists public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Europe/Berlin',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_slots_valid_range check (ends_at > starts_at)
);

create index if not exists appointment_slots_public_start_idx
on public.appointment_slots (is_public, starts_at);

create or replace function public.set_appointment_slot_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_appointment_slot_updated_at on public.appointment_slots;
create trigger set_appointment_slot_updated_at
before update on public.appointment_slots
for each row
execute function public.set_appointment_slot_updated_at();

alter table public.appointment_slots enable row level security;

grant select on public.appointment_slots to anon, authenticated;

drop policy if exists "Public appointment slots are readable by everyone" on public.appointment_slots;
create policy "Public appointment slots are readable by everyone"
on public.appointment_slots
for select
to anon, authenticated
using (is_public = true and starts_at > now());