// Modul 1 — Mengenal Relasi.
// Temuan: K01 (konteks sehari-hari terasa mudah), EL01 (arah panah "faktor dari"/"kelipatan dari"),
// DS02 (interaktif drag-and-drop dulu), DS03/EL03 (panah sedikit & berwarna).

import { buatDiagramPanah } from '../components/arrowDiagram.js';
import { buatLangkahBertahap } from '../components/stepReveal.js';
import { h, kotakInfo } from '../ui.js';

export default {
  nomor: 1,
  judul: 'Mengenal Relasi',
  ringkas: 'Memasangkan anggota dua himpunan dengan diagram panah.',
  ikon: '🔗',
  refleksi: 'Bagaimana caramu menentukan arah panah dari sebuah kalimat relasi?',
  langkah: [
    {
      jenis: 'materi', label: 'Pengantar', judul: 'Apa itu relasi?',
      tampil(el) {
        const diagram = buatDiagramPanah({
          A: { nama: 'Teman', anggota: ['Ani', 'Budi', 'Citra'] },
          B: { nama: 'Makanan', anggota: ['Bakso', 'Mi ayam', 'Soto'] },
          pasangan: [['Ani', 'Bakso'], ['Budi', 'Mi ayam'], ['Citra', 'Bakso']],
        });
        el.append(h('section', { class: 'kartu' },
          h('p', {}, h('strong', {}, 'Relasi'), ' adalah aturan yang memasangkan anggota himpunan A dengan anggota himpunan B.'),
          h('p', {}, 'Contoh relasi “makanan favorit” dari himpunan Teman ke himpunan Makanan:'),
          diagram.el,
          kotakInfo('tips', '➡️ Panah selalu dibaca dari A ke B: “Ani makanan favoritnya bakso”.')));
      },
    },
    {
      jenis: 'latihan', soal: 'm1-l1', judul: 'Buat diagram panahmu',
      pengantar: 'Sekarang giliranmu menarik panah. Satu kalimat = satu panah.',
    },
    {
      jenis: 'materi', label: 'Contoh', judul: 'Membaca kalimat “faktor dari”',
      tampil(el) {
        const diagram = buatDiagramPanah({
          A: { nama: 'A', anggota: ['2', '3'] },
          B: { nama: 'B', anggota: ['4', '6', '9'] },
        });
        const urutan = [[], [['2', '4']], [['2', '4'], ['2', '6']], [['2', '4'], ['2', '6']], [['2', '4'], ['2', '6'], ['3', '6']], [['2', '4'], ['2', '6'], ['3', '6'], ['3', '9']]];
        const langkah = buatLangkahBertahap([
          'Kalimat relasi selalu dibaca: “(anggota A) adalah faktor dari (anggota B)”.',
          '2 faktor dari 4? 4 ÷ 2 = 2, habis ✓ → panah 2 → 4',
          '2 faktor dari 6? 6 ÷ 2 = 3, habis ✓ → panah 2 → 6',
          '2 faktor dari 9? 9 ÷ 2 tidak habis ✗ → tidak ada panah',
          '3 faktor dari 6? 6 ÷ 3 = 2 ✓ → panah 3 → 6. (3 faktor dari 4? ✗)',
          '3 faktor dari 9? 9 ÷ 3 = 3 ✓ → panah 3 → 9. Selesai!',
        ], { onLangkah: (n) => diagram.setPasangan(urutan[n - 1] || []) });
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Relasi “faktor dari” dari A = {2, 3} ke B = {4, 6, 9}. Periksa satu per satu:'),
          diagram.el,
          langkah.el));
      },
    },
    { jenis: 'latihan', soal: 'm1-l2', judul: 'Relasi “setengah dari”' },
    { jenis: 'latihan', soal: 'm1-l3', judul: 'Relasi “faktor dari”' },
    {
      jenis: 'materi', label: 'Awas!', judul: '“Kelipatan dari” — arahnya tetap A ke B',
      tampil(el) {
        const diagram = buatDiagramPanah({
          A: { nama: 'A', anggota: ['6', '8'] },
          B: { nama: 'B', anggota: ['2', '3'] },
          pasangan: [['6', '2'], ['6', '3'], ['8', '2']],
        });
        el.append(h('section', { class: 'kartu' },
          h('p', {}, '“Faktor dari” dan “kelipatan dari” artinya berlawanan:'),
          h('ul', {},
            h('li', {}, '2 adalah ', h('strong', {}, 'faktor dari'), ' 6'),
            h('li', {}, '6 adalah ', h('strong', {}, 'kelipatan dari'), ' 2')),
          h('p', {}, 'Pada relasi “kelipatan dari” dari A = {6, 8} ke B = {2, 3}, panah tetap berangkat dari A:'),
          diagram.el,
          kotakInfo('peringatan', '⚠️ Jangan bingung karena angka di A lebih besar. Arah panah ditentukan oleh “dari A ke B”, bukan oleh besar kecilnya angka.')));
      },
    },
    { jenis: 'latihan', soal: 'm1-l4', judul: 'Relasi “kelipatan dari”' },
    { jenis: 'latihan', soal: 'm1-l5', judul: 'Pilih pasangan yang benar' },
  ],
};
