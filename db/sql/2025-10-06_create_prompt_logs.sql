-- Create prompt_logs table to store generation history
create table if not exists prompt_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tool_key text not null,
  subject text,
  grade text,
  style text,
  topic text,
  story text,
  negative text,
  scene_count int,
  model text,
  prompt text,
  response_json jsonb,
  response_text text,
  status text default 'ok' check (status in ('ok','error')),
  error_message text,
  duration_ms int,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_prompt_logs_user_created on prompt_logs(user_id, created_at desc);
create index if not exists idx_prompt_logs_tool_created on prompt_logs(tool_key, created_at desc);
create index if not exists idx_prompt_logs_resp_json on prompt_logs using gin (response_json);

-- Enable RLS
alter table prompt_logs enable row level security;

-- Helper: check admin using profiles.role
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select coalesce(lower(role) = 'admin', false)
  from profiles
  where id = uid
$$;

-- Policies
drop policy if exists prompt_logs_member_select on prompt_logs;
create policy prompt_logs_member_select on prompt_logs
  for select
  using (auth.uid() = user_id or is_admin(auth.uid()));

drop policy if exists prompt_logs_member_insert on prompt_logs;
create policy prompt_logs_member_insert on prompt_logs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists prompt_logs_member_delete on prompt_logs;
create policy prompt_logs_member_delete on prompt_logs
  for delete
  using (auth.uid() = user_id or is_admin(auth.uid()));

