document.addEventListener('DOMContentLoaded', async () => {
  let data = typeof DATA_ENERGI !== 'undefined' ? DATA_ENERGI : null; // cadangan untuk file:// (const tidak masuk ke window)
  try {
    const res = await fetch('data/data-perilaku-energi.json');
    if (res.ok) data = await res.json();
  } catch (e) { /* pakai data cadangan */ }

  if (!data) return console.error('Data perilaku energi gagal dimuat.');
  if (typeof Chart === 'undefined') {
    document.querySelectorAll('.chart-box').forEach((b) => {
      b.textContent = 'Grafik membutuhkan Chart.js (butuh koneksi internet). Muat ulang halaman saat online.';
    });
    return;
  }

  const C = { sb: '#2f6b4f', baik: '#9fb39a', cukup: '#b8924a', kurang: '#a5543f', em: '#0e4d3a', olive: '#6b7048', ink: '#1b2a21' };
  Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
  Chart.defaults.color = C.ink;
  const num = (n, d = 2) => Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  const wrap = (t, n = 26) => t.split(' ').reduce((l, w) => {
    const last = l[l.length - 1];
    if ((last + ' ' + w).length > n && last) l.push(w); else l[l.length - 1] = (last + ' ' + w).trim();
    return l;
  }, ['']);
  const grid = { color: 'rgba(29,58,43,.1)' };
  const tip = { backgroundColor: '#12281d', padding: 10, cornerRadius: 8 };
  const n = data.meta.jumlah_responden;

  // Legenda + donat distribusi kategori (angka diambil dari dataset)
  const kat = data.ringkasan.kategori;
  const names = Object.keys(kat);
  const cols = [C.sb, C.baik, C.cukup, C.kurang];
  const legend = document.getElementById('legend');
  if (legend) legend.innerHTML = names.map((k, i) =>
    `<li><i style="background:${cols[i]}"></i><span>${k}<em>${kat[k]} siswa</em></span><strong>${num(data.ringkasan.kategori_persen[k], 1)}%</strong></li>`).join('');
  new Chart('chartKategori', {
    type: 'doughnut',
    data: { labels: names, datasets: [{ data: names.map((k) => kat[k]), backgroundColor: cols, borderColor: '#faf8f2', borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '58%', plugins: { legend: { display: false }, tooltip: { ...tip,
      callbacks: { label: (i) => ` ${i.label}: ${i.raw} siswa (${num(i.raw / n * 100, 1)}%)` } } } },
  });

  // Rata-rata per indikator: tiga terendah disorot
  const low = new Set(data.ringkasan.sorotan.butir_terendah.map((b) => b.kode));
  const butir = data.per_butir;
  new Chart('chartButir', {
    type: 'bar',
    data: { labels: butir.map((b) => wrap(`${b.kode} ${b.label}`)), datasets: [{ data: butir.map((b) => b.rata_rata), borderRadius: 6,
      backgroundColor: butir.map((b) => (low.has(b.kode) ? C.cukup : C.em)) }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tip,
      callbacks: { label: (i) => ` Skor ${num(i.raw)} / 4,00`, afterLabel: (i) => ` Sering: ${num(butir[i.dataIndex].persen_sering, 1)}% | Jarang: ${num(butir[i.dataIndex].persen_jarang, 1)}%` } } },
      scales: { x: { min: 2.8, max: 3.6, grid, ticks: { callback: (v) => num(v, 1) } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } } },
  });

  // Perbandingan jurusan (PPLG disorot karena kelompok pembuat)
  const jur = [...data.per_jurusan].sort((a, b) => b.rata_rata_skor - a.rata_rata_skor);
  new Chart('chartJurusan', {
    type: 'bar',
    data: { labels: jur.map((j) => j.kode), datasets: [{ data: jur.map((j) => j.rata_rata_skor), borderRadius: 6, backgroundColor: jur.map((j) => (j.kode === 'PPLG' ? C.cukup : C.em)) }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tip,
      callbacks: { title: (i) => jur[i[0].dataIndex].nama, label: (i) => ` Skor ${num(i.raw)} / 4,00 (${jur[i.dataIndex].jumlah_responden} siswa)` } } },
      scales: { y: { min: 2.8, max: 3.6, grid, ticks: { callback: (v) => num(v, 1) } }, x: { grid: { display: false } } } },
  });

  // Rombel PPLG
  const rom = data.per_rombel.filter((r) => r.jurusan === 'PPLG').sort((a, b) => b.rata_rata_skor - a.rata_rata_skor);
  new Chart('chartRombel', {
    type: 'bar',
    data: { labels: rom.map((r) => r.rombel), datasets: [{ data: rom.map((r) => r.rata_rata_skor), borderRadius: 6, backgroundColor: C.olive }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tip,
      callbacks: { label: (i) => ` Skor ${num(i.raw)} / 4,00 (${rom[i.dataIndex].jumlah_responden} siswa)` } } },
      scales: { y: { min: 2.8, max: 3.6, grid, ticks: { callback: (v) => num(v, 1) } }, x: { grid: { display: false } } } },
  });
});
