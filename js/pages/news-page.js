/* =====================================================================
   news-page.js — daftar berita + paginasi untuk page/news/news.html
   Tanpa library. Data dibaca dari /js/data/json/news.json (hasil CMS).

   Gambar kartu: dipakai thumbnail /img/news-thumb/<nama>.webp (640x360).
   Kalau thumbnail belum ada, otomatis jatuh ke gambar asli di
   /img/uploads/, lalu ke logo HMTE kalau gambar asli juga gagal.
   ===================================================================== */
(function () {
  'use strict';

  var JSON_URL = '/js/data/json/news.json';
  var DETAIL_URL = '/page/news/news-detail.html?id=';
  var FALLBACK_IMG = '/img/logohmte.png';
  var PER_PAGE = 8;

  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, mei: 4, jun: 5, jul: 6, aug: 7, agu: 7, agt: 7, sep: 8, oct: 9, okt: 9, nov: 10, dec: 11, des: 11 };
  var dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  var grid, pager, top;
  var state = { items: [], page: 1, started: false };

  // ── Util ──────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Terima "May 03, 2026", "2026-05-03", atau "2026-05-03T00:00:00Z"
  function parseDate(str) {
    if (!str) return null;
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(str);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = /^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(str);
    if (m) {
      var mo = MONTHS[m[1].slice(0, 3).toLowerCase()];
      if (mo !== undefined) return new Date(+m[3], mo, +m[2]);
    }
    var d = new Date(str);
    return isNaN(d) ? null : d;
  }

  // "img/x.jpg", "../img/x.jpg", "/img/x.jpg" -> "/img/x.jpg"
  function normSrc(src) {
    src = String(src || '').trim();
    if (!src) return '';
    if (/^(https?:)?\/\//i.test(src) || src.indexOf('data:') === 0) return src;
    return '/' + src.replace(/^(\.{1,2}\/)+/, '').replace(/^\/+/, '');
  }

  // /img/uploads/foto.jpg -> /img/news-thumb/foto.webp (null kalau bukan dari uploads)
  function thumbFor(src) {
    var m = /^\/img\/uploads\/([^\/]+)\.[A-Za-z0-9]+$/.exec(src);
    return m ? '/img/news-thumb/' + m[1] + '.webp' : null;
  }

  function previewText(item) {
    if (item.preview) return String(item.preview).replace(/\s+/g, ' ').trim();
    return String(item.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  }

  // ── Render ────────────────────────────────────────────────────────
  function cardHTML(item, idx) {
    var src = normSrc(item.imgSrc || item.imgSRC || item.image);
    var thumb = thumbFor(src);
    var step = thumb ? 'thumb' : (src ? 'orig' : 'logo');
    var imgUrl = thumb || src || FALLBACK_IMG;
    var d = parseDate(item.date);
    var when = d ? '<time datetime="' + esc(d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2)) + '">' + esc(dateFmt.format(d)) + '</time>' : esc(item.date || '');

    return '<a class="nc" href="' + DETAIL_URL + encodeURIComponent(item.id) + '">' +
      '<div class="nc__img"><img src="' + esc(imgUrl) + '" alt="" width="640" height="360"' +
      ' data-step="' + step + '" data-orig="' + esc(src) + '"' +
      (idx === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></div>' +
      '<div class="nc__body">' +
      (item.category ? '<span class="nc__tag">' + esc(item.category) + '</span>' : '') +
      '<h3 class="nc__title">' + esc(item.title) + '</h3>' +
      '<p class="nc__desc">' + esc(previewText(item)) + '</p>' +
      '<span class="nc__date">' + when + '</span>' +
      '</div></a>';
  }

  function pagerHTML(total, current) {
    if (total <= 1) return '';
    var max = 5;
    var start = Math.max(1, current - Math.floor(max / 2));
    var end = Math.min(total, start + max - 1);
    start = Math.max(1, end - max + 1);

    var h = '<button type="button" class="pg-btn" data-page="' + (current - 1) + '"' + (current === 1 ? ' disabled' : '') + ' aria-label="Halaman sebelumnya">Prev</button>';
    for (var i = start; i <= end; i++) {
      h += '<button type="button" class="pg-btn" data-page="' + i + '"' + (i === current ? ' aria-current="page"' : '') + ' aria-label="Halaman ' + i + '">' + i + '</button>';
    }
    h += '<button type="button" class="pg-btn" data-page="' + (current + 1) + '"' + (current === total ? ' disabled' : '') + ' aria-label="Halaman berikutnya">Next</button>';
    return h;
  }

  function render() {
    var total = Math.max(1, Math.ceil(state.items.length / PER_PAGE));
    state.page = Math.min(Math.max(1, state.page), total);
    var from = (state.page - 1) * PER_PAGE;
    grid.innerHTML = state.items.slice(from, from + PER_PAGE).map(cardHTML).join('');
    pager.innerHTML = pagerHTML(total, state.page);
  }

  function status(msg) {
    grid.innerHTML = '<p class="news-status">' + esc(msg) + '</p>';
    pager.innerHTML = '';
  }

  function goTo(page) {
    state.page = page;
    render();
    try { history.replaceState(null, '', page > 1 ? '?page=' + page : location.pathname); } catch (e) { /* abaikan */ }
    top.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    if (state.started) return;          // aman dipanggil dua kali (loader.js juga memanggil initNewsPage)
    grid = document.getElementById('all-news-container');
    pager = document.getElementById('news-pagination-container');
    top = document.getElementById('news-top');
    if (!grid || !pager) return;
    state.started = true;

    // Gambar gagal -> thumbnail > gambar asli > logo
    grid.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG') return;
      if (img.dataset.step === 'thumb' && img.dataset.orig) {
        img.dataset.step = 'orig';
        img.src = img.dataset.orig;
      } else if (img.dataset.step !== 'logo') {
        img.dataset.step = 'logo';
        img.classList.add('is-fallback');
        img.src = FALLBACK_IMG;
      }
    }, true);

    pager.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('button[data-page]');
      if (btn && !btn.disabled) goTo(parseInt(btn.dataset.page, 10));
    });

    var wanted = parseInt(new URLSearchParams(location.search).get('page'), 10);
    if (wanted > 0) state.page = wanted;

    fetch(JSON_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        var items = Array.isArray(json) ? json : (json && json.items) || [];
        state.items = items.slice().sort(function (a, b) {
          var da = parseDate(a.date), db = parseDate(b.date);
          return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
        });
        if (!state.items.length) return status('Belum ada berita.');
        render();
      })
      .catch(function (err) {
        console.warn('[news-page] gagal memuat berita:', err.message);
        status('Berita gagal dimuat. Coba muat ulang halaman.');
      });
  }

  // loader.js memanggil window.initNewsPage setelah header/footer siap; kita juga mulai sendiri
  // begitu DOM siap supaya daftar berita tidak menunggu header & footer.
  window.initNewsPage = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
