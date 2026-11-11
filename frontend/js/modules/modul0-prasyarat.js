// Modul 0 — Pemanasan aljabar (pre-training): bilangan bulat, substitusi, eliminasi.
// Temuan: IL03 (prasyarat substitusi & eliminasi), IL05 (salah tanda negatif-positif).

import { buatLangkahBertahap } from '../components/stepReveal.js';
import { h, kotakInfo, tanda } from '../ui.js';

export default {
  nomor: 0,
  judul: 'Pemanasan Aljabar',
  ringkas: 'Bilangan negatif, substitusi pakai kurung, dan eliminasi.',
  ikon: '🔥',
  refleksi: 'Bagian mana yang paling sering membuatmu salah hitung? Tulis dengan kata-katamu.',
  langkah: [
    {
      jenis: 'materi', label: 'Pengantar', judul: 'Aturan tanda perkalian',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Banyak salah hitung terjadi karena tanda negatif. Ingat empat aturan ini:'),
          h('table', { class: 'tabel-aturan' },
            h('tbody', {},
              h('tr', {}, h('td', {}, '(+) · (+)'), h('td', {}, '= +'), h('td', {}, '2 · 3 = 6')),
              h('tr', {}, h('td', {}, '(+) · (−)'), h('td', {}, '= −'), h('td', {}, '2 · (−3) = −6')),
              h('tr', {}, h('td', {}, '(−) · (+)'), h('td', {}, '= −'), h('td', {}, '(−2) · 3 = −6')),
              h('tr', {}, h('td', {}, '(−) · (−)'), h('td', {}, '= +'), h('td', {}, '(−2) · (−3) = 6')))),
          kotakInfo('tips', '💡 Tanda sama → hasil positif. Tanda beda → hasil negatif.')));
      },
    },
    {
      jenis: 'materi', label: 'Contoh', judul: 'Substitusi: pakai kurung!',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Jika ', tanda('x', 'x = −2'), ', berapa nilai 3x − 1? Ikuti langkahnya satu per satu:'),
          buatLangkahBertahap([
            h('span', {}, 'Tulis bentuk awal: 3x − 1'),
            h('span', {}, 'Ganti x dengan ', tanda('x', '(−2)'), ' — selalu di dalam kurung: 3 · ', tanda('x', '(−2)'), ' − 1'),
            h('span', {}, 'Kalikan dulu: 3 · (−2) = −6 (tanda beda → negatif)'),
            h('span', {}, 'Lalu kurangkan: −6 − 1 = ', h('strong', {}, '−7')),
          ]).el,
          kotakInfo('peringatan', '⚠️ Tanpa kurung, “3 · −2” mudah terbaca “3 − 2”. Kurung menjaga tanda negatif tetap terlihat.')));
      },
    },
    { jenis: 'latihan', soal: 'm0-l1', judul: 'Perkalian dengan negatif' },
    { jenis: 'latihan', soal: 'm0-l2', judul: 'Pengurangan bilangan bulat' },
    { jenis: 'latihan', soal: 'm0-l3', judul: 'Substitusi' },
    {
      jenis: 'materi', label: 'Contoh', judul: 'Eliminasi: menghilangkan b',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Nanti di Modul 5 kita perlu mencari dua nilai yang belum diketahui. Caranya: kurangkan dua persamaan agar salah satunya hilang.'),
          buatLangkahBertahap([
            h('span', {}, 'Persamaan (1): 2a + b = 5'),
            h('span', {}, 'Persamaan (2): 4a + b = 11'),
            h('span', {}, 'Kurangkan (2) − (1): 4a − 2a = 2a, b − b = 0, 11 − 5 = 6'),
            h('span', {}, 'Hasilnya 2a = 6, jadi a = 3. Huruf b sudah hilang (tereliminasi)!'),
          ]).el));
      },
    },
    { jenis: 'latihan', soal: 'm0-l4', judul: 'Eliminasi' },
  ],
};
