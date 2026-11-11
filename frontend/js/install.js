// Pemasangan aplikasi ke layar utama HP (PWA) tanpa Play Store / App Store.
// - Android & desktop (Chrome/Edge): memakai event beforeinstallprompt → tombol "Pasang".
// - iPhone/iPad (Safari): tidak ada tombol otomatis → tampilkan panduan "Tambahkan ke Layar Utama".

import { h, simpanan } from './ui.js';

const KUNCI_TUNDA = 'fungsiku_tunda_pasang';
let peristiwaPasang = null;
const pendengar = new Set();

function beriKabar() {
  for (const fn of pendengar) fn();
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  peristiwaPasang = e;
  beriKabar();
});

window.addEventListener('appinstalled', () => {
  peristiwaPasang = null;
  beriKabar();
});

export function sudahTerpasang() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function adalahIOS() {
  const ua = navigator.userAgent || '';
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function bisaPasangOtomatis() {
  return peristiwaPasang !== null;
}

export async function pasang() {
  if (!peristiwaPasang) return false;
  const e = peristiwaPasang;
  peristiwaPasang = null;
  e.prompt();
  const { outcome } = await e.userChoice;
  beriKabar();
  return outcome === 'accepted';
}

function sedangDitunda() {
  const sampai = simpanan.baca(KUNCI_TUNDA, 0);
  return Date.now() < sampai;
}

function tunda(hari = 7) {
  simpanan.tulis(KUNCI_TUNDA, Date.now() + hari * 86400000);
}

export function panduanIOS() {
  return h('ol', { class: 'daftar-langkah' },
    h('li', {}, 'Buka aplikasi ini di ', h('strong', {}, 'Safari'), '.'),
    h('li', {}, 'Ketuk tombol ', h('strong', {}, 'Bagikan'), ' (kotak dengan panah ke atas ⬆️).'),
    h('li', {}, 'Pilih ', h('strong', {}, 'Tambahkan ke Layar Utama'), ', lalu ketuk ', h('strong', {}, 'Tambah'), '.'),
  );
}

export function panduanAndroid() {
  return h('ol', { class: 'daftar-langkah' },
    h('li', {}, 'Buka aplikasi ini di ', h('strong', {}, 'Chrome'), '.'),
    h('li', {}, 'Ketuk tombol ', h('strong', {}, '📲 Pasang'), ' di aplikasi, atau menu ', h('strong', {}, '⋮'), ' → ', h('strong', {}, 'Instal aplikasi / Tambahkan ke layar utama'), '.'),
    h('li', {}, 'Ikon FungsiKu akan muncul di layar HP seperti aplikasi biasa.'),
  );
}

/** Kartu ajakan memasang aplikasi di Beranda. Mengembalikan elemen yang memperbarui dirinya sendiri. */
export function kartuPasang() {
  const wadah = h('div');
  let pertama = true;

  function gambar() {
    if (!pertama && !wadah.isConnected) {
      pendengar.delete(gambar); // halaman sudah ditutup
      return;
    }
    pertama = false;
    wadah.replaceChildren();
    if (sudahTerpasang() || sedangDitunda()) return;

    let isi;
    if (bisaPasangOtomatis()) {
      isi = h('div', { class: 'baris-tombol' },
        h('button', { class: 'tombol tombol-utama', type: 'button', onclick: async () => { await pasang(); gambar(); } }, '📲 Pasang'),
        h('button', { class: 'tombol tombol-teks', type: 'button', onclick: () => { tunda(); gambar(); } }, 'Nanti'),
      );
    } else if (adalahIOS()) {
      isi = h('div', {},
        panduanIOS(),
        h('button', { class: 'tombol tombol-teks', type: 'button', onclick: () => { tunda(); gambar(); } }, 'Sembunyikan'),
      );
    } else {
      return; // browser tidak mendukung pemasangan otomatis; panduan ada di halaman #/pasang
    }

    wadah.append(h('section', { class: 'kartu kartu-pasang', 'aria-label': 'Pasang aplikasi' },
      h('h2', { class: 'judul-kartu' }, '📲 Pasang FungsiKu di HP-mu'),
      h('p', {}, 'Tanpa Play Store. Muncul sebagai ikon di layar HP dan tetap bisa dibuka tanpa sinyal.'),
      isi,
    ));
  }

  pendengar.add(gambar);
  gambar();
  return wadah;
}

export function dengarPasang(fn) {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
}
