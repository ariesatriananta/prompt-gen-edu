-- Add boolean column `disabled` to `profiles` with default false
alter table profiles
  add column if not exists disabled boolean not null default false;

-- Optional: index if you plan to filter by this flag
create index if not exists idx_profiles_disabled on profiles(disabled);

-- Notes:
-- - Run this in Supabase SQL editor, or via CLI: supabase db push
-- - Ensure RLS policies permit your admin to select/update this column.
--   If using service role in API, it bypasses RLS for admin operations.

