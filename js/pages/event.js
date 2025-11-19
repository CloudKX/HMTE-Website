// File: js/pages/event.js

// Pastikan eventsData dari calendar.js sudah dimuat
if (typeof eventsData === "undefined") {
  console.error("eventsData belum dimuat. Pastikan calendar.js di-load sebelum event.js.");
}

/**
 * Fungsi untuk mengubah YYYY-MM-DD menjadi format cantik
 */
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString.replace(/-/g, "/"));
  return date.toLocaleDateString("id-ID", options);
}

// === FUNGSI REUSABLE: POSTER CARD MARKUP (STANDARD) ===
function createEventCardHTML(event, isArchived = false) {
  let imagePath = event.imgSrc ? `/${event.imgSrc.replace(/^\//, "")}` : "/img/logohmte.png";
  const formattedDate = formatDate(event.date);

  let actionButtonHTML = "";
  if (isArchived) {
    actionButtonHTML = "";
  } else if (event.registrationLink) {
    actionButtonHTML = `
        <button onclick="window.open('${event.registrationLink}', '_blank')" class="mt-auto px-3 py-1 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-sm w-full">
            Daftar Sekarang
        </button>
      `;
  } else {
    actionButtonHTML = `
        <p class="mt-auto text-center text-gray-500 text-xs italic py-2">Pendaftaran segera dibuka.</p>
      `;
  }

  const borderColorClass = isArchived ? "border-gray-700 opacity-75 hover:opacity-100" : event.color === "green" ? "border-emerald-500" : event.color === "blue" ? "border-cyan-500" : "border-yellow-500";

  return `
      <div class="flex flex-col rounded-xl overflow-hidden
                  border ${borderColorClass}
                  transition-all duration-500
                  hover:shadow-lg hover:scale-[1.02]
                  cursor-default bg-gray-900 w-full max-w-xs mx-auto h-full"> 

          <div class="flex items-center justify-center bg-black relative"
               style="width: 100%; aspect-ratio: 9/12; overflow: hidden;">
              <img src="${imagePath}" 
                  alt="${event.title}" 
                  style="width: 100%; height: 100%; object-fit: cover;"
                  class="transition-transform duration-500 ${isArchived ? "grayscale hover:grayscale-0" : "hover:scale-105"}" 
                  onerror="this.onerror=null;this.src='/img/logohmte.png';" />
          </div>

          <div class="p-4 flex flex-col flex-1 bg-gray-900">
              <h3 class="text-sm font-bold text-white mb-2 line-clamp-2">${event.title}</h3>
              <div class="text-gray-300 text-xs mb-4 space-y-2">
                  <p><i class="far fa-calendar-alt mr-2 text-cyan-400"></i> ${formattedDate}</p>
                  <p><i class="fas fa-clock mr-2 text-cyan-400"></i> ${event.time}</p>
                  <p class="truncate"><i class="fas fa-map-marker-alt mr-2 text-cyan-400"></i> ${event.location}</p>
              </div>
              ${actionButtonHTML}
          </div>
      </div>
    `;
}

// === LOGIKA RENDER UTAMA ===

