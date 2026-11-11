// Diagram panah dari himpunan A ke himpunan B.
// Prinsip cognitive load: maksimal 5 panah, tiap pasangan beda warna + beda pola garis + bernomor (EL03, DS03).
// Interaksi (mode 'bebas'): tarik dari anggota A ke anggota B, ATAU ketuk A lalu ketuk B. Ketuk panah untuk menghapus.

import { h, s } from '../ui.js';

const POLA_GARIS = ['', '9 4', '2 4', '9 3 2 3', '5 3'];
const JUMLAH_WARNA = 5;
const BARIS = 56;
const ATAS = 40;
const LEBAR = 320;
const CX_A = 74;
const CX_B = 246;
let nomorDiagram = 0;

function lebarPil(label) {
  return Math.min(110, Math.max(40, String(label).length * 8 + 20));
}

export function buatDiagramPanah({ A, B, pasangan = [], mode = 'tampil', maksPanah = 5, onUbah } = {}) {
  const uid = `dp${++nomorDiagram}`;
  let daftar = pasangan.map(([x, y]) => [String(x), String(y)]);
  let terkunci = mode !== 'bebas';
  let terpilih = null;
  let seret = null;
  let abaikanKlikSampai = 0;

  const nA = A.anggota.length;
  const nB = B.anggota.length;
  const baris = Math.max(nA, nB, 1);
  const tinggi = ATAS + baris * BARIS + 14;
  const posisiY = (i, n) => ATAS + BARIS * (i + 0.5) + ((baris - n) * BARIS) / 2;

  const titikA = new Map(A.anggota.map((v, i) => [String(v), { x: CX_A, y: posisiY(i, nA), w: lebarPil(v) }]));
  const titikB = new Map(B.anggota.map((v, i) => [String(v), { x: CX_B, y: posisiY(i, nB), w: lebarPil(v) }]));

  // ---------- kerangka SVG
  const defs = s('defs');
  for (let k = 0; k < JUMLAH_WARNA; k++) {
    defs.append(
      s('marker', { id: `${uid}-m${k}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' },
        s('path', { d: 'M0,0 L10,5 L0,10 z', class: `isi-pasangan-${k}` })),
    );
  }
  defs.append(
    s('marker', { id: `${uid}-mseret`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' },
      s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'isi-seret' })),
  );

  const tengahY = ATAS + (baris * BARIS) / 2;
  const ryOval = (baris * BARIS) / 2 + 6;
  const lapisanPanah = s('g', { class: 'lapisan-panah' });
  const lapisanAnggota = s('g', { class: 'lapisan-anggota' });
  const garisSeret = s('line', { class: 'garis-seret', visibility: 'hidden', 'marker-end': `url(#${uid}-mseret)` });

  const svgEl = s('svg', {
    viewBox: `0 0 ${LEBAR} ${tinggi}`,
    class: `diagram-panah${mode === 'bebas' ? ' diagram-bebas' : ''}`,
    role: 'group',
  },
  defs,
  s('ellipse', { cx: CX_A, cy: tengahY, rx: 64, ry: ryOval, class: 'oval oval-a' }),
  s('ellipse', { cx: CX_B, cy: tengahY, rx: 64, ry: ryOval, class: 'oval oval-b' }),
  s('text', { x: CX_A, y: 22, class: 'label-himpunan label-a' }, A.nama),
  s('text', { x: CX_B, y: 22, class: 'label-himpunan label-b' }, B.nama),
  lapisanPanah,
  garisSeret,
  lapisanAnggota);

  const pesanEl = h('p', { class: 'pesan-diagram', 'aria-live': 'polite' });
  const wadah = h('div', { class: 'wadah-diagram' }, svgEl, pesanEl);

  // ---------- anggota himpunan
  function buatAnggota(himpunan, nilai, titik) {
    const bisaDipilih = mode === 'bebas';
    return s('g', {
      class: `anggota anggota-${himpunan.toLowerCase()}`,
      'data-himpunan': himpunan,
      'data-nilai': nilai,
      tabindex: bisaDipilih ? 0 : null,
      role: bisaDipilih ? 'button' : null,
      'aria-label': `${himpunan === 'A' ? A.nama : B.nama}: ${nilai}`,
    },
    s('rect', { x: titik.x - titik.w / 2, y: titik.y - 16, width: titik.w, height: 32, rx: 16, class: 'pil' }),
    s('text', { x: titik.x, y: titik.y + 5, class: 'teks-anggota' }, nilai));
  }
  for (const [nilai, titik] of titikA) lapisanAnggota.append(buatAnggota('A', nilai, titik));
  for (const [nilai, titik] of titikB) lapisanAnggota.append(buatAnggota('B', nilai, titik));

  // ---------- panah
  function gambarPanah() {
    lapisanPanah.replaceChildren();
    daftar.forEach(([x, y], i) => {
      const p = titikA.get(x);
      const q = titikB.get(y);
      if (!p || !q) return;
      const k = i % JUMLAH_WARNA;
      const x1 = p.x + p.w / 2;
      const x2 = q.x - q.w / 2 - 2;
      const g = s('g', { class: `panah panah-${k}`, 'data-indeks': i });
      if (mode === 'bebas') g.append(s('line', { x1, y1: p.y, x2, y2: q.y, class: 'panah-kena' }));
      g.append(s('line', {
        x1, y1: p.y, x2, y2: q.y,
        class: 'panah-garis',
        'stroke-dasharray': POLA_GARIS[k] || null,
        'marker-end': `url(#${uid}-m${k})`,
      }));
      const t = 0.24;
      const nx = x1 + (x2 - x1) * t;
      const ny = p.y + (q.y - p.y) * t;
      g.append(
        s('circle', { cx: nx, cy: ny, r: 8, class: 'panah-nomor-latar' }),
        s('text', { x: nx, y: ny + 3.5, class: 'panah-nomor' }, i + 1),
      );
      lapisanPanah.append(g);
    });
    const ringkasan = daftar.length
      ? daftar.map(([x, y]) => `${x} ke ${y}`).join(', ')
      : 'belum ada panah';
    svgEl.setAttribute('aria-label', `Diagram panah dari ${A.nama} ke ${B.nama}: ${ringkasan}`);
  }

  function pesan(teks) {
    pesanEl.textContent = teks;
    clearTimeout(pesan.pewaktu);
    pesan.pewaktu = setTimeout(() => { pesanEl.textContent = ''; }, 3500);
  }

  function ubah() {
    gambarPanah();
    hapusSorot();
    onUbah?.(ambilPasangan());
  }

  function tambah(x, y) {
    if (terkunci) return;
    if (daftar.some(([a, b]) => a === x && b === y)) {
      pesan(`Panah ${x} → ${y} sudah ada.`);
      return;
    }
    if (daftar.length >= maksPanah) {
      pesan(`Maksimal ${maksPanah} panah. Hapus dulu panah yang salah (ketuk panahnya).`);
      return;
    }
    daftar.push([x, y]);
    ubah();
  }

  function hapus(i) {
    if (terkunci) return;
    const [x, y] = daftar[i];
    daftar.splice(i, 1);
    pesan(`Panah ${x} → ${y} dihapus.`);
    ubah();
  }

  function perbaruiPilihan() {
    for (const el of lapisanAnggota.querySelectorAll('.anggota-a')) {
      el.classList.toggle('terpilih', el.dataset.nilai === terpilih);
    }
    svgEl.classList.toggle('ada-pilihan', terpilih !== null);
  }

  function keKoordinatSvg(e) {
    const titik = svgEl.createSVGPoint();
    titik.x = e.clientX;
    titik.y = e.clientY;
    return titik.matrixTransform(svgEl.getScreenCTM().inverse());
  }

  function sorotTarget(el) {
    for (const b of lapisanAnggota.querySelectorAll('.anggota-b.target')) b.classList.remove('target');
    el?.classList.add('target');
  }

  // ---------- interaksi
  function aktifkan(el) {
    if (terkunci || !el) return;
    const nilai = el.dataset.nilai;
    if (el.dataset.himpunan === 'A') {
      terpilih = terpilih === nilai ? null : nilai;
      perbaruiPilihan();
      if (terpilih) pesan(`${nilai} dipilih. Sekarang ketuk pasangannya di ${B.nama}.`);
    } else if (terpilih) {
      tambah(terpilih, nilai);
      terpilih = null;
      perbaruiPilihan();
    } else {
      pesan(`Pilih dulu anggota di ${A.nama} (sebelah kiri). Panah selalu dari ${A.nama} ke ${B.nama}.`);
    }
  }

  lapisanAnggota.addEventListener('click', (e) => {
    if (performance.now() < abaikanKlikSampai) return;
    aktifkan(e.target.closest('.anggota'));
  });

  lapisanAnggota.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    aktifkan(e.target.closest('.anggota'));
  });

  lapisanPanah.addEventListener('click', (e) => {
    const g = e.target.closest('.panah');
    if (g && mode === 'bebas') hapus(Number(g.dataset.indeks));
  });

  svgEl.addEventListener('pointerdown', (e) => {
    if (terkunci) return;
    const el = e.target.closest('.anggota-a');
    if (!el) return;
    seret = { nilai: el.dataset.nilai, x0: e.clientX, y0: e.clientY, id: e.pointerId, aktif: false };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* tidak didukung */
    }
  });

  svgEl.addEventListener('pointermove', (e) => {
    if (!seret || e.pointerId !== seret.id) return;
    if (!seret.aktif && Math.hypot(e.clientX - seret.x0, e.clientY - seret.y0) < 8) return;
    seret.aktif = true;
    const p = titikA.get(seret.nilai);
    const q = keKoordinatSvg(e);
    garisSeret.setAttribute('x1', p.x + p.w / 2);
    garisSeret.setAttribute('y1', p.y);
    garisSeret.setAttribute('x2', q.x);
    garisSeret.setAttribute('y2', q.y);
    garisSeret.setAttribute('visibility', 'visible');
    sorotTarget(document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.anggota-b'));
  });

  function akhiriSeret(e, batal) {
    if (!seret || e.pointerId !== seret.id) return;
    if (seret.aktif) {
      abaikanKlikSampai = performance.now() + 400;
      if (!batal) {
        const target = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.anggota-b');
        if (target) tambah(seret.nilai, target.dataset.nilai);
        else pesan(`Lepaskan tepat di atas anggota ${B.nama}.`);
      }
    }
    garisSeret.setAttribute('visibility', 'hidden');
    sorotTarget(null);
    seret = null;
  }
  svgEl.addEventListener('pointerup', (e) => akhiriSeret(e, false));
  svgEl.addEventListener('pointercancel', (e) => akhiriSeret(e, true));

  // ---------- penyorotan (umpan balik & penjelasan)
  function hapusSorot() {
    for (const el of lapisanAnggota.querySelectorAll('.anggota')) {
      el.classList.remove('sorot-jomblo', 'sorot-mendua', 'sorot-domain', 'sorot-kodomain', 'sorot-range');
    }
    for (const el of lapisanAnggota.querySelectorAll('.tag-sorot')) el.remove();
  }

  function tambahTag(himpunan, nilai, teks) {
    const titik = (himpunan === 'A' ? titikA : titikB).get(String(nilai));
    if (!titik) return;
    lapisanAnggota.append(s('text', { x: titik.x, y: titik.y + 27, class: 'tag-sorot' }, teks));
  }

  function anggotaEl(himpunan, nilai) {
    return [...lapisanAnggota.querySelectorAll(`.anggota-${himpunan.toLowerCase()}`)]
      .find((el) => el.dataset.nilai === String(nilai));
  }

  /** Menandai anggota A yang jomblo/mendua. */
  function sorot({ jomblo = [], mendua = [] } = {}) {
    hapusSorot();
    for (const x of jomblo) { anggotaEl('A', x)?.classList.add('sorot-jomblo'); tambahTag('A', x, 'jomblo'); }
    for (const x of mendua) { anggotaEl('A', x)?.classList.add('sorot-mendua'); tambahTag('A', x, 'mendua'); }
  }

  /** Menyorot sekumpulan anggota, mis. domain/kodomain/range. */
  function sorotAnggota(himpunan, daftarNilai, jenis) {
    for (const v of daftarNilai) anggotaEl(himpunan, v)?.classList.add(`sorot-${jenis}`);
  }

  gambarPanah();

  return {
    el: wadah,
    ambilPasangan,
    setPasangan(baru) {
      daftar = baru.map(([x, y]) => [String(x), String(y)]);
      gambarPanah();
    },
    kunci(nilai = true) {
      terkunci = nilai || mode !== 'bebas';
      svgEl.classList.toggle('terkunci', terkunci);
      terpilih = null;
      perbaruiPilihan();
    },
    sorot,
    sorotAnggota,
    hapusSorot,
  };

  function ambilPasangan() {
    return daftar.map(([x, y]) => [x, y]);
  }
}
