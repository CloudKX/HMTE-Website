// js/pages/event.js
// ── Helpers ───────────────────────────────────────────────────────────

function _evFormatDate(str) {
  return new Date(str.replace(/-/g, '/'))
    .toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
}

function _evImgPath(src) {
  if (!src) return '/img/logohmte.png';
  var p = src.replace(/^\.\.\//, '').replace(/^\.\//, '');
  return p.startsWith('/') ? p : '/' + p;
}

function _evObserve(container) {
  if (!container || typeof IntersectionObserver === 'undefined') {
    if (container) container.querySelectorAll('.ev-card').forEach(function(c){ c.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -16px 0px' });

  container.querySelectorAll('.ev-card:not([data-io])').forEach(function(card) {
    card.setAttribute('data-io','1'); io.observe(card);
  });
}

// ── Card: Event Utama (1 kartu besar) ────────────────────────────────

function _evMainCard(ev) {
  var img  = _evImgPath(ev.imgSrc);
  var date = _evFormatDate(ev.date);
  var loc  = ev.locationLink
    ? '<a href="' + ev.locationLink + '" target="_blank">' + (ev.location||'') + '</a>'
    : (ev.location || '-');

  var btn = ev.registrationLink
    ? '<a href="' + ev.registrationLink + '" target="_blank" class="ev-main-btn">' +
        '<i class="fas fa-ticket-alt"></i> Daftar Sekarang</a>'
    : '<span class="ev-main-btn-soon">Pendaftaran segera dibuka</span>';

  return (
    '<div class="ev-main-card">' +
      '<div class="ev-main-cover">' +
        '<span class="ev-main-badge">⭐ EVENT TERDEKAT</span>' +
        '<img src="' + img + '" alt="' + ev.title + '"' +
             ' onerror="this.onerror=null;this.src=\'/img/logohmte.png\';" />' +
      '</div>' +
      '<div class="ev-main-body">' +
        '<h3 class="ev-main-title">' + ev.title + '</h3>' +
        '<p class="ev-main-desc">' + (ev.description||'') + '</p>' +
        '<div class="ev-main-info">' +
          '<p><i class="far fa-calendar-alt"></i>' + date + '</p>' +
          '<p><i class="fas fa-clock"></i>' + (ev.time||'-') + '</p>' +
          '<p><i class="fas fa-map-marker-alt"></i>' + loc + '</p>' +
        '</div>' +
        btn +
      '</div>' +
    '</div>'
  );
}

// ── Card: Upcoming & Archive ──────────────────────────────────────────
// index → stagger delay, variant → 'upcoming' | 'archive'

function createEventCardHTML(ev, index, variant) {
  index   = index   || 0;
  variant = variant || 'upcoming';

  var img     = _evImgPath(ev.imgSrc);
  var date    = _evFormatDate(ev.date);
  var delay   = (index * 110 + 60) + 'ms';
  var archive = (variant === 'archive');

  /* border warna berdasar color field */
  var borderColor = archive ? 'rgba(255,255,255,0.07)'
    : ev.color === 'blue'   ? 'rgba(6,182,212,0.22)'
    : ev.color === 'yellow' ? 'rgba(234,179,8,0.22)'
    :                          'rgba(15,188,109,0.18)';

  /* badge */
  var badgeClass = archive ? 'ev-badge-archive' : 'ev-badge-upcoming';
  var badgeText  = archive ? 'SELESAI' : 'AKAN DATANG';

  /* tombol aksi */
  var actionBtn;
  if (archive) {
    var docUrl = ev.driveLink || ev.link || null;
    actionBtn = docUrl
      ? '<a href="' + docUrl + '" target="_blank" class="ev-card-btn ev-btn-doc">' +
          '<i class="fas fa-folder-open"></i> Lihat Dokumentasi</a>'
      : '<span class="ev-btn-soon">Belum ada dokumentasi</span>';
  } else {
    actionBtn = ev.registrationLink
      ? '<a href="' + ev.registrationLink + '" target="_blank" class="ev-card-btn ev-btn-reg">' +
          '<i class="fas fa-ticket-alt"></i> Daftar Sekarang</a>'
      : '<span class="ev-btn-soon">Pendaftaran segera dibuka</span>';
  }

  /* info baris bawah (hanya untuk upcoming) */
  var infoHTML = archive
    ? '<p class="ev-card-loc"><i class="fas fa-map-marker-alt"></i>' + (ev.location||'-') + '</p>'
    : '<div class="ev-card-info">' +
        '<span><i class="fas fa-clock"></i>' + (ev.time||'-') + '</span>' +
        '<span><i class="fas fa-map-marker-alt"></i>' + (ev.location||'-') + '</span>' +
      '</div>';

  return (
    '<div class="ev-card' + (archive ? ' ev-card-archive' : '') + '"' +
         ' style="transition-delay:' + delay + ';border-color:' + borderColor + ';">' +

      '<div class="ev-card-cover">' +
        '<span class="ev-card-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '<img src="' + img + '" alt="' + ev.title + '"' +
             ' onerror="this.onerror=null;this.src=\'/img/logohmte.png\';" />' +
      '</div>' +

      '<div class="ev-card-body">' +
        '<div class="ev-card-date"><i class="far fa-calendar-alt"></i>' + date + '</div>' +
        '<h3 class="ev-card-title">' + ev.title + '</h3>' +
        (archive ? '' : '<p class="ev-card-desc">' + (ev.description||'') + '</p>') +
        infoHTML +
        actionBtn +
      '</div>' +
    '</div>'
  );
}

// ── RENDER UTAMA ─────────────────────────────────────────────────────

async function loadEventListPage() {
  var mainWrap     = document.getElementById('current-event-register');
  var upcomingWrap = document.getElementById('upcoming-list');
  var archiveWrap  = document.getElementById('div-tiga-events');
  if (!mainWrap || !archiveWrap) return;

  /* Pastikan data tersedia */
  if (!window._eventsCache || !window._eventsCache.length) {
    if (typeof window.loadEventsData === 'function') {
      await window.loadEventsData();
    } else {
      mainWrap.innerHTML = '<p style="color:rgba(156,163,175,0.4);padding:40px;text-align:center;">Gagal memuat data event.</p>';
      return;
    }
  }

  var all = window._eventsCache || [];
  var now = new Date(); now.setHours(0,0,0,0);

  var upcoming = all
    .filter(function(e){ return new Date(e.date.replace(/-/g,'/')) >= now; })
    .sort(function(a,b){ return new Date(a.date)-new Date(b.date); });

  var completed = all
    .filter(function(e){ return new Date(e.date.replace(/-/g,'/')) < now; })
    .sort(function(a,b){ return new Date(b.date)-new Date(a.date); });

  /* ── SEKSI 1: Event Terdekat ── */
  if (!upcoming.length) {
    mainWrap.innerHTML =
      '<div style="text-align:center;padding:48px 0;">' +
        '<p style="color:rgba(156,163,175,0.55);margin-bottom:4px;">Tidak ada event yang akan datang saat ini.</p>' +
        '<p style="color:rgba(107,114,128,0.5);font-size:0.82rem;">Pantau terus halaman ini!</p>' +
      '</div>';
    if (upcomingWrap) upcomingWrap.innerHTML = '';
  } else {
    mainWrap.innerHTML = _evMainCard(upcoming[0]);

    /* ── SEKSI 2: Akan Datang Lainnya ── */
    var others = upcoming.slice(1);
    if (upcomingWrap) {
      if (others.length) {
        /* Tampilkan heading seksi 2 */
        var h2 = document.getElementById('upcoming-heading');
        if (h2) h2.style.display = '';

        upcomingWrap.innerHTML = others
          .map(function(ev,i){ return createEventCardHTML(ev, i, 'upcoming'); })
          .join('');
        _evObserve(upcomingWrap);
      } else {
        upcomingWrap.innerHTML = '';
      }
    }
  }

  /* ── GARIS + SEKSI 3: Arsip ── */
  var divider = document.getElementById('archive-divider');

  if (completed.length) {
    if (divider) divider.style.display = '';

    var limit   = 10;
    var shown   = completed.slice(0, limit);
    var rest    = completed.slice(limit);

    archiveWrap.innerHTML =
      '<div class="ev-archive-header">' +
        '<div class="ev-archive-eyebrow">Dokumentasi</div>' +
        '<h2 class="ev-archive-title">Arsip Kegiatan</h2>' +
        '<p class="ev-archive-sub">Dokumentasi kegiatan HMTE yang telah terlaksana.</p>' +
      '</div>' +
      '<div id="ev-archive-grid" class="ev-archive-grid">' +
        shown.map(function(ev,i){ return createEventCardHTML(ev, i, 'archive'); }).join('') +
      '</div>' +
      (rest.length
        ? '<div style="text-align:center;margin-top:28px;">' +
            '<button class="ev-more-btn" onclick="evLoadMore()">Lihat Lebih Banyak</button>' +
          '</div>'
        : '');

    window._evArchiveRest = rest;
    _evObserve(document.getElementById('ev-archive-grid'));
  } else {
    if (divider) divider.style.display = 'none';
    archiveWrap.innerHTML = '';
  }
}

window.evLoadMore = function() {
  var grid = document.getElementById('ev-archive-grid');
  if (!grid || !window._evArchiveRest || !window._evArchiveRest.length) return;
  var startIdx = grid.querySelectorAll('.ev-card').length;
  grid.insertAdjacentHTML('beforeend',
    window._evArchiveRest
      .map(function(ev,i){ return createEventCardHTML(ev, startIdx+i, 'archive'); })
      .join('')
  );
  window._evArchiveRest = [];
  var btn = document.querySelector('[onclick="evLoadMore()"]');
  if (btn) btn.parentElement.remove();
  _evObserve(grid);
};

/* ── EXPORTS ── */
window.createEventCardHTML = createEventCardHTML;
window.loadEventListPage   = loadEventListPage;

/* ── AUTO-INIT ── */
(function() {
  function tryInit() {
    if (document.getElementById('current-event-register')) {
      loadEventListPage();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(tryInit, 200); });
  } else {
    setTimeout(tryInit, 200);
  }
})();