// Titik masuk aplikasi RelaFun.

import './install.js'; // dimuat paling awal agar event "beforeinstallprompt" tidak terlewat
import { api } from './api.js';
import { ambilProfil, verifikasiSesi } from './auth.js';
import { dengarAntrean, kirimSemua } from './offlineQueue.js';
import { mulaiRouter, muatUlangHalaman, pergi } from './router.js';
import { muatBankSoal } from './soal.js';
import { beriTahu, h } from './ui.js';

function daftarkanServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const adaKontrolerAwal = Boolean(navigator.serviceWorker.controller);

  const tawarkanPembaruan = (sw) => beriTahu('Versi baru RelaFun tersedia.', {
    tombol: 'Muat ulang',
    aksi: () => sw.postMessage({ tipe: 'LEWATI_TUNGGU' }),
    lama: 0,
  });

  navigator.serviceWorker.register('/service-worker.js').then((reg) => {
    if (reg.waiting && adaKontrolerAwal) tawarkanPembaruan(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const baru = reg.installing;
      baru?.addEventListener('statechange', () => {
        if (baru.state === 'installed' && navigator.serviceWorker.controller) tawarkanPembaruan(baru);
      });
    });
  }).catch((galat) => console.warn('Service worker gagal didaftarkan:', galat));

  let sudahMuatUlang = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!adaKontrolerAwal || sudahMuatUlang) return; // kunjungan pertama: tidak perlu muat ulang
    sudahMuatUlang = true;
    window.location.reload();
  });
}

function pasangIndikatorSimpan() {
  const el = document.getElementById('status-simpan');
  const gambar = (status, jumlah) => {
    if (navigator.onLine === false) {
      el.textContent = jumlah ? `📴 Offline · ${jumlah} menunggu` : '📴 Offline';
      el.dataset.status = 'offline';
    } else if (status === 'mengirim') {
      el.textContent = '↻ Menyimpan…';
      el.dataset.status = status;
    } else if (status === 'menunggu') {
      el.textContent = `⏳ ${jumlah} belum terkirim`;
      el.dataset.status = status;
    } else {
      el.textContent = ambilProfil() ? '✓ Tersimpan' : '';
      el.dataset.status = status;
    }
  };
  let terakhir = ['tersimpan', 0];
  dengarAntrean((status, jumlah) => { terakhir = [status, jumlah]; gambar(status, jumlah); });
  window.addEventListener('online', () => gambar(...terakhir));
  window.addEventListener('offline', () => gambar(...terakhir));
}

async function mulai() {
  daftarkanServiceWorker();
  pasangIndikatorSimpan();

  try {
    await muatBankSoal();
  } catch {
    document.getElementById('aplikasi').replaceChildren(
      h('div', { class: 'kartu' },
        h('h2', {}, 'Aplikasi belum bisa dimuat'),
        h('p', {}, 'Sambungkan HP ke internet, lalu muat ulang halaman ini. Setelah dibuka sekali, RelaFun bisa dipakai tanpa sinyal.'),
        h('button', { class: 'tombol tombol-utama', type: 'button', onclick: () => window.location.reload() }, 'Muat ulang')));
    return;
  }

  mulaiRouter();

  // Hangatkan fungsi server (cold start Vercel) di latar, tanpa membuat siswa menunggu.
  api.kesehatan().catch(() => {});

  if (ambilProfil()) {
    const hasil = await verifikasiSesi();
    if (hasil === 'keluar') {
      beriTahu('Sesi berakhir. Silakan masuk lagi.');
      pergi('#/masuk');
    } else if (hasil === 'ok') {
      kirimSemua();
      if ((window.location.hash || '#/beranda') === '#/beranda') muatUlangHalaman();
    }
  }
}

mulai();
