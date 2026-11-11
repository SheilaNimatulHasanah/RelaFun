// Modul 6 — Soal Cerita & Literasi Matematika.
// Temuan: EL05 (bingung konstanta vs koefisien di soal tarif), GL05 (pola sama di konteks berbeda).
// Tahap literasi (PISA): merumuskan → menerapkan → menafsirkan.

import { buatLangkahBertahap } from '../components/stepReveal.js';
import { h, kotakInfo, tanda } from '../ui.js';

export default {
  nomor: 6,
  judul: 'Soal Cerita',
  ringkas: 'Tarif taksi, sewa, parkir: semuanya f(x) = ax + b.',
  ikon: '🚕',
  refleksi: 'Tulis satu contoh lain dari kehidupanmu yang bisa dibuat menjadi f(x) = ax + b.',
  langkah: [
    {
      jenis: 'materi', label: 'Pengantar', judul: 'Fungsi di sekitar kita',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', { class: 'cerita' },
            'Tarif taksi: ', tanda('b', 'biaya buka pintu Rp7.000'), ' ditambah ', tanda('a', 'Rp4.000 per kilometer'), '. Andi naik taksi sejauh ', tanda('x', '5 km'), '. Berapa ongkosnya?'),
          h('p', {}, 'Menyelesaikan soal cerita ada tiga tahap:'),
          h('ol', { class: 'tahap-literasi' },
            h('li', {}, h('strong', {}, 'Merumuskan'), ' — ubah cerita menjadi rumus.'),
            h('li', {}, h('strong', {}, 'Menerapkan'), ' — hitung memakai rumus.'),
            h('li', {}, h('strong', {}, 'Menafsirkan'), ' — jawab dengan kalimat sesuai cerita.'))));
      },
    },
    {
      jenis: 'materi', label: 'Contoh', judul: 'Nilai awal vs tarif per satuan',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('div', { class: 'dua-kolom' },
            h('div', { class: 'kartu-aturan kartu-b' },
              h('p', {}, h('strong', {}, 'b = nilai awal')),
              h('p', {}, 'Dibayar SEKALI, berapa pun jaraknya.'),
              h('p', { class: 'label-kecil' }, 'Kata kunci: biaya awal, buka pintu, pendaftaran, tetap, sekali bayar')),
            h('div', { class: 'kartu-aturan kartu-a' },
              h('p', {}, h('strong', {}, 'a = per satuan')),
              h('p', {}, 'Dikalikan dengan x (jarak, jam, GB, …).'),
              h('p', { class: 'label-kecil' }, 'Kata kunci: per, setiap, tiap'))),
          buatLangkahBertahap([
            h('span', {}, h('strong', {}, 'Merumuskan: '), 'f(x) = ', tanda('a', '4.000'), 'x + ', tanda('b', '7.000'), ', dengan ', tanda('x', 'x'), ' = jarak (km)'),
            h('span', {}, h('strong', {}, 'Menerapkan: '), 'f(5) = 4.000 · 5 + 7.000 = 20.000 + 7.000 = 27.000'),
            h('span', {}, h('strong', {}, 'Menafsirkan: '), 'Ongkos taksi Andi untuk 5 km adalah Rp27.000.'),
          ]).el));
      },
    },
    { jenis: 'latihan', soal: 'm6-l1', judul: 'Tandai a dan b' },
    { jenis: 'latihan', soal: 'm6-l2', judul: 'Hitung ongkosnya' },
    {
      jenis: 'materi', label: 'Pola', judul: 'Konteks beda, pola sama',
      tampil(el) {
        const baris = [
          ['🚕 Taksi', 'Rp4.000 per km', 'Rp7.000 buka pintu', 'f(x) = 4.000x + 7.000'],
          ['⚽ Lapangan', 'Rp100.000 per jam', 'Rp50.000 kebersihan', 'f(x) = 100.000x + 50.000'],
          ['🏍️ Parkir', 'Rp1.000 per jam', 'Rp2.000 masuk', 'f(x) = 1.000x + 2.000'],
        ];
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Ceritanya berbeda, tetapi semuanya memakai pola yang sama: f(x) = ax + b.'),
          h('div', { class: 'gulir-tabel' },
            h('table', { class: 'tabel-pola' },
              h('thead', {}, h('tr', {}, h('th', {}, 'Konteks'), h('th', { class: 'kolom-a' }, 'a (per satuan)'), h('th', { class: 'kolom-b' }, 'b (nilai awal)'), h('th', {}, 'Rumus'))),
              h('tbody', {}, ...baris.map((r) => h('tr', {}, ...r.map((sel) => h('td', {}, sel))))))),
          kotakInfo('tips', '💡 Jika kamu bisa mengerjakan satu, kamu bisa mengerjakan semuanya.')));
      },
    },
    { jenis: 'latihan', soal: 'm6-l3', judul: 'Sewa lapangan futsal' },
    {
      jenis: 'latihan', soal: 'm6-l4', judul: 'Mencari tarif dari dua data',
      pengantar: 'Ini gabungan Modul 5 dan Modul 6: cari a dan b dari dua data cerita.',
    },
    { jenis: 'latihan', soal: 'm6-l5', judul: 'Menafsirkan arti angka' },
  ],
};
