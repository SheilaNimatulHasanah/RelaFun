// Modul 4 — Mesin Fungsi f(x) = ax + b.
// Temuan: GL03 (petunjuk visual mesin), DS01 (geser x → proses hitung terlihat → titik bergerak di grafik),
// IL02 (langkah bertahap), IL05 (negatif dalam kurung; x = input, f(x) = output), IL04 (jembatan panah → rumus).

import { buatBidangKartesius } from '../components/cartesian.js';
import { buatMesinFungsi, teksRumus, teksTambahB } from '../components/functionMachine.js';
import { fmt, fmtSub, h, kotakInfo, tanda } from '../ui.js';

function penggeser({ label, min, max, nilai, onUbah, kelas = '' }) {
  const keluaran = h('output', { class: 'nilai-penggeser' }, fmt(nilai));
  const input = h('input', { type: 'range', min, max, step: 1, class: `penggeser ${kelas}`, 'aria-label': label });
  input.value = String(nilai);
  input.addEventListener('input', () => {
    const v = Number(input.value);
    keluaran.textContent = fmt(v);
    onUbah(v);
  });
  return h('label', { class: 'baris-penggeser' }, h('span', { class: 'label-penggeser' }, label), input, keluaran);
}

export default {
  nomor: 4,
  judul: 'Mesin Fungsi',
  ringkas: 'Input x masuk, diproses, keluar sebagai f(x).',
  ikon: '⚙️',
  refleksi: 'Ceritakan cara kerja mesin f(x) = 2x + 1 dengan kata-katamu sendiri.',
  langkah: [
    {
      jenis: 'materi', label: 'Pengantar', judul: 'Fungsi seperti mesin',
      tampil(el) {
        const mesin = buatMesinFungsi({ a: 2, b: 1, x: 3 });
        el.append(h('section', { class: 'kartu' },
          h('p', {}, 'Bayangkan fungsi sebagai mesin. Kita memasukkan ', tanda('x', 'input x'), ', mesin memprosesnya, lalu keluar ', tanda('fx', 'output f(x)'), '.'),
          penggeser({ label: 'Pilih x:', min: -5, max: 5, nilai: 3, onUbah: (v) => mesin.setX(v), kelas: 'penggeser-x' }),
          mesin.el,
          kotakInfo('tips', '💡 Ketuk tombol untuk memproses satu langkah. Coba juga x negatif, perhatikan kurungnya.')));
      },
    },
    {
      jenis: 'materi', label: 'Eksplorasi', judul: 'Geser x, lihat titiknya bergerak',
      tampil(el) {
        const a = 2;
        const b = 1;
        const bidang = buatBidangKartesius({ xMin: -5, xMax: 5, yMin: -10, yMax: 12, langkah: 1 });
        const dikunjungi = new Map();
        const hitungan = h('div', { class: 'hitungan-langsung', 'aria-live': 'polite' });
        let garisTampil = false;

        function perbarui(x) {
          const y = a * x + b;
          hitungan.replaceChildren(
            h('p', {}, `f(${fmt(x)}) = ${fmt(a)} · `, tanda('x', fmtSub(x)), ` + ${fmt(b)}`),
            h('p', {}, `= ${teksTambahB(a * x, b)}`),
            h('p', {}, '= ', tanda('fx', fmt(y))));
          dikunjungi.set(x, y);
          bidang.gambarTitik([...dikunjungi].map(([tx, ty]) => ({ x: tx, y: ty, kelas: 'titik-jejak' })));
          bidang.setAktif(x, y);
        }

        const tombolGaris = h('button', {
          class: 'tombol tombol-sekunder', type: 'button',
          onclick: () => {
            garisTampil = !garisTampil;
            if (garisTampil) bidang.gambarGaris(a, b);
            else bidang.hapusGaris();
            tombolGaris.textContent = garisTampil ? 'Sembunyikan garis' : 'Hubungkan titik-titiknya';
          },
        }, 'Hubungkan titik-titiknya');

        el.append(h('section', { class: 'kartu' },
          h('p', { class: 'rumus-besar' }, teksRumus(a, b)),
          penggeser({ label: 'Geser x:', min: -5, max: 5, nilai: 1, onUbah: perbarui, kelas: 'penggeser-x' }),
          hitungan,
          h('div', { class: 'wadah-grafik' }, bidang.el),
          tombolGaris,
          kotakInfo('tips', '💡 Geser x ke beberapa nilai. Titik-titik yang kamu kunjungi tetap tertinggal. Apa pola yang kamu lihat?')));
        perbarui(1);
      },
    },
    { jenis: 'latihan', soal: 'm4-l1', judul: 'Menghitung nilai fungsi' },
    { jenis: 'latihan', soal: 'm4-l2', judul: 'Menghitung nilai fungsi' },
    {
      jenis: 'materi', label: 'Awas!', judul: 'Mana input, mana output?',
      tampil(el) {
        el.append(h('section', { class: 'kartu' },
          h('p', { class: 'rumus-besar' }, 'f(', tanda('x', '4'), ') = ', tanda('fx', '11')),
          h('ul', {},
            h('li', {}, tanda('x', '4'), ' adalah ', h('strong', {}, 'input'), ' (x), ditulis di dalam kurung f( ).'),
            h('li', {}, tanda('fx', '11'), ' adalah ', h('strong', {}, 'output'), ' f(x), hasil mesinnya.')),
          h('div', { class: 'dua-kolom' },
            h('div', { class: 'kartu-aturan' },
              h('p', {}, h('strong', {}, 'Diketahui input → cari output')),
              h('p', {}, 'Substitusi: ganti x dengan angkanya.'),
              h('p', {}, 'f(x) = 4x + 1, f(3) = 4 · 3 + 1 = 13')),
            h('div', { class: 'kartu-aturan' },
              h('p', {}, h('strong', {}, 'Diketahui output → cari input')),
              h('p', {}, 'Buat persamaan lalu selesaikan.'),
              h('p', {}, '4x + 1 = 13 → 4x = 12 → x = 3')))));
      },
    },
    { jenis: 'latihan', soal: 'm4-l3', judul: 'Dari output ke input' },
    { jenis: 'latihan', soal: 'm4-l4', judul: 'Tabel nilai fungsi' },
    {
      jenis: 'materi', label: 'Eksplorasi', judul: 'Apa arti a dan b?',
      tampil(el) {
        let a = 2;
        let b = 1;
        const bidang = buatBidangKartesius({ xMin: -5, xMax: 5, yMin: -8, yMax: 8 });
        const rumus = h('p', { class: 'rumus-besar', 'aria-live': 'polite' });
        function perbarui() {
          rumus.replaceChildren(teksRumus(a, b));
          bidang.gambarGaris(a, b);
          bidang.gambarTitik([{ x: 0, y: b, kelas: 'titik-b', teks: `b = ${fmt(b)}` }]);
        }
        el.append(h('section', { class: 'kartu' },
          rumus,
          penggeser({ label: 'a:', min: -3, max: 3, nilai: a, onUbah: (v) => { a = v; perbarui(); }, kelas: 'penggeser-a' }),
          penggeser({ label: 'b:', min: -4, max: 4, nilai: b, onUbah: (v) => { b = v; perbarui(); }, kelas: 'penggeser-b' }),
          h('div', { class: 'wadah-grafik' }, bidang.el),
          h('ul', {},
            h('li', {}, tanda('a', 'a'), ': setiap x naik 1, f(x) berubah sebanyak a. Makin besar a, garis makin curam.'),
            h('li', {}, tanda('b', 'b'), ': nilai f(x) saat x = 0, yaitu titik awal di sumbu tegak.'))));
        perbarui();
      },
    },
    { jenis: 'latihan', soal: 'm4-l5', judul: 'Menebak aturan mesin' },
  ],
};
