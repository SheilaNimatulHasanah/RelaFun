// Status siswa: profil, progres modul, masuk & keluar.
// Profil dan progres disalin ke HP agar aplikasi tetap bisa dibuka saat offline.

import { api, GalatApi } from './api.js';
import { antre, aturPenangan, kosongkanAntrean } from './offlineQueue.js';
import { simpanan } from './ui.js';

const KUNCI_PROFIL = 'relafun_profil';
const KUNCI_PROGRES = 'relafun_progres';
const KUNCI_TERAKHIR = 'relafun_modul_terakhir';

let profil = simpanan.baca(KUNCI_PROFIL);
let progres = simpanan.baca(KUNCI_PROGRES, {}) || {};
const pendengar = new Set();

function simpanLokal() {
  simpanan.tulis(KUNCI_PROFIL, profil);
  simpanan.tulis(KUNCI_PROGRES, progres);
  for (const fn of pendengar) fn();
}

export function dengarStatus(fn) {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
}

export function ambilProfil() {
  return profil;
}

export function ambilProgres(modul) {
  return {
    langkah_terakhir: 0,
    selesai: false,
    skor_kuis: null,
    skor_sementara: false,
    ...(progres[modul] || {}),
  };
}

export function modulTerbuka(modul) {
  if (modul <= 1) return true; // pemanasan & modul 1 selalu terbuka
  return ambilProgres(modul - 1).selesai;
}

export function modulTerakhir() {
  return simpanan.baca(KUNCI_TERAKHIR);
}

function gabungDariServer(daftar) {
  for (const p of daftar || []) {
    const lokal = ambilProgres(p.modul);
    progres[p.modul] = {
      langkah_terakhir: Math.max(lokal.langkah_terakhir, p.langkah_terakhir || 0),
      selesai: lokal.selesai || p.selesai,
      skor_kuis: p.skor_kuis ?? lokal.skor_kuis,
      skor_sementara: p.skor_kuis === null || p.skor_kuis === undefined ? lokal.skor_sementara : false,
    };
  }
}

function hapusLokal() {
  profil = null;
  progres = {};
  simpanan.hapus(KUNCI_TERAKHIR);
  simpanLokal();
}

export async function masuk(nama) {
  const data = await api.masuk(nama);
  kosongkanAntrean();
  profil = data.siswa;
  progres = {};
  simpanan.hapus(KUNCI_TERAKHIR);
  simpanLokal();
  return profil;
}

/**
 * Mengecek sesi ke server.
 * Hasil: 'ok' | 'keluar' (sesi tidak berlaku) | 'offline' (server tidak terjangkau)
 */
export async function verifikasiSesi() {
  try {
    const data = await api.saya();
    profil = data.siswa;
    gabungDariServer(data.progres);
    simpanLokal();
    return 'ok';
  } catch (galat) {
    if (galat instanceof GalatApi && galat.status === 401) {
      hapusLokal();
      kosongkanAntrean();
      return 'keluar';
    }
    return 'offline';
  }
}

export async function keluar() {
  try {
    await api.keluar();
  } catch {
    /* tetap keluar di HP walaupun offline */
  }
  kosongkanAntrean();
  hapusLokal();
}

export function catatLangkah(modul, langkah) {
  progres[modul] = { ...ambilProgres(modul), langkah_terakhir: langkah };
  simpanan.tulis(KUNCI_TERAKHIR, modul);
  simpanLokal();
  antre('progres', { langkah_terakhir: langkah }, modul);
}

/** Mencatat kuis selesai. sementara = skor dihitung di HP karena offline. */
export function catatKuis(modul, skor, sementara) {
  const lama = ambilProgres(modul);
  const sudahAdaSkorResmi = lama.skor_kuis !== null && !lama.skor_sementara;
  progres[modul] = {
    ...lama,
    selesai: true,
    skor_kuis: sudahAdaSkorResmi ? lama.skor_kuis : skor,
    skor_sementara: sudahAdaSkorResmi ? false : sementara,
  };
  simpanLokal();
}

// Kuis yang dikirim dari antrean offline → perbarui dengan skor resmi server.
aturPenangan('kuis', (modul, hasil) => {
  const lama = ambilProgres(modul);
  progres[modul] = { ...lama, selesai: true, skor_kuis: hasil.skor_tercatat ?? hasil.skor, skor_sementara: false };
  simpanLokal();
});

aturPenangan('sesiHabis', () => {
  verifikasiSesi().then((hasil) => {
    if (hasil === 'keluar') window.location.hash = '#/masuk';
  });
});
