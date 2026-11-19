/* Kalkulator Pemborosan Energi
   Energi (kWh) = Daya (Watt) x Jam / 1000. Semua angka di bawah adalah ASUMSI kalkulator, bukan hasil pengukuran. */
(() => {
  const TARIF = 1500;      // Rp per kWh
  const EMISI = 0.8;       // kg CO2 per kWh
  const HARI_ALAT = 30;    // hari per bulan (kalkulator 1)
  const KG_POHON = 22;     // perkiraan kg CO2 diserap satu pohon per tahun
  const $ = (id) => document.getElementById(id);
  const fmt = (v, d = 1) => v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

  function impact(kwh) {
    const co2 = kwh * EMISI;
    const pohon = Math.max(1, Math.round(co2 / KG_POHON));
    return {
      kwh: `${fmt(kwh)} kWh/bulan`,
      rp: `Rp ${Math.round(kwh * TARIF).toLocaleString('id-ID')} /bulan`,
      co2: `${fmt(co2)} kg CO₂`,
      pohon: `Dibutuhkan sekitar ${pohon} pohon untuk menyerap emisi ini selama setahun (asumsi ±${KG_POHON} kg CO₂ per pohon per tahun).`,
    };
  }

  // Kalkulator 1: satu alat, banyak ruang kelas
  const form = $('formAlat');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const watt = parseFloat($('alatWatt').value);
    const jam = parseFloat($('alatJam').value);
    const kelas = parseInt($('alatKelas').value, 10);
    const err = $('alatErr'), box = $('alatHasil');
    let msg = '';
    if (!(watt > 0)) msg = 'Isi daya listrik (Watt) dengan angka lebih dari 0.';
    else if (!(jam > 0 && jam <= 24)) msg = 'Lama menyala harus antara 0 dan 24 jam per hari.';
    else if (!(kelas >= 1)) msg = 'Jumlah kelas/ruangan minimal 1.';
    err.hidden = !msg; err.textContent = msg;
    if (msg) { box.hidden = true; return; }
    const nama = $('alatNama').value.trim();
    const r = impact((watt * jam * HARI_ALAT * kelas) / 1000);
    $('aKwh').textContent = r.kwh; $('aRp').textContent = r.rp; $('aCo2').textContent = r.co2;
    $('aPohon').textContent = `${nama ? `${nama}: ` : ''}${r.pohon}`;
    box.hidden = false;
  });

  // Kalkulator 2: PC/alat standby, hasil langsung berubah saat input digeser
  const lab = () => {
    const watt = parseFloat($('labAlat').value);
    const unit = parseInt($('labUnit').value, 10);
    const jam = parseInt($('labJam').value, 10);
    const hari = parseInt($('labHari').value, 10);
    $('labUnitVal').textContent = `${unit} unit`;
    $('labJamVal').textContent = `${jam} jam/hari`;
    const r = impact((watt * unit * jam * hari) / 1000);
    $('lKwh').textContent = r.kwh; $('lRp').textContent = r.rp; $('lCo2').textContent = r.co2; $('lPohon').textContent = r.pohon;
  };
  ['labAlat', 'labUnit', 'labJam', 'labHari'].forEach((id) => $(id).addEventListener('input', lab));
  lab();
})();
