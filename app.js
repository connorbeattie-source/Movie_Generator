let movies = [];
let currentPick = null;
let workbook = null;
let worksheetName = 'Movies';

const DATABASE_FILE = 'movie_database.xlsx';
const PROGRESS_KEY = 'balancedMovieCanonProgressV2';

const els = {
  loadStatus: document.getElementById('loadStatus'),
  totalCount: document.getElementById('totalCount'),
  watchedCount: document.getElementById('watchedCount'),
  unwatchedCount: document.getElementById('unwatchedCount'),
  ratedCount: document.getElementById('ratedCount'),
  genreControls: document.getElementById('genreControls'),
  genreSelect: document.getElementById('genreSelect'),
  pickBtn: document.getElementById('pickBtn'),
  resultPanel: document.getElementById('resultPanel'),
  resultTitle: document.getElementById('resultTitle'),
  resultSummary: document.getElementById('resultSummary'),
  resultGenre: document.getElementById('resultGenre'),
  resultSpecificGenre: document.getElementById('resultSpecificGenre'),
  resultCountry: document.getElementById('resultCountry'),
  resultYear: document.getElementById('resultYear'),
  resultWatchedToggle: document.getElementById('resultWatchedToggle'),
  pickAgainBtn: document.getElementById('pickAgainBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  resetLocalBtn: document.getElementById('resetLocalBtn'),
  clearRatingBtn: document.getElementById('clearRatingBtn'),
  tableBody: document.querySelector('#movieTable tbody'),
  resultStars: [...document.querySelectorAll('.result-panel .star-control button[data-rating]')]
};

function normaliseHeader(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
}

function movieKey(title, year) {
  return `${String(title).trim().toLowerCase()}__${String(year).trim()}`;
}

function loadProgressStore() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}

function saveProgressStore(store) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
}

function persistMovie(movie) {
  const store = loadProgressStore();
  store[movie.key] = {
    watched: Boolean(movie.watched),
    rating: Number(movie.rating) || 0,
    dateWatched: movie.dateWatched || '',
    notes: movie.notes || ''
  };
  saveProgressStore(store);
}

function isYes(value) {
  const v = String(value || '').trim().toLowerCase();
  return v === 'yes' || v === 'true' || v === 'watched' || value === true;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function hydrateMovies(rows) {
  const progress = loadProgressStore();
  return rows.map((row, index) => {
    const title = row['movietitle'] || row['title'] || '';
    const year = row['yearoffilmmade'] || row['year'] || '';
    const key = movieKey(title, year || index);
    const saved = progress[key] || {};
    const watched = saved.watched ?? isYes(row['watched']);
    return {
      key,
      id: `${key}-${index}`,
      title,
      genre: row['genre'] || '',
      rollup: row['rolledupgenre'] || row['rolledgenre'] || row['category'] || row['genre'] || '',
      country: row['countryoffilm'] || row['country'] || '',
      year,
      summary: row['summary'] || row['imdbsummary'] || row['description'] || '',
      watched: Boolean(watched),
      rating: Number(saved.rating ?? row['rating'] ?? 0) || 0,
      dateWatched: saved.dateWatched || row['datewatched'] || '',
      notes: saved.notes || row['notes'] || ''
    };
  }).filter(movie => movie.title);
}

async function loadEmbeddedWorkbook() {
  try {
    const response = await fetch(`${DATABASE_FILE}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load ${DATABASE_FILE}.`);
    const arrayBuffer = await response.arrayBuffer();
    parseWorkbook(arrayBuffer);
    els.loadStatus.textContent = `Loaded ${movies.length} movies from the embedded Excel database.`;
  } catch (error) {
    els.loadStatus.textContent = `Error: ${error.message} If running locally, use a local server rather than opening index.html directly.`;
  }
}

function parseWorkbook(arrayBuffer) {
  workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  worksheetName = workbook.SheetNames.includes('Movies') ? 'Movies' : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];
  const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!raw.length) throw new Error('The embedded Excel file is empty.');

  const headers = raw[0].map(normaliseHeader);
  const rows = raw.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header] = row[index]);
    return obj;
  });

  movies = hydrateMovies(rows);
  if (!movies.length) throw new Error('No movies found. Check the Movie title column.');
  renderAll();
}

