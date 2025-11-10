/**
 * Data Kegiatan Timeline
 * Format: YYYY-MM-DD
 */
const eventsData = [
  {
    id: 1,
    date: "2025-11-15",
    title: "Workshop Elektrikal",
    description: "Workshop mengenai dasar-dasar kelistrikan dan elektronika",
    time: "09:00 - 12:00 WIB",
    location: "Aula Teknik Elektro",
    color: "green",
  },
  {
    id: 2,
    date: "2025-11-20",
    title: "Seminar Nasional",
    description: "Seminar tentang perkembangan teknologi AI dalam bidang elektro",
    time: "13:00 - 16:00 WIB",
    location: "Gedung Convention Center",
    color: "blue",
  },
  {
    id: 3,
    date: "2025-11-25",
    title: "Rapat Koordinasi",
    description: "Rapat koordinasi pengurus HMTE",
    time: "19:00 - 21:00 WIB",
    location: "Sekretariat HMTE",
    color: "yellow",
  },
  // Tambahkan event baru di sini
];

/**
 * State Calendar
 */
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

/**
 * Fungsi untuk mendapatkan jumlah hari dalam bulan
 */
function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Fungsi untuk mendapatkan hari pertama dalam bulan (0 = Minggu, 6 = Sabtu)
 */
function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay();
}

/**
 * Fungsi untuk mendapatkan nama bulan
 */
function getMonthName(month) {
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return months[month];
}

/**
 * Fungsi untuk cek apakah tanggal memiliki event
 */
function hasEvent(day, month, year) {
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return eventsData.find((event) => event.date === dateStr);
}

/**
 * Fungsi untuk render kalender
 */
function renderCalendar() {
  const calendarGrid = document.getElementById("calendar-grid");
  const monthYearDisplay = document.getElementById("month-year-display");

  if (!calendarGrid || !monthYearDisplay) {
    console.warn("Calendar elements tidak ditemukan");
    return;
  }

  // Update display bulan/tahun
  monthYearDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;

  // Clear grid
  calendarGrid.innerHTML = "";

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);

  // Tanggal bulan sebelumnya
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    calendarGrid.innerHTML += `
      <div class="p-2 text-center text-gray-500 text-sm">${day}</div>
    `;
  }

  // Tanggal bulan ini
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const event = hasEvent(day, currentMonth, currentYear);
    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

    let classes = "p-2 text-center text-white hover:bg-green-600 rounded cursor-pointer transition text-sm relative";

    if (isToday) {
      classes += " bg-green-700 font-bold";
    }

    if (event) {
      classes += " bg-blue-900";
    }

    calendarGrid.innerHTML += `
      <div class="${classes}" onclick="showEventDetails('${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}')">
        ${day}
        ${event ? '<div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></div>' : ""}
      </div>
    `;
  }

  // Tanggal bulan berikutnya
  const totalCells = firstDay + daysInMonth;
  const remainingCells = 7 - (totalCells % 7);

  if (remainingCells < 7) {
    for (let day = 1; day <= remainingCells; day++) {
      calendarGrid.innerHTML += `
        <div class="p-2 text-center text-gray-500 text-sm">${day}</div>
      `;
    }
  }

  console.log(`✅ Kalender ${getMonthName(currentMonth)} ${currentYear} berhasil ditampilkan`);
}

/**
 * Fungsi untuk navigasi bulan
 */
function changeMonth(direction) {
  currentMonth += direction;

  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  renderCalendar();
  displayUpcomingEvents();
}

/**
 * Fungsi untuk tampilkan detail event
 */
function showEventDetails(dateStr) {
  const event = eventsData.find((e) => e.date === dateStr);
  const eventDetailsContainer = document.getElementById("event-details");

  if (!eventDetailsContainer) return;

  if (event) {
    eventDetailsContainer.innerHTML = `
      <div class="bg-gray-900 rounded-lg p-4">
        <h4 class="text-white font-bold text-lg mb-2">${event.title}</h4>
        <p class="text-gray-300 text-sm mb-2">${event.description}</p>
        <div class="text-cyan-400 text-xs mb-1">
          <i class="fas fa-clock mr-1"></i> ${event.time}
        </div>
        <div class="text-cyan-400 text-xs">
          <i class="fas fa-map-marker-alt mr-1"></i> ${event.location}
        </div>
      </div>
    `;
  } else {
    eventDetailsContainer.innerHTML = `
      <div class="bg-gray-900 rounded-lg p-4 text-center text-gray-400">
        Tidak ada kegiatan pada tanggal ini
      </div>
    `;
  }
}

/**
 * Fungsi untuk tampilkan upcoming events
 */
function displayUpcomingEvents() {
  const upcomingContainer = document.getElementById("upcoming-events");

  if (!upcomingContainer) return;

  // Filter event bulan ini dan yang akan datang
  const today = new Date();
  const upcoming = eventsData
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (upcoming.length === 0) {
    upcomingContainer.innerHTML = '<p class="text-gray-400 text-sm">Tidak ada kegiatan mendatang</p>';
    return;
  }

  const upcomingHTML = upcoming
    .map((event) => {
      const eventDate = new Date(event.date);
      const day = eventDate.getDate();
      const month = getMonthName(eventDate.getMonth()).substring(0, 3);

      return `
      <div class="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
        <div class="flex items-start gap-3">
          <div class="bg-green-600 rounded-lg p-2 text-center min-w-[50px]">
            <div class="text-white font-bold text-xl">${day}</div>
            <div class="text-white text-xs">${month}</div>
          </div>
          <div class="flex-1">
            <h5 class="text-white font-semibold text-sm mb-1">${event.title}</h5>
            <p class="text-gray-400 text-xs mb-1">${event.time}</p>
            <p class="text-cyan-400 text-xs">
              <i class="fas fa-map-marker-alt mr-1"></i>${event.location}
            </p>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  upcomingContainer.innerHTML = upcomingHTML;
}

/**
 * Expose functions ke global scope
 */
window.changeMonth = changeMonth;
window.showEventDetails = showEventDetails;
