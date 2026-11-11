// Memuat bank soal bersama (data/soal.json). Disimpan service worker agar tersedia offline.

let bank = null;

export async function muatBankSoal() {
  if (bank) return bank;
  const respons = await fetch('/data/soal.json');
  if (!respons.ok) throw new Error('Bank soal tidak dapat dimuat.');
  const isi = await respons.json();
  bank = new Map(isi.soal.map((s) => [s.id, s]));
  return bank;
}

export function ambilSoal(id) {
  const soal = bank?.get(id);
  if (!soal) throw new Error(`Soal tidak ditemukan: ${id}`);
  return soal;
}

export function soalModul(modul, jenis) {
  return [...(bank?.values() || [])].filter((s) => s.modul === modul && s.jenis === jenis);
}
