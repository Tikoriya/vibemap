-- Push spot tag-filtering AND pagination down into Postgres instead of fetching
-- every spot and filtering/slicing in JS on the client. filter_city_spots returns
-- the city's spots, optionally narrowed to selected tags (ANY by default, ALL when
-- p_match_all), one keyset page at a time.
-- Pagination is keyset (not OFFSET): pass the previous page's last row via
-- (p_cursor_created_at, p_cursor_id); ordering is (created_at desc, id desc) so the
-- tuple comparison walks strictly forward with no skips/dupes as rows change.
-- security invoker + stable so the existing spots RLS (scoped via the parent
-- city's owner) keeps enforcing per-user access; search_path is pinned per the
-- seed_default_tags convention.

create or replace function public.filter_city_spots(
  p_city_id bigint,
  p_tag_ids bigint[] default '{}',
  p_match_all boolean default false,
  p_limit integer default 20,
  p_cursor_created_at timestamptz default null,
  p_cursor_id bigint default null
)
returns setof public.spots
language sql
stable
security invoker
set search_path = ''
as $$
  select s.*
  from public.spots s
  where s.city_id = p_city_id
    and (
      coalesce(array_length(p_tag_ids, 1), 0) = 0
      or (
        not p_match_all
        and exists (
          select 1
          from public.spot_tags st
          where st.spot_id = s.id
            and st.tag_id = any (p_tag_ids)
        )
      )
      or (
        p_match_all
        and (
          select count(distinct st.tag_id)
          from public.spot_tags st
          where st.spot_id = s.id
            and st.tag_id = any (p_tag_ids)
        ) = cardinality(p_tag_ids)
      )
    )
    and (
      p_cursor_created_at is null
      or (s.created_at, s.id) < (p_cursor_created_at, p_cursor_id)
    )
  order by s.created_at desc, s.id desc
  limit p_limit;
$$;

-- The filter bar only needs the distinct tags actually attached to spots in this
-- city. Computing that in SQL avoids fetching every spot just to flatMap its tags
-- on the client. Same security invoker + stable + pinned search_path conventions
-- so tag/spot RLS keeps scoping rows to the owner.
create or replace function public.city_tags(p_city_id bigint)
returns setof public.tags
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct t.*
  from public.tags t
  join public.spot_tags st on st.tag_id = t.id
  join public.spots s on s.id = st.spot_id
  where s.city_id = p_city_id
  order by t.label asc;
$$;
