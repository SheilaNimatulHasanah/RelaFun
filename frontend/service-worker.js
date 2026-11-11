// Service worker RelaFun: menyimpan tampilan aplikasi di HP agar terbuka instan dan bisa offline.
// PENTING: naikkan VERSI_CACHE setiap kali ada file frontend yang berubah.

const VERSI_CACHE = 'relafun-v1';

const ASET = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/css/tokens.css',
  '/css/style.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/data/soal.json',
  '/js/main.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/install.js',
  '/js/offlineQueue.js',
  '/js/penilaian.js',
  '/js/router.js',
  '/js/soal.js',
  '/js/ui.js',
  '/js/components/arrowDiagram.js',
  '/js/components/cartesian.js',
  '/js/components/feedback.js',
  '/js/components/functionMachine.js',
  '/js/components/hintBox.js',
  '/js/components/skalaBeban.js',
  '/js/components/soalView.js',
  '/js/components/stepReveal.js',
  '/js/components/textHighlighter.js',
  '/js/modules/daftar.js',
  '/js/modules/engine.js',
  '/js/modules/modul0-prasyarat.js',
  '/js/modules/modul1-relasi.js',
  '/js/modules/modul2-fungsi.js',
  '/js/modules/modul3-representasi.js',
  '/js/modules/modul4-mesin.js',
  '/js/modules/modul5-cari-ab.js',
  '/js/modules/modul6-soal-cerita.js',
  '/js/pages/beranda.js',
  '/js/pages/masuk.js',
  '/js/pages/pasang.js',
  '/js/pages/rangkuman.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSI_CACHE).then((cache) => cache.addAll(ASET.map((url) => new Request(url, { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const semua = await caches.keys();
    await Promise.all(semua.filter((nama) => (nama.startsWith('relafun-') || nama.startsWith('fungsiku-')) && nama !== VERSI_CACHE).map((nama) => caches.delete(nama)));
    await self.clients.claim();
  })());
});

// Siswa menekan "Muat ulang" pada pesan "Versi baru tersedia".
self.addEventListener('message', (event) => {
  if (event.data?.tipe === 'LEWATI_TUNGGU') self.skipWaiting();
});

async function cacheDulu(request) {
  const cache = await caches.open(VERSI_CACHE);
  const tersimpan = await cache.match(request, { ignoreSearch: true });
  if (tersimpan) return tersimpan;
  const respons = await fetch(request);
  if (respons.ok) cache.put(request, respons.clone());
  return respons;
}

async function basiSambilPerbarui(request) {
  const cache = await caches.open(VERSI_CACHE);
  const tersimpan = await cache.match(request);
  const ambilBaru = fetch(request).then((respons) => {
    if (respons.ok) cache.put(request, respons.clone());
    return respons;
  }).catch(() => null);
  return tersimpan || (await ambilBaru) || Response.error();
}

async function navigasi(request) {
  const cache = await caches.open(VERSI_CACHE);
  const halaman = await cache.match('/');
  if (halaman) return halaman; // tampilan aplikasi langsung dari HP (instan, walau server tidur)
  try {
    return await fetch(request);
  } catch {
    return (await cache.match('/offline.html')) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // data selalu lewat jaringan

  if (request.mode === 'navigate') {
    event.respondWith(navigasi(request));
  } else if (url.pathname === '/data/soal.json') {
    event.respondWith(basiSambilPerbarui(request));
  } else {
    event.respondWith(cacheDulu(request));
  }
});
