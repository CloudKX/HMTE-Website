// ═══════════════════════════════════════════════════════════
//  TIMELINE CALENDAR — Load dari JSON
//  Membaca: js/data/json/timeline.json
// ═══════════════════════════════════════════════════════════

(function() {
  let timelineData = [];
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Fetch timeline data dari JSON
  async function loadTimelineData() {
    try {
      const response = await fetch('/js/data/json/timeline.json');
      if (!response.ok) throw new Error('Failed to load timeline data');
      const data = await response.json();
      timelineData = data.items || [];
      initCalendar();
    } catch (error) {
      console.error('[Timeline] Error loading data:', error);
      // Fallback ke empty array
      timelineData = [];
      initCalendar();
    }
  }

  // Render kalender bulanan
  function initCalendar() {
    renderCalendar(currentMonth, currentYear);
  }

  function renderCalendar(month, year) {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');

    if (!calendarGrid || !monthYearDisplay) return;

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Bersihkan grid
    calendarGrid.innerHTML = '';

    // Dapatkan hari pertama dan jumlah hari
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Render hari sebelumnya (gray)
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayEl = createDayElement(day, month - 1, year, true);
      calendarGrid.appendChild(dayEl);
    }

    // Render hari bulan ini
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = createDayElement(day, month, year, false);
      calendarGrid.appendChild(dayEl);
    }

    // Render hari bulan berikutnya (gray)
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 baris × 7 hari
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = createDayElement(day, month + 1, year, true);
      calendarGrid.appendChild(dayEl);
    }
  }

  function createDayElement(day, month, year, isGray) {
    const dayEl = document.createElement('div');
    const dateStr = formatDateString(day, month, year);
    const eventsOnDay = timelineData.filter(e => e.date === dateStr);

    dayEl.className = `
      p-1.5 md:p-2.5 text-center rounded-lg cursor-pointer text-sm md:text-base
      transition-all duration-200 ${
      isGray
        ? 'text-gray-600 bg-gray-900 opacity-40'
        : 'text-white hover:bg-green-600/20 hover:border-green-500 border border-green-600/20'
    } ${eventsOnDay.length > 0 ? 'bg-green-600/30 border-green-500/50 font-bold' : ''}
    `;

    dayEl.textContent = day;
    dayEl.style.fontSize = 'clamp(0.75rem, 2vw, 1rem)';

    if (!isGray) {
      dayEl.addEventListener('click', () => {
        if (eventsOnDay.length > 0) {
          showEventDetails(eventsOnDay);
        } else {
          showEventDetails([]);
        }
      });
    }

    return dayEl;
  }

  function formatDateString(day, month, year) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function showEventDetails(events) {
    const detailsEl = document.getElementById('event-details');
    if (!detailsEl) return;

    if (events.length === 0) {
      detailsEl.innerHTML = '<p style="color: rgba(156,163,175,0.55); font-size:0.8rem;">Tidak ada kegiatan pada tanggal ini.</p>';
      return;
    }

    let html = '<div style="text-align: left;">';
    events.forEach(event => {
      html += `
        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="color: #10b981; font-weight: 700; font-size: 0.9rem;">${event.title}</div>
          <div style="color: rgba(156,163,175,0.7); font-size: 0.75rem; margin-top: 4px;">${event.description}</div>
          ${event.location ? `<div style="color: rgba(156,163,175,0.6); font-size: 0.75rem; margin-top: 4px;">📍 ${event.location}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
    detailsEl.innerHTML = html;
  }

  // Change month handlers
  window.changeMonth = function(direction) {
    currentMonth += direction;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    } else if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  };

  // Populate upcoming events sidebar
  function updateUpcomingEvents() {
    const upcomingContainer = document.getElementById('upcoming-events');
    if (!upcomingContainer) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = timelineData
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5); // Ambil 5 terdekat

    if (upcomingEvents.length === 0) {
      upcomingContainer.innerHTML = '<p style="color: rgba(156,163,175,0.45); font-size:0.82rem;">Belum ada kegiatan mendatang.</p>';
      return;
    }

    upcomingContainer.innerHTML = '';
    upcomingEvents.forEach(event => {
      const date = new Date(event.date);
      const dateStr = date.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' });

      const itemEl = document.createElement('div');
      itemEl.className = 'p-3 rounded-lg bg-gray-800/50 border border-green-600/20 hover:border-green-500/50 transition-all';
      itemEl.innerHTML = `
        <div style="color: #10b981; font-weight: 700; font-size: 0.85rem;">${event.title}</div>
        <div style="color: rgba(156,163,175,0.6); font-size: 0.75rem; margin-top: 4px;">📅 ${dateStr}</div>
        ${event.location ? `<div style="color: rgba(156,163,175,0.6); font-size: 0.75rem; margin-top: 2px;">📍 ${event.location}</div>` : ''}
      `;
      upcomingContainer.appendChild(itemEl);
    });
  }

  // Init ketika DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadTimelineData();
      updateUpcomingEvents();
    });
  } else {
    loadTimelineData();
    updateUpcomingEvents();
  }

  // Export untuk testing
  window.timelineApp = {
    loadTimelineData,
    renderCalendar,
    updateUpcomingEvents
  };
})();
