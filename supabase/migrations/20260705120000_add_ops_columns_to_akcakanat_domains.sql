-- Operational tracking columns for the /bakcakanat domain board:
--   has_email      -> does the domain have a mailbox (var/yok)
--   redirect_to    -> forwarding target; empty string means no redirect
--   payment_days   -> renewal/payment due dates (free text)
--   payment_method -> how the domain is paid, e.g. "sanal kart" (free text)
alter table public.akcakanat_domains
  add column if not exists has_email boolean not null default false,
  add column if not exists redirect_to text not null default '',
  add column if not exists payment_days text not null default '',
  add column if not exists payment_method text not null default '';
