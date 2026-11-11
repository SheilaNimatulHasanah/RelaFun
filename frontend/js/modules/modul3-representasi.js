// Modul 3 — Domain, Kodomain, Range & Representasi.
// Temuan: GL01 (diagram berwarna dulu baru pasangan/tabel), IL01 (domain/kodomain/range di berbagai bentuk),
// K02 (urutan guru: diagram → pasangan berurutan). Warna tiap pasangan SAMA di semua bentuk.

import { buatDiagramPanah } from '../components/arrowDiagram.js';
import { buatBidangKartesius } from '../components/cartesian.js';
import { tabelFungsi } from '../components/soalView.js';
import { buatLangkahBertahap } from '../components/stepReveal.js';
import { h, kotakInfo } from '../ui.js';

const A = { nama: 'A (input)', anggota: ['1', '2', '3'] };
const B = { nama: 'B', anggota: ['1', '3', '5', '7', '9'] };
const PASANGAN = [['1', '1'], ['2', '3'], ['3', '5']];

function chipPasangan() {
  return h('p', { class: 'baris-chip' },
    '{ ',
    ...PASANGAN.flatMap(([x, y], i) => [
      h('span', { class: `chip warna-pasangan-${i}` }, `(${x}, ${y})`),
      i < PASANGAN.length - 1 ? ', ' : '',
    ]),
    ' }');
}

function grafikPasangan() {
  const bidang = buatBidangKartesius({ xMin: -1, xMax: 5, yMin: -1, yMax: 10 });
  bidang.gambarTitik(PASANGAN.map(([x, y], i) => ({ x: Number(x), y: Number(y), kelas: `warna-pasangan-${i}`, teks: `(${x}, ${y})` })));
  return h('div', { class: 'wadah-grafik' }, bidang.el);
}

export default {
  nomor: 3,
  judul: 'Domain, Kodomain & Range',
  ringkas: 'Satu fungsi dalam empat bentuk: panah, pasangan, tabel, grafik.',
  ikon: '🧩',
  refleksi: 'Apa beda kodomain dan range? Jelaskan dengan contohmu sendiri.',
  langkah: [
    {
      jenis: 'materi', label: 'Eksplorasi', judul: 'Satu fungsi, empat bentuk',
      tampil(el) {
        const diagram = buatDiagramPanah({ A, B, pasangan: PASANGAN });
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Fungsi f memetakan x ke 2x − 1. Warna setiap pasangan tetap sama di semua bentuk.'),
          h('p', { class: 'label-kecil' }, '① Diagram panah'),
          diagram.el,
          buatLangkahBertahap([
            h('div', {}, h('p', { class: 'label-kecil' }, '② Himpunan pasangan berurutan'), chipPasangan()),
            h('div', {}, h('p', { class: 'label-kecil' }, '③ Tabel'), tabelFungsi([1, 2, 3], [1, 3, 5])),
            h('div', {}, h('p', { class: 'label-kecil' }, '④ Grafik Kartesius'), grafikPasangan()),
          ], { labelTombol: 'Ubah ke bentuk berikutnya ▶', mulai: 0 }).el,
          kotakInfo('tips', '💡 Isinya sama, hanya cara menuliskannya yang berbeda.')));
      },
    },
    {
      jenis: 'materi', label: 'Konsep', judul: 'Domain, kodomain, dan range',
      tampil(el) {
        const diagram = buatDiagramPanah({ A, B, pasangan: PASANGAN });
        const penjelasan = h('p', { class: 'penjelasan-sorot', 'aria-live': 'polite' }, 'Ketuk tombol di bawah untuk menyorot.');
        const isi = {
          domain: { himpunan: 'A', anggota: A.anggota, teks: 'Domain (daerah asal) = semua anggota A = {1, 2, 3}.' },
          kodomain: { himpunan: 'B', anggota: B.anggota, teks: 'Kodomain (daerah kawan) = SEMUA anggota B = {1, 3, 5, 7, 9}.' },
          range: { himpunan: 'B', anggota: ['1', '3', '5'], teks: 'Range (daerah hasil) = anggota B yang KENA panah = {1, 3, 5}.' },
        };
        const tombol = Object.entries(isi).map(([jenis, data]) => h('button', {
          class: `tombol tombol-sorot sorot-${jenis}`, type: 'button',
          onclick: () => {
            diagram.hapusSorot();
            diagram.sorotAnggota(data.himpunan, data.anggota, jenis);
            penjelasan.textContent = data.teks;
          },
        }, jenis[0].toUpperCase() + jenis.slice(1)));
        el.append(h('section', { class: 'kartu' },
          diagram.el,
          h('div', { class: 'baris-tombol' }, ...tombol),
          penjelasan,
          kotakInfo('tips', '💡 Range selalu bagian dari kodomain. Bedanya: range hanya yang kena panah.')));
      },
    },
    { jenis: 'latihan', soal: 'm3-l1', judul: 'Menentukan range' },
    { jenis: 'latihan', soal: 'm3-l3', judul: 'Kodomain' },
    {
      jenis: 'materi', label: 'Contoh', judul: 'Membaca domain & range di grafik',
      tampil(el) {
        const bidang = buatBidangKartesius({ xMin: -1, xMax: 5, yMin: -1, yMax: 10 });
        const titik = PASANGAN.map(([x, y], i) => ({ x: Number(x), y: Number(y), kelas: `warna-pasangan-${i}` }));
        bidang.gambarTitik(titik);
        const langkah = buatLangkahBertahap([
          'Setiap titik (x, y) adalah satu pasangan.',
          'Domain dibaca di sumbu mendatar (x): 1, 2, 3.',
          'Range dibaca di sumbu tegak (f(x)): 1, 3, 5.',
        ], {
          onLangkah: (n) => {
            const t = titik[Math.min(n, titik.length) - 1];
            bidang.setAktif(t.x, t.y);
          },
        });
        el.append(h('section', { class: 'kartu' }, h('div', { class: 'wadah-grafik' }, bidang.el), langkah.el));
      },
    },
    { jenis: 'latihan', soal: 'm3-l4', judul: 'Range dari grafik' },
    { jenis: 'latihan', soal: 'm3-l2', judul: 'Domain dari pasangan berurutan' },
    { jenis: 'latihan', soal: 'm3-l5', judul: 'Membaca tabel' },
  ],
};
