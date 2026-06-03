# Movie Randomizer App v11

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


## v11 update

- Comment fields now use wrapping text areas instead of single-line inputs.
- Long comments wrap within the table cell.
- Comment column is more responsive on mobile/tablet.


## v12 theme update

- Creative popcorn/cinema background theme.
- Dark high-contrast panels retained for readability.
- Visible keyboard focus outlines added for accessibility.
- Table/comment readability preserved on mobile with horizontal table scrolling.

## v13 update

The recommendation panel now includes the full tracking controls: seen toggle, auto date watched, star rating, and a multiline comment box. Updates save to Supabase and remain visible after refresh and across devices.


## IMDb links

The Excel database now includes `IMDb ID` and `IMDb URL` columns. The app reads the `IMDb URL` first, then falls back to building a URL from `IMDb ID`, and finally creates an IMDb search link from the movie title and year if needed.

No Supabase schema changes are required for IMDb links because these are static movie catalogue fields stored in `movie_database.xlsx`.
