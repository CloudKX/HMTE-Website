// js/pages/project.js
// Versi CMS: data di-fetch dari JSON.
// ─────────────────────────────────────────────────────────────
//  createProkerCardHTML → kartu HORIZONTAL, tanpa badge teks
//  di atas gambar. Warna kategori via border-left.
// ─────────────────────────────────────────────────────────────

var JSON_PATHS = {
  ongoing:   '/js/data/json/ongoing-projects.json',
  upcoming:  '/js/data/json/upcoming-projects.json',
  completed: '/js/data/json/completed-projects.json',
};
var FALLBACK_IMAGE = '/img/logohmte.png';

// ── Fetch helper ─────────────────────────────────────────────
async function fetchProjectData(category) {
  try {
    var res  = await fetch(JSON_PATHS[category]);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var json = await res.json();
    return (json.items || []).map(function (p) {
      return Object.assign({}, p, {
        category: category,
        image: p.image || FALLBACK_IMAGE,
      });
    });
  } catch (e) {
    console.warn('[project.js] Gagal fetch ' + category + ':', e.message);
    return [];
  }
}

// ── getAllProjects ─────────────────────────────────────────────
async function getAllProjects() {
  var results = await Promise.all([
    fetchProjectData('ongoing'),
    fetchProjectData('upcoming'),
    fetchProjectData('completed'),
  ]);
  var ongoing   = results[0];
  var upcoming  = results[1];
  var completed = results[2];

  function withMeta(arr, categoryLabel, statusFn, contentFn) {
    return arr.map(function (p) {
      return Object.assign({}, p, {
        categoryLabel: categoryLabel,
        statusText:    statusFn(p),
        content:       contentFn(p),
      });
    });
  }

  var all = [].concat(
    withMeta(ongoing,   'Sedang Berjalan', function (p) { return 'Progres: ' + (p.status || '-'); }, function (p) { return p.description; }),
    withMeta(upcoming,  'Akan Datang',     function ()  { return 'Segera Hadir'; },                  function (p) { return p.description; }),
    withMeta(completed, 'Arsip Kegiatan',  function ()  { return 'Selesai'; },                       function (p) { return p.release || p.releaseDescription || p.description; })
  );

  return all.map(function (p, i) {
    return Object.assign({}, p, { id: p.id != null ? p.id : i + 1 });
  });
}

// ── getHomeProjects ───────────────────────────────────────────
async function getHomeProjects() {
  var all      = await getAllProjects();
  var featured = all.filter(function (p) { return p.showOnHome === true; });
  if (featured.length > 0) return featured.slice(0, 4);

  var fallback = [];
  var o = all.find(function (p) { return p.category === 'ongoing'; });
  var u = all.filter(function (p) { return p.category === 'upcoming'; })
             .sort(function (a, b) { return new Date(a.date) - new Date(b.date); })[0];
  var c = all.filter(function (p) { return p.category === 'completed'; })
             .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })[0];
  if (o) fallback.push(o);
  if (u) fallback.push(u);
  if (c) fallback.push(c);
  return fallback;
}

