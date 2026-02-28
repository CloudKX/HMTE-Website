// js/pages/event.js

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString.replace(/-/g, '/')).toLocaleDateString('id-ID', options);
}

// ── Card EVENT TERDEKAT ───────────────────────────────────────────────────────
function createMainEventHTML(event) {
  const img  = event.imgSrc ? `/${event.imgSrc.replace(/^\//, '')}` : '/img/logohmte.png';
  const date = formatDate(event.date);
  const btn  = event.registrationLink
    ? `<a href="${event.registrationLink}" target="_blank"
          class="inline-block w-full text-center px-6 py-2.5 bg-green-600 text-white
                 font-bold rounded-lg hover:bg-green-700 transition text-sm">
         🎟️ Daftar Sekarang
       </a>`
    : `<div class="w-full text-center px-6 py-2.5 bg-gray-700 text-gray-400
                  rounded-lg border border-gray-600 text-sm">Info Segera</div>`;

  return `
    <div class="flex flex-col rounded-xl overflow-hidden border-2 border-green-500
                shadow-xl shadow-green-500/10 bg-gray-900 w-full max-w-sm mx-auto">
      <div class="relative bg-black" style="aspect-ratio:9/12;overflow:hidden;">
        <div class="absolute top-0 left-0 bg-green-600 text-white text-xs font-bold
                    px-3 py-1 rounded-br-lg z-10">⭐ EVENT TERDEKAT</div>
        <img src="${img}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;"
             onerror="this.onerror=null;this.src='/img/logohmte.png';" />
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h3 class="text-lg font-bold text-white mb-1">${event.title}</h3>
        <p class="text-gray-400 text-sm mb-4 line-clamp-2">${event.description}</p>
        <div class="text-gray-300 text-sm mb-5 space-y-2 border-t border-gray-800 pt-3">
          <p><i class="far fa-calendar-alt mr-2 text-cyan-400"></i>${date}</p>
          <p><i class="fas fa-clock mr-2 text-cyan-400"></i>${event.time}</p>
          <p class="truncate">
            <i class="fas fa-map-marker-alt mr-2 text-cyan-400"></i>
            ${event.locationLink
              ? `<a href="${event.locationLink}" target="_blank" class="hover:text-cyan-300">${event.location}</a>`
              : event.location}
          </p>
        </div>
        ${btn}
      </div>
    </div>`;
}

// ── Card UPCOMING lainnya ─────────────────────────────────────────────────────
function createUpcomingCardHTML(event) {
  const img  = event.imgSrc ? `/${event.imgSrc.replace(/^\//, '')}` : '/img/logohmte.png';
  const date = formatDate(event.date);
  const borderClass = event.color === 'green' ? 'border-emerald-500'
                    : event.color === 'blue'  ? 'border-cyan-500' : 'border-yellow-500';
  const btn = event.registrationLink
    ? `<a href="${event.registrationLink}" target="_blank"
          class="mt-auto block w-full text-center px-3 py-2 bg-green-600 text-white
                 font-semibold rounded-lg hover:bg-green-700 transition text-sm">
         🎟️ Daftar Sekarang
       </a>`
    : `<p class="mt-auto text-center text-gray-500 text-xs italic py-2">Pendaftaran segera dibuka.</p>`;

  return `
    <div class="flex flex-col rounded-xl overflow-hidden border-2 ${borderClass}
                transition-all duration-500 hover:shadow-lg hover:shadow-green-500/20
                hover:scale-[1.02] bg-gray-900 w-full max-w-xs mx-auto h-full">
      <div class="relative bg-black" style="aspect-ratio:9/12;overflow:hidden;">
        <img src="${img}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;"
             class="transition-transform duration-500 hover:scale-105"
             onerror="this.onerror=null;this.src='/img/logohmte.png';" />
        <div class="absolute top-2 left-2 bg-green-600/90 text-white text-[10px] font-bold
                    px-2 py-1 rounded-full">AKAN DATANG</div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-sm font-bold text-white mb-2 line-clamp-2">${event.title}</h3>
        <p class="text-gray-400 text-xs mb-3 line-clamp-2">${event.description}</p>
        <div class="text-gray-300 text-xs mb-4 space-y-1.5">
          <p><i class="far fa-calendar-alt mr-2 text-cyan-400"></i>${date}</p>
          <p><i class="fas fa-clock mr-2 text-cyan-400"></i>${event.time}</p>
          <p class="truncate"><i class="fas fa-map-marker-alt mr-2 text-cyan-400"></i>${event.location}</p>
        </div>
        ${btn}
      </div>
    </div>`;
}

