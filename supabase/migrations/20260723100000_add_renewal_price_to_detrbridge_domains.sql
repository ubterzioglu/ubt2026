-- Renewal (post-promo) yearly price for /detrbridge domain suggestions,
-- distinct from retail_price_yearly: some registrars quote a first-year
-- discounted price, a "retail" list price, AND a separate (often much
-- higher) renewal price after the first term.
alter table public.detrbridge_domains
  add column if not exists renewal_price_yearly numeric(10, 2);
