-- Give every account its own copy of the curated "starter" labels.
-- Previously these lived only in client code (ICON_LABELS in
-- components/ui/IconLabel.tsx) and were rendered as hardcoded picker chips.
-- Persisting a per-user copy lets a user later rename or delete them like any
-- other tag once edit-labels ships. Labels and icon names must stay in sync
-- with ICON_LABELS; icon values are Lucide PascalCase names (see tags.icon).

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
  on conflict (label, user_id) do nothing;
  return new;
end;
$$;

-- Fires for all sign-up paths (password, magic link, Apple) since the row is
-- inserted into auth.users in every case.
drop trigger if exists on_auth_user_created_seed_tags on auth.users;
create trigger on_auth_user_created_seed_tags
  after insert on auth.users
  for each row execute function public.seed_default_tags();

-- Backfill accounts that already exist so they also get the starter set.
insert into public.tags (user_id, label, icon)
select u.id, t.label, t.icon
from auth.users u
cross join (
  values
    ('Coffee', 'Coffee'),
    ('Cocktails', 'Martini'),
    ('Food', 'UtensilsCrossed'),
    ('Coworking', 'LaptopMinimalCheck'),
    ('Work-friendly', 'Laptop'),
    ('Wine', 'Wine'),
    ('Brunch', 'EggFried'),
    ('Pastries', 'Croissant'),
    ('Coffee to go', 'CupSoda')
) as t(label, icon)
on conflict (label, user_id) do nothing;
