# Movie Randomizer App v10

This version is configured with the supplied Supabase Project URL and anon public key.

## What syncs across phone and desktop

- Current recommended movie
- Watched / seen status
- 1–5 star rating
- Comments

## Required Supabase step

Open Supabase → SQL Editor → New Query.

Paste and run the full contents of `supabase_setup.sql` from this v10 package.

This is required because v10 explicitly grants browser access to the two tables as well as creating Row Level Security policies.

## Deploy

Upload this full folder to Vercel, or replace the files in your GitHub repo and let Vercel redeploy.

## How to verify

1. Open the deployed app.
2. Mark one movie as seen or add a rating/comment.
3. Look at the bottom status area. It should say `Progress saved to database.`
4. In Supabase → Table Editor → `movie_app_progress`, check that a row appears.

If it says `Could not save progress to database`, copy the full message from the bottom status area.
