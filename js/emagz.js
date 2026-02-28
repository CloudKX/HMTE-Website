// js/emagz.js

// 1. Variabel global untuk menyimpan data dari CMS
window.emagzData = [];
let isDataFetched = false;

// 2. Fungsi asinkron untuk mengambil data JSON
async function fetchEmagzData() {
  if (isDataFetched) return window.emagzData;
  try {
    const response = await fetch('/js/data/json/emagz.json?t=' + new Date().getTime());
    if (response.ok) {
      const data = await response.json();
      window.emagzData = data.items || [];
    }
  } catch (error) {
    console.error("Error fetching E-Magz data:", error);
  }
  isDataFetched = true;
  return window.emagzData;
}

// ─────────────────────────────────────────────────────────────
// CORE: createEmagzCardHTML
// PERBAIKAN: Inline style transition-delay DIHAPUS. Delay diatur via Observer.
// ─────────────────────────────────────────────────────────────
function createEmagzCardHTML(edition, index = 0) {
  const readerLink = `/page/emagz/emagz-reader.html?id=${edition.id}`;
  const src = edition.coverSrc || '/img/logohmte.png';
  const imageSrc = src.startsWith('http') ? src : '/' + src.replace(/^\//, '');

  return `
    <a href="${readerLink}" class="emagz-card" data-index="${index}">
      <div class="emagz-card-cover">
        <span class="emagz-card-edition-badge">Vol. ${edition.id}</span>
        <img
          src="${imageSrc}"
          alt="${edition.title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='/img/logohmte.png';"
        />
      </div>
      <div class="emagz-card-body">
        <div class="emagz-card-meta">
          <span class="emagz-card-tag">E-Magz</span>
          <span class="emagz-card-dot"></span>
          <span class="emagz-card-date">${edition.date ? edition.date.substring(0,4) : '2025'}</span>
        </div>
        <h3 class="emagz-card-title">${edition.title}</h3>
        <p class="emagz-card-desc">${edition.description}</p>
        <span class="emagz-card-read">Baca Sekarang <i class="fas fa-arrow-right"></i></span>
      </div>
    </a>
  `;
}

// ─────────────────────────────────────────────────────────────
// PERBAIKAN ANIMASI OBSERVER (STAGGER EFFECT)
// ─────────────────────────────────────────────────────────────
function observeEmagzCards(container) {
  if (!container || typeof IntersectionObserver === 'undefined') return;

  // Observer untuk Header & Footer
  const baseTargets = document.querySelectorAll('.emagz-header, .emagz-footer');
  const baseObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        baseObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  baseTargets.forEach(el => baseObs.observe(el));

  // Observer khusus untuk Kartu (dengan delay berurutan)
  const cards = container.querySelectorAll('.emagz-card');
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Tembak delay dinamis berdasarkan urutan elemen masuk layar
        entry.target.style.transitionDelay = `${idx * 0.1}s`;
        
        // Timeout kecil agar browser me-render CSS delay-nya dulu
        setTimeout(() => {
           entry.target.classList.add('is-visible');
        }, 10);
        
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 20px -20px 20px' });

  cards.forEach(card => cardObs.observe(card));
}

// ─────────────────────────────────────────────────────────────
// HOMEPAGE SECTION
// ─────────────────────────────────────────────────────────────
async function renderEmagzSection() {
  await fetchEmagzData();
  
  var container = document.getElementById('emagz-cards-container');
  var moreLink  = document.getElementById('emagz-more-link');
  if (!container) return;

  var latest = window.emagzData.slice(0, 3);

  if (latest.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#9ca3af;width:100%;">Belum ada edisi E-Magazine.</p>';
    if (moreLink) moreLink.classList.add('hidden');
    return;
  }

  container.innerHTML = latest.map((ed, i) => createEmagzCardHTML(ed, i)).join('');

  // Jalankan Observer Animasi baru
  observeEmagzCards(container);

  if (moreLink && window.emagzData.length > 3) {
    var link = moreLink.querySelector('a');
    if (link) link.href = '/page/emagz/emagz.html';
    moreLink.classList.remove('hidden');
  }
}

function checkAndRenderEmagzSection() {
  var container = document.getElementById('emagz-cards-container');
  if (container) renderEmagzSection();
  else setTimeout(checkAndRenderEmagzSection, 50);
}

// ─────────────────────────────────────────────────────────────
// ARCHIVE PAGE
// ─────────────────────────────────────────────────────────────
async function loadEmagzArchivePage() {
  await fetchEmagzData();
  var container = document.getElementById('emagz-archive-container');
  if (!container) return;

  if (window.emagzData.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#9ca3af;grid-column:1/-1;">Belum ada edisi.</p>';
    return;
  }

  var sorted = window.emagzData.slice().sort((a, b) => b.id - a.id);
  container.innerHTML = sorted.map((ed, i) => createEmagzCardHTML(ed, i)).join('');

  observeEmagzCards(container);
  document.dispatchEvent(new Event('component:loaded'));
}

// ─────────────────────────────────────────────────────────────
// READER PAGE
// ─────────────────────────────────────────────────────────────
async function loadEmagzReader() {
  await fetchEmagzData();
  var readerContainer = document.getElementById('emagz-reader-container');
  if (!readerContainer) return;

  var urlParams  = new URLSearchParams(window.location.search);
  var editionId  = parseInt(urlParams.get('id'));
  var edition    = window.emagzData.find(e => e.id === editionId);

  if (!edition) {
    readerContainer.innerHTML = '<p style="text-align:center;color:#f87171;">Error: Edisi tidak ditemukan.</p>';
    return;
  }

  // Set Title
  document.getElementById('page-title').textContent = 'Baca Emagz HMTE - Edisi ' + editionId + ': ' + edition.title;
  document.querySelector('main h1').textContent = 'E-Magazine HMTE Edisi ' + editionId;
  document.querySelector('main p.text-center').textContent = 'Membaca: ' + edition.title;

  var src = edition.coverSrc || '/img/logohmte.png';
  var imgSrc = src.startsWith('http') ? src : '/' + src.replace(/^\//, '');

  readerContainer.innerHTML = `
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(15,188,109,0.15);border-radius:16px;padding:24px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;margin-bottom:32px;">
      <div style="width:120px;height:160px;flex-shrink:0;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <img src="${imgSrc}" alt="Cover ${edition.title}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="flex:1;min-width:200px;">
        <h2 style="font-size:1.3rem;font-weight:800;color:#0fbc6d;margin:0 0 8px;">${edition.title}</h2>
        <p style="color:#9ca3af;font-size:0.85rem;margin:0 0 16px;line-height:1.6;">${edition.description}</p>
        <a href="${edition.pdfLink}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:8px 20px;background:#dc2626;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;font-size:0.85rem;transition:background 0.2s;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
          Lihat di Tab Baru <i class="fas fa-external-link-alt"></i>
        </a>
      </div>
    </div>
    <div style="border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,0.08);">
      <div style="padding:10px 16px;background:rgba(255,255,255,0.05);font-size:0.8rem;color:#9ca3af;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
        E-MAGZ READER — Scroll di dalam bingkai untuk membaca
      </div>
      <iframe src="${edition.pdfLink}" width="100%" height="800px" style="border:none;background:#fff;display:block;"></iframe>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
// EXPOSE & AUTO INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('emagz-archive-container')) loadEmagzArchivePage();
  if (document.getElementById('emagz-reader-container')) loadEmagzReader();
});

window.renderEmagzSection         = renderEmagzSection;
window.checkAndRenderEmagzSection = checkAndRenderEmagzSection;
window.loadEmagzArchivePage       = loadEmagzArchivePage;
window.loadEmagzReader            = loadEmagzReader;