// ── Card ARSIP (selesai) — tombol "Lihat Dokumentasi" atau link Google Drive ──
function createArchiveCardHTML(event) {
  const img  = event.imgSrc ? `/${event.imgSrc.replace(/^\//, '')}` : '/img/logohmte.png';
  const date = formatDate(event.date);

  // Prioritas: driveLink > link > tidak ada
  const docUrl = event.driveLink || event.link || null;
  const docBtn = docUrl
    ? `<a href="${docUrl}" target="_blank"
          class="mt-auto block w-full text-center px-3 py-2 bg-gray-700 text-gray-300
                 font-semibold rounded-lg hover:bg-gray-600 hover:text-white transition text-sm
                 border border-gray-600">
         📁 Lihat Dokumentasi
       </a>`
    : `<p class="mt-auto text-center text-gray-600 text-xs italic py-2">Belum ada dokumentasi.</p>`;

  return `
    <div class="flex flex-col rounded-xl overflow-hidden border border-gray-700
                opacity-80 hover:opacity-100 transition-all duration-500
                hover:border-gray-500 bg-gray-900 w-full max-w-xs mx-auto h-full">
      <div class="relative bg-black" style="aspect-ratio:9/12;overflow:hidden;">
        <img src="${img}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;"
             class="grayscale hover:grayscale-0 transition-all duration-500"
             onerror="this.onerror=null;this.src='/img/logohmte.png';" />
        <div class="absolute top-2 left-2 bg-gray-700/90 text-gray-300 text-[10px] font-bold
                    px-2 py-1 rounded-full">SELESAI</div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-sm font-bold text-white mb-2 line-clamp-2">${event.title}</h3>
        <div class="text-gray-400 text-xs mb-3 space-y-1">
          <p><i class="far fa-calendar-alt mr-2 text-gray-500"></i>${date}</p>
          <p class="truncate"><i class="fas fa-map-marker-alt mr-2 text-gray-500"></i>${event.location}</p>
        </div>
        ${docBtn}
      </div>
    </div>`;
}

// ── RENDER UTAMA ──────────────────────────────────────────────────────────────
async function loadEventListPage() {
  const mainWrap    = document.getElementById('current-event-register');
  const upcomingWrap = document.getElementById('upcoming-list');
  const archiveWrap = document.getElementById('div-tiga-events');
  if (!mainWrap || !archiveWrap) return;

  if (!window._eventsCache) {
    if (typeof window.loadEventsData === 'function') await window.loadEventsData();
    else { console.error('[event.js] loadEventsData tidak tersedia.'); return; }
  }

  const all = window._eventsCache || [];
  const now = new Date(); now.setHours(0, 0, 0, 0);

  const upcoming  = all.filter(e => new Date(e.date).setHours(0,0,0,0) >= now.getTime())
                       .sort((a, b) => new Date(a.date) - new Date(b.date));
  const completed = all.filter(e => new Date(e.date).setHours(0,0,0,0) <  now.getTime())
                       .sort((a, b) => new Date(b.date) - new Date(a.date));

  // ── Event Mendatang ─────────────────────────────────────────────────────────
  if (!upcoming.length) {
    mainWrap.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-400 mb-2">Saat ini tidak ada event yang akan datang.</p>
        <p class="text-gray-600 text-sm">Pantau terus halaman ini untuk update berikutnya!</p>
      </div>`;
    if (upcomingWrap) upcomingWrap.innerHTML = '';
  } else {
    mainWrap.innerHTML = createMainEventHTML(upcoming[0]);
    if (upcomingWrap) {
      const others = upcoming.slice(1);
      upcomingWrap.innerHTML = others.length
        ? others.map(createUpcomingCardHTML).join('')
        : '';
    }
  }

  // ── Arsip Kegiatan ──────────────────────────────────────────────────────────
  const limit      = 8;
  const displayed  = completed.slice(0, limit);

  archiveWrap.innerHTML = `
    <div class="border-t border-gray-800 pt-12 mt-4">
      <div class="text-center mb-8">
        <span class="inline-flex items-center gap-3 text-xs tracking-widest uppercase
                     text-gray-500 font-bold mb-3">
          <span class="block w-8 h-px bg-gray-700"></span>Dokumentasi<span class="block w-8 h-px bg-gray-700"></span>
        </span>
        <h2 class="text-2xl md:text-3xl font-bold text-white">Arsip Kegiatan</h2>
        <p class="text-gray-500 text-sm mt-2">
          Dokumentasi kegiatan HMTE yang telah terlaksana.
          ${'' /* Link Google Drive global jika ada */}
        </p>
      </div>
      ${!displayed.length
        ? `<p class="text-gray-600 italic text-center">Belum ada arsip kegiatan.</p>`
        : `<div id="archive-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
             ${displayed.map(createArchiveCardHTML).join('')}
           </div>
           ${completed.length > limit
             ? `<div class="text-center mt-8">
                  <button onclick="loadMoreArchive()"
                          class="px-5 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm
                                 hover:bg-gray-700 hover:text-white transition border border-gray-700">
                    Lihat Lebih Banyak
                  </button>
                </div>`
             : ''}`}
    </div>`;

  window._remainingArchives = completed.slice(limit);
}

window.loadMoreArchive = function () {
  if (!window._remainingArchives?.length) return;
  const grid = document.getElementById('archive-grid');
  if (grid) grid.insertAdjacentHTML('beforeend', window._remainingArchives.map(createArchiveCardHTML).join(''));
  window._remainingArchives = [];
  document.querySelector('[onclick="loadMoreArchive()"]')?.remove();
};

window.loadEventListPage = loadEventListPage;

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('/page/event/')) setTimeout(loadEventListPage, 150);
});