function loadEventListPage() {
  const featuredListContainer = document.getElementById("featured-events-list");
  const currentEventContainer = document.getElementById("current-event-register");
  const archiveSection = document.getElementById("div-tiga-events");

  if (!featuredListContainer || !currentEventContainer || !archiveSection || typeof eventsData === "undefined") return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter Data
  const upcomingEvents = eventsData.filter((event) => new Date(event.date).setHours(0, 0, 0, 0) >= today.getTime()).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = eventsData.filter((event) => new Date(event.date).setHours(0, 0, 0, 0) < today.getTime()).sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- BAGIAN 1: EVENT UTAMA & DAFTAR ---
  currentEventContainer.innerHTML = "";
  featuredListContainer.innerHTML = "";

  if (upcomingEvents.length === 0) {
    currentEventContainer.innerHTML = '<p class="text-gray-400 text-center">Saat ini tidak ada event yang akan datang.</p>';
    featuredListContainer.innerHTML = '<p class="text-gray-400 col-span-3 text-center">Nantikan update selanjutnya!</p>';
  } else {
    // 1. Render Event Utama (Index 0)
    const mainEvent = upcomingEvents[0];
    currentEventContainer.innerHTML = renderCurrentEvent(mainEvent);

    // 2. Render Sisa Event
    const otherUpcomingEvents = upcomingEvents.slice(1, 7);
    if (otherUpcomingEvents.length > 0) {
      featuredListContainer.innerHTML = otherUpcomingEvents.map((e) => createEventCardHTML(e, false)).join("");
    } else {
      featuredListContainer.innerHTML = '<p class="text-gray-500 col-span-3 text-center italic">Hanya satu event yang sedang aktif saat ini.</p>';
    }
  }

  // --- BAGIAN 2: ARSIP EVENT ---
  const archiveLimit = 8;
  const displayedArchives = pastEvents.slice(0, archiveLimit);

  let archiveHTML = `
      <h2 class="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-2">🔗 Arsip Kegiatan</h2>
      <p class="text-gray-400 mb-8">Dokumentasi kegiatan HMTE yang telah terlaksana.</p>
  `;

  if (displayedArchives.length === 0) {
    archiveHTML += '<p class="text-gray-500 italic">Belum ada arsip kegiatan.</p>';
  } else {
    archiveHTML += `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${displayedArchives.map((e) => createEventCardHTML(e, true)).join("")}
        </div>
      `;

    if (pastEvents.length > archiveLimit) {
      archiveHTML += `
            <div class="text-center mt-8">
                <button class="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition">
                    Lihat Arsip Lebih Lama
                </button>
            </div>
          `;
    }
  }
  archiveSection.innerHTML = archiveHTML;
}

/**
 * Render markup untuk Event Utama (Tampilan Lebih Kalem)
 */
function renderCurrentEvent(event) {
  const formattedDate = formatDate(event.date);
  const imagePath = event.imgSrc ? `/${event.imgSrc.replace(/^\//, "")}` : "/img/logohmte.png";

  let primaryButtonHTML = "";
  if (event.registrationLink) {
    primaryButtonHTML = `
          <a href="${event.registrationLink}" target="_blank"
             class="inline-block w-full text-center px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md">
              Daftar Sekarang
          </a>
      `;
  } else {
    primaryButtonHTML = `
          <div class="w-full text-center px-6 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg border border-gray-600 text-sm">
              Info Segera
          </div>
      `;
  }

  // PERUBAHAN TAMPILAN:
  // 1. Border standar hijau (border-green-500), tidak ada shadow glow yang berlebihan.
  // 2. Label "EVENT TERDEKAT" dengan warna hijau standar.
  // 3. Ikon kembali ke warna tema cyan/hijau.

  return `
      <div class="flex flex-col rounded-xl overflow-hidden
                  border-2 border-green-500 shadow-lg
                  bg-gray-900 w-full max-w-sm mx-auto transform transition-transform hover:scale-[1.01]"> 

          <div class="flex items-center justify-center bg-black relative"
               style="width: 100%; aspect-ratio: 9/12; overflow: hidden;">
              
              <div class="absolute top-0 left-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 shadow-md">
                  EVENT TERDEKAT
              </div>

              <img src="${imagePath}" 
                  alt="${event.title}" 
                  style="width: 100%; height: 100%; object-fit: cover;"
                  onerror="this.onerror=null;this.src='/img/logohmte.png';" />
          </div>

          <div class="p-5 flex flex-col flex-1 bg-gray-900">
              <h3 class="text-lg font-bold text-white mb-2">${event.title}</h3>
              
              <p class="text-gray-400 text-sm mb-4 line-clamp-2">${event.description}</p>

              <div class="text-gray-300 text-sm mb-6 space-y-2 border-t border-gray-800 pt-3">
                  <p><i class="far fa-calendar-alt mr-2 text-cyan-400"></i> ${formattedDate}</p>
                  <p><i class="fas fa-clock mr-2 text-cyan-400"></i> ${event.time}</p>
                  <p class="truncate"><i class="fas fa-map-marker-alt mr-2 text-cyan-400"></i> 
                     <a href="${event.locationLink}" target="_blank" class="hover:text-cyan-300 transition">${event.location}</a>
                  </p>
              </div>
              
              ${primaryButtonHTML}
          </div>
      </div>
  `;
}

// Eksekusi
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path === "/page/event/event.html") {
    setTimeout(() => {
      loadEventListPage();
    }, 100);
  }
});

window.loadEventListPage = loadEventListPage;
