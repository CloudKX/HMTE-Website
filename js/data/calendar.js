// js/data/calendar.js
// Versi CMS: eventsData di-fetch dari /js/data/json/events.json.
// Semua fungsi render (renderCalendar, showEventDetails, dll) TIDAK BERUBAH.

const EVENTS_JSON_PATH = '/js/data/json/events.json';

// ── Cache global agar bisa diakses oleh event.js & home.js ───────────────────
window._eventsCache = null;

async function loadEventsData() {
  if (window._eventsCache) return window._eventsCache;
  try {
    const res  = await fetch(EVENTS_JSON_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    window._eventsCache = json.items || [];
    return window._eventsCache;
  } catch (e) {
    console.error('[calendar.js] Gagal fetch events:', e.message);
    window._eventsCache = [];
    return [];
  }
}

// ── State Calendar ────────────────────────────────────────────────────────────
let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();

// ── Helper Functions (tidak berubah) ─────────────────────────────────────────
function getDaysInMonth(month, year)  { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(month, year) { return new Date(year, month, 1).getDay(); }
function getMonthName(month) {
  return ['Januari','Februari','Maret','April','Mei','Juni',
          'Juli','Agustus','September','Oktober','November','Desember'][month];
}

function hasEvent(day, month, year) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return (window._eventsCache || []).find((e) => e.date === dateStr);
}

// ── Render Kalender ───────────────────────────────────────────────────────────
function renderCalendar() {
  const calendarGrid      = document.getElementById('calendar-grid');
  const monthYearDisplay  = document.getElementById('month-year-display');
  if (!calendarGrid || !monthYearDisplay) return;

  monthYearDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
  calendarGrid.innerHTML = '';

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay    = getFirstDayOfMonth(currentMonth, currentYear);
  const colorMap    = { green: 'bg-green-600', blue: 'bg-cyan-600', yellow: 'bg-yellow-500' };

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += `<div class="p-2 text-center text-gray-700 text-sm"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const event   = hasEvent(day, currentMonth, currentYear);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;

    let classes = 'p-2 text-center text-white hover:bg-gray-700 rounded-lg cursor-pointer transition transform hover:scale-105 text-sm relative bg-gray-700';
    if (isToday) {
      classes = classes.replace('bg-gray-700', 'bg-cyan-600 font-bold').replace('hover:bg-gray-700', 'hover:bg-cyan-700');
    }
    if (event && !isToday) {
      const eventBg = colorMap[event.color] || 'bg-green-600';
      classes = classes.replace('bg-gray-700', eventBg).replace('hover:bg-gray-700', 'hover:bg-gray-800');
    } else if (event && isToday) {
      classes += ' ring-2 ring-green-400';
    }

    const dotColor = event ? (colorMap[event.color] || 'bg-green-600') : 'bg-transparent';
    const eventDot = event ? `<div class="absolute bottom-1 right-1 w-2 h-2 ${dotColor} rounded-full"></div>` : '';

    calendarGrid.innerHTML += `
      <div class="${classes}" onclick="showEventDetails('${dateStr}')">
        ${day}${eventDot}
      </div>`;
  }

  const totalCells     = firstDay + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < remainingCells; i++) {
    calendarGrid.innerHTML += `<div class="p-2 text-center text-gray-700 text-sm"></div>`;
  }
}

// ── Detail Event ──────────────────────────────────────────────────────────────
function showEventDetails(dateStr) {
  const eventsData          = window._eventsCache || [];
  const event               = eventsData.find((e) => e.date === dateStr);
  const eventDetailsContainer = document.getElementById('event-details');
  if (!eventDetailsContainer) return;

  const [y, m, d]   = dateStr.split('-');
  const eventDate   = new Date(y, m - 1, d);
  const formattedDate = `${eventDate.getDate()} ${getMonthName(eventDate.getMonth())} ${eventDate.getFullYear()}`;

  const borderColorMap = { green: 'border-green-500', blue: 'border-cyan-500', yellow: 'border-yellow-500', gray: 'border-gray-500' };
  const borderColor    = borderColorMap[event?.color || 'gray'];
  // Cek apakah event sudah selesai (tanggal < hari ini)
  const _evDate      = new Date(dateStr); _evDate.setHours(0,0,0,0);
  const _today       = new Date(); _today.setHours(0,0,0,0);
  const _isCompleted = event && _evDate < _today;

  let actionButton = '';
  if (event) {
    if (_isCompleted) {
      const docUrl = event.driveLink || event.link || null;
      actionButton = docUrl
        ? `<a href="${docUrl}" target="_blank" class="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition text-sm font-semibold border border-gray-600">📁 Lihat Dokumentasi</a>`
        : `<span class="text-gray-600 text-xs italic">Tidak ada dokumentasi.</span>`;
    } else {
      actionButton = event.registrationLink
        ? `<a href="${event.registrationLink}" target="_blank" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-semibold">🎟️ Daftar</a>`
        : `<span class="text-gray-500 text-xs italic">Pendaftaran segera dibuka.</span>`;
    }
  }

  if (event) {
    eventDetailsContainer.innerHTML = `
      <div class="bg-gray-900 rounded-lg p-4 border-l-4 ${borderColor}">
        <p class="text-gray-400 text-sm mb-1">Tanggal: <span class="text-white font-semibold">${formattedDate}</span></p>
        <h4 class="text-white font-bold text-lg mb-2">${event.title}</h4>
        <p class="text-gray-300 text-sm mb-2">${event.description}</p>
        <div class="text-cyan-400 text-xs mb-1"><i class="fas fa-clock mr-1"></i> ${event.time}</div>
        <div class="text-cyan-400 text-xs mb-4"><i class="fas fa-map-marker-alt mr-1"></i> ${event.location}</div>
        ${actionButton}
      </div>`;
  } else {
    eventDetailsContainer.innerHTML = `
      <div class="bg-gray-900 rounded-lg p-4 text-center text-gray-400">
        ${formattedDate}: Tidak ada kegiatan terjadwal
      </div>`;
  }
}

