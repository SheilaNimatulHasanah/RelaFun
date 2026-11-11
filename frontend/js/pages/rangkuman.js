// Kartu konsep: ringkasan setiap modul yang bisa dibuka kapan saja.

import { h, tanda } from '../ui.js';

const KARTU = [
  {
    judul: '🔥 Pemanasan',
    isi: () => [
      h('li', {}, 'Tanda sama → hasil positif; tanda beda → hasil negatif.'),
      h('li', {}, 'Substitusi bilangan negatif selalu pakai kurung: 3 · (−2) − 1.'),
      h('li', {}, 'Eliminasi: kurangkan dua persamaan agar satu huruf hilang.'),
    ],
  },
  {
    judul: '🔗 Relasi',
    isi: () => [
      h('li', {}, 'Relasi memasangkan anggota himpunan A dengan anggota himpunan B.'),
      h('li', {}, 'Panah selalu dari A ke B: “(anggota A) … (anggota B)”.'),
      h('li', {}, '“2 faktor dari 6” sama artinya dengan “6 kelipatan dari 2”.'),
    ],
  },
  {
    judul: '🎯 Fungsi',
    isi: () => [
      h('li', {}, 'Fungsi: setiap anggota A punya TEPAT SATU pasangan.'),
      h('li', {}, 'Tidak boleh jomblo, tidak boleh mendua.'),
      h('li', {}, 'Anggota B boleh dipilih banyak atau tidak dipilih.'),
    ],
  },
  {
    judul: '🧩 Domain, Kodomain, Range',
    isi: () => [
      h('li', {}, tanda('x', 'Domain'), ' = semua anggota A (input).'),
      h('li', {}, 'Kodomain = semua anggota B.'),
      h('li', {}, tanda('fx', 'Range'), ' = anggota B yang kena panah (output).'),
      h('li', {}, 'Bentuk penyajian: diagram panah, pasangan berurutan, tabel, grafik.'),
    ],
  },
  {
    judul: '⚙️ Mesin Fungsi',
    isi: () => [
      h('li', {}, 'f(x) = ax + b: input ', tanda('x', 'x'), ' dikali a, ditambah b, keluar ', tanda('fx', 'f(x)'), '.'),
      h('li', {}, 'f(4) = 11 → input 4, output 11.'),
      h('li', {}, tanda('a', 'a'), ' = perubahan f(x) setiap x naik 1; ', tanda('b', 'b'), ' = nilai f(0).'),
    ],
  },
  {
    judul: '🔍 Mencari a dan b',
    isi: () => [
      h('li', {}, 'Tulis dua persamaan dari dua nilai fungsi.'),
      h('li', {}, 'Kurangkan agar b hilang → cari a.'),
      h('li', {}, 'Masukkan a ke salah satu persamaan → cari b.'),
      h('li', {}, 'Cek dengan substitusi balik!'),
    ],
  },
  {
    judul: '🚕 Soal Cerita',
    isi: () => [
      h('li', {}, tanda('b', 'b'), ' = nilai awal, dibayar sekali.'),
      h('li', {}, tanda('a', 'a'), ' = per satuan (kata kunci: per, setiap).'),
      h('li', {}, 'Merumuskan → menerapkan → menafsirkan.'),
    ],
  },
];

export function halamanRangkuman(wadah) {
  wadah.append(h('div', { class: 'halaman-rangkuman' },
    h('p', {}, 'Ringkasan konsep setiap modul. Buka kapan saja saat butuh pengingat.'),
    ...KARTU.map((k) => h('section', { class: 'kartu kartu-konsep' }, h('h3', {}, k.judul), h('ul', {}, ...k.isi())))));
}
