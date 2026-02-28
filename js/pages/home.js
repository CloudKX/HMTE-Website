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

  // Tunggu getAllProjects tersedia (dari js/pages/project.js)
  if (typeof window.getAllProjects !== 'function') {
    setTimeout(renderHomeProker, 100);
    return;
  }

  const allProjects = await window.getAllProjects();

  const ongoingProjects   = allProjects.filter((p) => p.category === 'ongoing');
  const upcomingProjects  = allProjects.filter((p) => p.category === 'upcoming');
  const completedProjects = allProjects.filter((p) => p.category === 'completed');

  const projectsToShow = [];

  if (ongoingProjects.length > 0) {
    projectsToShow.push({
      ...ongoingProjects[0],
      type: 'Ongoing', emoji: '🚀',
      statusText: ongoingProjects[0].status,
      link: './page/project/project.html',
    });
  }

  const futureUpcoming = upcomingProjects
    .filter((p) => { const d = new Date(p.date); d.setHours(0,0,0,0); return d >= today; })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (futureUpcoming.length > 0) {
    projectsToShow.push({
      ...futureUpcoming[0],
      type: 'Upcoming', emoji: '🗓️',
      statusText: new Date(futureUpcoming[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      link: './page/project/project.html',
    });
  }

  const pastCompleted = completedProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (pastCompleted.length > 0) {
    projectsToShow.push({
      ...pastCompleted[0],
      type: 'Completed', emoji: '✅',
      statusText: new Date(pastCompleted[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }

  if (!projectsToShow.length) {
    container.innerHTML = '<p class="text-center text-gray-400 col-span-full">Tidak ada Program Kerja yang dapat ditampilkan.</p>';
    return;
  }

  container.innerHTML = projectsToShow.map((project) => {
    let finalLink = './page/project/project.html';
    let linkText  = '';
    if (project.type === 'Completed') {
      finalLink = `./page/project/project-detail.html?id=${project.id}`;
      linkText  = project.link ? 'Press Release →' : '';
    }

    const description = project.description.length > 70
      ? project.description.substring(0, 70) + '...'
      : project.description;

    const imagePath   = project.image ? project.image.replace('../../', '') : 'img/logohmte.png';
    const borderColor = project.type === 'Ongoing'   ? 'border-green-500'
                      : project.type === 'Upcoming'  ? 'border-yellow-500'
                      : 'border-cyan-500';

    return `
      <a href="${finalLink}" class="project-card flex flex-col bg-gray-800 rounded-xl shadow-lg overflow-hidden
                                    transition-transform transform hover:scale-[1.02] border-t-4 ${borderColor}">
        <div class="block relative h-72 overflow-hidden">
          <img src="${imagePath}" alt="${project.title}"
               class="w-full h-full object-cover transition duration-300 ease-in-out hover:opacity-80"
               onerror="this.onerror=null;this.src='img/logohmte.png';">
          <div class="absolute top-0 left-0 bg-gray-900 bg-opacity-70 text-xs text-white px-3 py-1 m-2 rounded-full font-bold">
            ${project.type.toUpperCase()}
          </div>
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <h3 class="text-xl font-bold text-white mb-2">${project.title}</h3>
          <p class="text-gray-400 text-sm mb-3 flex-grow">${description}</p>
          <p class="text-gray-500 text-xs mt-2">${project.type}: ${project.statusText}</p>
          <span class="text-green-400 mt-2 text-sm font-semibold">${linkText}</span>
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
