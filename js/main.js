(() => {
  const PAGES = [
    ['index', 'index.html', 'Beranda'],
    ['data', 'data.html', 'Data & Fakta'],
    ['aksi', 'aksi.html', 'Aksi'],
    ['game', 'game.html', 'Mini Game'],
    ['tentang', 'tentang.html', 'Tentang'],
  ];
  const current = document.body.dataset.page;

  const nav = document.createElement('header');
  nav.className = 'nav';
  nav.innerHTML = `<a class="brand" href="index.html">Extro<b>va</b></a>
    <button class="burger" aria-expanded="false" aria-controls="menu">Menu</button>
    <ul id="menu">${PAGES.map(([id, href, label]) =>
      `<li><a href="${href}"${id === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul>`;
  document.body.prepend(nav);

  const burger = nav.querySelector('.burger');
  const menu = nav.querySelector('#menu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `<div class="wrap cols">
      <div><h4>Extrova</h4>
        <p>Kampanye konservasi dan hemat energi, proyek kolaboratif Edukasi Pembangunan Berkelanjutan (ESD) siswa kelas XI PPLG.</p>
        <p>SMK Wikrama Bogor</p></div>
      <div><h4>Jelajahi</h4><ul>${PAGES.map(([, href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></div>
      <div><h4>Sumber & kolaborasi</h4>
        <p>Data: Kuesioner ENERGI XI (Perilaku), 636 responden.</p>
        <p>Mapel: PABP, KIK, MTK, B. Indonesia, PP, Produktif PPLG.</p></div>
    </div>
    <div class="wrap copy">&copy; 2026 Tim Pengembang PPLG XI. Dibuat dengan HTML, CSS, JavaScript, dan Chart.js.</div>`;
  document.body.append(footer);

  // Scroll reveal (satu efek halus, hanya sekali per elemen)
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  // pembiassaan aksi
  const pledge = document.getElementById('pledge');
  if (pledge) {
    const boxes = [...pledge.querySelectorAll('input')];
    const out = pledge.querySelector('output');
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('extrova-pembiasaan') || '[]'); } catch (e) { /* abaikan */ }
    boxes.forEach((b, i) => { b.checked = saved.includes(i); });
    const update = () => {
      const picked = boxes.reduce((a, b, i) => (b.checked ? [...a, i] : a), []);
      try { localStorage.setItem('extrova-pembiasaan', JSON.stringify(picked)); } catch (e) { /* abaikan */ }
      out.textContent = picked.length === 0 ? 'Pilih minimal satu kebiasaan untuk memulai.'
        : picked.length < 3 ? `${picked.length} komitmen tercatat di perangkat ini. Tambah satu lagi?`
        : `Komitmenmu: ${picked.length} kebiasaan. Terima kasih sudah ikut menjaga energi sekolah.`;
    };
    boxes.forEach((b) => b.addEventListener('change', update));
    update();
  }
})();
