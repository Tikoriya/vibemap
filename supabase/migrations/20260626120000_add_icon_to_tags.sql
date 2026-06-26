-- Store the chosen Lucide icon name (PascalCase, e.g. "Coffee") for a label/tag.
-- Nullable so existing tags and tags created lazily during spot save keep working.
alter table public.tags
  add column if not exists icon text;
