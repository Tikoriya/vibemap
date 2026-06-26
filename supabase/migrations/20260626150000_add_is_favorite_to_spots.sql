-- Lets a user mark a spot as a favorite. Defaults to false so existing spots
-- and inserts that omit the flag keep working.
alter table public.spots
  add column if not exists is_favorite boolean not null default false;
