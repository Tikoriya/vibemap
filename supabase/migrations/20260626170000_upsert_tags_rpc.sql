-- Tag dedupe belongs in the DB constraint, not a client read-modify-write.
-- createTags previously pulled ALL of a user's tags into JS to match labels
-- case-insensitively. That races (two saves can both miss and double-insert) and
-- scales with the user's tag count. This RPC pushes it to one round trip backed
-- by the (user_id, lower(label)) unique index from
-- 20260626140000_dedupe_tags_case_insensitive.sql.
--
-- supabase-js .upsert({ onConflict }) cannot target an EXPRESSION index
-- (lower(label)) — PostgREST quotes each token as a plain column and defaults the
-- conflict target to the primary key — so the upsert must live in SQL where
-- "on conflict (user_id, lower(label))" can be expressed. security invoker keeps
-- the tags RLS (user_id = auth.uid()) enforcing ownership on both the insert and
-- the select; search_path is pinned per the seed_default_tags convention.

create or replace function public.upsert_tags(p_user_id uuid, p_tags jsonb)
returns setof public.tags
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Insert every requested label that does not already exist for the user. Within
  -- one request, collapse case-insensitive duplicates first (distinct on), keeping
  -- the earliest occurrence's icon, so we never hand Postgres two colliding rows.
  insert into public.tags (user_id, label, icon)
  select distinct on (lower(candidate.label))
    p_user_id, candidate.label, candidate.icon
  from (
    select
      trim(arr.elem ->> 'label') as label,
      nullif(arr.elem ->> 'icon', '') as icon,
      arr.ord
    from jsonb_array_elements(p_tags) with ordinality as arr(elem, ord)
    where length(trim(arr.elem ->> 'label')) > 0
  ) as candidate
  order by lower(candidate.label), candidate.ord
  on conflict (user_id, lower(label)) do nothing;

  -- Return the canonical row for each requested label (freshly inserted OR a
  -- pre-existing one a duplicate insert skipped), matched case-insensitively.
  return query
  select t.*
  from public.tags t
  where t.user_id = p_user_id
    and lower(t.label) in (
      select lower(trim(arr.elem ->> 'label'))
      from jsonb_array_elements(p_tags) as arr(elem)
      where length(trim(arr.elem ->> 'label')) > 0
    );
end;
$$;
