// js/emagz.js

/**
 * Data Edisi Emagz
 */
const emagzData = [
  {
    id: 1,
    title: "E-Magz Vol.1",
    description: "Kumpulan konten E-MAGZ EDISI 8 HMTE UNSOED 2025",
    coverSrc: "/img/emagz/Vol1.jpg",
    pdfLink: "/img/emagz/1.pdf",
  },
  {
    id: 2,
    title: "E-Magz Vol.2",
    description: "E-Magz HMTE UNSOED Vol. 2: Rekomendasi Channel Teknik Elektro, Series 2025, dan Hiburan",
    coverSrc: "/img/emagz/Vol2.jpg",
    pdfLink: "/img/emagz/2.pdf",
  },
  {
    id: 3,
    title: "E-Magz Vol.3",
    description: "Panduan E-Magz HMTE UNSOED 2025: Kiat Meningkatkan Skill, Manfaat Olahraga, dan Rekomendasi Musik untuk Mahasiswa",
    coverSrc: "/img/emagz/Vol3.jpg",
    pdfLink: "/img/emagz/3.pdf",
  },
  {
    id: 4,
    title: "E-Magz Vol.4",
    description: "E-MAGZ HMTE UNSOED Edisi 8: Rekomendasi Alat Elektronik dan Tips Hidup Hemat Anak Kost",
    coverSrc: "/img/emagz/Vol4.jpg",
    pdfLink: "/img/emagz/4.pdf",
  },
];

// ─────────────────────────────────────────────────────────────
// CORE: createEmagzCardHTML
// Mencetak markup bersih menggunakan class CSS custom (.emagz-card*)
// Parameter `index` dipakai untuk stagger delay animasi.
// ─────────────────────────────────────────────────────────────
function createEmagzCardHTML(edition, index = 0) {
  const readerLink = `/page/emagz/emagz-reader.html?id=${edition.id}`;
  const imageSrc   = edition.coverSrc.startsWith('http')
    ? edition.coverSrc
    : '/' + edition.coverSrc.replace(/^\//, '');

  const delayMs = index * 90; // 90ms per card

  return `
    <a href="${readerLink}" class="emagz-card" style="transition-delay:${delayMs}ms" data-index="${index}">
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
          <span class="emagz-card-date">2025</span>
        </div>
        <h3 class="emagz-card-title">${edition.title}</h3>
        <p class="emagz-card-desc">${edition.description}</p>
        <span class="emagz-card-read">Baca Sekarang <i class="fas fa-arrow-right"></i></span>
      </div>
    </a>
  `;
}

// ─────────────────────────────────────────────────────────────
// IntersectionObserver: trigger animasi .emagz-card → .is-visible
// ─────────────────────────────────────────────────────────────
function observeEmagzCards(container) {
  if (!container || typeof IntersectionObserver === 'undefined') {
    // Fallback: langsung tampilkan semua
    container && container.querySelectorAll('.emagz-card').forEach(function(c) {
      c.classList.add('is-visible');
    });
    return;
  }

  var obs = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  container.querySelectorAll('.emagz-card').forEach(function(card) {
    obs.observe(card);
  });
}

// ─────────────────────────────────────────────────────────────
// HOMEPAGE SECTION: render 3 kartu terbaru
// ─────────────────────────────────────────────────────────────
function renderEmagzSection() {
  var container = document.getElementById('emagz-cards-container');
  var moreLink  = document.getElementById('emagz-more-link');
  if (!container) return;

  var latest = emagzData.slice(0, 3);

  if (latest.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#9ca3af;">Belum ada edisi E-Magazine.</p>';
    if (moreLink) moreLink.classList.add('hidden');
    return;
  }

  container.innerHTML = latest.map(function(ed, i) {
    return createEmagzCardHTML(ed, i);
  }).join('');

  // Trigger animasi
  observeEmagzCards(container);

  // Callback ke sections/emagz.html jika ada
  if (typeof window.initEmagzAnimations === 'function') {
    window.initEmagzAnimations();
  }

  // Tampilkan tombol "Baca Lainnya"
  if (moreLink && emagzData.length > 3) {
    var link = moreLink.querySelector('a');
    if (link) link.href = '/page/emagz/emagz.html';
    moreLink.classList.remove('hidden');
  }
}

function checkAndRenderEmagzSection() {
  var container = document.getElementById('emagz-cards-container');
  if (container) {
    renderEmagzSection();
  } else {
    setTimeout(checkAndRenderEmagzSection, 50);
  }
}

// ─────────────────────────────────────────────────────────────
// ARCHIVE PAGE: render semua edisi
// ─────────────────────────────────────────────────────────────
function loadEmagzArchivePage() {
  var container = document.getElementById('emagz-archive-container');
  if (!container) return;

  if (emagzData.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#9ca3af;grid-column:1/-1;">Belum ada edisi.</p>';
    return;
  }

  var sorted = emagzData.slice().sort(function(a, b) { return b.id - a.id; });

  container.innerHTML = sorted.map(function(ed, i) {
    return createEmagzCardHTML(ed, i);
  }).join('');

  observeEmagzCards(container);
  console.log('✅ Arsip E-Magz berhasil di-render!');
}

// ─────────────────────────────────────────────────────────────
// READER PAGE: embed PDF
// ─────────────────────────────────────────────────────────────
function loadEmagzReader() {
  var readerContainer = document.getElementById('emagz-reader-container');
  if (!readerContainer) return;

  var urlParams  = new URLSearchParams(window.location.search);
  var editionId  = parseInt(urlParams.get('id'));
  var edition    = emagzData.find(function(e) { return e.id === editionId; });

  if (!edition) {
    readerContainer.innerHTML = '<p style="text-align:center;color:#f87171;">Error: Edisi tidak ditemukan.</p>';
    return;
  }

  var pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = 'Baca Emagz HMTE - Edisi ' + editionId + ': ' + edition.title;

  var mainTitle = document.querySelector('main h1');
  if (mainTitle) mainTitle.textContent = 'E-Magazine HMTE Edisi ' + editionId;

  var subTitle = document.querySelector('main p.text-center');
  if (subTitle) subTitle.textContent = 'Membaca: ' + edition.title;

  var imgSrc = edition.coverSrc.startsWith('http')
    ? edition.coverSrc
    : '/' + edition.coverSrc.replace(/^\//, '');

  if (!edition.pdfLink) {
    readerContainer.innerHTML = '<p style="text-align:center;color:#f87171;">Error: Tautan PDF tidak ditemukan.</p>';
    return;
  }

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
// Expose ke global
// ─────────────────────────────────────────────────────────────
window.renderEmagzSection         = renderEmagzSection;
window.checkAndRenderEmagzSection = checkAndRenderEmagzSection;
window.loadEmagzArchivePage       = loadEmagzArchivePage;
window.loadEmagzReader            = loadEmagzReader;