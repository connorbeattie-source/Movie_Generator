# Movie Randomizer App - V2

This version loads `movie_database.xlsx` automatically in the background. The user does not upload an Excel file in the UI.

## Features

- Completely random unwatched movie pick
- Genre-based random unwatched movie pick
- UI label uses `Genre` for the rolled-up genre
- Watched / seen toggle from the result screen and table
- 1-5 star rating from the result screen and table
- Short movie summaries included in the Excel database
- Export updated Excel with watched status, rating, and date watched

## How to deploy on Vercel

Upload these files to your GitHub repo and deploy as a static project:

- `index.html`
- `style.css`
- `app.js`
- `movie_database.xlsx`

Vercel settings:

- Framework preset: Other
- Build command: blank
- Output directory: `.`

## Important

Watched status and ratings are stored in the browser using localStorage. This means they persist on the same device/browser, but they do not sync across devices unless you later add a database such as Supabase.

If you update the master movie list, replace `movie_database.xlsx` in GitHub with the same filename and redeploy.

## Running locally

Because the app fetches the Excel file, do not open `index.html` directly from your file system. Use a simple local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```


## v3 updates
- Removed the Unwatched dashboard label.
- Renamed Specific genre to Sub Genre.
- Added sortable table headers for Genre, Sub Genre, Country, Year, Seen, and Rating.
- Clicking the 1-star rating clears the rating back to unrated.


## v4 updates
- Added sortable Movie column.
- Added movie title search.
- Added free-text Comment field, saved in browser local storage.
- Moved the automatic Excel/database status panel to the bottom of the page.
- Saves the current recommended movie so it is shown again on the next visit.
- Removed visible "unwatched" wording from the genre selector.
