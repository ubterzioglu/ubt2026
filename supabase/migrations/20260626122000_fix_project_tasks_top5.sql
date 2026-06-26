-- The "İlk yapılacak 5 şey" list has 5 items; the original seed only tagged 3
-- of them as priority 'top5'. Promote the remaining two (Umut's first data
-- batch + Zoho mail setup) so all five surface under the İlk 5 filter.
-- Idempotent: re-running just re-sets the same priority.

UPDATE public.project_tasks
SET priority = 'top5'
WHERE title IN (
  'İlk etapta örnek şehir/mekan listesi çıkar',
  'Zoho üzerinden proje mail altyapısını ayarla'
)
AND priority <> 'top5';
