-- Yearly pricing info for /detrbridge domain suggestions, so a suggested
-- domain can carry its registrar offer (e.g. "€7.43/yr, retail €12.69/yr")
-- alongside the name/vote/select flow already in place.
alter table public.detrbridge_domains
  add column if not exists price_yearly numeric(10, 2),
  add column if not exists retail_price_yearly numeric(10, 2),
  add column if not exists price_currency text not null default 'EUR';
