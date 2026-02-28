/**
 * js/data/data-loader.js
 * ═══════════════════════════════════════════════════════════
 *  Loader terpusat: fetch JSON yang ditulis Decap CMS,
 *  lalu expose ke window.* agar semua halaman bisa pakai.
 *
 *  Cara kerja:
 *  1. Decap CMS menyimpan data ke js/data/json/*.json
 *  2. File ini fetch semua JSON itu secara paralel
 *  3. Hasilnya di-flatten dari { items: [...] } → array flat
 *  4. Di-expose ke global (window.newsData, dll) agar
 *     news-generator.js, event.js, project.js, emagz.js
 *     tidak perlu diubah sama sekali.
 *
 *  Sertakan di setiap halaman SEBELUM script data lainnya:
 *    <script src="/js/data/data-loader.js"></script>
 * ═══════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Path ke file JSON hasil Decap CMS ──
  var JSON_PATHS = {
    news:             '/js/data/json/news.json',
    events:           '/js/data/json/events.json',
    ongoingProjects:  '/js/data/json/ongoing-projects.json',
    upcomingProjects: '/js/data/json/upcoming-projects.json',
    completedProjects:'/js/data/json/completed-projects.json',
    emagz:            '/js/data/json/emagz.json',
    podcast:          '/js/data/json/podcast.json',
  };

  // ── Fetch helper dengan fallback ke array kosong ──
  function fetchJSON(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + url);
        return res.json();
      })
      .catch(function (err) {
        console.warn('[data-loader] ⚠️ Gagal fetch', url, '—', err.message);
        return null;
      });
  }

  // ── Flatten: ambil array dari { items:[...] } atau { videos:[...] } ──
  function flatten(data, key) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data[key]) return data[key];
    // Fallback: coba key pertama yang merupakan array
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      if (Array.isArray(data[keys[i]])) return data[keys[i]];
    }
    return [];
  }

  // ── Normalisasi data per tipe ──

  // News: pastikan field imgSrc bukan imgSRC
  function normalizeNews(items) {
    return items.map(function (item, idx) {
      return Object.assign({}, item, {
        imgSrc: item.imgSrc || item.imgSRC || item.image || '',
        // Konten markdown dari CMS sudah berupa string HTML via Decap
        content: item.content || '<p>' + (item.preview || '') + '</p>',
      });
    });
  }

  // Events: pastikan field imgSrc dan isFeatured ada
  function normalizeEvents(items) {
    return items.map(function (item) {
      return Object.assign({}, item, {
        imgSrc:       item.imgSrc || item.image || '',
        isFeatured:   item.isFeatured === true || item.isFeatured === 'true',
        locationLink: item.locationLink || '#',
        content:      item.content || '<p>' + (item.description || '') + '</p>',
      });
    });
  }

  // Projects: pastikan field `image` dan `release` ada
  function normalizeProjects(items) {
    return items.map(function (item, idx) {
      return Object.assign({}, item, {
        id:      item.id || idx + 1,
        image:   item.image || item.img || item.imgSrc || '/img/logohmte.png',
        // CMS lama pakai releaseDescription, JS pakai release
        release: item.release || item.releaseDescription || '',
      });
    });
  }

  // Emagz: pastikan field coverSrc dan pdfLink ada
  function normalizeEmagz(items) {
    return items.map(function (item) {
      return Object.assign({}, item, {
        coverSrc: item.coverSrc || item.cover || item.image || '/img/logohmte.png',
        pdfLink:  item.pdfLink  || item.pdf   || item.link  || '',
      });
    });
  }

  // ── MAIN LOADER ──
  window.__dataLoaderReady = false;

  Promise.all([
    fetchJSON(JSON_PATHS.news),
    fetchJSON(JSON_PATHS.events),
    fetchJSON(JSON_PATHS.ongoingProjects),
    fetchJSON(JSON_PATHS.upcomingProjects),
    fetchJSON(JSON_PATHS.completedProjects),
    fetchJSON(JSON_PATHS.emagz),
    fetchJSON(JSON_PATHS.podcast),
  ]).then(function (results) {
    var rawNews             = results[0];
    var rawEvents           = results[1];
    var rawOngoing          = results[2];
    var rawUpcoming         = results[3];
    var rawCompleted        = results[4];
    var rawEmagz            = results[5];
    var rawPodcast          = results[6];

    // Expose ke global — sama persis dengan nama yang dipakai JS halaman
    window.newsData           = normalizeNews(flatten(rawNews, 'items'));
    window.eventsData         = normalizeEvents(flatten(rawEvents, 'items'));
    window.ongoingProjects    = normalizeProjects(flatten(rawOngoing, 'items'));
    window.upcomingProjects   = normalizeProjects(flatten(rawUpcoming, 'items'));
    window.completedProjects  = normalizeProjects(flatten(rawCompleted, 'items'));
    window.emagzData          = normalizeEmagz(flatten(rawEmagz, 'items'));
    window.podcastVideos      = flatten(rawPodcast, 'videos');

    window.__dataLoaderReady  = true;

    // Broadcast event agar halaman yang menunggu data bisa lanjut
    document.dispatchEvent(new CustomEvent('hmte:dataReady', {
      detail: {
        news:     window.newsData.length,
        events:   window.eventsData.length,
        emagz:    window.emagzData.length,
        proker:   window.ongoingProjects.length
                + window.upcomingProjects.length
                + window.completedProjects.length,
      }
    }));

    console.log(
      '%c[data-loader] ✅ Semua data berhasil dimuat',
      'color:#0fbc6d;font-weight:bold;',
      '\n  news:', window.newsData.length,
      '| events:', window.eventsData.length,
      '| emagz:', window.emagzData.length,
      '| proker:', window.ongoingProjects.length + window.upcomingProjects.length + window.completedProjects.length
    );

  }).catch(function (err) {
    console.error('[data-loader] ❌ Fatal error:', err);
  });

})();
