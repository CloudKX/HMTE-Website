// js/emagz.js
// =============================================================================
//  Versi CMS: data di-fetch dari js/data/json/emagz.json
// =============================================================================

const EMAGZ_JSON_PATH = "/js/data/json/emagz.json";

// ── Fetch data dari JSON, simpan ke cache module-level ───────────────────────
let _emagzCache = null;

async function getEmagzData() {
  if (_emagzCache) return _emagzCache;
  try {
    const res = await fetch(EMAGZ_JSON_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    _emagzCache = json.items || [];
    return _emagzCache;
  } catch (e) {
    console.error("[emagz.js] Gagal fetch data:", e.message);
    return [];
  }
}

// =============================================================================
//  CARD RENDERING HOMEPAGE — Dipertahankan agar Beranda tidak rusak
// =============================================================================

function createEmagzCardHTML(edition) {
  const readerLink = `/page/emagz/emagz-reader.html?id=${edition.id}`;
  const imagePath  = edition.coverSrc
    ? (edition.coverSrc.startsWith("http") ? edition.coverSrc : `/${edition.coverSrc.replace(/^\//, "")}`)
    : "/img/logohmte.png";

  return `
    <div class="group relative flex flex-col w-full max-w-[280px] mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 hover:border-green-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-green-500/30">
      <div class="relative w-full aspect-[3/4] overflow-hidden">
        <img 
          src="${imagePath}" 
          alt="${edition.title}" 
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onerror="this.onerror=null;this.src='/img/logohmte.png';" 
        />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
        <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-green-400 text-[10px] font-bold px-3 py-1 rounded-full border border-green-500/30">
          Edisi #${edition.id}
        </div>
      </div>
      <div class="p-5 flex flex-col flex-1 relative">
        <h3 class="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition-colors">
          ${edition.title}
        </h3>
        <p class="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          ${edition.description}
        </p>
        <a href="${readerLink}" class="mt-auto w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-800 border border-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-green-600 hover:border-green-500 hover:text-white transition-all group-hover:shadow-lg">
          Baca Sekarang <i class="fas fa-arrow-right ml-2 text-xs"></i>
        </a>
      </div>
    </div>
  `;
}

// =============================================================================
//  HOMEPAGE SECTION
// =============================================================================

async function renderEmagzSection() {
  const container = document.getElementById("emagz-cards-container");
  const moreLink  = document.getElementById("emagz-more-link");
  if (!container) return;

  const emagzData    = await getEmagzData();
  const latestEditions = emagzData.slice(0, 3);

  if (latestEditions.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full">Belum ada edisi E-Magazine yang tersedia.</p>';
    if (moreLink) moreLink.classList.add("hidden");
    return;
  }

  container.innerHTML = latestEditions.map(createEmagzCardHTML).join("");

  if (moreLink && emagzData.length > 3) {
    const linkEl = moreLink.querySelector("a");
    if (linkEl) linkEl.href = "/page/emagz/emagz.html";
    moreLink.classList.remove("hidden");
  }
}

async function checkAndRenderEmagzSection() {
  const container = document.getElementById("emagz-cards-container");
  if (container) {
    await renderEmagzSection();
  } else {
    setTimeout(checkAndRenderEmagzSection, 50);
  }
}

// =============================================================================
//  HALAMAN ARSIP (emagz.html) — DIUBAH AGAR MENDUKUNG ANIMASI CSS MURNI
// =============================================================================

async function loadEmagzArchivePage() {
  const container = document.getElementById("emagz-archive-container");
  if (!container) return;

  const emagzData = await getEmagzData();

  if (emagzData.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full">Belum ada edisi E-Magazine yang tersedia dalam arsip.</p>';
    return;
  }

  // DIHAPUS: container.className = "grid grid-cols-1..." (Agar tidak merusak CSS kita)

  // Mencetak format HTML bersih tanpa kelas bentrok Tailwind
  container.innerHTML = emagzData
    .slice()
    .sort((a, b) => b.id - a.id)
    .map((edition) => {
      const readerLink = `/page/emagz/emagz-reader.html?id=${edition.id}`;
      const imagePath  = edition.coverSrc
        ? (edition.coverSrc.startsWith("http") ? edition.coverSrc : `/${edition.coverSrc.replace(/^\//, "")}`)
        : "/img/logohmte.png";

      return `
        <a href="${readerLink}">
          <div style="position:relative; width:100%; aspect-ratio:3/4; overflow:hidden;">
            <img src="${imagePath}" alt="${edition.title}" onerror="this.onerror=null;this.src='/img/logohmte.png';" />
            <div style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); color:#4ade80; font-size:10px; font-weight:bold; padding:4px 10px; border-radius:20px; border:1px solid rgba(74,222,128,0.3); backdrop-filter:blur(4px);">
              Edisi #${edition.id}
            </div>
          </div>
          <div class="p-5">
            <h3>${edition.title}</h3>
            <p class="text-gray-400">${edition.description}</p>
            <button>
              Baca Sekarang <i class="fas fa-arrow-right ml-2 text-xs"></i>
            </button>
          </div>
        </a>
      `;
    })
    .join("");

  console.log("✅ Arsip E-Magz berhasil di-render dengan format HTML bersih!");
}

// =============================================================================
//  READER (EMBED PDF)
// =============================================================================

async function loadEmagzReader() {
  const readerContainer = document.getElementById("emagz-reader-container");
  if (!readerContainer) return;

  const editionId = parseInt(new URLSearchParams(window.location.search).get("id"));
  const emagzData = await getEmagzData();
  const edition   = emagzData.find((e) => e.id === editionId);

  if (!edition) {
    readerContainer.innerHTML = '<p class="text-center text-red-400">Error: Edisi Emagz tidak ditemukan.</p>';
    return;
  }

  const pageTitle = document.getElementById("page-title");
  if (pageTitle) pageTitle.textContent = `Baca Emagz HMTE - Edisi ${editionId}: ${edition.title}`;

  const mainTitle = document.querySelector("main h1");
  if (mainTitle) mainTitle.textContent = `E-Magazine HMTE Edisi ${editionId}`;
  const subTitle = document.querySelector("main p.text-center");
  if (subTitle) subTitle.textContent = `Membaca: ${edition.title}`;

  if (!edition.pdfLink) {
    readerContainer.innerHTML = '<p class="text-center text-red-400">Error: Tautan PDF untuk edisi ini tidak ditemukan.</p>';
    return;
  }

  const coverPath = edition.coverSrc
    ? (edition.coverSrc.startsWith("http") ? edition.coverSrc : `/${edition.coverSrc.replace(/^\//, "")}`)
    : "/img/logohmte.png";

  readerContainer.innerHTML = `
    <div class="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center mb-10 border-l-4 border-green-500">
      <div class="w-32 h-40 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden mr-6 mb-4 sm:mb-0 border border-gray-700 shadow-md">
        <img src="${coverPath}" alt="Cover ${edition.title}" class="w-full h-full object-cover"/>
      </div>
      <div class="flex-1">
        <h2 class="text-2xl font-extrabold text-green-400 mb-1">${edition.title}</h2>
        <p class="text-gray-400 mb-4">${edition.description}</p>
        <a href="${edition.pdfLink}" target="_blank"
           class="px-5 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition duration-200 mt-3 inline-block">
          Lihat di Tab Baru <i class="fas fa-external-link-alt ml-2"></i>
        </a>
      </div>
    </div>

    <div class="viewer-frame shadow-2xl border-2 border-gray-700 rounded-xl overflow-hidden bg-white">
      <div class="viewer-header p-3 bg-gray-700 text-sm text-center font-medium text-gray-300">
        E-MAGZ READER — Silakan scroll di dalam bingkai untuk membaca.
      </div>
      <iframe src="${edition.pdfLink}" width="100%" height="800px" style="border:none;background-color:white;"></iframe>
    </div>
  `;
}

// =============================================================================
//  EXPOSE ke global (dipanggil oleh loader.js)
// =============================================================================
window.checkAndRenderEmagzSection = checkAndRenderEmagzSection;
window.loadEmagzArchivePage       = loadEmagzArchivePage;
window.loadEmagzReader            = loadEmagzReader;