// Menampilkan langkah satu per satu (segmenting). Langkah sebelumnya tetap terlihat tetapi diredupkan.

import { h } from '../ui.js';

/**
 * daftar: array berisi string | Node | (() => Node | string)
 * onLangkah(jumlahTampil): dipanggil setiap kali langkah baru muncul
 */
export function buatLangkahBertahap(daftar, { labelTombol = 'Langkah berikutnya ▶', onLangkah, mulai = 1 } = {}) {
  let tampil = 0;
  const ol = h('ol', { class: 'daftar-bertahap' });
  const tombol = h('button', { class: 'tombol tombol-utama', type: 'button', onclick: () => berikut() }, labelTombol);
  const tombolUlang = h('button', { class: 'tombol tombol-teks', type: 'button', onclick: () => ulang() }, '↺ Dari awal');
  const el = h('div', { class: 'langkah-bertahap' }, ol, h('div', { class: 'baris-tombol' }, tombol, tombolUlang));

  function isi(item) {
    const nilai = typeof item === 'function' ? item() : item;
    return nilai instanceof Node ? nilai : document.createTextNode(String(nilai));
  }

  function perbarui() {
    [...ol.children].forEach((li, i) => {
      li.classList.toggle('aktif', i === tampil - 1);
      li.classList.toggle('lewat', i < tampil - 1);
    });
    const habis = tampil >= daftar.length;
    tombol.disabled = habis;
    tombol.textContent = habis ? 'Selesai ✓' : labelTombol;
    tombolUlang.hidden = tampil <= 1;
  }

  function berikut() {
    if (tampil >= daftar.length) return;
    ol.append(h('li', {}, isi(daftar[tampil])));
    tampil += 1;
    perbarui();
    onLangkah?.(tampil);
  }

  function ulang() {
    ol.replaceChildren();
    tampil = 0;
    for (let i = 0; i < mulai; i++) berikut();
    perbarui();
  }

  ulang();
  return { el, berikut, ulang, jumlahTampil: () => tampil };
}
