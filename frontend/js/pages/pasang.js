// Halaman panduan memasang aplikasi (tanpa Play Store / App Store).

import { adalahIOS, bisaPasangOtomatis, dengarPasang, panduanAndroid, panduanIOS, pasang, sudahTerpasang } from '../install.js';
import { h, kotakInfo } from '../ui.js';

export function halamanPasang(wadah) {
  const status = h('div');

  function gambarStatus() {
    status.replaceChildren();
    if (sudahTerpasang()) {
      status.append(kotakInfo('info', '✅ RelaFun sudah terpasang dan sedang berjalan sebagai aplikasi.'));
    } else if (bisaPasangOtomatis()) {
      status.append(h('button', {
        class: 'tombol tombol-utama tombol-besar', type: 'button',
        onclick: async () => { await pasang(); gambarStatus(); },
      }, '📲 Pasang sekarang'));
    }
  }

  const berhenti = dengarPasang(gambarStatus);
  gambarStatus();

  const android = h('section', { class: 'kartu' }, h('h3', {}, '🤖 HP Android'), panduanAndroid());
  const ios = h('section', { class: 'kartu' }, h('h3', {}, '🍎 iPhone / iPad'), panduanIOS());

  wadah.append(h('div', { class: 'halaman-pasang' },
    h('p', {}, 'RelaFun bisa dipasang seperti aplikasi biasa ', h('strong', {}, 'tanpa Play Store atau App Store'), '. Setelah dipasang, ikon RelaFun muncul di layar HP dan bisa dibuka walaupun tanpa sinyal.'),
    status,
    ...(adalahIOS() ? [ios, android] : [android, ios]),
    h('section', { class: 'kartu' }, h('h3', {}, '💻 Laptop'),
      h('p', {}, 'Di Chrome atau Edge, klik ikon pasang (⊕) di ujung kanan kolom alamat.')),
    kotakInfo('info', 'Aplikasi tetap diperbarui otomatis. Jika ada versi baru, akan muncul pesan “Versi baru tersedia”.')));

  return berhenti;
}
