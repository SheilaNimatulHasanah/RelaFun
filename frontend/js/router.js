// Navigasi berbasis hash: #/masuk, #/beranda, #/modul/3, #/pasang, #/rangkuman

import { ambilProfil, modulTerbuka } from './auth.js';
import { ambilModul } from './modules/daftar.js';
import { jalankanModul } from './modules/engine.js';
import { halamanBeranda } from './pages/beranda.js';
import { halamanMasuk } from './pages/masuk.js';
import { halamanPasang } from './pages/pasang.js';
import { halamanRangkuman } from './pages/rangkuman.js';
import { h, kosongkan } from './ui.js';

const wadah = () => document.getElementById('aplikasi');
const judul = () => document.getElementById('judul-halaman');
const tombolKembali = () => document.getElementById('tombol-kembali');

let bersihkan = null;

export function pergi(hash) {
  if (window.location.hash === hash) tampilkan();
  else window.location.hash = hash;
}

const keBeranda = () => pergi('#/beranda');
const keMasuk = () => pergi('#/masuk');

function aturKepala(teks, bisaKembali) {
  judul().textContent = teks;
  document.title = teks === 'RelaFun' ? 'RelaFun – Relasi & Fungsi' : `${teks} · RelaFun`;
  tombolKembali().hidden = !bisaKembali;
}

function tampilkan() {
  bersihkan?.();
  bersihkan = null;
  const el = kosongkan(wadah());
  const hash = window.location.hash || '';
  const masukSudah = Boolean(ambilProfil());

  if (hash === '#/pasang') {
    aturKepala('Pasang Aplikasi', true);
    bersihkan = halamanPasang(el) || null;
    return;
  }

  if (!masukSudah) {
    if (hash !== '#/masuk') {
      window.location.replace('#/masuk');
      return;
    }
    aturKepala('RelaFun', false);
    halamanMasuk(el, { keBeranda });
    return;
  }

  const cocokModul = hash.match(/^#\/modul\/(\d+)$/);
  if (cocokModul) {
    const nomor = Number(cocokModul[1]);
    const modul = ambilModul(nomor);
    if (!modul || !modulTerbuka(nomor)) {
      window.location.replace('#/beranda');
      return;
    }
    aturKepala(nomor === 0 ? modul.judul : `Modul ${nomor} · ${modul.judul}`, true);
    try {
      bersihkan = jalankanModul(modul, el, { keBeranda });
    } catch (galat) {
      console.error(galat);
      el.append(h('p', { class: 'pesan-galat' }, 'Modul gagal dimuat. Coba muat ulang aplikasi.'));
    }
    return;
  }

  if (hash === '#/rangkuman') {
    aturKepala('Rangkuman', true);
    halamanRangkuman(el);
    return;
  }

  if (hash !== '#/beranda') {
    window.location.replace('#/beranda');
    return;
  }
  aturKepala('RelaFun', false);
  halamanBeranda(el, { keMasuk });
}

export function mulaiRouter() {
  window.addEventListener('hashchange', tampilkan);
  tombolKembali().addEventListener('click', keBeranda);
  tampilkan();
}

export function muatUlangHalaman() {
  tampilkan();
}
