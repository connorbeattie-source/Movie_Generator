# 100 Movie Canon Randomizer Web App

## What this does
This is a simple browser-based movie picker that is maintained by Excel.

It supports two flows:

1. **Pick completely at random**  
   Randomly selects any unwatched movie from the full Excel database.

2. **Pick by rolled-up genre**  
   The user selects a rolled-up genre, such as Horror, Crime, Sci-Fi, Romance, etc.  
   The app then randomly selects an unwatched movie from that genre.

When a movie is marked as watched, it is excluded from future random selections.

## Files included

- `index.html` — open this in your browser to use the app.
- `style.css` — visual styling.
- `app.js` — randomizer logic.
- `movie_database.xlsx` — the Excel movie database.

## How to use

1. Open `index.html` in Chrome, Edge, Safari, or Firefox.
2. Upload/select the included `movie_database.xlsx` file.
3. Choose either:
   - Completely random
   - Pick by rolled-up genre
4. Click **Pick a movie**.
5. After watching the film, click **Mark as watched**.
6. Click **Download updated Excel** to save your progress back into Excel.

## Excel maintenance rules

The app expects a sheet called `Movies` with these columns:

- Movie title
- Genre
- Rolled-up Genre
- Country of film
- Year of film made
- Watched
- Date Watched
- Notes

`Watched` should be either `Yes` or `No`.

The app uses **Rolled-up Genre** for the genre picker. For example:

- Slasher Horror → Horror
- Psychological Horror → Horror
- Crime Drama → Crime
- Science Fiction Action → Sci-Fi

## Important note

The app uses the SheetJS browser library from a CDN to read/write Excel files. If you want to use this fully offline, download the SheetJS `xlsx.full.min.js` file and update `index.html` to reference it locally instead of the CDN URL.
