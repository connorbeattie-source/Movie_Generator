-- Run this in Supabase SQL Editor.
-- It creates one shared state row/profile for your movie app so the current recommendation, watched status, ratings and comments sync across devices.

create table if not exists public.movie_app_state (
  profile_id text primary key,
  current_pick_key text,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.movie_app_state enable row level security;

drop policy if exists "Allow public read movie app state" on public.movie_app_state;
create policy "Allow public read movie app state"
on public.movie_app_state
for select
to anon
using (true);

drop policy if exists "Allow public upsert movie app state" on public.movie_app_state;
create policy "Allow public upsert movie app state"
on public.movie_app_state
for insert
to anon
with check (true);

drop policy if exists "Allow public update movie app state" on public.movie_app_state;
create policy "Allow public update movie app state"
on public.movie_app_state
for update
to anon
using (true)
with check (true);

insert into public.movie_app_state (profile_id, current_pick_key, progress)
values ('default', null, '{}'::jsonb)
on conflict (profile_id) do nothing;
