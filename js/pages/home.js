// js/pages/home.js
// Versi CMS: baca _eventsCache (dari calendar.js) dan project data dari JSON.
// Logika render TIDAK BERUBAH.

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
    .slice(0, 2);

  if (!futureEvents.length) {
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full">Tidak ada kegiatan yang akan datang dalam waktu dekat.</p>';
    return;
  }

  container.innerHTML = futureEvents.map((event) => {
    const mainEventLink = './page/event/event.html';
    let imagePath = event.imgSrc ? event.imgSrc.replace('../../', '') : 'img/logohmte.png';
    if (imagePath.startsWith('../')) imagePath = imagePath.substring(3);

    const formattedDate    = formatDate(event.date);
    const borderColorClass = event.color === 'green' ? 'border-emerald-500'
                           : event.color === 'blue'  ? 'border-cyan-500'
                           : 'border-yellow-500';
    const actionButtonHTML = event.registrationLink
      ? `<button onclick="window.open('${event.registrationLink}', '_blank')"
                 class="mt-auto px-3 py-1 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-sm w-full">
           Daftar Sekarang
         </button>`
      : `<button onclick="window.location.href='${mainEventLink}'"
                 class="mt-auto px-3 py-1 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition text-sm w-full">
           Lihat Detail
         </button>`;

    return `
      <div class="flex flex-col rounded-xl overflow-hidden border ${borderColorClass}
                  transition-all duration-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/40
                  cursor-default bg-gray-900 w-full max-w-xs mx-auto">
        <div class="flex items-center justify-center bg-black"
             style="width:100%;aspect-ratio:9/12;overflow:hidden;">
          <img src="${imagePath}" alt="${event.title}"
               style="width:100%;height:100%;object-fit:cover;"
               class="transition-transform duration-500 hover:scale-105"
               onerror="this.onerror=null;this.src='img/logohmte.png';" />
        </div>
        <div class="p-3 flex flex-col flex-1 bg-gray-900">
          <h3 class="text-sm font-bold text-white mb-2">${event.title}</h3>
          <div class="text-gray-300 text-xs mb-3 space-y-1">
            <p><i class="far fa-calendar-alt mr-1 text-cyan-400"></i> ${formattedDate}</p>
            <p><i class="fas fa-clock mr-1 text-cyan-400"></i> ${event.time}</p>
            <p class="truncate"><i class="fas fa-map-marker-alt mr-1 text-cyan-400"></i> ${event.location}</p>
          </div>
          ${actionButtonHTML}
        </div>
      </div>`;
  }).join('');
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
// Baca dari window._projectsCache yang diisi oleh project.js (fetch JSON)
async function renderHomeProker() {
  const container = document.getElementById('home-proker-container');
  if (!container) return;

  // Tunggu getHomeProjects atau getAllProjects tersedia dari js/pages/project.js
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
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full py-6">Tidak ada Program Kerja yang ditampilkan.<br><span class="text-xs text-gray-600">Aktifkan "Tampilkan di Beranda" pada proker di panel admin.</span></p>';
    return;
  }

  const typeLabel = (p) => {
    if (p.category === 'ongoing')   return { label: 'ONGOING',   border: 'border-green-500',  textColor: 'text-green-400' };
    if (p.category === 'upcoming')  return { label: 'UPCOMING',  border: 'border-yellow-500', textColor: 'text-yellow-400' };
    return                                 { label: 'COMPLETED', border: 'border-cyan-500',   textColor: 'text-cyan-400' };
  };

  container.innerHTML = projectsToShow.map((project) => {
    const { label, border, textColor } = typeLabel(project);
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
      <a href="${finalLink}" class="ongoing-card" style="text-decoration:none;">
        <div class="ongoing-card-img">
          <span class="ongoing-badge" style="position:absolute;top:10px;right:10px;z-index:3;">
            <span style="width:5px;height:5px;background:#0fbc6d;border-radius:50%;display:inline-block;margin-right:4px;box-shadow:0 0 6px #0fbc6d;"></span>
            ${label}
          </span>
          <img src="${imagePath}" alt="${project.title}"
               onerror="this.onerror=null;this.src='img/logohmte.png';" />
        </div>
        <div class="ongoing-card-body">
          <div class="ongoing-card-meta">
            <span class="ongoing-card-date">${statusInfo}</span>
            <span class="ongoing-card-tag">${project.categoryLabel || label}</span>
          </div>
          <h3 class="ongoing-card-title">${project.title}</h3>
          <p class="ongoing-card-desc">${description}</p>
        </div>
      </a>`;
  }).join('');
}

// ── Expose getAllProjects ke global agar bisa dipakai home.js ─────────────────
// (project.js versi CMS harus expose window.getAllProjects)
document.addEventListener('DOMContentLoaded', () => {
  renderHomeProker();
  checkAndRenderHomeOngoing();
});
