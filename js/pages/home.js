// js/pages/home.js
// Versi CMS: baca _eventsCache (dari calendar.js) dan project data dari JSON.

const today = new Date();
today.setHours(0, 0, 0, 0);

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString.replace(/-/g, '/')).toLocaleDateString('id-ID', options);
}

// ── Ongoing Events di Homepage ────────────────────────────────────────────────
async function renderHomeOngoingEvents() {
  const container = document.getElementById('home-ongoing-container');
  if (!container) return;

  // Tunggu data events tersedia (diload oleh calendar.js)
  if (!window._eventsCache) {
    if (typeof window.loadEventsData === 'function') {
      await window.loadEventsData();
    } else {
      // Retry kalau calendar.js belum siap
      setTimeout(renderHomeOngoingEvents, 100);
      return;
    }
  }

  const eventsData    = window._eventsCache || [];
  const futureEvents  = eventsData
    .filter((e) => new Date(e.date).setHours(0, 0, 0, 0) >= today.getTime() && e.isFeatured)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4); // Menampilkan maksimal 4 event

  if (!futureEvents.length) {
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full" style="width: 100%; grid-column: 1 / -1;">Tidak ada kegiatan yang akan datang dalam waktu dekat.</p>';
    return;
  }

  // DIUBAH: Menggunakan format HTML yang 100% cocok dengan ongoing.html
  container.innerHTML = futureEvents.map((event, index) => {
    let imagePath = event.imgSrc ? event.imgSrc.replace('../../', '') : 'img/logohmte.png';
    if (imagePath.startsWith('../')) imagePath = imagePath.substring(3);

    const formattedDate = formatDate(event.date);
    // Jika tidak ada link registrasi, arahkan ke detail event
    const targetLink = event.registrationLink ? event.registrationLink : './page/event/event.html';

    return `
      <a href="${targetLink}" class="ongoing-card" style="animation-delay: ${index * 0.15 + 0.1}s;">
        <div class="ongoing-card-img">
          <span class="ongoing-badge">
            <span class="ongoing-badge-dot"></span>Terdekat
          </span>
          <img src="${imagePath}" alt="${event.title}" onerror="this.onerror=null;this.src='img/logohmte.png';" />
        </div>
        <div class="ongoing-card-body">
          <div class="ongoing-card-meta">
            <span class="ongoing-card-date"><i class="ri-calendar-line"></i> ${formattedDate}</span>
            <span class="ongoing-card-tag">${event.time}</span>
          </div>
          <h3 class="ongoing-card-title">${event.title}</h3>
          <p class="ongoing-card-desc" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:rgba(156,163,175,0.7);font-size:0.8rem;margin:0;">
            ${event.description || 'Klik untuk melihat detail acara.'}
          </p>
          <div class="ongoing-card-info">
            <i class="ri-map-pin-line"></i> ${event.location || 'Lokasi menyusul'}
          </div>
        </div>
      </a>`;
  }).join('');

  // SANGAT PENTING: Panggil ulang fungsi animasi setelah elemen baru selesai dirender
  if (typeof window.initOngoingAnimations === 'function') {
    window.initOngoingAnimations();
  }
}

function checkAndRenderHomeOngoing() {
  const container = document.getElementById('home-ongoing-container');
  if (container) {
    renderHomeOngoingEvents();
  } else {
    setTimeout(checkAndRenderHomeOngoing, 50);
  }
}

// ── Program Kerja di Homepage ─────────────────────────────────────────────────
async function renderHomeProker() {
  const container = document.getElementById('home-proker-container');
  if (!container) return;

  const getProjects = window.getHomeProjects || window.getAllProjects;
  if (typeof getProjects !== 'function') {
    setTimeout(renderHomeProker, 100);
    return;
  }

  let projectsToShow;
  try {
    projectsToShow = await getProjects();
  } catch (e) {
    console.error('[home.js] renderHomeProker error:', e);
    projectsToShow = [];
  }

  if (!projectsToShow || !projectsToShow.length) {
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full py-6" style="width: 100%; grid-column: 1 / -1;">Tidak ada Program Kerja yang ditampilkan.<br><span class="text-xs text-gray-600">Aktifkan "Tampilkan di Beranda" pada proker di panel admin.</span></p>';
    return;
  }

  const typeLabel = (p) => {
    if (p.category === 'ongoing')   return { label: 'ONGOING',   dotColor: '#0fbc6d' };
    if (p.category === 'upcoming')  return { label: 'UPCOMING',  dotColor: '#eab308' };
    return                                 { label: 'COMPLETED', dotColor: '#06b6d4' };
  };

  container.innerHTML = projectsToShow.map((project, index) => {
    const { label, dotColor } = typeLabel(project);
    const finalLink = project.category === 'completed' && project.id
      ? `./page/project/project-detail.html?id=${project.id}`
      : './page/project/project.html';

    const description = (project.description || '').length > 80
      ? (project.description || '').substring(0, 80) + '...'
      : (project.description || '');

    const imagePath = project.image
      ? project.image.replace('../../', '').replace(/^\//, '')
      : 'img/logohmte.png';

    const statusInfo = project.category === 'ongoing'
      ? `Progres: ${project.status || '-'}`
      : project.date
        ? new Date(project.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    return `
      <a href="${finalLink}" class="ongoing-card" style="text-decoration:none; animation-delay: ${index * 0.15 + 0.1}s;">
        <div class="ongoing-card-img">
          <span class="ongoing-badge" style="position:absolute;top:10px;right:10px;z-index:3;">
            <span style="width:5px;height:5px;background:${dotColor};border-radius:50%;display:inline-block;margin-right:4px;box-shadow:0 0 6px ${dotColor};"></span>
            ${label}
          </span>
          <img src="${imagePath}" alt="${project.title}" onerror="this.onerror=null;this.src='img/logohmte.png';" />
        </div>
        <div class="ongoing-card-body">
          <div class="ongoing-card-meta">
            <span class="ongoing-card-date">${statusInfo}</span>
            <span class="ongoing-card-tag" style="color: ${dotColor}; border-color: ${dotColor}; background: transparent;">${project.categoryLabel || label}</span>
          </div>
          <h3 class="ongoing-card-title">${project.title}</h3>
          <p class="ongoing-card-desc">${description}</p>
        </div>
      </a>`;
  }).join('');

  // Memicu animasi untuk proker (jika fungsi observer dipanggil dengan nama yang sama)
  if (typeof window.initOngoingAnimations === 'function') {
    window.initOngoingAnimations();
  }
}

// ── Inisialisasi ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderHomeProker();
  checkAndRenderHomeOngoing();
});