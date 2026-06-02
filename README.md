# Movie Randomizer App v7

This version loads `movie_database.xlsx` automatically in the background and uses Supabase as the shared cloud store for the current recommendation, watched status, ratings, and comments.

## What is included

- Random movie picker
- Genre-based picker
- Watched toggle
- 1–5 star rating, with click-again-to-clear behaviour
- Movie search
- Sortable table columns
- Comments field
- Embedded Excel movie database
- Optional Supabase sync for current recommendation, watched status, ratings and comments

## Important: cross-device persistence

To make the current recommendation, watched status, ratings, and comments persist between phone and desktop, configure Supabase:

1. Create a free Supabase project.
2. Open Supabase → SQL Editor.
3. Run the contents of `supabase_setup.sql`.
4. Open `config.js`.
5. Replace:
   - `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE`
   - `PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE`
6. Commit the updated files to GitHub.
7. Vercel will redeploy.

After that:

- If you pick a movie on your phone, the same recommendation will appear when you open the app on your desktop.
- If you mark a film as watched on desktop, it will be excluded on phone.
- If you add a rating or comment on one device, it will load on the other device when you reopen the app.

## Files

- `index.html` — app screen
- `style.css` — styling
- `app.js` — app logic
- `config.js` — Supabase config
- `supabase_setup.sql` — database setup script
- `movie_database.xlsx` — editable movie database

## Maintaining the Excel list

Update `movie_database.xlsx`, keep the same filename, and commit it to GitHub. Vercel will redeploy automatically.

## Local testing

Do not open `index.html` directly from Finder/File Explorer. Use a local server, for example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```
