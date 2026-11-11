// Mesin fungsi: input x → (× a) → (+ b) → output f(x)  (temuan GL03).
// Proses berjalan SATU LANGKAH per ketukan; siswa yang mengatur tempo (EL04, IL02).

import { fmt, fmtSub, h, MINUS } from '../ui.js';

export function teksTambahB(nilai, b) {
  return b < 0 ? `${fmt(nilai)} ${MINUS} ${fmt(-b)}` : `${fmt(nilai)} + ${fmt(b)}`;
}

export function teksRumus(a, b) {
  const bagianA = a === 1 ? 'x' : a === -1 ? `${MINUS}x` : `${fmt(a)}x`;
  if (b === 0) return `f(x) = ${bagianA}`;
  return `f(x) = ${bagianA} ${b < 0 ? MINUS : '+'} ${fmt(Math.abs(b))}`;
}

export function buatMesinFungsi({ a, b, x = 3, onSelesai } = {}) {
  let langkah = 0;

  const nilaiMasuk = h('span', { class: 'nilai-kotak' });
  const nilaiKali = h('span', { class: 'nilai-kotak' });
  const nilaiTambah = h('span', { class: 'nilai-kotak' });
  const nilaiKeluar = h('span', { class: 'nilai-kotak' });
  const labelKali = h('span', { class: 'label-kotak' });
  const labelTambah = h('span', { class: 'label-kotak' });

  const kotakMasuk = h('div', { class: 'kotak-mesin kotak-masuk' }, h('span', { class: 'label-kotak' }, 'Input x'), nilaiMasuk);
  const kotakKali = h('div', { class: 'kotak-mesin kotak-proses' }, labelKali, nilaiKali);
  const kotakTambah = h('div', { class: 'kotak-mesin kotak-proses' }, labelTambah, nilaiTambah);
  const kotakKeluar = h('div', { class: 'kotak-mesin kotak-keluar' }, h('span', { class: 'label-kotak' }, 'Output f(x)'), nilaiKeluar);
  const semuaKotak = [kotakMasuk, kotakKali, kotakTambah, kotakKeluar];

  const judulRumus = h('p', { class: 'rumus-mesin' });
  const daftarLangkah = h('ol', { class: 'daftar-bertahap' });
  const tombolLanjut = h('button', { class: 'tombol tombol-utama', type: 'button', onclick: () => berikut() }, 'Proses langkah berikutnya ▶');
  const tombolUlang = h('button', { class: 'tombol tombol-sekunder', type: 'button', onclick: () => ulang() }, '↺ Ulang');

  const el = h('div', { class: 'mesin-fungsi' },
    judulRumus,
    h('div', { class: 'jalur-mesin', 'aria-hidden': 'true' },
      kotakMasuk, h('span', { class: 'panah-mesin' }, '→'),
      kotakKali, h('span', { class: 'panah-mesin' }, '→'),
      kotakTambah, h('span', { class: 'panah-mesin' }, '→'),
      kotakKeluar),
    daftarLangkah,
    h('div', { class: 'baris-tombol' }, tombolLanjut, tombolUlang));

  const hasilKali = () => a * x;
  const hasilAkhir = () => a * x + b;

  const teksLangkah = [
    () => [`Masukkan input: x = ${fmtSub(x)}`],
    () => [`Kalikan dengan a = ${fmt(a)}:  ${fmt(a)} · ${fmtSub(x)} = ${fmt(hasilKali())}`],
    () => [b < 0 ? `Kurangi ${fmt(-b)}:  ` : `Tambah b = ${fmt(b)}:  `, `${teksTambahB(hasilKali(), b)} = ${fmt(hasilAkhir())}`],
    () => [`Keluar output: f(${fmt(x)}) = ${fmt(hasilAkhir())}`],
  ];

  function gambar() {
    judulRumus.textContent = teksRumus(a, b);
    labelKali.textContent = `× ${fmtSub(a)}`;
    labelTambah.textContent = b < 0 ? `${MINUS} ${fmt(-b)}` : `+ ${fmt(b)}`;
    nilaiMasuk.textContent = langkah >= 1 ? fmt(x) : '?';
    nilaiKali.textContent = langkah >= 2 ? fmt(hasilKali()) : '';
    nilaiTambah.textContent = langkah >= 3 ? fmt(hasilAkhir()) : '';
    nilaiKeluar.textContent = langkah >= 4 ? fmt(hasilAkhir()) : '?';
    semuaKotak.forEach((k, i) => {
      k.classList.toggle('aktif', i === langkah - 1);
      k.classList.toggle('lewat', i < langkah - 1);
    });

    daftarLangkah.replaceChildren(...teksLangkah.slice(0, langkah).map((fn, i) =>
      h('li', { class: i === langkah - 1 ? 'aktif' : 'lewat' }, ...fn())));
    tombolLanjut.disabled = langkah >= 4;
    tombolLanjut.textContent = langkah >= 4 ? 'Selesai ✓' : langkah === 0 ? 'Masukkan x ke mesin ▶' : 'Proses langkah berikutnya ▶';
  }

  function berikut() {
    if (langkah >= 4) return;
    langkah += 1;
    gambar();
    if (langkah === 4) onSelesai?.(x, hasilAkhir());
  }

  function ulang() {
    langkah = 0;
    gambar();
  }

  gambar();

  return {
    el,
    setX(nilai) {
      x = nilai;
      ulang();
    },
    setFungsi(aBaru, bBaru) {
      a = aBaru;
      b = bBaru;
      ulang();
    },
    berikut,
    ulang,
  };
}
