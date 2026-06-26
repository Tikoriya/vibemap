-- Tags were unique on (label, user_id), which is case-sensitive in Postgres, so
-- a freeform "brunch" could coexist with the seeded "Brunch" and a spot ended up
-- linked to both (e.g. "The Egg Lab" showing two brunch pills). This migration
-- merges case-insensitive duplicates per user and enforces case-insensitive
-- uniqueness so it cannot happen again.

-- Map each duplicate tag to the canonical row it should collapse into. The
-- canonical row per (user_id, lower(label)) prefers one that already has an icon
-- (the seeded defaults do), then the earliest created.
create temporary table tag_merge on commit drop as
with ranked as (
  select
    id,
    user_id,
    label,
    row_number() over (
      partition by user_id, lower(label)
      order by (icon is not null) desc, id asc
    ) as rn
  from public.tags
),
canonical as (
  select user_id, lower(label) as lkey, id as canonical_id
  from ranked
  where rn = 1
)
select r.id as dup_id, c.canonical_id
from ranked r
join canonical c
  on c.user_id = r.user_id
  and c.lkey = lower(r.label)
where r.rn > 1;

-- Drop join rows that would collide once repointed (canonical tag already linked
-- to that spot), then repoint the rest from the duplicate to the canonical tag.
delete from public.spot_tags st
using tag_merge m
where st.tag_id = m.dup_id
  and exists (
    select 1
    from public.spot_tags existing
    where existing.spot_id = st.spot_id
      and existing.tag_id = m.canonical_id
  );

update public.spot_tags st
set tag_id = m.canonical_id
from tag_merge m
where st.tag_id = m.dup_id;

delete from public.tags t
using tag_merge m
where t.id = m.dup_id;

-- Drop the existing case-sensitive uniqueness (constraint name is environment
-- dependent, so resolve it dynamically) before adding the case-insensitive one.
do $$
declare
  v_conname text;
begin
  select c.conname
  into v_conname
  from pg_constraint c
  where c.conrelid = 'public.tags'::regclass
    and c.contype = 'u'
    and array_length(c.conkey, 1) = 2
    and c.conkey @> array[
      (select attnum from pg_attribute
        where attrelid = 'public.tags'::regclass and attname = 'label'),
      (select attnum from pg_attribute
        where attrelid = 'public.tags'::regclass and attname = 'user_id')
    ]::smallint[];

  if v_conname is not null then
    execute format('alter table public.tags drop constraint %I', v_conname);
  end if;
end $$;

drop index if exists public.tags_label_user_id_key;

create unique index if not exists tags_user_id_lower_label_key
  on public.tags (user_id, lower(label));

-- The seed trigger relied on the old case-sensitive conflict target; repoint it
-- at the new case-insensitive index so sign-ups keep skipping existing labels.
create or replace function public.seed_default_tags()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.tags (user_id, label, icon)
  values
    (new.id, 'Coffee', 'Coffee'),
    (new.id, 'Cocktails', 'Martini'),
    (new.id, 'Food', 'UtensilsCrossed'),
    (new.id, 'Coworking', 'LaptopMinimalCheck'),
    (new.id, 'Work-friendly', 'Laptop'),
    (new.id, 'Wine', 'Wine'),
    (new.id, 'Brunch', 'EggFried'),
    (new.id, 'Pastries', 'Croissant'),
    (new.id, 'Coffee to go', 'CupSoda')
  on conflict (user_id, lower(label)) do nothing;
  return new;
end;
$$;
