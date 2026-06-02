-- Movie Randomizer Supabase setup v10
-- Run this full file in Supabase SQL Editor.
-- It is safe to run more than once.

create table if not exists public.movie_app_recommendation (
  profile_id text primary key,
  current_pick_key text,
  updated_at timestamptz not null default now()
);

create table if not exists public.movie_app_progress (
  profile_id text not null,
  movie_key text not null,
  watched boolean not null default false,
  rating integer not null default 0 check (rating >= 0 and rating <= 5),
  comment text not null default '',
  date_watched date,
  updated_at timestamptz not null default now(),
  primary key (profile_id, movie_key)
);

-- Supabase/PostgREST still needs table privileges in addition to RLS policies.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.movie_app_recommendation to anon, authenticated;
grant select, insert, update, delete on public.movie_app_progress to anon, authenticated;

alter table public.movie_app_recommendation enable row level security;
alter table public.movie_app_progress enable row level security;

-- Recreate policies so the browser anon key can read/write the shared single-user state.
drop policy if exists "movie_app_recommendation_select" on public.movie_app_recommendation;
drop policy if exists "movie_app_recommendation_insert" on public.movie_app_recommendation;
drop policy if exists "movie_app_recommendation_update" on public.movie_app_recommendation;
drop policy if exists "Allow public read recommendation" on public.movie_app_recommendation;
drop policy if exists "Allow public insert recommendation" on public.movie_app_recommendation;
drop policy if exists "Allow public update recommendation" on public.movie_app_recommendation;

create policy "movie_app_recommendation_select"
on public.movie_app_recommendation
for select
to anon, authenticated
using (true);

create policy "movie_app_recommendation_insert"
on public.movie_app_recommendation
for insert
to anon, authenticated
with check (true);

create policy "movie_app_recommendation_update"
on public.movie_app_recommendation
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "movie_app_progress_select" on public.movie_app_progress;
drop policy if exists "movie_app_progress_insert" on public.movie_app_progress;
drop policy if exists "movie_app_progress_update" on public.movie_app_progress;
drop policy if exists "movie_app_progress_delete" on public.movie_app_progress;
drop policy if exists "Allow public read progress" on public.movie_app_progress;
drop policy if exists "Allow public insert progress" on public.movie_app_progress;
drop policy if exists "Allow public update progress" on public.movie_app_progress;
drop policy if exists "Allow public delete progress" on public.movie_app_progress;

create policy "movie_app_progress_select"
on public.movie_app_progress
for select
to anon, authenticated
using (true);

create policy "movie_app_progress_insert"
on public.movie_app_progress
for insert
to anon, authenticated
with check (true);

create policy "movie_app_progress_update"
on public.movie_app_progress
for update
to anon, authenticated
using (true)
with check (true);

create policy "movie_app_progress_delete"
on public.movie_app_progress
for delete
to anon, authenticated
using (true);

insert into public.movie_app_recommendation (profile_id, current_pick_key, updated_at)
values ('default', null, now())
on conflict (profile_id) do nothing;