function uniqueGenres() {
  return [...new Set(movies.map(m => m.rollup).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function renderStats() {
  const watched = movies.filter(m => m.watched).length;
  const rated = movies.filter(m => Number(m.rating) > 0).length;
  els.totalCount.textContent = movies.length;
  els.watchedCount.textContent = watched;
  els.unwatchedCount.textContent = movies.length - watched;
  els.ratedCount.textContent = rated;
}

function renderGenres() {
  const selected = els.genreSelect.value;
  els.genreSelect.innerHTML = '';
  uniqueGenres().forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = `${genre} (${movies.filter(m => m.rollup === genre && !m.watched).length} unwatched)`;
    els.genreSelect.appendChild(option);
  });
  if ([...els.genreSelect.options].some(o => o.value === selected)) els.genreSelect.value = selected;
}

function starMarkup(movie) {
  const rating = Number(movie.rating) || 0;
  return [1,2,3,4,5].map(n => `<button class="table-star ${n <= rating ? 'active' : ''}" data-key="${escapeHtml(movie.key)}" data-rating="${n}" aria-label="Rate ${n} star${n > 1 ? 's' : ''}">★</button>`).join('');
}

function renderTable() {
  els.tableBody.innerHTML = '';
  movies.forEach(movie => {
    const tr = document.createElement('tr');
    if (movie.watched) tr.classList.add('watched');
    tr.innerHTML = `
      <td><strong>${escapeHtml(movie.title)}</strong><small>${escapeHtml(movie.summary)}</small></td>
      <td>${escapeHtml(movie.rollup)}</td>
      <td>${escapeHtml(movie.genre)}</td>
      <td>${escapeHtml(movie.country)}</td>
      <td>${escapeHtml(movie.year)}</td>
      <td><label class="switch"><input type="checkbox" data-key="${escapeHtml(movie.key)}" class="watched-toggle" ${movie.watched ? 'checked' : ''}/><span></span></label></td>
      <td><div class="table-stars">${starMarkup(movie)}</div></td>
    `;
    els.tableBody.appendChild(tr);
  });
}

function renderAll() {
  renderStats();
  renderGenres();
  renderTable();
  if (currentPick) renderResult(currentPick);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function getCandidatePool() {
  const mode = document.querySelector('input[name="pickMode"]:checked').value;
  let pool = movies.filter(m => !m.watched);
  if (mode === 'genre') {
    const genre = els.genreSelect.value;
    pool = pool.filter(m => m.rollup === genre);
  }
  return pool;
}

function pickRandomMovie() {
  if (!movies.length) {
    alert('The movie database is still loading.');
    return;
  }
  const pool = getCandidatePool();
  if (!pool.length) {
    alert('No unwatched movies available for this selection.');
    return;
  }
  currentPick = pool[Math.floor(Math.random() * pool.length)];
  renderResult(currentPick);
  window.scrollTo({ top: els.resultPanel.offsetTop - 16, behavior: 'smooth' });
}

function renderResult(movie) {
  els.resultTitle.textContent = movie.title;
  els.resultSummary.textContent = movie.summary || 'No summary available.';
  els.resultGenre.textContent = movie.rollup;
  els.resultSpecificGenre.textContent = movie.genre;
  els.resultCountry.textContent = movie.country;
  els.resultYear.textContent = movie.year;
  els.resultWatchedToggle.checked = Boolean(movie.watched);
  renderResultStars(movie.rating);
  els.resultPanel.classList.remove('hidden');
}

function renderResultStars(rating) {
  const value = Number(rating) || 0;
  els.resultStars.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.rating) <= value));
}

function setWatched(movie, watched) {
  movie.watched = Boolean(watched);
  movie.dateWatched = movie.watched ? (movie.dateWatched || todayIso()) : '';
  persistMovie(movie);
  renderAll();
}

function setRating(movie, rating) {
  movie.rating = Number(rating) || 0;
  persistMovie(movie);
  renderAll();
}

function findMovieByKey(key) {
  return movies.find(m => m.key === key);
}

function downloadUpdatedExcel() {
  if (!movies.length) {
    alert('The movie database is still loading.');
    return;
  }

  const rows = movies.map(m => ({
    'Movie title': m.title,
    'Genre': m.genre,
    'Rolled-up Genre': m.rollup,
    'Country of film': m.country,
    'Year of film made': m.year,
    'Summary': m.summary,
    'Watched': m.watched ? 'Yes' : 'No',
    'Rating': m.rating || '',
    'Date Watched': m.dateWatched || '',
    'Notes': m.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows, { header: ['Movie title','Genre','Rolled-up Genre','Country of film','Year of film made','Summary','Watched','Rating','Date Watched','Notes'] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movies');
  XLSX.writeFile(wb, 'movie_database_updated.xlsx');
}

document.querySelectorAll('input[name="pickMode"]').forEach(input => {
  input.addEventListener('change', () => {
    const mode = document.querySelector('input[name="pickMode"]:checked').value;
    els.genreControls.classList.toggle('hidden', mode !== 'genre');
  });
});

els.pickBtn.addEventListener('click', pickRandomMovie);
els.pickAgainBtn.addEventListener('click', pickRandomMovie);
els.downloadBtn.addEventListener('click', downloadUpdatedExcel);
els.resetLocalBtn.addEventListener('click', () => {
  if (!confirm('Reset watched status and ratings stored in this browser?')) return;
  localStorage.removeItem(PROGRESS_KEY);
  movies = movies.map(m => ({ ...m, watched: false, rating: 0, dateWatched: '' }));
  currentPick = null;
  els.resultPanel.classList.add('hidden');
  renderAll();
});
els.resultWatchedToggle.addEventListener('change', () => {
  if (!currentPick) return;
  setWatched(currentPick, els.resultWatchedToggle.checked);
});
els.resultStars.forEach(btn => btn.addEventListener('click', () => {
  if (!currentPick) return;
  setRating(currentPick, btn.dataset.rating);
}));
els.clearRatingBtn.addEventListener('click', () => {
  if (!currentPick) return;
  setRating(currentPick, 0);
});
els.tableBody.addEventListener('change', event => {
  if (!event.target.classList.contains('watched-toggle')) return;
  const movie = findMovieByKey(event.target.dataset.key);
  if (movie) setWatched(movie, event.target.checked);
});
els.tableBody.addEventListener('click', event => {
  if (!event.target.classList.contains('table-star')) return;
  const movie = findMovieByKey(event.target.dataset.key);
  if (movie) setRating(movie, event.target.dataset.rating);
});

loadEmbeddedWorkbook();
