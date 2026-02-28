// js/data/news-generator.js
// Versi CMS: fetch dari /js/data/json/news.json, bukan variabel global newsData.
// Semua logika render TIDAK BERUBAH.

const NEWS_JSON_PATH = '/js/data/json/news.json';
const newsPerPage    = 8;

// ── Cache agar tidak fetch ulang di halaman yang sama ────────────────────────
let _newsCache = null;

async function getNewsData() {
  if (_newsCache) return _newsCache;
  try {
    const res = await fetch(NEWS_JSON_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    _newsCache = json.items || [];
    return _newsCache;
  } catch (e) {
    console.error('[news-generator.js] Gagal fetch:', e.message);
    return [];
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString.replace(/-/g, '/')).toLocaleDateString('id-ID', options);
}

// =============================================================================
//  HOMEPAGE — 3 berita terbaru
// =============================================================================
async function generateLatestNews() {
  const newsContainer = document.getElementById('latest-news-container');
  if (!newsContainer) return;

  const newsData = await getNewsData();
  if (!newsData.length) return;

  const latest = newsData.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  newsContainer.innerHTML = latest.map((news, idx) => {
    const detailLink = `page/news/news-detail.html?id=${news.id}`;
    return `
      <a href="${detailLink}" class="news-card">
        <div class="news-card-img">
          <span class="news-card-num">0${idx + 1}</span>
          <img src="${news.imgSrc}" alt="${news.title}" loading="lazy">
        </div>
        <div class="news-card-body">
          <div class="news-card-meta">
            <span class="news-card-date">${news.date}</span>
            <span class="news-card-dot"></span>
            <span class="news-card-tag">${news.category}</span>
          </div>
          <h3 class="news-card-title">${news.title}</h3>
          <p class="news-card-desc">${news.preview}</p>
          <span class="news-card-read">Baca selengkapnya <i class="fas fa-arrow-right"></i></span>
        </div>
      </a>
    `;
  }).join('');

  // Sesuaikan kolom grid otomatis
  const count = latest.length;
  if (count === 1) {
    newsContainer.style.gridTemplateColumns = 'minmax(0, 420px)';
    newsContainer.style.justifyContent = 'center';
  } else if (count === 2) {
    newsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    newsContainer.style.maxWidth = '740px';
    newsContainer.style.margin = '0 auto';
  } else {
    newsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    newsContainer.style.maxWidth = '';
    newsContainer.style.margin = '';
  }

  if (typeof window.initNewsAnimations === 'function') {
    window.initNewsAnimations();
  }
}

// =============================================================================
//  HALAMAN NEWS — pagination
// =============================================================================
function renderPaginationControls(container, totalPages, currentPage) {
  window.goToNewsPage = (page) => renderAllPaginatedNews(window._sortedNewsData, page);

  let html = `<button
    class="px-3 py-1 bg-gray-700 text-white rounded hover:bg-green-600 disabled:opacity-50 transition"
    onclick="window.goToNewsPage(${currentPage - 1})"
    ${currentPage === 1 ? 'disabled' : ''}
  >Prev</button>`;

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage   = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1);

  for (let i = startPage; i <= endPage; i++) {
    html += `<button
      class="px-3 py-1 rounded transition ${i === currentPage ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
      onclick="window.goToNewsPage(${i})"
    >${i}</button>`;
  }

  html += `<button
    class="px-3 py-1 bg-gray-700 text-white rounded hover:bg-green-600 disabled:opacity-50 transition"
    onclick="window.goToNewsPage(${currentPage + 1})"
    ${currentPage === totalPages ? 'disabled' : ''}
  >Next</button>`;

  container.innerHTML = html;
}

function renderAllPaginatedNews(news, page = 1) {
  const container           = document.getElementById('all-news-container');
  const paginationContainer = document.getElementById('news-pagination-container');
  if (!container || !paginationContainer) return;

  const totalPages    = Math.ceil(news.length / newsPerPage);
  const start         = (page - 1) * newsPerPage;
  const paginatedNews = news.slice(start, start + newsPerPage);

  if (!paginatedNews.length) {
    container.innerHTML           = '<p class="text-gray-400 col-span-full text-center">Tidak ada berita yang ditemukan.</p>';
    paginationContainer.innerHTML = '';
    return;
  }

  container.innerHTML = paginatedNews.map((item) => {
    const detailLink = `page/news/news-detail.html?id=${item.id}`;
    return `
      <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700
                  hover:border-green-500 transition duration-300 cursor-pointer"
           onclick="window.location.href='${detailLink}'">
        <img src="../../${item.imgSrc}" alt="${item.title}"
             class="w-full h-32 object-cover"
             onerror="this.onerror=null;this.src='../../img/logohmte.png';">
        <div class="p-4">
          <p class="text-xs font-medium text-green-400 mb-1">${item.category}</p>
          <h3 class="text-lg font-bold text-white mb-2 leading-tight">${item.title}</h3>
          <p class="text-gray-400 text-sm mb-2">${item.preview.substring(0, 100)}...</p>
          <p class="text-gray-400 text-xs">${formatDate(item.date)}</p>
        </div>
      </div>
    `;
  }).join('');

  renderPaginationControls(paginationContainer, totalPages, page);
}

async function generateNewsPage() {
  const container = document.getElementById('all-news-container');
  const newsData  = await getNewsData();

  if (!newsData.length) {
    if (container) container.innerHTML = '<p class="text-center text-gray-400">Data berita tidak ditemukan!</p>';
    return;
  }

  window._sortedNewsData = newsData.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  renderAllPaginatedNews(window._sortedNewsData, 1);
}

// ── Expose ke global (dipanggil loader.js) ────────────────────────────────────
window.generateLatestNews = generateLatestNews;
window.initNewsPage       = generateNewsPage;
