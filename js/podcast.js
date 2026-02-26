// js/podcast.js
// =============================================================================
//  Fetch daftar video YouTube dari podcast.json lalu render sebagai thumbnail
//  yang bisa diklik — tampilan sesuai screenshot (grid 2 kolom, thumbnail YT).
//
//  Cara pakai di HTML:
//    <div id="podcast-container"></div>
//    <script src="/js/podcast.js"></script>
//
//  Data diambil dari: /js/data/json/podcast.json
//  Format JSON:
//    { "videos": [ { "id", "title", "youtubeId", "episode" }, ... ] }
// =============================================================================

const PODCAST_JSON_PATH = "/js/data/json/podcast.json";

// ── Helper: ambil thumbnail YouTube dari youtubeId ────────────────────────────
// YouTube menyediakan thumbnail gratis di URL standar ini.
// maxresdefault = kualitas tertinggi (1280×720).
// Fallback ke hqdefault (480×360) kalau maxres tidak tersedia.
function getYoutubeThumbnail(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

function getYoutubeUrl(youtubeId) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

// ── Render satu card thumbnail ────────────────────────────────────────────────
function createPodcastCardHTML(video) {
  const thumbnail  = getYoutubeThumbnail(video.youtubeId);
  const watchUrl   = getYoutubeUrl(video.youtubeId);
  // Fallback thumbnail kalau maxresdefault tidak ada
  const fallbackThumbnail = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return `
    <a href="${watchUrl}" target="_blank" rel="noopener noreferrer"
       class="podcast-card group relative block rounded-2xl overflow-hidden
              border border-gray-700 hover:border-green-500
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/20
              bg-gray-900">

      <!-- Thumbnail -->
      <div class="relative w-full aspect-video overflow-hidden bg-gray-800">
        <img
          src="${thumbnail}"
          alt="${video.title}"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onerror="this.src='${fallbackThumbnail}'"
        />

        <!-- Overlay gelap saat hover -->
        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>

        <!-- Tombol Play (replika YouTube) -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center
                      rounded-full bg-red-600 group-hover:bg-red-500
                      shadow-lg group-hover:scale-110 transition-all duration-300">
            <!-- SVG play icon — lebih tajam dari unicode ▶ -->
            <svg class="w-7 h-7 md:w-8 md:h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <!-- Badge Episode -->
        <div class="absolute bottom-3 right-3
                    bg-black/70 backdrop-blur-sm
                    text-white text-xs font-bold
                    px-2.5 py-1 rounded-full
                    border border-white/10">
          EPISODE ${video.episode}
        </div>
      </div>

      <!-- Judul di bawah thumbnail -->
      <div class="p-4">
        <p class="text-white text-sm font-semibold leading-snug line-clamp-2
                  group-hover:text-green-400 transition-colors duration-200">
          ${video.title}
        </p>
      </div>
    </a>
  `;
}

// ── Render semua video ke container ──────────────────────────────────────────
async function loadPodcastSection() {
  const container = document.getElementById("podcast-container");
  if (!container) return;

  // Loading state
  container.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12 text-gray-500 animate-pulse">
      <i class="fas fa-circle-notch fa-spin mr-2"></i> Memuat episode...
    </div>
  `;

  try {
    const res  = await fetch(PODCAST_JSON_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const videos = data.videos || [];

    if (videos.length === 0) {
      container.innerHTML = `
        <p class="col-span-full text-center text-gray-400">
          Belum ada episode yang tersedia.
        </p>
      `;
      return;
    }

    // Render cards — grid sudah diset di HTML, JS hanya inject card
    container.innerHTML = videos.map(createPodcastCardHTML).join("");

  } catch (e) {
    console.error("[podcast.js] Gagal fetch:", e.message);
    container.innerHTML = `
      <p class="col-span-full text-center text-red-400">
        Gagal memuat data podcast. Silakan refresh halaman.
      </p>
    `;
  }
}

// ── Expose ke global (dipanggil loader.js atau inline) ───────────────────────
window.loadPodcastSection = loadPodcastSection;

// Auto-run kalau container langsung ada saat script dimuat
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("podcast-container")) {
    loadPodcastSection();
  }
});