-- Adds an optional country to cities so the city card can show "Country · N places".
alter table public.cities
  add column if not exists country text;
