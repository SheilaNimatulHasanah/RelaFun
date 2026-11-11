// Modul 2 — Relasi vs Fungsi.
// Temuan: GL04 (analogi "tidak boleh jomblo, tidak boleh mendua"), K03 (diagram panah sudah dikuasai),
// DS02 (konsep interaktif dulu).

import { buatDiagramPanah } from '../components/arrowDiagram.js';
import { buatLangkahBertahap } from '../components/stepReveal.js';
import { cekFungsi } from '../penilaian.js';
import { h, kotakInfo } from '../ui.js';

const A = { nama: 'A', anggota: ['1', '2', '3'] };
const B = { nama: 'B', anggota: ['p', 'q', 'r'] };

export default {
  nomor: 2,
  judul: 'Relasi vs Fungsi',
  ringkas: 'Fungsi: tidak boleh jomblo, tidak boleh mendua.',
  ikon: '🎯',
  refleksi: 'Jelaskan dengan kata-katamu: kapan sebuah relasi disebut fungsi? (Bayangkan kamu menjelaskannya ke teman.)',
  langkah: [
    {
      jenis: 'materi', label: 'Pengantar', judul: 'Fungsi = relasi khusus',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', {}, h('strong', {}, 'Fungsi'), ' (pemetaan) adalah relasi yang memasangkan ', h('strong', {}, 'setiap'), ' anggota A dengan ', h('strong', {}, 'tepat satu'), ' anggota B.'),
          h('p', {}, 'Cara mudah mengingatnya, untuk setiap anggota A:'),
          h('div', { class: 'dua-kolom' },
            h('div', { class: 'kartu-aturan' }, h('p', { class: 'emoji-besar' }, '🚫💔'), h('p', {}, h('strong', {}, 'Tidak boleh jomblo')), h('p', {}, 'Setiap anggota A harus punya pasangan.')),
            h('div', { class: 'kartu-aturan' }, h('p', { class: 'emoji-besar' }, '🚫👥'), h('p', {}, h('strong', {}, 'Tidak boleh mendua')), h('p', {}, 'Setiap anggota A hanya boleh punya SATU pasangan.'))),
          kotakInfo('tips', '💡 Aturan ini hanya untuk anggota A (asal panah).')));
      },
    },
    {
      jenis: 'materi', label: 'Contoh', judul: 'Fungsi atau bukan?',
      tampil(el) {
        const contoh = [
          { pasangan: [['1', 'p'], ['2', 'q'], ['3', 'r']], teks: '✅ Contoh 1: setiap anggota A punya tepat satu panah → FUNGSI.' },
          { pasangan: [['1', 'p'], ['2', 'q']], teks: '❌ Contoh 2: angka 3 tidak punya pasangan (jomblo) → BUKAN fungsi.' },
          { pasangan: [['1', 'p'], ['2', 'q'], ['2', 'r'], ['3', 'r']], teks: '❌ Contoh 3: angka 2 punya dua pasangan (mendua) → BUKAN fungsi.' },
        ];
        const diagram = buatDiagramPanah({ A, B });
        const langkah = buatLangkahBertahap(contoh.map((c) => c.teks), {
          labelTombol: 'Contoh berikutnya ▶',
          onLangkah: (n) => {
            const c = contoh[n - 1];
            diagram.setPasangan(c.pasangan);
            const hasil = cekFungsi(c.pasangan, A.anggota);
            diagram.hapusSorot();
            diagram.sorot(hasil);
          },
        });
        el.append(h('section', { class: 'kartu' }, diagram.el, langkah.el));
      },
    },
    {
      jenis: 'materi', label: 'Penting', judul: 'Yang BOLEH untuk anggota B',
      tampil(el) {
        const diagram = buatDiagramPanah({ A, B, pasangan: [['1', 'p'], ['2', 'p'], ['3', 'q']] });
        el.append(h('section', { class: 'kartu' },
          diagram.el,
          h('p', {}, 'Relasi ini ', h('strong', {}, 'tetap fungsi'), ', walaupun:'),
          h('ul', {},
            h('li', {}, 'p dipilih oleh dua anggota A (1 dan 2) — ', h('strong', {}, 'boleh'), '.'),
            h('li', {}, 'r tidak dipilih siapa pun — ', h('strong', {}, 'boleh'), '.')),
          kotakInfo('tips', '💡 Anggota B bebas: boleh dipilih banyak, boleh tidak dipilih. Yang diperiksa hanya anggota A.')));
      },
    },
    { jenis: 'latihan', soal: 'm2-l1', judul: 'Periksa diagram' },
    { jenis: 'latihan', soal: 'm2-l2', judul: 'Periksa diagram' },
    { jenis: 'latihan', soal: 'm2-l3', judul: 'Periksa diagram' },
    { jenis: 'latihan', soal: 'm2-l4', judul: 'Hati-hati!' },
    { jenis: 'latihan', soal: 'm2-l5', judul: 'Perbaiki menjadi fungsi' },
    {
      jenis: 'materi', label: 'Contoh', judul: 'Fungsi dalam pasangan berurutan',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Relasi juga bisa ditulis sebagai himpunan pasangan berurutan (x, y):'),
          h('p', { class: 'rumus-besar' }, '{(1, p), (2, q), (3, p)}'),
          buatLangkahBertahap([
            'Angka pertama (x) adalah anggota A, angka kedua (y) adalah pasangannya di B.',
            'Daftar angka pertama: 1, 2, 3.',
            'Setiap anggota A muncul tepat satu kali → tidak ada yang jomblo atau mendua → FUNGSI.',
            'Kalau ada (1, p) dan (1, q), berarti 1 mendua → bukan fungsi.',
          ]).el));
      },
    },
    { jenis: 'latihan', soal: 'm2-l6', judul: 'Pasangan berurutan' },
  ],
};
