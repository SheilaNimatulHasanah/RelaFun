// Antrean offline: data disimpan dulu di HP, lalu dikirim ke server saat online.
// Siswa tidak pernah kehilangan jawaban walaupun sinyal putus atau server sedang "tidur".

import { api, GalatApi } from './api.js';
import { idAcak, simpanan } from './ui.js';

const KUNCI = 'antrean_fungsiku';
const UKURAN_BATCH = 50;

let antrean = simpanan.baca(KUNCI, []);
if (!Array.isArray(antrean)) antrean = [];

let sedangMengirim = false;
let pewaktuKirim = null;
const pendengar = new Set();
const penangan = { kuis: null, sesiHabis: null };

function simpan() {
  simpanan.tulis(KUNCI, antrean);
}

function beriKabar() {
  const status = sedangMengirim ? 'mengirim' : antrean.length ? 'menunggu' : 'tersimpan';
  for (const fn of pendengar) fn(status, antrean.length);
}

/** Mendengarkan perubahan status antrean: fn(status, jumlah). */
export function dengarAntrean(fn) {
  pendengar.add(fn);
  fn(sedangMengirim ? 'mengirim' : antrean.length ? 'menunggu' : 'tersimpan', antrean.length);
  return () => pendengar.delete(fn);
}

/** Dipanggil saat kuis yang dikerjakan offline akhirnya dinilai server. */
export function aturPenangan(jenis, fn) {
  penangan[jenis] = fn;
}

export function jumlahAntrean() {
  return antrean.length;
}

export function kosongkanAntrean() {
  antrean = [];
  simpan();
  beriKabar();
}

/**
 * Menambah data ke antrean.
 * jenis: 'jawaban' | 'progres' | 'kuis' | 'skala'
 */
export function antre(jenis, data, modul = null) {
  if (jenis === 'progres') {
    // Progres cukup yang terbaru per modul.
    antrean = antrean.filter((i) => !(i.jenis === 'progres' && i.modul === modul));
  }
  antrean.push({ _id: idAcak(), jenis, modul, data });
  simpan();
  beriKabar();
  jadwalkanKirim();
}

export function jadwalkanKirim(jeda = 800) {
  clearTimeout(pewaktuKirim);
  pewaktuKirim = setTimeout(kirimSemua, jeda);
}

function hapusDariAntrean(daftarId) {
  const ids = new Set(daftarId);
  antrean = antrean.filter((i) => !ids.has(i._id));
  simpan();
}

/** Mengembalikan true bila boleh lanjut ke item berikutnya. */
function tanganiGalat(galat, item) {
  if (galat instanceof GalatApi) {
    if (galat.status === 401) {
      penangan.sesiHabis?.();
      return false;
    }
    if (!galat.bisaDiulang) {
      // Data ditolak server (tidak valid) → buang agar antrean tidak macet.
      hapusDariAntrean(Array.isArray(item) ? item.map((i) => i._id) : [item._id]);
      return true;
    }
  }
  return false; // offline / server tidur → coba lagi nanti
}

export async function kirimSemua() {
  if (sedangMengirim || !antrean.length) return;
  if (navigator.onLine === false) return;
  sedangMengirim = true;
  beriKabar();
  try {
    // 1) Jawaban latihan dikirim berkelompok.
    while (true) {
      const kelompok = antrean.filter((i) => i.jenis === 'jawaban').slice(0, UKURAN_BATCH);
      if (!kelompok.length) break;
      try {
        await api.jawaban(kelompok.map((i) => i.data));
        hapusDariAntrean(kelompok.map((i) => i._id));
      } catch (galat) {
        if (!tanganiGalat(galat, kelompok)) return;
      }
    }
    // 2) Sisanya satu per satu, sesuai urutan.
    for (const item of antrean.filter((i) => i.jenis !== 'jawaban')) {
      try {
        if (item.jenis === 'progres') await api.progres(item.modul, item.data.langkah_terakhir);
        else if (item.jenis === 'skala') await api.skalaBeban(item.data);
        else if (item.jenis === 'kuis') {
          const hasil = await api.kuis(item.modul, item.data);
          penangan.kuis?.(item.modul, hasil);
        }
        hapusDariAntrean([item._id]);
      } catch (galat) {
        if (!tanganiGalat(galat, item)) return;
      }
    }
  } finally {
    sedangMengirim = false;
    beriKabar();
  }
}

window.addEventListener('online', () => jadwalkanKirim(300));
setInterval(() => {
  if (antrean.length) kirimSemua();
}, 60000);
