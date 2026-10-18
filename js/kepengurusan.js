/* =====================================================================
   kepengurusan.js — data divisi + popup + carousel filosofi
   Tanpa library. Untuk mengubah isi: edit DIVISI / DEPT di bawah.
   Foto divisi: taruh di img/kepengurusan/<folder>/<nomor>.webp
   ===================================================================== */
(function () {
  'use strict';

  var IMG = 'img/kepengurusan/';

  // Pasangan warna gradasi ikon (terang, gelap)
  var G = {
    yellow: ['#ca8a04', '#854d0e'], emerald: ['#059669', '#065f46'], blue: ['#2563eb', '#1e40af'],
    teal: ['#0d9488', '#115e59'], indigo: ['#4f46e5', '#3730a3'], purple: ['#9333ea', '#6b21a8'],
    red: ['#dc2626', '#991b1b'], orange: ['#ea580c', '#9a3412'], pink: ['#db2777', '#9d174d']
  };

  // p('bph', 1, 4, 5) -> ['img/kepengurusan/bph/1.webp', '.../4.webp', '.../5.webp']
  function p(folder) {
    var out = [];
    for (var i = 1; i < arguments.length; i++) out.push(IMG + folder + '/' + arguments[i] + '.webp');
    return out;
  }

  // ---------------------------------------------------------------------
  // DATA DIVISI (tampil di popup)
  // ---------------------------------------------------------------------
  var DIVISI = {
    // ── BPH ──
    bph_ketua: {
      title: 'KAHIM', icon: 'fa-star', color: 'yellow', images: p('kahim', 1),
      desc: 'Ketua HMTE UNSOED memimpin secara struktural melalui fungsi manajerial: perencanaan, pengarahan, dan pengawasan. Selain memiliki hak delegasi, Ketua juga menjadi penanggung jawab utama seluruh kinerja himpunan.'
    },
    bph_wakil: {
      title: 'WAKAHIM', icon: 'fa-star-half-alt', color: 'yellow', images: p('wakahim', 1),
      desc: 'Wakil Ketua mendampingi Ketua dalam menjalankan roda organisasi, mengkoordinasikan antar departemen, serta menggantikan peran Ketua saat dibutuhkan.'
    },
    bph_bendahara: {
      title: 'Bendahara', icon: 'fa-coins', color: 'emerald', images: p('bph', 1, 4, 5),
      desc: 'Bendahara Umum bertanggung jawab atas pengelolaan dan administrasi keuangan organisasi, serta melakukan transparansi dana setiap bulan.'
    },
    bph_sekretaris: {
      title: 'Sekretaris', icon: 'fa-file-alt', color: 'blue', images: p('bph', 1, 2, 3),
      desc: 'Sekretaris Umum bertugas mengkoordinasi administrasi surat-menyurat, jadwal program kerja, serta memastikan kesesuaian pelaksanaan dengan TOR.'
    },

    // ── Pengembangan Mahasiswa ──
    mikat: {
      title: 'Minat dan Bakat', icon: 'fa-gamepad', color: 'teal', images: p('mikat', 1, 2, 3, 4),
      desc: 'Divisi Mikat HMTE Unsoed hadir sebagai ruang kreatif bagi mahasiswa untuk menyalurkan minat sekaligus mengasah bakat. Lewat berbagai kegiatan, Mikat mendorong mahasiswa lebih percaya diri, produktif, dan berprestasi.'
    },
    psdm: {
      title: 'Pengembangan Sumber Daya Manusia', icon: 'fa-user-graduate', color: 'indigo', images: p('psdm', 1, 2, 3, 4, 5),
      desc: 'Divisi PSDM HMTE Unsoed hadir sebagai wadah pengembangan diri bagi mahasiswa. Melalui program pembinaan dan pelatihan, PSDM mendorong mahasiswa untuk aktif, tangguh, dan siap menghadapi tantangan.'
    },
    event: {
      title: 'Divisi Event', icon: 'fa-calendar-check', color: 'purple', images: p('event', 1, 2, 3, 4),
      desc: 'Divisi Event HMTE Unsoed berperan dalam melaksanakan berbagai kegiatan berskala besar himpunan, seperti Dies Natalis dan Seminar Nasional. Divisi ini bertanggung jawab menghadirkan acara yang kreatif, terstruktur, dan mampu membangun hubungan baik antara himpunan dengan masyarakat luas.'
    },

    // ── Kewirausahaan ──
    kwu: {
      title: 'Kewirausahaan', icon: 'fa-briefcase', color: 'purple', images: p('kwu', 1, 2, 3, 4, 5, 6),
      desc: 'KWU HMTE Unsoed adalah wadah bagi mahasiswa untuk menyalurkan ide, melatih keterampilan, dan merasakan pengalaman nyata di bidang bisnis. Lewat divisi ini, mahasiswa belajar membangun mindset entrepreneur yang visioner.'
    },

    // ── Iptek ──
    ristek: {
      title: 'Riset dan Teknologi', icon: 'fa-laptop-code', color: 'red', images: p('ristek', 1, 2, 3, 4, 5, 6, 7, 8),
      desc: 'Divisi Ristek HMTE Unsoed jadi ruang bagi mahasiswa Teknik Elektro untuk menuangkan ide, bereksperimen, dan menciptakan inovasi. Melalui karya kreatif dan pengembangan teknologi, Ristek hadir untuk membangun generasi yang inovatif.'
    },
    pendampingan: {
      title: 'Divisi Pendampingan', icon: 'fa-chalkboard-teacher', color: 'orange', images: p('pendampingan', 1, 2, 3, 4, 5, 6),
      desc: 'Divisi Pendampingan HMTE Unsoed hadir untuk memfasilitasi pengembangan akademik dan prestasi mahasiswa Teknik Elektro, mulai dari kompetisi mahasiswa berprestasi hingga program kreativitas, mendorong setiap anggota mencapai potensi terbaiknya.'
    },

    // ── Minfo ──
    medkominfo: {
      title: 'Media Informasi', icon: 'fa-newspaper', color: 'orange', images: p('minfo', 1, 2, 3, 4, 5, 6),
      desc: 'Divisi Media Informasi HMTE Unsoed adalah garda informasi sekaligus wajah digital organisasi. Lewat media sosial, menyampaikan pengetahuan, publikasi acara, hingga ucapan hari besar agar seluruh civitas HMTE selalu terhubung.'
    },
    medkreatif: {
      title: 'Media Kreatif', icon: 'fa-paint-brush', color: 'pink', images: p('medkre', 1, 2, 3, 4, 5),
      desc: 'Divisi Media Kreatif HMTE Unsoed bertanggung jawab dalam produksi konten visual dan kreatif himpunan, meliputi desain grafis, fotografi, videografi, serta berbagai karya kreatif yang memperkuat identitas visual HMTE.'
    },

    // ── Humaniora ──
    personalia: {
      title: 'Divisi Personalia', icon: 'fa-id-badge', color: 'blue', images: p('personalia', 1, 2, 3, 4, 5, 6),
      desc: 'Divisi Personalia adalah divisi yang bertanggung jawab dalam membangun, menjaga, dan mempererat hubungan kebersamaan serta keterikatan emosional Keluarga Besar Teknik Elektro, yang meliputi mahasiswa aktif, alumni, dan unsur pendukung lainnya.'
    },
    humas: {
      title: 'Hubungan Masyarakat', icon: 'fa-globe', color: 'blue', images: p('humas', 1, 2, 3, 4, 5, 6),
      desc: 'Divisi Humas HMTE Unsoed berperan sebagai garda depan dalam menjalin komunikasi dengan pihak internal maupun eksternal, sekaligus menjaga citra organisasi agar tetap dikenal, dipercaya, dan berkembang.'
    },
    internal: {
      title: 'Internal', icon: 'fa-home', color: 'pink', images: p('internal', 1, 2, 3, 4, 5, 6),
      desc: 'Divisi Internal HMTE Unsoed hadir untuk mempererat kebersamaan dan membangun solidaritas antar mahasiswa Teknik Elektro. Lewat berbagai program kerja, Internal menjadi ruang tumbuh yang mendukung mahasiswa berkembang.'
    }
  };

  // ---------------------------------------------------------------------
  // DATA DEPARTEMEN (modal "Pilih Divisi")
  // ---------------------------------------------------------------------
  var DEPT = {
    bph_inner: {
      title: 'BPH', sub: 'Badan Pengurus Harian', icon: 'fa-briefcase', grad: ['#eab308', '#a16207'],
      divisi: [
        { key: 'bph_bendahara', icon: 'fa-coins', color: '#34d399', label: 'Bendahara' },
        { key: 'bph_sekretaris', icon: 'fa-file-alt', color: '#60a5fa', label: 'Sekretaris' }
      ]
    },
    pengmah: {
      title: 'Pengembangan Mahasiswa', sub: '3 Divisi', icon: 'fa-users', grad: ['#14b8a6', '#0f766e'],
      divisi: [
        { key: 'mikat', icon: 'fa-gamepad', color: '#2dd4bf', label: 'Divisi Mikat' },
        { key: 'psdm', icon: 'fa-user-graduate', color: '#f472b6', label: 'Divisi PSDM' },
        { key: 'event', icon: 'fa-calendar-check', color: '#c084fc', label: 'Divisi Event' }
      ]
    },
    iptek: {
      title: 'Iptek', sub: '2 Divisi', icon: 'fa-microchip', grad: ['#ef4444', '#991b1b'],
      divisi: [
        { key: 'ristek', icon: 'fa-laptop-code', color: '#f87171', label: 'Divisi Ristek' },
        { key: 'pendampingan', icon: 'fa-chalkboard-teacher', color: '#fb923c', label: 'Divisi Pendampingan' }
      ]
    },
    minfo: {
      title: 'Minfo', sub: '2 Divisi', icon: 'fa-photo-video', grad: ['#f97316', '#c2410c'],
      divisi: [
        { key: 'medkominfo', icon: 'fa-newspaper', color: '#fb923c', label: 'Media Informasi' },
        { key: 'medkreatif', icon: 'fa-paint-brush', color: '#f472b6', label: 'Media Kreatif' }
      ]
    },
    humaniora: {
      title: 'Humaniora', sub: '3 Divisi', icon: 'fa-handshake', grad: ['#3b82f6', '#1d4ed8'],
      divisi: [
        { key: 'personalia', icon: 'fa-id-badge', color: '#60a5fa', label: 'Divisi Personalia' },
        { key: 'humas', icon: 'fa-globe', color: '#22d3ee', label: 'Divisi Humas' },
        { key: 'internal', icon: 'fa-home', color: '#f472b6', label: 'Divisi Internal' }
      ]
    }
  };

  // ---------------------------------------------------------------------
  // Util
  // ---------------------------------------------------------------------
  function $(id) { return document.getElementById(id); }
  function gradient(pair) { return 'linear-gradient(135deg,' + pair[0] + ',' + pair[1] + ')'; }
  function icon(cls, extra) {
    var i = document.createElement('i');
    i.className = 'fas ' + cls + (extra ? ' ' + extra : '');
    return i;
  }

  var lastTrigger = null;
  function lockScroll(on) { document.body.style.overflow = on ? 'hidden' : ''; }

  function openModal(el, trigger) {
    lastTrigger = trigger || document.activeElement;
    el.hidden = false;
    lockScroll(true);
    var c = el.querySelector('.kp-modal__close');
    if (c) c.focus({ preventScroll: true });
  }
  function closeModal(el) {
    if (el.hidden) return;
    el.hidden = true;
    if (document.querySelectorAll('.kp-modal:not([hidden])').length === 0) lockScroll(false);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }

  // ---------------------------------------------------------------------
  // Popup divisi
  // ---------------------------------------------------------------------
  var popup, popupImg, popupCount, images = [], idx = 0;

  function showImage(i) {
    if (!images.length) return;
    idx = (i + images.length) % images.length;
    popupImg.src = images[idx];
    popupCount.textContent = (idx + 1) + ' / ' + images.length;
    // siapkan foto berikutnya di latar belakang supaya geser terasa instan
    if (images.length > 1) new Image().src = images[(idx + 1) % images.length];
  }

  function openDivisi(key, trigger) {
    var d = DIVISI[key];
    if (!d) return;

    $('popupTitle').textContent = d.title;
    $('popupDescription').textContent = d.desc;

    var ic = $('popupIcon');
    ic.textContent = '';
    ic.style.background = gradient(G[d.color] || G.emerald);
    ic.appendChild(icon(d.icon));

    images = d.images;
    popupImg.alt = 'Foto ' + d.title;
    var multi = images.length > 1;
    $('popupPrev').hidden = !multi;
    $('popupNext').hidden = !multi;
    popupCount.hidden = !multi;
    showImage(0);

    openModal(popup, trigger);
    popup.querySelector('.kp-popup__body').scrollTop = 0;
  }

  // ---------------------------------------------------------------------
  // Modal pilih divisi
  // ---------------------------------------------------------------------
  var pick;

  function openDept(key, trigger) {
    var dep = DEPT[key];
    if (!dep) return;

    $('pickTitle').textContent = dep.title;
    $('pickSub').textContent = dep.sub;
    var ic = $('pickIcon');
    ic.textContent = '';
    ic.style.background = gradient(dep.grad);
    ic.appendChild(icon(dep.icon));

    var grid = $('pickGrid');
    grid.textContent = '';
    dep.divisi.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'kp-btn';
      b.dataset.pickDivisi = d.key;
      var i = icon(d.icon);
      i.style.color = d.color;
      b.appendChild(i);
      b.appendChild(document.createTextNode(d.label));
      grid.appendChild(b);
    });

    openModal(pick, trigger);
  }

  // ---------------------------------------------------------------------
  // Carousel Filosofi Logo (CSS scroll-snap)
  // ---------------------------------------------------------------------
  function initCarousel() {
    var track = $('kpSlides');
    if (!track) return;
    var slides = track.children, prev = $('kpPrev'), next = $('kpNext'), dots = $('kpDots');
    var n = slides.length, current = 0, ticking = false;

    for (var i = 0; i < n; i++) {
      (function (k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Slide ' + (k + 1));
        b.addEventListener('click', function () { go(k); });
        dots.appendChild(b);
      })(i);
    }

    function go(k) {
      k = Math.max(0, Math.min(n - 1, k));
      track.scrollTo({ left: k * track.clientWidth, behavior: 'smooth' });
    }
    function sync() {
      ticking = false;
      current = Math.round(track.scrollLeft / (track.clientWidth || 1));
      prev.disabled = current <= 0;
      next.disabled = current >= n - 1;
      for (var i = 0; i < dots.children.length; i++) {
        dots.children[i].setAttribute('aria-current', i === current ? 'true' : 'false');
      }
    }
    track.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(sync); }
    }, { passive: true });
    prev.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });
    window.addEventListener('resize', function () { track.scrollLeft = current * track.clientWidth; });
    sync();
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    popup = $('divisiPopup');
    popupImg = $('popupImage');
    popupCount = $('popupCount');
    pick = $('deptModal');

    initCarousel();

    // Satu listener untuk semua klik (tanpa onclick di HTML)
    document.addEventListener('click', function (e) {
      var t = e.target;
      var el = t.closest && t.closest('[data-divisi],[data-dept],[data-close],[data-pick-divisi],#popupPrev,#popupNext');
      if (!el) return;

      if (el.dataset.divisi) return openDivisi(el.dataset.divisi, el);
      if (el.dataset.dept) return openDept(el.dataset.dept, el);
      if (el.dataset.pickDivisi) { closeModal(pick); return openDivisi(el.dataset.pickDivisi, lastTrigger); }
      if (el.hasAttribute('data-close')) return closeModal(el.closest('.kp-modal'));
      if (el.id === 'popupPrev') return showImage(idx - 1);
      if (el.id === 'popupNext') return showImage(idx + 1);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(popup); closeModal(pick); }
      if (!popup.hidden && images.length > 1) {
        if (e.key === 'ArrowLeft') showImage(idx - 1);
        if (e.key === 'ArrowRight') showImage(idx + 1);
      }
    });

    // Geser foto dengan jari (HP)
    var startX = null;
    var media = popup.querySelector('.kp-popup__media');
    media.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    media.addEventListener('touchend', function (e) {
      if (startX === null || images.length < 2) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) showImage(idx + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
  });
})();
