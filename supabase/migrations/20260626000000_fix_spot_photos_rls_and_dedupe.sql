-- spot_photos was missing UPDATE/DELETE RLS policies, so reordering (UPDATE)
-- and photo removal (DELETE) were silently no-ops while INSERT still worked.
-- That produced duplicate rows. This migration cleans up the data and adds the
-- missing policies, scoped to the owner via spot -> city -> cities.user_id.

-- 1. Remove duplicate rows (same photo inserted multiple times), keeping the
--    earliest row per (spot_id, url).
delete from public.spot_photos a
using public.spot_photos b
where a.spot_id = b.spot_id
  and a.url = b.url
  and a.id > b.id;

-- 2. Renumber positions so each spot has a contiguous 0..n-1 sequence,
--    preserving the current relative order.
with ordered as (
  select
    id,
    row_number() over (
      partition by spot_id
      order by position asc, id asc
    ) - 1 as new_position
  from public.spot_photos
)
update public.spot_photos sp
set position = ordered.new_position
from ordered
where ordered.id = sp.id
  and sp.position is distinct from ordered.new_position;

-- 3. Add the missing write policies. Ownership runs through the parent spot's
--    city, since spot_photos and spots have no user_id column.
alter table public.spot_photos enable row level security;

drop policy if exists "Owners can update their spot photos" on public.spot_photos;
create policy "Owners can update their spot photos"
on public.spot_photos
for update
to authenticated
using (
  exists (
    select 1
    from public.spots s
    join public.cities c on c.id = s.city_id
    where s.id = spot_photos.spot_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.spots s
    join public.cities c on c.id = s.city_id
    where s.id = spot_photos.spot_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their spot photos" on public.spot_photos;
create policy "Owners can delete their spot photos"
on public.spot_photos
for delete
to authenticated
using (
  exists (
    select 1
    from public.spots s
    join public.cities c on c.id = s.city_id
    where s.id = spot_photos.spot_id
      and c.user_id = auth.uid()
  )
);
