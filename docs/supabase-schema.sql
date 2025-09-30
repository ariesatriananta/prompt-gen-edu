-- Enable UUID extension if needed
create extension if not exists "uuid-ossp";

-- Profiles table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'member' check (role in ('admin','member')),
  trial_ends_at timestamptz not null default now() + interval '3 days',
  created_at timestamptz not null default now()
);

-- Tools master
create table if not exists public.tools (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  name text not null
);

-- Mapping tools per member
create table if not exists public.member_tools (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  primary key (profile_id, tool_id)
);

-- Trigger to create profile on new auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, trial_ends_at)
  values (new.id, new.email, 'member', now() + interval '3 days')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.tools enable row level security;
alter table public.member_tools enable row level security;

-- Profiles policies
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

-- Admin full access via their own profile role
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Tools policies (read for all logged-in, write for admin)
drop policy if exists tools_read on public.tools;
create policy tools_read on public.tools
  for select using (auth.role() = 'authenticated');

drop policy if exists tools_admin_all on public.tools;
create policy tools_admin_all on public.tools
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Member_tools policies
drop policy if exists member_tools_self on public.member_tools;
create policy member_tools_self on public.member_tools
  for select using (profile_id = auth.uid());

drop policy if exists member_tools_admin_all on public.member_tools;
create policy member_tools_admin_all on public.member_tools
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Seed tools
insert into public.tools (key, name) values
  ('eduprompt','Eduprompt'),
  ('motionprompt','Motionprompt'),
  ('storyprompt','Storyprompt'),
  ('visiprompt','Visiprompt'),
  ('quizprompt','QuizPrompt'),
  ('playprompt','PlayPrompt')
on conflict (key) do nothing;

