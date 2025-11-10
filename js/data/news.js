/**
 * Data Berita HMTE
 * Format tanggal: YYYY-MM-DD untuk sorting otomatis
 */
const newsData = [
  {
    id: 1,
    title: "Electrical Graduation",
    date: "2025-02-22",
    category: "Graduation",
    image: "img/news/NewsCover-Graduation.webp",
    description: "HMTE Unsoed kembali melaksanakan Electrical Graduation periode Februari 2025, mengawal 16 wisudawan dan wisudawati dari angkatan 2020 dan 2021.",
    link: "page/news-detail/graduation.html",
  },
  {
    id: 2,
    title: "Electrical for Society",
    date: "2025-03-12",
    category: "Humas",
    image: "img/news/NewsCover-EFS.webp",
    description: "Himpunan Mahasiswa Teknik Elektro (HMTE) telah berhasil melaksanakan program kerja unggulannya, Electrical for Society (EFS).",
    link: "page/news-detail/efs.html",
  },
  {
    id: 3,
    title: "Sosialisasi PKM",
    date: "2025-04-05",
    category: "PKM Center",
    image: "img/news/NewsCover-SosPKM.webp",
    description: "Sosialisasi dilakukan untuk membekali KBTE sebelum mengikuti Program Kreativitas Mahasiswa yang diadakan setiap tahunnya.",
    link: "page/news-detail/pkm.html",
  },
  // Tambahkan berita baru di sini
  // {
  //   id: 4,
  //   title: "Judul Berita Baru",
  //   date: "2025-05-10",
  //   category: "Kategori",
  //   image: "img/news/cover-baru.webp",
  //   description: "Deskripsi berita...",
  //   link: "page/news-detail/baru.html"
  // }
];

/**
 * Fungsi untuk format tanggal ke bahasa Indonesia
 */
function formatDate(dateString) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Fungsi untuk render berita
 */
function renderNews() {
  const newsContainer = document.getElementById("news-container");

  if (!newsContainer) {
    console.warn("News container tidak ditemukan");
    return;
  }

  // Sort berita dari yang terbaru
  const sortedNews = newsData.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Generate HTML untuk setiap berita
  const newsHTML = sortedNews
    .map(
      (news) => `
    <div
      class="flex flex-col rounded-xl overflow-hidden border border-transparent transition-all duration-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/40 cursor-pointer"
      onclick="window.location.href='${news.link}'"
    >
      <!-- Gambar -->
      <div class="overflow-hidden rounded-xl shadow-lg flex items-center justify-center bg-black" style="width: 100%; height: 220px; flex-shrink: 0">
        <img 
          src="${news.image}" 
          alt="${news.title}" 
          style="width: 100%; height: 100%; object-fit: cover" 
          class="transition-transform duration-500 hover:scale-105"
          onerror="this.src='img/placeholder.jpg'"
        />
      </div>

      <!-- Isi -->
      <div class="mt-4 flex flex-col flex-1 p-4">
        <p class="text-xs font-semibold text-cyan-400 mb-1">
          ${formatDate(news.date)} • ${news.category}
        </p>
        <h3 class="font-bold text-white text-lg mb-2">${news.title}</h3>
        <p class="text-gray-300 text-sm leading-relaxed">${news.description}</p>
      </div>
    </div>
  `
    )
    .join("");

  newsContainer.innerHTML = newsHTML;
  console.log(`✅ ${sortedNews.length} berita berhasil ditampilkan`);
}
