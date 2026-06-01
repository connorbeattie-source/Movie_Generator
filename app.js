let movies = [];
let currentPick = null;
let workbook = null;
let worksheetName = 'Movies';

const STORAGE_KEY = 'balancedMovieCanonWatched';
const els = {
  fileInput: document.getElementById('fileInput'),
  loadStatus: document.getElementById('loadStatus'),
  totalCount: document.getElementById('totalCount'),
  watchedCount: document.getElementById('watchedCount'),
  unwatchedCount: document.getElementById('unwatchedCount'),
  genreControls: document.getElementById('genreControls'),
  genreSelect: document.getElementById('genreSelect'),
  pickBtn: document.getElementById('pickBtn'),
  resultPanel: document.getElementById('resultPanel'),
  resultTitle: document.getElementById('resultTitle'),
  resultGenre: document.getElementById('resultGenre'),
  resultRollup: document.getElementById('resultRollup'),
  resultCountry: document.getElementById('resultCountry'),
  resultYear: document.getElementById('resultYear'),
  markWatchedBtn: document.getElementById('markWatchedBtn'),
  pickAgainBtn: document.getElementById('pickAgainBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  resetLocalBtn: document.getElementById('resetLocalBtn'),
  tableBody: document.querySelector('#movieTable tbody')
};

function normaliseHeader(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
}

function loadWatchedStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveWatchedStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function isYes(value) {
  return String(value || '').trim().toLowerCase() === 'yes' || value === true;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function hydrateMovies(rows) {
  const watchedStore = loadWatchedStore();
  return rows.map((row, index) => {
    const title = row['movietitle'] || row['title'] || '';
    const watchedFromExcel = isYes(row['watched']);
    const watchedFromLocal = Boolean(watchedStore[title]);
    return {
      id: `${title}-${row['yearoffilmmade'] || row['year'] || index}`,
      title,
      genre: row['genre'] || '',
      rollup: row['rolledupgenre'] || row['rolledgenre'] || row['category'] || row['genre'] || '',
      country: row['countryoffilm'] || row['country'] || '',
      year: row['yearoffilmmade'] || row['year'] || '',
      watched: watchedFromExcel || watchedFromLocal,
      dateWatched: row['datewatched'] || watchedStore[title]?.dateWatched || '',
      notes: row['notes'] || ''
    };
  }).filter(movie => movie.title);
}

function parseWorkbook(arrayBuffer) {
  workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  worksheetName = workbook.SheetNames.includes('Movies') ? 'Movies' : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];
  const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!raw.length) throw new Error('The selected Excel file is empty.');

  const headers = raw[0].map(normaliseHeader);
  const rows = raw.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header] = row[index]);
    return obj;
  });

  movies = hydrateMovies(rows);
  if (!movies.length) throw new Error('No movies found. Check that the file has a Movie title column.');
  renderAll();
  els.loadStatus.textContent = `Loaded ${movies.length} movies from ${worksheetName}.`;
}

function uniqueGenres() {
  return [...new Set(movies.map(m => m.rollup).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function renderStats() {
  const watched = movies.filter(m => m.watched).length;
  els.totalCount.textContent = movies.length;
  els.watchedCount.textContent = watched;
  els.unwatchedCount.textContent = movies.length - watched;
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

function renderTable() {
  els.tableBody.innerHTML = '';
  movies.forEach(movie => {
    const tr = document.createElement('tr');
    if (movie.watched) tr.classList.add('watched');
    tr.innerHTML = `
      <td>${escapeHtml(movie.title)}</td>
      <td>${escapeHtml(movie.rollup)}</td>
      <td>${escapeHtml(movie.year)}</td>
      <td><span class="badge ${movie.watched ? 'yes' : ''}">${movie.watched ? 'Yes' : 'No'}</span></td>
    `;
    els.tableBody.appendChild(tr);
  });
}

function renderAll() {
  renderStats();
  renderGenres();
  renderTable();
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
    alert('Load the Excel database first.');
    return;
  }
  const pool = getCandidatePool();
  if (!pool.length) {
    alert('No unwatched movies available for this selection.');
    return;
  }
  currentPick = pool[Math.floor(Math.random() * pool.length)];
  renderResult(currentPick);
}

function renderResult(movie) {
  els.resultTitle.textContent = movie.title;
  els.resultGenre.textContent = movie.genre;
  els.resultRollup.textContent = movie.rollup;
  els.resultCountry.textContent = movie.country;
  els.resultYear.textContent = movie.year;
  els.resultPanel.classList.remove('hidden');
  els.markWatchedBtn.disabled = movie.watched;
}

function markCurrentWatched() {
  if (!currentPick) return;
  currentPick.watched = true;
  currentPick.dateWatched = todayIso();

  const store = loadWatchedStore();
  store[currentPick.title] = { watched: true, dateWatched: currentPick.dateWatched };
  saveWatchedStore(store);

  renderAll();
  renderResult(currentPick);
}

function downloadUpdatedExcel() {
  if (!movies.length) {
    alert('Load the Excel database first.');
    return;
  }

  const rows = movies.map(m => ({
    'Movie title': m.title,
    'Genre': m.genre,
    'Rolled-up Genre': m.rollup,
    'Country of film': m.country,
    'Year of film made': m.year,
    'Watched': m.watched ? 'Yes' : 'No',
    'Date Watched': m.dateWatched || '',
    'Notes': m.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows, { header: ['Movie title','Genre','Rolled-up Genre','Country of film','Year of film made','Watched','Date Watched','Notes'] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movies');
  XLSX.writeFile(wb, 'movie_database_updated.xlsx');
}

els.fileInput.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try { parseWorkbook(e.target.result); }
    catch (error) { els.loadStatus.textContent = `Error: ${error.message}`; }
  };
  reader.readAsArrayBuffer(file);
});

document.querySelectorAll('input[name="pickMode"]').forEach(input => {
  input.addEventListener('change', () => {
    const mode = document.querySelector('input[name="pickMode"]:checked').value;
    els.genreControls.classList.toggle('hidden', mode !== 'genre');
  });
});

els.pickBtn.addEventListener('click', pickRandomMovie);
els.pickAgainBtn.addEventListener('click', pickRandomMovie);
els.markWatchedBtn.addEventListener('click', markCurrentWatched);
els.downloadBtn.addEventListener('click', downloadUpdatedExcel);
els.resetLocalBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  movies = movies.map(m => ({ ...m, watched: false, dateWatched: '' }));
  currentPick = null;
  els.resultPanel.classList.add('hidden');
  renderAll();
});
