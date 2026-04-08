create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.appointment_slots(id) on delete restrict,
  status text not null default 'pending',
  full_name text not null,
  email text not null,
  company text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_status_check check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  constraint appointments_full_name_length check (char_length(trim(full_name)) >= 2)
);

create unique index if not exists appointments_one_active_booking_per_slot_idx
on public.appointments (slot_id)
where status in ('pending', 'confirmed');

create index if not exists appointments_status_created_at_idx
on public.appointments (status, created_at desc);

create or replace function public.set_appointment_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_appointment_updated_at on public.appointments;
create trigger set_appointment_updated_at
before update on public.appointments
for each row
execute function public.set_appointment_updated_at();

alter table public.appointments enable row level security;

grant insert on public.appointments to anon, authenticated;

drop policy if exists "Public appointment requests can be created" on public.appointments;
create policy "Public appointment requests can be created"
on public.appointments
for insert
to anon, authenticated
with check (
  status = 'pending'
  and exists (
    select 1
    from public.appointment_slots slots
    where slots.id = appointments.slot_id
      and slots.is_public = true
      and slots.starts_at > now()
  )
  and not exists (
    select 1
    from public.appointments existing
    where existing.slot_id = appointments.slot_id
      and existing.status in ('pending', 'confirmed')
  )
);