// Bidang Kartesius (SVG). Sumbu x berwarna biru (input), sumbu tegak oranye (output f(x)).

import { fmt, s } from '../ui.js';

const UKURAN = 320;
const TEPI = 30;
let nomorBidang = 0;

export function buatBidangKartesius({ xMin = -5, xMax = 5, yMin = -5, yMax = 5, langkah = 1, labelY = 'f(x)' } = {}) {
  const uid = `bk${++nomorBidang}`;
  const sx = (x) => TEPI + ((x - xMin) / (xMax - xMin)) * (UKURAN - 2 * TEPI);
  const sy = (y) => UKURAN - TEPI - ((y - yMin) / (yMax - yMin)) * (UKURAN - 2 * TEPI);
  const dalam = (v, a, b) => v >= a && v <= b;
  const sumbuY0 = dalam(0, yMin, yMax) ? sy(0) : sy(yMin);
  const sumbuX0 = dalam(0, xMin, xMax) ? sx(0) : sx(xMin);

  const kisi = s('g', { class: 'kisi' });
  const label = s('g', { class: 'label-sumbu' });
  const jarakLabelX = (xMax - xMin) / langkah > 12 ? 2 : 1;
  const jarakLabelY = (yMax - yMin) / langkah > 12 ? 2 : 1;

  let n = 0;
  for (let x = Math.ceil(xMin / langkah) * langkah; x <= xMax + 1e-9; x += langkah, n++) {
    kisi.append(s('line', { x1: sx(x), y1: sy(yMin), x2: sx(x), y2: sy(yMax) }));
    if (x !== 0 && Math.round(x / langkah) % jarakLabelX === 0) {
      label.append(s('text', { x: sx(x), y: sumbuY0 + 14, class: 'angka-x' }, fmt(x)));
    }
  }
  for (let y = Math.ceil(yMin / langkah) * langkah; y <= yMax + 1e-9; y += langkah) {
    kisi.append(s('line', { x1: sx(xMin), y1: sy(y), x2: sx(xMax), y2: sy(y) }));
    if (y !== 0 && Math.round(y / langkah) % jarakLabelY === 0) {
      label.append(s('text', { x: sumbuX0 - 6, y: sy(y) + 4, class: 'angka-y' }, fmt(y)));
    }
  }
  if (dalam(0, xMin, xMax) && dalam(0, yMin, yMax)) {
    label.append(s('text', { x: sx(0) - 6, y: sy(0) + 14, class: 'angka-y' }, '0'));
  }

  const sumbu = s('g', { class: 'sumbu' },
    s('line', { x1: sx(xMin), y1: sumbuY0, x2: sx(xMax) + 8, y2: sumbuY0, class: 'sumbu-x' }),
    s('line', { x1: sumbuX0, y1: sy(yMin), x2: sumbuX0, y2: sy(yMax) - 8, class: 'sumbu-y' }),
    s('text', { x: sx(xMax) + 10, y: sumbuY0 - 6, class: 'nama-sumbu-x' }, 'x'),
    s('text', { x: sumbuX0 + 6, y: sy(yMax) - 10, class: 'nama-sumbu-y' }, labelY));

  const lapisanGaris = s('g', { 'clip-path': `url(#${uid}-klip)` });
  const lapisanTitik = s('g');
  const lapisanAktif = s('g');

  const svgEl = s('svg', { viewBox: `0 0 ${UKURAN} ${UKURAN}`, class: 'bidang-kartesius', role: 'img', 'aria-label': 'Bidang Kartesius' },
    s('defs', {}, s('clipPath', { id: `${uid}-klip` },
      s('rect', { x: sx(xMin), y: sy(yMax), width: sx(xMax) - sx(xMin), height: sy(yMin) - sy(yMax) }))),
    kisi, sumbu, label, lapisanGaris, lapisanTitik, lapisanAktif);

  function titikEl({ x, y, kelas = '', teks = null }) {
    const g = s('g', { class: `titik ${kelas}` }, s('circle', { cx: sx(x), cy: sy(y), r: 5.5 }));
    if (teks) g.append(s('text', { x: sx(x) + 8, y: sy(y) - 8, class: 'label-titik' }, teks));
    return g;
  }

  return {
    el: svgEl,
    /** titik: [{x, y, kelas, teks}] */
    gambarTitik(titik) {
      lapisanTitik.replaceChildren(...titik.filter((t) => dalam(t.x, xMin, xMax) && dalam(t.y, yMin, yMax)).map(titikEl));
      svgEl.setAttribute('aria-label', `Bidang Kartesius dengan titik ${titik.map((t) => `(${fmt(t.x)}, ${fmt(t.y)})`).join(', ')}`);
    },
    tambahTitik(t) {
      if (dalam(t.x, xMin, xMax) && dalam(t.y, yMin, yMax)) lapisanTitik.append(titikEl(t));
    },
    bersihkanTitik() {
      lapisanTitik.replaceChildren();
    },
    /** Garis f(x) = ax + b */
    gambarGaris(a, b, kelas = 'garis-fungsi') {
      lapisanGaris.replaceChildren(s('line', {
        x1: sx(xMin), y1: sy(a * xMin + b), x2: sx(xMax), y2: sy(a * xMax + b), class: kelas,
      }));
    },
    hapusGaris() {
      lapisanGaris.replaceChildren();
    },
    /** Titik aktif dengan garis bantu putus-putus ke kedua sumbu (DS01). */
    setAktif(x, y) {
      lapisanAktif.replaceChildren();
      if (x === null || x === undefined) return;
      if (!dalam(x, xMin, xMax) || !dalam(y, yMin, yMax)) {
        lapisanAktif.append(s('text', { x: UKURAN / 2, y: TEPI - 10, class: 'label-luar' }, `(${fmt(x)}, ${fmt(y)}) di luar layar`));
        return;
      }
      lapisanAktif.append(
        s('line', { x1: sx(x), y1: sy(y), x2: sx(x), y2: sumbuY0, class: 'bantu bantu-x' }),
        s('line', { x1: sx(x), y1: sy(y), x2: sumbuX0, y2: sy(y), class: 'bantu bantu-y' }),
        s('circle', { cx: sx(x), cy: sy(y), r: 8, class: 'titik-aktif' }),
        s('text', { x: sx(x) + (x > (xMin + xMax) / 2 ? -10 : 10), y: sy(y) - 12, class: `label-aktif${x > (xMin + xMax) / 2 ? ' rata-kanan' : ''}` },
          `(${fmt(x)}, ${fmt(y)})`),
      );
    },
  };
}

/** Rentang otomatis yang memuat semua titik dan titik asal. */
export function rentangUntuk(titik, ruang = 1) {
  const xs = titik.map(([x]) => x).concat(0);
  const ys = titik.map(([, y]) => y).concat(0);
  return {
    xMin: Math.min(...xs) - ruang,
    xMax: Math.max(...xs) + ruang,
    yMin: Math.min(...ys) - ruang,
    yMax: Math.max(...ys) + ruang,
  };
}