// ── Upcoming Events Sidebar ───────────────────────────────────────────────────
function displayUpcomingEvents() {
  const upcomingContainer = document.getElementById('upcoming-events');
  if (!upcomingContainer) return;

  const eventsData = window._eventsCache || [];
  const today      = new Date(); today.setHours(0, 0, 0, 0);

  const upcoming = eventsData
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (!upcoming.length) {
    upcomingContainer.innerHTML = '<p class="text-gray-400 text-sm">Tidak ada kegiatan mendatang</p>';
    return;
  }

  const colorMap = { green: 'bg-green-600', blue: 'bg-cyan-600', yellow: 'bg-yellow-500' };

  upcomingContainer.innerHTML = upcoming.map((event) => {
    const eventDate = new Date(event.date);
    const day       = eventDate.getDate();
    const month     = getMonthName(eventDate.getMonth()).substring(0, 3);
    const bgColor   = colorMap[event.color] || 'bg-gray-600';
    return `
      <div class="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition cursor-pointer"
           onclick="showEventDetails('${event.date}')">
        <div class="flex items-start gap-3">
          <div class="${bgColor} rounded-lg p-2 text-center min-w-[50px] shadow-md">
            <div class="text-white font-bold text-xl">${day}</div>
            <div class="text-white text-xs">${month}</div>
          </div>
          <div class="flex-1">
            <h5 class="text-white font-semibold text-sm mb-1">${event.title}</h5>
            <p class="text-gray-400 text-xs mb-1">${event.time}</p>
            <p class="text-cyan-400 text-xs"><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</p>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Navigasi Bulan ────────────────────────────────────────────────────────────
function changeMonth(direction) {
  currentMonth += direction;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
  displayUpcomingEvents();
}

// ── Inisialisasi (dipanggil loader.js via window.initCalendar) ────────────────
window.initCalendar = async function () {
  await loadEventsData(); // ← fetch dulu, baru render

  renderCalendar();
  displayUpcomingEvents();

  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstUpcoming = (window._eventsCache || [])
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (firstUpcoming) showEventDetails(firstUpcoming.date);
};

window.changeMonth      = changeMonth;
window.showEventDetails = showEventDetails;
window.loadEventsData   = loadEventsData;  // expose agar bisa dipakai event.js & home.js
