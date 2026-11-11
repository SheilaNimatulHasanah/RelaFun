// Utilitas kecil untuk membuat elemen DOM dan memformat angka.

export const MINUS = '−';
const NS_SVG = 'http://www.w3.org/2000/svg';

function pasangAtribut(el, atribut) {
  for (const [kunci, nilai] of Object.entries(atribut || {})) {
    if (nilai === null || nilai === undefined || nilai === false) continue;
    if (kunci === 'class') el.setAttribute('class', nilai);
    else if (kunci === 'text') el.textContent = nilai;
    else if (kunci === 'dataset') Object.assign(el.dataset, nilai);
    else if (kunci.startsWith('on') && typeof nilai === 'function') {
      el.addEventListener(kunci.slice(2).toLowerCase(), nilai);
    } else if (nilai === true) el.setAttribute(kunci, '');
    else el.setAttribute(kunci, String(nilai));
  }
}

function tambahAnak(el, anak) {
  for (const a of anak.flat(Infinity)) {
    if (a === null || a === undefined || a === false) continue;
    el.append(a instanceof Node ? a : document.createTextNode(String(a)));
  }
}

/** Membuat elemen HTML: h('p', {class: 'x'}, 'teks', anakLain) */
export function h(tag, atribut = {}, ...anak) {
  const el = document.createElement(tag);
  pasangAtribut(el, atribut);
  tambahAnak(el, anak);
  return el;
}

/** Membuat elemen SVG. */
export function s(tag, atribut = {}, ...anak) {
  const el = document.createElementNS(NS_SVG, tag);
  pasangAtribut(el, atribut);
  tambahAnak(el, anak);
  return el;
}

export function kosongkan(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/** Format angka untuk ditampilkan: tanda minus matematika, titik ribuan bila perlu. */
export function fmt(n, { ribuan = Math.abs(n) >= 10000 } = {}) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return String(n);
  const bulat = Math.round(n * 1000) / 1000;
  let teks = String(Math.abs(bulat)).replace('.', ',');
  if (ribuan && Number.isInteger(bulat)) {
    teks = String(Math.abs(bulat)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  return (bulat < 0 ? MINUS : '') + teks;
}

/** Bilangan untuk substitusi: negatif selalu di dalam kurung (temuan IL05). */
export function fmtSub(n) {
  return n < 0 ? `(${fmt(n)})` : fmt(n);
}

export function idAcak() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** localStorage yang aman: tidak pernah melempar galat (mis. mode privat). */
export const simpanan = {
  baca(kunci, bawaan = null) {
    try {
      const isi = localStorage.getItem(kunci);
      return isi === null ? bawaan : JSON.parse(isi);
    } catch {
      return bawaan;
    }
  },
  tulis(kunci, nilai) {
    try {
      localStorage.setItem(kunci, JSON.stringify(nilai));
      return true;
    } catch {
      return false;
    }
  },
  hapus(kunci) {
    try {
      localStorage.removeItem(kunci);
    } catch {
      /* abaikan */
    }
  },
};

/** Kotak info kecil (tips, peringatan) */
export function kotakInfo(jenis, ...isi) {
  return h('div', { class: `kotak-info kotak-${jenis}` }, ...isi);
}

/** Teks dengan warna semantik: x, fx, a, b */
export function tanda(jenis, teks) {
  return h('span', { class: `tanda tanda-${jenis}` }, teks);
}

/** Pemberitahuan singkat di bagian bawah layar. */
export function beriTahu(pesan, { tombol, aksi, lama = 4000 } = {}) {
  const wadah = document.getElementById('pemberitahuan');
  if (!wadah) return;
  const el = h('div', { class: 'toast', role: 'status' }, h('span', {}, pesan));
  if (tombol) {
    el.append(h('button', { class: 'tombol tombol-kecil', type: 'button', onclick: () => { aksi?.(); el.remove(); } }, tombol));
  }
  wadah.append(el);
  if (lama) setTimeout(() => el.remove(), lama);
}
