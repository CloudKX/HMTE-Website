// js/pages/home.js
// Versi CMS: baca _eventsCache (dari calendar.js) + project data dari JSON.
// ─────────────────────────────────────────────────────────────
//  PERUBAHAN UTAMA:
//  1. renderHomeProker() pakai createProkerCardHTML() dari project.js
//     → kartu identik 100% dengan halaman arsip
//  2. Setelah render selesai, panggil initProkerAnimations()
//     agar IntersectionObserver aktif
//  3. Retry bersih jika project.js belum siap
// ─────────────────────────────────────────────────────────────

var _today = new Date();
_today.setHours(0, 0, 0, 0);

function formatDate(dateString) {
  return new Date(dateString.replace(/-/g, '/'))
    .toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Ongoing Events di Homepage ────────────────────────────────
async function renderHomeOngoingEvents() {
  var container = document.getElementById('home-ongoing-container');
  if (!container) return;

  if (!window._eventsCache) {
    if (typeof window.loadEventsData === 'function') {
      await window.loadEventsData();
    } else {
      setTimeout(renderHomeOngoingEvents, 100);
      return;
    }
  }

  var eventsData   = window._eventsCache || [];
  var futureEvents = eventsData
    .filter(function (e) { return new Date(e.date).setHours(0,0,0,0) >= _today.getTime() && e.isFeatured; })
    .sort(function (a, b) { return new Date(a.date) - new Date(b.date); })
    .slice(0, 4);

  if (!futureEvents.length) {
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full" style="width:100%;grid-column:1/-1;">Tidak ada kegiatan yang akan datang dalam waktu dekat.</p>';
    return;
  }

  container.innerHTML = futureEvents.map(function (event, index) {
    var imagePath = event.imgSrc ? event.imgSrc.replace('../../', '') : 'img/logohmte.png';
    if (imagePath.startsWith('../')) imagePath = imagePath.substring(3);
    var formattedDate = formatDate(event.date);
    var targetLink    = event.registrationLink ? event.registrationLink : './page/event/event.html';

    return '<a href="' + targetLink + '" class="ongoing-card" style="animation-delay:' + (index * 0.15 + 0.1) + 's;">' +
      '<div class="ongoing-card-img">' +
        '<span class="ongoing-badge"><span class="ongoing-badge-dot"></span>Terdekat</span>' +
        '<img src="' + imagePath + '" alt="' + event.title + '" onerror="this.onerror=null;this.src=\'img/logohmte.png\';" />' +
      '</div>' +
      '<div class="ongoing-card-body">' +
        '<div class="ongoing-card-meta">' +
          '<span class="ongoing-card-date"><i class="ri-calendar-line"></i> ' + formattedDate + '</span>' +
          '<span class="ongoing-card-tag">' + event.time + '</span>' +
        '</div>' +
        '<h3 class="ongoing-card-title">' + event.title + '</h3>' +
        '<p style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:rgba(156,163,175,0.7);font-size:0.8rem;margin:0;">' +
          (event.description || 'Klik untuk melihat detail acara.') +
        '</p>' +
        '<div class="ongoing-card-info"><i class="ri-map-pin-line"></i> ' + (event.location || 'Lokasi menyusul') + '</div>' +
      '</div>' +
    '</a>';
  }).join('');

  if (typeof window.initOngoingAnimations === 'function') {
    window.initOngoingAnimations();
  }
}

function checkAndRenderHomeOngoing() {
  var container = document.getElementById('home-ongoing-container');
  if (container) renderHomeOngoingEvents();
  else setTimeout(checkAndRenderHomeOngoing, 50);
}

// ── Program Kerja di Homepage ─────────────────────────────────
async function renderHomeProker() {
  var container = document.getElementById('home-proker-container');
  if (!container) return;

  /* Tunggu project.js siap */
  if (typeof window.getHomeProjects !== 'function' && typeof window.getAllProjects !== 'function') {
    setTimeout(renderHomeProker, 100);
    return;
  }

  /* Tunggu createProkerCardHTML tersedia (dari project.js) */
  if (typeof window.createProkerCardHTML !== 'function') {
    setTimeout(renderHomeProker, 100);
    return;
  }

  var getProjects = window.getHomeProjects || window.getAllProjects;
  var projectsToShow;

  try {
    projectsToShow = await getProjects();
  } catch (e) {
    console.error('[home.js] renderHomeProker error:', e);
    projectsToShow = [];
  }

  if (!projectsToShow || !projectsToShow.length) {
    container.innerHTML =
      '<p class="text-center text-gray-400 col-span-full py-6" style="width:100%;">' +
        'Tidak ada Program Kerja yang ditampilkan.<br>' +
        '<span style="font-size:0.75rem;color:#4b5563;">Aktifkan "Tampilkan di Beranda" pada proker di panel admin.</span>' +
      '</p>';
    return;
  }

  /* Render menggunakan createProkerCardHTML dari project.js */
  container.innerHTML = projectsToShow
    .map(function (project, index) {
      return window.createProkerCardHTML(project, index);
    })
    .join('');

  /* Trigger animasi — IntersectionObserver dari sections/proker.html */
  if (typeof window.initProkerAnimations === 'function') {
    window.initProkerAnimations();
  }
  /* Juga pakai observeProkerCards langsung jika tersedia */
  if (typeof window.observeProkerCards === 'function') {
    window.observeProkerCards(container);
  }
}

// ── Inisialisasi ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  renderHomeProker();
  checkAndRenderHomeOngoing();
});

/* Expose agar bisa dipanggil dari luar jika perlu */
window.renderHomeProker        = renderHomeProker;
window.renderHomeOngoingEvents = renderHomeOngoingEvents;