// js/pages/event.js
// ── Card HTML helpers ─────────────────────────────────────────

function formatEventDate(dateString) {
  return new Date(dateString.replace(/-/g, '/'))
    .toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
}

/**
 * createEventCardHTML(event, index)
 * DNA identik dengan emagz-card / proker-card.
 * index → transition-delay stagger (110ms per kartu).
 */
function createEventCardHTML(event, index, variant) {
  index   = index   || 0;
  variant = variant || 'upcoming'; // 'upcoming' | 'archive'

  var img     = event.imgSrc ? '/' + event.imgSrc.replace(/^\//, '') : '/img/logohmte.png';
  var date    = formatEventDate(event.date);
  var delayMs = index * 110 + 60;

  var isArchive = (variant === 'archive');

  /* ── Border warna ── */
  var borderStyle = isArchive
    ? 'border: 1px solid rgba(255,255,255,0.07);'
    : event.color === 'blue'   ? 'border: 1px solid rgba(6,182,212,0.25);'
    : event.color === 'yellow' ? 'border: 1px solid rgba(234,179,8,0.25);'
    :                             'border: 1px solid rgba(15,188,109,0.2);';

  /* ── Badge teks + warna ── */
  var badgeLabel = isArchive ? 'SELESAI' : 'AKAN DATANG';
  var badgeBg    = isArchive
    ? 'background:rgba(120,120,120,0.18);border:1px solid rgba(255,255,255,0.1);color:rgba(200,200,200,0.6);'
    : 'background:rgba(15,188,109,0.18);border:1px solid rgba(15,188,109,0.35);color:#0fbc6d;';

  /* ── Tombol aksi ── */
  var actionBtn = '';
  if (isArchive) {
    var docUrl = event.driveLink || event.link || null;
    actionBtn = docUrl
      ? '<a href="' + docUrl + '" target="_blank" class="ev-card-action ev-action-doc">' +
          '<i class="fas fa-folder-open"></i> Lihat Dokumentasi</a>'
      : '<span class="ev-card-action ev-action-empty">Belum ada dokumentasi</span>';
  } else {
    actionBtn = event.registrationLink
      ? '<a href="' + event.registrationLink + '" target="_blank" class="ev-card-action ev-action-reg">' +
          '<i class="fas fa-ticket-alt"></i> Daftar Sekarang</a>'
      : '<span class="ev-card-action ev-action-soon">Pendaftaran segera dibuka</span>';
  }

  /* ── Overlay grayscale untuk arsip ── */
  var imgFilter = isArchive ? 'filter:grayscale(0.7) brightness(0.75);' : 'filter:brightness(0.82) saturate(1.05);';

  return (
    '<div class="ev-card' + (isArchive ? ' ev-card-archive' : '') + '"' +
         ' style="transition-delay:' + delayMs + 'ms;' + borderStyle + '"' +
         ' data-index="' + index + '">' +

      /* Cover */
      '<div class="ev-card-cover">' +
        '<span class="ev-card-badge" style="' + badgeBg + '">' + badgeLabel + '</span>' +
        '<img src="' + img + '" alt="' + event.title + '"' +
             ' style="' + imgFilter + '"' +
             ' onerror="this.onerror=null;this.src=\'/img/logohmte.png\';" />' +
      '</div>' +

      /* Body */
      '<div class="ev-card-body">' +
        '<div class="ev-card-meta">' +
          '<span class="ev-card-date"><i class="far fa-calendar-alt"></i> ' + date + '</span>' +
        '</div>' +
        '<h3 class="ev-card-title">' + event.title + '</h3>' +
        (isArchive
          ? '<p class="ev-card-loc"><i class="fas fa-map-marker-alt"></i> ' + (event.location || '') + '</p>'
          : '<p class="ev-card-desc">' + (event.description || '') + '</p>' +
            '<div class="ev-card-info">' +
              '<span><i class="fas fa-clock"></i> ' + (event.time || '') + '</span>' +
              '<span><i class="fas fa-map-marker-alt"></i> ' + (event.location || '') + '</span>' +
            '</div>'
        ) +
        actionBtn +
      '</div>' +
    '</div>'
  );
}

/* ── Card EVENT TERDEKAT (besar, di atas) ──────────────────── */
function createMainEventHTML(event) {
  var img  = event.imgSrc ? '/' + event.imgSrc.replace(/^\//, '') : '/img/logohmte.png';
  var date = formatEventDate(event.date);
  var btn  = event.registrationLink
    ? '<a href="' + event.registrationLink + '" target="_blank" class="ev-main-btn">' +
        '<i class="fas fa-ticket-alt"></i> Daftar Sekarang</a>'
    : '<div class="ev-main-btn ev-main-btn-ghost">Info segera hadir</div>';

  return (
    '<div class="ev-main-card">' +
      '<div class="ev-main-cover">' +
        '<div class="ev-main-badge">⭐ EVENT TERDEKAT</div>' +
        '<img src="' + img + '" alt="' + event.title + '"' +
             ' onerror="this.onerror=null;this.src=\'/img/logohmte.png\';" />' +
      '</div>' +
      '<div class="ev-main-body">' +
        '<h3 class="ev-main-title">' + event.title + '</h3>' +
        '<p class="ev-main-desc">' + (event.description || '') + '</p>' +
        '<div class="ev-main-info">' +
          '<p><i class="far fa-calendar-alt"></i> ' + date + '</p>' +
          '<p><i class="fas fa-clock"></i> ' + (event.time || '') + '</p>' +
          '<p><i class="fas fa-map-marker-alt"></i> ' +
            (event.locationLink
              ? '<a href="' + event.locationLink + '" target="_blank">' + event.location + '</a>'
              : (event.location || '')) +
          '</p>' +
        '</div>' +
        btn +
      '</div>' +
    '</div>'
  );
}

/* ── Observer helper ─────────────────────────────────────────── */
function observeEventCards(container) {
  if (!container || typeof IntersectionObserver === 'undefined') {
    if (container) container.querySelectorAll('.ev-card').forEach(function(c){ c.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  container.querySelectorAll('.ev-card:not([data-obs])').forEach(function(card) {
    card.setAttribute('data-obs', '1');
    io.observe(card);
  });
}

/* ── RENDER UTAMA ─────────────────────────────────────────────── */
async function loadEventListPage() {
  var mainWrap    = document.getElementById('current-event-register');
  var upcomingWrap = document.getElementById('upcoming-list');
  var archiveWrap = document.getElementById('div-tiga-events');
  if (!mainWrap || !archiveWrap) return;

  if (!window._eventsCache) {
    if (typeof window.loadEventsData === 'function') await window.loadEventsData();
    else { console.error('[event.js] loadEventsData tidak tersedia.'); return; }
  }

  var all = window._eventsCache || [];
  var now = new Date(); now.setHours(0,0,0,0);

  var upcoming  = all.filter(function(e){ return new Date(e.date).setHours(0,0,0,0) >= now.getTime(); })
                     .sort(function(a,b){ return new Date(a.date)-new Date(b.date); });
  var completed = all.filter(function(e){ return new Date(e.date).setHours(0,0,0,0) < now.getTime(); })
                     .sort(function(a,b){ return new Date(b.date)-new Date(a.date); });

  /* ── Section: Event Mendatang ── */
  if (!upcoming.length) {
    mainWrap.innerHTML =
      '<div style="text-align:center;padding:48px 0;">' +
        '<p style="color:rgba(156,163,175,0.6);margin-bottom:6px;">Tidak ada event yang akan datang.</p>' +
        '<p style="color:rgba(107,114,128,0.6);font-size:0.82rem;">Pantau terus halaman ini!</p>' +
      '</div>';
    if (upcomingWrap) upcomingWrap.innerHTML = '';
  } else {
    mainWrap.innerHTML = createMainEventHTML(upcoming[0]);
    if (upcomingWrap) {
      var others = upcoming.slice(1);
      upcomingWrap.innerHTML = others.length
        ? others.map(function(ev, i){ return createEventCardHTML(ev, i, 'upcoming'); }).join('')
        : '';
      observeEventCards(upcomingWrap);
    }
  }

  /* ── Section: Arsip ── */
  var limit     = 8;
  var displayed = completed.slice(0, limit);

  archiveWrap.innerHTML =
    '<div class="ev-archive-wrap">' +
      '<div class="ev-archive-header">' +
        '<span class="ev-archive-eyebrow">' +
          '<span></span>Dokumentasi<span></span>' +
        '</span>' +
        '<h2 class="ev-archive-title">Arsip Kegiatan</h2>' +
        '<p class="ev-archive-sub">Dokumentasi kegiatan HMTE yang telah terlaksana.</p>' +
      '</div>' +
      (!displayed.length
        ? '<p style="color:rgba(107,114,128,0.5);text-align:center;padding:24px 0;font-style:italic;">Belum ada arsip kegiatan.</p>'
        : '<div id="archive-grid" class="ev-archive-grid">' +
            displayed.map(function(ev,i){ return createEventCardHTML(ev, i, 'archive'); }).join('') +
          '</div>' +
          (completed.length > limit
            ? '<div style="text-align:center;margin-top:28px;">' +
                '<button onclick="loadMoreArchive()" class="ev-more-btn">Lihat Lebih Banyak</button>' +
              '</div>'
            : '')
      ) +
    '</div>';

  window._remainingArchives = completed.slice(limit);
  observeEventCards(document.getElementById('archive-grid'));
}

window.loadMoreArchive = function () {
  if (!window._remainingArchives || !window._remainingArchives.length) return;
  var grid = document.getElementById('archive-grid');
  if (grid) {
    var startIdx = grid.querySelectorAll('.ev-card').length;
    grid.insertAdjacentHTML('beforeend',
      window._remainingArchives.map(function(ev,i){ return createEventCardHTML(ev, startIdx+i, 'archive'); }).join('')
    );
    observeEventCards(grid);
  }
  window._remainingArchives = [];
  var btn = document.querySelector('[onclick="loadMoreArchive()"]');
  if (btn) btn.parentElement.remove();
};

window.createEventCardHTML   = createEventCardHTML;
window.loadEventListPage     = loadEventListPage;

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.includes('/page/event/')) setTimeout(loadEventListPage, 150);
});