// Halaman masuk: cukup nama panggilan (tanpa kode kelas, email, atau kata sandi).

import { GalatApi } from '../api.js';
import { masuk } from '../auth.js';
import { h, kotakInfo } from '../ui.js';

export function halamanMasuk(wadah, { keBeranda }) {
  const nama = h('input', { id: 'input-nama', type: 'text', autocomplete: 'nickname', maxlength: 40, required: true, class: 'input-teks' });
  const pesan = h('p', { class: 'pesan-galat', role: 'alert' });
  const tombol = h('button', { class: 'tombol tombol-utama tombol-besar', type: 'submit' }, 'Mulai belajar ►');

  const formulir = h('form', { class: 'kartu formulir-masuk', novalidate: true },
    h('label', { for: 'input-nama' }, 'Nama panggilan'),
    nama,
    h('p', { class: 'label-kecil' }, 'Tulis nama yang biasa dipakai temanmu memanggilmu.'),
    tombol,
    pesan);

  formulir.addEventListener('submit', async (e) => {
    e.preventDefault();
    pesan.textContent = '';
    if (!nama.value.trim()) { pesan.textContent = 'Isi nama panggilanmu dulu.'; nama.focus(); return; }

    tombol.disabled = true;
    tombol.textContent = 'Menghubungkan…';
    const pewaktuLambat = setTimeout(() => {
      pesan.textContent = 'Masih menghubungi server, mohon tunggu sebentar…';
    }, 5000);
    try {
      await masuk(nama.value.trim());
      keBeranda();
    } catch (galat) {
      pesan.textContent = galat instanceof GalatApi
        ? galat.message
        : 'Tidak dapat terhubung. Untuk masuk pertama kali, HP harus tersambung ke internet.';
    } finally {
      clearTimeout(pewaktuLambat);
      tombol.disabled = false;
      tombol.textContent = 'Mulai belajar ►';
    }
  });

  wadah.append(h('div', { class: 'halaman-masuk' },
    h('div', { class: 'sambutan' },
      h('img', { src: '/icons/icon-192.png', alt: '', width: 72, height: 72, class: 'logo-sambutan' }),
      h('h2', {}, 'Selamat datang di RelaFun'),
      h('p', {}, 'Belajar relasi dan fungsi pelan-pelan, langkah demi langkah.')),
    formulir,
    kotakInfo('info', '🔒 Hanya nama panggilan yang disimpan. Data belajar dipakai untuk penelitian pengembangan media pembelajaran.')));
  nama.focus();
}
