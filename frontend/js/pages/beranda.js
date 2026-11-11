// Beranda: sapaan, kartu pasang aplikasi, lanjutkan belajar, daftar modul.

import { ambilProfil, ambilProgres, keluar, modulTerakhir, modulTerbuka } from '../auth.js';
import { kartuPasang } from '../install.js';
import { DAFTAR_MODUL, ambilModul } from '../modules/daftar.js';
import { jumlahAntrean } from '../offlineQueue.js';
import { h } from '../ui.js';

function statusModul(modul) {
  const p = ambilProgres(modul.nomor);
  if (!modulTerbuka(modul.nomor)) return { kelas: 'terkunci', teks: '🔒 Selesaikan modul sebelumnya' };
  if (p.selesai) {
    const skor = p.skor_kuis === null ? '' : ` · skor ${p.skor_kuis}${p.skor_sementara ? ' ⏳' : ''}`;
    return { kelas: 'selesai', teks: `✓ Selesai${skor}` };
  }
  if (p.langkah_terakhir > 0) return { kelas: 'sedang', teks: '◐ Sedang dipelajari' };
  return { kelas: 'baru', teks: 'Belum dimulai' };
}

export function halamanBeranda(wadah, { keMasuk }) {
  const profil = ambilProfil();

  const terakhir = ambilModul(modulTerakhir());
  const lanjut = terakhir && !ambilProgres(terakhir.nomor).selesai ? terakhir : null;

  const kartuModul = DAFTAR_MODUL.map((m) => {
    const status = statusModul(m);
    const terbuka = status.kelas !== 'terkunci';
    return h('li', {},
      h(terbuka ? 'a' : 'div', {
        class: `kartu-modul status-${status.kelas}${m.nomor === 0 ? ' modul-pemanasan' : ''}`,
        href: terbuka ? `#/modul/${m.nomor}` : null,
        'aria-disabled': terbuka ? null : 'true',
      },
      h('span', { class: 'ikon-modul', 'aria-hidden': 'true' }, m.ikon),
      h('span', { class: 'isi-kartu-modul' },
        h('span', { class: 'nomor-modul' }, m.nomor === 0 ? 'Pemanasan (opsional)' : `Modul ${m.nomor}`),
        h('span', { class: 'judul-modul' }, m.judul),
        h('span', { class: 'ringkas-modul' }, m.ringkas),
        h('span', { class: 'status-modul' }, status.teks))));
  });

  const tombolKeluar = h('button', {
    class: 'tombol tombol-teks', type: 'button',
    onclick: async () => {
      const sisa = jumlahAntrean();
      const pesan = sisa
        ? `Masih ada ${sisa} data yang belum terkirim ke server dan akan hilang jika keluar sekarang. Tetap keluar?`
        : 'Keluar dari RelaFun? Progres di HP ini akan dihapus (data di server tetap aman).';
      if (!window.confirm(pesan)) return;
      await keluar();
      keMasuk();
    },
  }, 'Keluar');

  wadah.append(h('div', { class: 'halaman-beranda' },
    h('section', { class: 'sapaan' },
      h('h2', {}, `Halo, ${profil?.nama || 'teman'} 👋`)),
    kartuPasang(),
    lanjut
      ? h('a', { class: 'tombol tombol-utama tombol-besar tombol-lanjut', href: `#/modul/${lanjut.nomor}` },
        `▶ Lanjutkan: Modul ${lanjut.nomor} · ${lanjut.judul}`)
      : null,
    h('h2', { class: 'judul-bagian' }, 'Daftar modul'),
    h('ol', { class: 'daftar-modul' }, ...kartuModul),
    h('nav', { class: 'menu-bawah', 'aria-label': 'Menu lain' },
      h('a', { class: 'tombol tombol-sekunder', href: '#/rangkuman' }, '📒 Rangkuman'),
      h('a', { class: 'tombol tombol-sekunder', href: '#/pasang' }, '📲 Cara memasang'),
      tombolKeluar)));
}