// ─────────────────────────────────────────────────────────────
//  createProkerCardHTML
//  Kartu HORIZONTAL — garis kiri berwarna per kategori.
//  TIDAK ada badge/teks di atas gambar sama sekali.
// ─────────────────────────────────────────────────────────────
function createProkerCardHTML(project, index) {
  index = index || 0;

  var categoryClass = {
    ongoing:   'card-ongoing',
    upcoming:  'card-upcoming',
    completed: 'card-completed',
  }[project.category] || 'card-completed';

  var categoryLabel = {
    ongoing:   'Ongoing',
    upcoming:  'Upcoming',
    completed: 'Selesai',
  }[project.category] || 'Selesai';

  var statusClass = 'status-' + project.category;

  var imageSrc = (project.image || FALLBACK_IMAGE).replace(/^\/\//, '/');
  if (!imageSrc.startsWith('/') && !imageSrc.startsWith('http')) imageSrc = '/' + imageSrc;

  var link    = '/page/project/project-detail.html?id=' + project.id;
  var delayMs = index * 90;

  var dateText = '';
  if (project.date) {
    var d = new Date(project.date);
    dateText = isNaN(d.getTime())
      ? project.date
      : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  var desc = (project.description || '');
  if (desc.length > 90) desc = desc.substring(0, 90) + '\u2026';

  return '<a href="' + link + '" class="proker-card ' + categoryClass + '" ' +
         'style="transition-delay:' + delayMs + 'ms" data-index="' + index + '">' +
    '<div class="proker-card-cover">' +
      '<img src="' + imageSrc + '" alt="' + project.title + '" loading="lazy" ' +
           'onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\';" />' +
    '</div>' +
    '<div class="proker-card-body">' +
      '<div class="proker-card-meta">' +
        '<span class="proker-card-tag">' + categoryLabel + '</span>' +
        (dateText ? '<span class="proker-card-date">' + dateText + '</span>' : '') +
      '</div>' +
      '<h3 class="proker-card-title">' + project.title + '</h3>' +
      '<p class="proker-card-desc">' + desc + '</p>' +
      '<div class="proker-card-status ' + statusClass + '">' +
        '<i class="fas fa-circle" style="font-size:0.35rem;"></i> ' +
        (project.statusText || '') +
      '</div>' +
    '</div>' +
  '</a>';
}

// ── observeProkerCards ────────────────────────────────────────
function observeProkerCards(container) {
  if (!container || typeof IntersectionObserver === 'undefined') {
    if (container) container.querySelectorAll('.proker-card').forEach(function (c) { c.classList.add('is-visible'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  container.querySelectorAll('.proker-card:not([data-obs])').forEach(function (card) {
    card.setAttribute('data-obs', '1');
    obs.observe(card);
  });
}

// ── Render functions ──────────────────────────────────────────
function renderOngoingProjects(projects) {
  var container = document.getElementById('ongoing-projects-container');
  if (!container) return;
  if (!projects.length) { container.innerHTML = '<p class="loading-text">Tidak ada proyek yang sedang berjalan.</p>'; return; }
  container.innerHTML = '<div class="proker-archive-grid">' + projects.map(function (p, i) { return createProkerCardHTML(p, i); }).join('') + '</div>';
  observeProkerCards(container);
}

function renderUpcomingProjects(projects) {
  var container = document.getElementById('upcoming-projects-container');
  if (!container) return;
  if (!projects.length) { container.innerHTML = '<p class="loading-text">Tidak ada proyek yang dijadwalkan.</p>'; return; }
  container.innerHTML = '<div class="proker-archive-grid">' + projects.map(function (p, i) { return createProkerCardHTML(p, i); }).join('') + '</div>';
  observeProkerCards(container);
}

function renderCompletedProjects(projects) {
  var container = document.getElementById('completed-projects-container');
  if (!container) return;
  if (!projects.length) { container.innerHTML = '<p class="loading-text">Belum ada proyek selesai.</p>'; return; }
  container.innerHTML = '<div class="proker-archive-grid">' + projects.map(function (p, i) { return createProkerCardHTML(p, i); }).join('') + '</div>';
  observeProkerCards(container);
}

// ── loadProjectSections ───────────────────────────────────────
async function loadProjectSections() {
  var all = await getAllProjects();
  var ongoing   = all.filter(function (p) { return p.category === 'ongoing'; });
  var upcoming  = all.filter(function (p) { return p.category === 'upcoming'; }).sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  var completed = all.filter(function (p) { return p.category === 'completed'; }).sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  renderOngoingProjects(ongoing);
  renderUpcomingProjects(upcoming);
  renderCompletedProjects(completed);
}

// ── loadProjectDetailPage ─────────────────────────────────────
async function loadProjectDetailPage() {
  var id  = new URLSearchParams(window.location.search).get('id');
  var all = await getAllProjects();
  var project = all.find(function (p) { return String(p.id) === String(id); });

  var titleEl       = document.getElementById('detail-title');
  var contentEl     = document.getElementById('detail-content');
  var dateEl        = document.getElementById('detail-date');
  var categoryBadge = document.getElementById('detail-category-badge');
  var statusBadge   = document.getElementById('detail-status-badge');
  var imgContainer  = document.getElementById('detail-image-container');
  var docSection    = document.getElementById('documentation-section');
  var docLink       = document.getElementById('documentation-link');

  if (!project) {
    if (titleEl)      titleEl.textContent = 'Proyek Tidak Ditemukan';
    if (contentEl)    contentEl.innerHTML = '<p style="color:#f87171;text-align:center;padding:40px 0;">Maaf, proyek tidak tersedia.</p>';
    if (imgContainer) imgContainer.style.display = 'none';
    if (docSection)   docSection.style.display   = 'none';
    return;
  }

  var pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = project.title + ' - Detail';
  if (titleEl)       titleEl.textContent       = project.title;
  if (statusBadge)   statusBadge.textContent   = project.statusText;
  if (categoryBadge) categoryBadge.textContent = project.categoryLabel;

  var badgeMap = {
    completed: 'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-900/50 text-cyan-400 border border-cyan-800',
    ongoing:   'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-900/50 text-green-400 border border-green-800',
    upcoming:  'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  };
  if (categoryBadge) categoryBadge.className = badgeMap[project.category] || badgeMap.upcoming;

  if (dateEl) {
    if (project.date) {
      var d = new Date(project.date);
      dateEl.textContent = isNaN(d.getTime()) ? 'Tanggal belum ditentukan'
        : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } else { dateEl.textContent = '-'; }
  }

  var imgSrc = (project.image || FALLBACK_IMAGE);
  if (!imgSrc.startsWith('/') && !imgSrc.startsWith('http')) imgSrc = '/' + imgSrc;
  if (imgContainer) {
    imgContainer.innerHTML = '<img src="' + imgSrc + '" alt="' + project.title + '" ' +
      'style="width:100%;height:auto;border-radius:12px;display:block;" ' +
      'onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\';" />';
  }
  if (contentEl) contentEl.innerHTML = project.content || '';

  if (project.link && docSection && docLink) {
    docLink.href = project.link; docSection.classList.remove('hidden');
  } else if (docSection) {
    docSection.classList.add('hidden');
  }
}

// ── Auto-run ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var path = window.location.pathname;
  if (path.includes('project-detail.html')) loadProjectDetailPage();
  else if (path.includes('project.html'))   loadProjectSections();
});

// ── Expose ke global ──────────────────────────────────────────
window.getAllProjects         = getAllProjects;
window.getHomeProjects        = getHomeProjects;
window.createProkerCardHTML   = createProkerCardHTML;
window.observeProkerCards     = observeProkerCards;
window.loadProjectSections    = loadProjectSections;
window.loadProjectDetailPage  = loadProjectDetailPage;
window.renderProjects         = loadProjectSections;