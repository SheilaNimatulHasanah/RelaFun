// Halaman masuk: nama panggilan + kode kelas (tanpa email/kata sandi).

import { GalatApi } from '../api.js';
import { masuk } from '../auth.js';
import { h, kotakInfo } from '../ui.js';

export function halamanMasuk(wadah, { keBeranda }) {
  const nama = h('input', { id: 'input-nama', type: 'text', autocomplete: 'nickname', maxlength: 40, required: true, class: 'input-teks' });
  const kode = h('input', {
    id: 'input-kode', type: 'text', autocomplete: 'off', autocapitalize: 'characters', maxlength: 20, required: true,
    class: 'input-teks input-kode', placeholder: 'mis. 9A-SMPN1',
  });
  const pesan = h('p', { class: 'pesan-galat', role: 'alert' });
  const tombol = h('button', { class: 'tombol tombol-utama tombol-besar', type: 'submit' }, 'Mulai belajar ►');

  const formulir = h('form', { class: 'kartu formulir-masuk', novalidate: true },
    h('label', { for: 'input-nama' }, 'Nama panggilan'),
    nama,
    h('label', { for: 'input-kode' }, 'Kode kelas'),
    kode,
    h('p', { class: 'label-kecil' }, 'Kode kelas diberikan oleh gurumu.'),
    tombol,
    pesan);

  formulir.addEventListener('submit', async (e) => {
    e.preventDefault();
    pesan.textContent = '';
    if (!nama.value.trim()) { pesan.textContent = 'Isi nama panggilanmu dulu.'; nama.focus(); return; }
    if (!kode.value.trim()) { pesan.textContent = 'Isi kode kelas dulu.'; kode.focus(); return; }

    tombol.disabled = true;
    tombol.textContent = 'Menghubungkan…';
    const pewaktuLambat = setTimeout(() => {
      pesan.textContent = 'Masih menghubungi server, mohon tunggu sebentar…';
    }, 5000);
    try {
      await masuk(nama.value.trim(), kode.value.trim());
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
      h('h2', {}, 'Selamat datang di FungsiKu'),
      h('p', {}, 'Belajar relasi dan fungsi pelan-pelan, langkah demi langkah.')),
    formulir,
    kotakInfo('info', '🔒 Hanya nama panggilan dan kode kelas yang disimpan. Data belajar dipakai untuk penelitian pengembangan media pembelajaran.')));
  nama.focus();
}
