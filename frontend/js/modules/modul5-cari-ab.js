// Modul 5 — Mencari a dan b dari dua nilai fungsi.
// Temuan: K03 & IL04 (titik tersulit), IL03 (f(2)=5, f(4)=11; prasyarat eliminasi), GL02 (cek substitusi balik).
// Strategi: worked example → contoh setengah jadi (fading) → mandiri.

import { buatBidangKartesius } from '../components/cartesian.js';
import { buatLangkahBertahap } from '../components/stepReveal.js';
import { h, kotakInfo, tanda } from '../ui.js';

export default {
  nomor: 5,
  judul: 'Mencari a dan b',
  ringkas: 'Menemukan rumus f(x) = ax + b dari dua nilai fungsi.',
  ikon: '🔍',
  refleksi: 'Langkah mana yang paling sulit saat mencari a dan b? Mengapa?',
  langkah: [
    {
      jenis: 'materi', label: 'Pengantar', judul: 'Rumusnya belum diketahui',
      tampil(el) {
        const bidang = buatBidangKartesius({ xMin: -1, xMax: 6, yMin: -2, yMax: 14 });
        bidang.gambarTitik([
          { x: 2, y: 5, kelas: 'warna-pasangan-0', teks: 'f(2) = 5' },
          { x: 4, y: 11, kelas: 'warna-pasangan-1', teks: 'f(4) = 11' },
        ]);
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Kita tahu fungsinya berbentuk f(x) = ', tanda('a', 'a'), 'x + ', tanda('b', 'b'), ', dan tahu dua nilainya: f(2) = 5 dan f(4) = 11.'),
          h('p', {}, 'Tetapi nilai a dan b belum diketahui. Rumus apa yang melewati kedua titik ini?'),
          h('div', { class: 'wadah-grafik' }, bidang.el),
          h('p', {}, h('strong', {}, 'Rencana 4 langkah:')),
          h('ol', { class: 'daftar-langkah' },
            h('li', {}, 'Tulis dua persamaan dari dua nilai fungsi.'),
            h('li', {}, 'Kurangkan persamaan agar b hilang (eliminasi), lalu cari a.'),
            h('li', {}, 'Masukkan a ke salah satu persamaan untuk mencari b.'),
            h('li', {}, 'Cek dengan substitusi balik.'))));
      },
    },
    {
      jenis: 'materi', label: 'Contoh lengkap', judul: 'f(2) = 5 dan f(4) = 11',
      tampil(el) {
        const bidang = buatBidangKartesius({ xMin: -1, xMax: 6, yMin: -2, yMax: 14 });
        bidang.gambarTitik([{ x: 2, y: 5, kelas: 'warna-pasangan-0' }, { x: 4, y: 11, kelas: 'warna-pasangan-1' }]);
        const grafik = h('div', { class: 'wadah-grafik' }, bidang.el);
        grafik.hidden = true;
        const langkah = buatLangkahBertahap([
          h('span', {}, 'f(2) = 5 → ', tanda('a', '2a'), ' + ', tanda('b', 'b'), ' = 5   … (1)'),
          h('span', {}, 'f(4) = 11 → ', tanda('a', '4a'), ' + ', tanda('b', 'b'), ' = 11   … (2)'),
          h('span', {}, 'Kurangkan (2) − (1): 4a − 2a = 2a, b − b = 0, 11 − 5 = 6 → ', tanda('a', '2a = 6')),
          h('span', {}, 'Bagi dengan 2: ', tanda('a', 'a = 3')),
          h('span', {}, 'Masukkan a = 3 ke (1): 2 · 3 + b = 5 → 6 + b = 5 → ', tanda('b', 'b = −1')),
          h('span', {}, 'Jadi rumusnya ', h('strong', {}, 'f(x) = 3x − 1')),
          h('span', {}, 'Cek: f(2) = 3 · 2 − 1 = 5 ✓ dan f(4) = 3 · 4 − 1 = 11 ✓'),
        ], {
          onLangkah: (n) => {
            if (n >= 6) {
              bidang.gambarGaris(3, -1);
              grafik.hidden = false;
            } else {
              bidang.hapusGaris();
              grafik.hidden = true;
            }
          },
        });
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Ikuti contoh ini langkah demi langkah. Jangan terburu-buru.'),
          langkah.el,
          grafik));
      },
    },
    {
      jenis: 'latihan', soal: 'm5-l1', judul: 'Contoh setengah jadi',
      pengantar: 'Sebagian langkah sudah diisi. Lengkapi kotak yang kosong.',
    },
    {
      jenis: 'latihan', soal: 'm5-l2', judul: 'Bantuan lebih sedikit',
      pengantar: 'Sekarang kotak kosongnya lebih banyak. Kamu pasti bisa!',
    },
    {
      jenis: 'materi', label: 'Kebiasaan baik', judul: 'Cek dengan substitusi balik',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Setelah menemukan a dan b, masukkan kembali x dari soal ke rumusmu. Jika hasilnya sama dengan soal, rumusmu benar.'),
          h('p', {}, 'Contoh: kamu mendapat f(x) = 3x − 1 dari f(2) = 5 dan f(4) = 11.'),
          h('ul', { class: 'daftar-cek' },
            h('li', { class: 'cocok' }, 'f(2) = 3 · 2 − 1 = 5 ✓ cocok'),
            h('li', { class: 'cocok' }, 'f(4) = 3 · 4 − 1 = 11 ✓ cocok')),
          h('p', {}, 'Kalau ada yang tidak cocok, berarti ada hitungan yang salah. Periksa lagi, terutama tanda negatifnya.'),
          kotakInfo('tips', '💡 Di soal berikutnya ada tombol “🔍 Cek dengan substitusi balik”. Gunakan sebelum menekan “Cek jawaban”.')));
      },
    },
    { jenis: 'latihan', soal: 'm5-l3', judul: 'Mandiri' },
    { jenis: 'latihan', soal: 'm5-l4', judul: 'Mandiri, dengan bilangan negatif' },
  ],
};
