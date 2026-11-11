// Daftar semua modul, urut dari sederhana ke kompleks (DS02, IL04).

import modul0 from './modul0-prasyarat.js';
import modul1 from './modul1-relasi.js';
import modul2 from './modul2-fungsi.js';
import modul3 from './modul3-representasi.js';
import modul4 from './modul4-mesin.js';
import modul5 from './modul5-cari-ab.js';
import modul6 from './modul6-soal-cerita.js';

export const DAFTAR_MODUL = [modul0, modul1, modul2, modul3, modul4, modul5, modul6];

export function ambilModul(nomor) {
  return DAFTAR_MODUL.find((m) => m.nomor === nomor) || null;
}
