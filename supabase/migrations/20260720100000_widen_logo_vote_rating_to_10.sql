-- Logo vote scale changes from 1-5 to 1-10.
alter table public.detrbridge_logo_votes
  drop constraint if exists detrbridge_logo_votes_rating_check;
alter table public.detrbridge_logo_votes
  add constraint detrbridge_logo_votes_rating_check check (rating between 1 and 10);
