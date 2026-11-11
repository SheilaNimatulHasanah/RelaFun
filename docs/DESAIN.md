# DESAIN.md — Tahap Design (ADDIE)

Dokumen ini menerjemahkan `ANALISIS.md` dan `PRD.md` menjadi rancangan arsitektur, tampilan, interaksi, komponen, API, dan data.

## 1. Arsitektur

```
┌──────────── Perangkat siswa ────────────┐
│ PWA terpasang (ikon di layar utama)     │
│  atau browser biasa                     │
│                                         │
│  JavaScript (frontend/)                 │
│  ├─ tampilan modul & komponen SVG       │
│  ├─ umpan balik langsung (latihan)      │
│  ├─ service-worker.js  → cache offline  │
│  └─ offlineQueue.js    → antrean kirim  │
└───────────────┬─────────────────────────┘
                │ HTTPS, JSON (fetch /api/...)
                │ cookie sesi (HttpOnly, Secure)
┌───────────────▼─────────────────────────┐
│ Vercel: CDN (frontend/) + fungsi Python │
│ api/index.py → Flask (backend/)         │
│  ├─ menyajikan file frontend/ di "/"    │
│  ├─ routes.py     → API /api/...        │
│  ├─ penilaian.py  → skor kuis           │
│  └─ db.py         → supabase-py         │
└───────────────┬─────────────────────────┘
                │ service_role key (.env server)
┌───────────────▼─────────────────────────┐
│ Supabase (Postgres) — RLS aktif         │
└─────────────────────────────────────────┘
```

Pembagian tugas bahasa:

| Bagian | Bahasa | Alasan |
|---|---|---|
| Tampilan, interaksi, animasi langkah, umpan balik latihan | JavaScript | Harus instan dan tetap jalan offline |
| PWA (manifest, service worker, tombol pasang) | JavaScript + JSON | Standar web untuk aplikasi yang bisa dipasang |
| API, sesi siswa, validasi, penilaian kuis | Python (Flask) | Kunci database aman di server; skor kuis tidak bisa dimanipulasi dari HP |
| Ekspor & ringkasan data penelitian | Python (`scripts/`) | Mudah mengolah data untuk tahap Evaluation |

## 2. Peta Navigasi

```
#/masuk ──► #/beranda ──► #/prasyarat (mini-review, bisa dilewati)
                │
                ├──► #/modul/1  Mengenal Relasi
                ├──► #/modul/2  Relasi vs Fungsi
                ├──► #/modul/3  Domain, Kodomain, Range & Representasi
                ├──► #/modul/4  Mesin Fungsi
                ├──► #/modul/5  Mencari a dan b
                ├──► #/modul/6  Soal Cerita
                ├──► #/rangkuman
                └──► #/pasang   (panduan memasang aplikasi)
```

Alur di dalam setiap modul (satu langkah = satu layar):

```
Pengantar → Eksplorasi → Contoh → Latihan (3–5 soal) → Kuis singkat → Refleksi (skala 1–9 + "jelaskan dengan kata-katamu")
```

Modul dibuka berurutan (modul berikutnya terbuka setelah kuis modul sebelumnya dikerjakan), tetapi modul yang sudah dibuka bisa diulang kapan saja.

## 3. Pola Layar Standar

### 3.1 Smartphone (360–599px)

```
┌──────────────────────────────┐
│ ←  Modul 4 · Mesin Fungsi  ✓ │  bilah atas: kembali + judul + status simpan
│ ■■■■■□□□  langkah 5 dari 8   │  progres langkah
├──────────────────────────────┤
│ PERTANYAAN / INSTRUKSI       │  ← selalu di atas visual
│ "Geser x ke −3. Berapa f(x)?"│
├──────────────────────────────┤
│                              │
│   [ VISUAL / DIAGRAM ]       │  ← satu layar dengan soal (EL02)
│                              │
├──────────────────────────────┤
│ Langkah hitung (bertahap)    │
│ f(−3) = 2·(−3) + 5           │
├──────────────────────────────┤
│ 💡 Petunjuk     [  Cek  ]    │
│ [ ◄ Kembali ]  [ Lanjut ► ]  │  tempo diatur siswa (EL04)
└──────────────────────────────┘
```

### 3.2 Tablet/Desktop (≥ 900px)

```
┌───────────────────────────────────────────────────────────┐
│ RelaFun   Modul 4 · Mesin Fungsi        langkah 5 dari 8 │
├───────────────────────────┬───────────────────────────────┤
│ PERTANYAAN / INSTRUKSI    │                               │
│                           │     [ VISUAL / DIAGRAM ]      │
│ Langkah hitung bertahap   │                               │
│                           │                               │
│ 💡 Petunjuk   [ Cek ]     │                               │
├───────────────────────────┴───────────────────────────────┤
│ [ ◄ Kembali ]                                [ Lanjut ► ] │
└───────────────────────────────────────────────────────────┘
```

### 3.3 Beranda (dengan tombol pasang)

```
┌──────────────────────────────┐
│ RelaFun        Halo, Rina 👋 │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ 📲 Pasang RelaFun di HP │ │  ← muncul hanya jika belum terpasang
│ │ Bisa dibuka tanpa sinyal │ │
│ │ [ Pasang ]   [ Nanti ]   │ │
│ └──────────────────────────┘ │
│ ▶ Lanjutkan: Modul 4 lgkh 5  │
│ ① Mengenal Relasi      ✓     │
│ ② Relasi vs Fungsi     ✓     │
│ ③ Representasi         ✓     │
│ ④ Mesin Fungsi        ◐      │
│ ⑤ Mencari a dan b     🔒     │
│ ⑥ Soal Cerita         🔒     │
└──────────────────────────────┘
```

Aturan tata letak:
- Soal dan visual **tidak pernah** dipisah halaman/tab (split-attention).
- Area konten tidak lebih dari ~1,5 tinggi layar HP; jika lebih, pecah menjadi langkah baru.
- Tombol utama di bagian bawah agar mudah dijangkau ibu jari.
- Saat berjalan sebagai PWA (`display: standalone`), sediakan tombol kembali sendiri di bilah atas karena tidak ada bilah browser.

## 4. Sistem Visual

### 4.1 Warna Semantik (tetap di seluruh aplikasi)

| Token | Arti | Terang | Gelap |
|---|---|---|---|
| `--warna-x` | input / x / domain | biru `#2563EB` | `#60A5FA` |
| `--warna-fx` | output / f(x) / range | oranye `#EA580C` | `#FB923C` |
| `--warna-kodomain` | kodomain | abu `#64748B` | `#94A3B8` |
| `--warna-a` | koefisien a (per satuan) | ungu `#7C3AED` | `#A78BFA` |
| `--warna-b` | konstanta b (nilai awal) | hijau `#059669` | `#34D399` |
| `--benar` | umpan balik benar | hijau `#16A34A` | `#4ADE80` |
| `--salah` | umpan balik salah | merah `#DC2626` | `#F87171` |
| `--tema` | warna tema PWA (bilah status HP) | `#2563EB` | `#0F172A` |

### 4.2 Warna Pasangan Panah (maks. 5, ramah buta warna — palet Okabe-Ito)

| Pasangan | Warna | Pola garis cadangan |
|---|---|---|
| 1 | `#0072B2` biru | utuh |
| 2 | `#E69F00` jingga | putus-putus panjang |
| 3 | `#009E73` hijau kebiruan | titik-titik |
| 4 | `#CC79A7` merah muda | putus-titik |
| 5 | `#56B4E9` biru langit | putus-putus pendek |

Setiap panah juga diberi nomor/label kecil agar warna bukan satu-satunya penanda.

### 4.3 Tipografi & Ukuran

- Font: sistem (`system-ui, "Segoe UI", Roboto, sans-serif`); tanda minus memakai karakter `−` (U+2212) agar jelas.
- Ukuran teks dasar 16–18px di HP; rumus 20px+.
- Area sentuh ≥ 44 × 44px; jarak antar anggota himpunan ≥ 48px.
- Sudut membulat 12px, bayangan tipis, latar polos (tanpa gambar dekoratif).
- Mode gelap memakai `prefers-color-scheme` dan token di `css/tokens.css`.

### 4.4 Ikon Aplikasi

- Simbol sederhana "f(x)" putih di atas kotak biru `--tema`, dengan panah kecil.
- Ukuran: 192, 512, maskable 512 (isi berada di zona aman 80% tengah), apple-touch-icon 180.

## 5. Spesifikasi Komponen (JavaScript)

### 5.1 `ArrowDiagram` (Modul 1, 2, 3)
- Dua oval himpunan A (kiri) dan B (kanan), tiap himpunan maks. 5 anggota.
- Interaksi: **drag** dari anggota A ke anggota B, atau **ketuk A lalu ketuk B** (alternatif HP). Ketuk panah untuk menghapus.
- Panah otomatis berwarna sesuai urutan pasangan (§4.2).
- Mode: `bebas` (siswa membuat), `tampil` (hanya baca), `perbaiki` (siswa mengubah agar menjadi fungsi).
- Pemeriksa di JS: `cekFungsi(pasangan, A)` → `{ adalahFungsi, jomblo: [...], mendua: [...] }` untuk umpan balik langsung; logika yang sama ada di Python `cek_fungsi()` untuk penilaian kuis.

### 5.2 `FunctionMachine` (Modul 4, 5)
- Gambar mesin: corong masuk (x, biru) → kotak proses "× a" lalu "+ b" → corong keluar (f(x), oranye).
- Saat x berubah: angka berjalan melewati kotak proses satu per satu (diputar langkah demi langkah, tidak otomatis).

### 5.3 `CartesianPlot` (Modul 3, 4, 6)
- SVG, rentang default −10 … 10, kisi tipis, sumbu tebal, label sumbu x (biru) dan y/f(x) (oranye).
- Menampilkan titik pasangan (warna sesuai pasangan) atau garis f(x) = ax + b.
- Titik aktif bergerak mengikuti slider x (DS01), dengan garis bantu putus-putus ke kedua sumbu.

### 5.4 `StepReveal`
- Menampilkan langkah hitung satu baris per ketukan "Langkah berikutnya".
- Mode `contoh` (semua terisi), `setengah` (sebagian kotak kosong), `mandiri` (semua diisi siswa) — mendukung *fading*.
- Bagian yang sedang dibahas disorot; langkah sebelumnya tetap terlihat (redup).

### 5.5 `HintBox`
- Tiga tingkat: (1) pertanyaan pengarah, (2) langkah berikutnya, (3) contoh serupa dengan angka berbeda.
- Mencatat jumlah petunjuk yang dibuka.

### 5.6 `FeedbackBanner`
- Benar: konfirmasi singkat + satu kalimat alasan.
- Salah: tunjukkan bagian yang keliru (mis. "Tanda negatif hilang di langkah 2") + ajakan mencoba lagi; tidak langsung memberi jawaban.

### 5.7 `TextHighlighter` (Modul 6)
- Siswa mengetuk frasa dalam soal cerita lalu memilih label "nilai awal (b)" atau "per satuan (a)"; frasa berubah warna sesuai `--warna-b` / `--warna-a`.

### 5.8 `SkalaBeban` (refleksi)
- 9 tombol: 1 "sangat-sangat ringan" … 9 "sangat-sangat berat"; pertanyaan: "Seberapa besar usaha pikiran yang kamu keluarkan di modul ini?"

### 5.9 `InstallPrompt` (`install.js`)
- Lihat §7.3.

## 6. Pemetaan Prinsip Cognitive Load → Keputusan Desain

| Prinsip | Keputusan desain | Temuan |
|---|---|---|
| Split-attention | Soal & visual satu layar, label langsung di diagram | EL02 |
| Coherence / pengurangan kepadatan | Maks. 5 panah, tanpa hiasan | EL03, DS03 |
| Signaling | Warna tetap untuk x, f(x), a, b; sorotan langkah aktif | IL01, IL05, EL05 |
| Segmenting & learner pacing | Satu konsep per layar, tombol lanjut/kembali | IL02, EL04 |
| Pre-training | Mini-review bilangan bulat & substitusi sebelum Modul 4–5 | IL03, IL05 |
| Simple-to-complex sequencing | Relasi → fungsi → representasi → mesin → a,b → soal cerita | K01, IL04, DS02 |
| Worked example & fading | Modul 5: contoh penuh → setengah → mandiri | K03, IL03 |
| Multiple representations terhubung | Panah ↔ pasangan ↔ tabel ↔ grafik, warna konsisten | GL01, IL01 |
| Self-explanation | Prompt "jelaskan dengan kata-katamu", analogi jomblo/mendua | GL04 |
| Variability & transfer | Beberapa konteks soal cerita berstruktur sama | GL05 |
| Self-verification | Tombol cek substitusi balik | GL02 |

Catatan: kemampuan **offline** juga mengurangi beban ekstra — siswa tidak terganggu loading atau kehilangan jawaban saat sinyal putus.

## 7. Desain PWA (bisa dipasang tanpa Play Store/App Store)

### 7.1 `manifest.webmanifest`

```json
{
  "name": "RelaFun – Relasi & Fungsi",
  "short_name": "RelaFun",
  "description": "Belajar relasi dan fungsi bertahap untuk SMP",
  "lang": "id",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#FFFFFF",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Di `index.html`: `<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">`, `<meta name="apple-mobile-web-app-capable" content="yes">`.

### 7.2 Strategi Cache (`service-worker.js`)

| Jenis permintaan | Strategi | Keterangan |
|---|---|---|
| Aset tampilan (HTML, CSS, JS, ikon) | Cache-first, di-*precache* saat instal | Aplikasi terbuka instan & offline |
| `/data/soal.json` | Stale-while-revalidate | Soal tersedia offline, diperbarui diam-diam |
| `/api/*` | Network-only | Data tidak boleh basi; jika gagal → antrean offline |
| Navigasi saat offline & belum ter-cache | `offline.html` | Pesan ramah "Kamu sedang offline" |

- Nama cache memakai versi (`relafun-v1`); saat versi naik, cache lama dihapus di event `activate`.
- Jika ada versi baru, tampilkan pesan kecil "Versi baru tersedia — [Muat ulang]" (siswa yang memutuskan, sesuai prinsip tempo siswa).

### 7.3 Alur Pemasangan (`install.js`)

```
Aplikasi dibuka
  ├─ sudah berjalan standalone (sudah terpasang)? ── ya ──► sembunyikan kartu pasang
  │
  ├─ Android/desktop Chrome/Edge: event `beforeinstallprompt`
  │     └─ simpan event → tampilkan kartu "📲 Pasang RelaFun"
  │           └─ ketuk [Pasang] → prompt() → catat hasil (diterima/ditolak)
  │
  └─ iPhone/iPad (Safari, tidak ada prompt otomatis)
        └─ tampilkan kartu panduan: "Ketuk ikon Bagikan ⬆️ → Tambahkan ke Layar Utama"
```

- [Nanti] menyembunyikan kartu selama 7 hari (disimpan di localStorage).
- Halaman `#/pasang` berisi panduan bergambar untuk Android dan iPhone, bisa dibuka dari menu.
- Syarat pemasangan: situs **HTTPS** (Vercel menyediakan otomatis), manifest valid, service worker aktif.

### 7.4 Antrean Offline (`offlineQueue.js`)

- Setiap pengiriman (`simpanJawaban`, `simpanProgres`, `simpanSkalaBeban`) mencoba `fetch` ke API.
- Jika gagal (offline/server tidur): data disimpan di localStorage kunci `antrean_relafun` (try/catch), lalu dikirim **batch** ke `POST /api/jawaban` saat event `online`, saat aplikasi dibuka, atau setiap 60 detik.
- Indikator di bilah atas: "✓ Tersimpan" / "⏳ Menunggu sinyal…".
- Kuis yang dikerjakan offline: skor sementara dihitung JS dan ditandai "menunggu konfirmasi"; skor resmi dari server setelah tersinkron.

## 8. Desain Soal & Penilaian

- Bank soal `data/soal.json` dipakai bersama oleh JavaScript dan Python. Setiap soal: `id`, `modul`, `tipe` (`pilihan`, `angka`, `diagram`, `sorot_teks`), `teks`, `data`, `kunci`, `hint` (3 item), `pembahasan`.

```json
{
  "id": "m5-k1",
  "modul": 5,
  "tipe": "angka",
  "teks": "Diketahui f(x) = ax + b, f(2) = 5 dan f(4) = 11. Tentukan nilai a.",
  "data": { "titik": [[2, 5], [4, 11]] },
  "kunci": 3,
  "hint": ["Tulis dua persamaan dari f(2) dan f(4).", "Kurangkan kedua persamaan untuk menghilangkan b.", "Contoh: f(1)=4, f(3)=8 → 2a = 4 → a = 2"],
  "pembahasan": "4a + b = 11 dan 2a + b = 5 → 2a = 6 → a = 3"
}
```

- **Latihan**: diperiksa di JS (umpan balik instan, offline).
- **Kuis**: jawaban dikirim ke `POST /api/kuis/<modul>`, skor dihitung `penilaian.py` di server (data penelitian lebih terpercaya).
- Isian angka menerima `-` maupun `−`, spasi diabaikan.
- Skor kuis = jumlah benar pada percobaan pertama (skala 0–100); percobaan ulang tetap dicatat.
- Fungsi Python di `penilaian.py`: `cek_jawaban_angka(jawaban, kunci)`, `cek_fungsi(pasangan, domain)`, `cek_pilihan(...)`, `cek_sorot_teks(...)`, `hitung_skor_kuis(modul, jawaban_siswa)`.

## 9. Desain Data (Supabase)

### 9.1 Tabel

```
siswa                                   -- tanpa kode kelas: siapa pun bisa masuk dengan nama
  id             uuid  PRIMARY KEY default gen_random_uuid()   -- dibuat oleh Flask
  nama           text  not null check (char_length(nama) between 1 and 40)
  dibuat_pada    timestamptz default now()

progres_modul
  siswa_id         uuid references siswa(id) on delete cascade
  modul            smallint  (0 = prasyarat, 1–6)
  langkah_terakhir smallint
  selesai          boolean default false
  skor_kuis        smallint            -- dihitung server, 0–100
  updated_at       timestamptz default now()
  PRIMARY KEY (siswa_id, modul)

jawaban
  id            bigint generated always as identity PRIMARY KEY
  id_klien      text unique            -- dibuat JS, mencegah duplikat saat antrean dikirim ulang
  siswa_id      uuid references siswa(id) on delete cascade
  modul         smallint
  soal_id       text
  jenis         text                   -- 'latihan' | 'kuis'
  jawaban       jsonb
  benar         boolean
  percobaan_ke  smallint
  jumlah_hint   smallint
  durasi_detik  integer
  dibuat_pada   timestamptz default now()

skala_beban
  id            bigint generated always as identity PRIMARY KEY
  siswa_id      uuid references siswa(id) on delete cascade
  modul         smallint
  skor          smallint check (skor between 1 and 9)
  penjelasan    text                   -- self-explanation (opsional, maks. 500 karakter)
  dibuat_pada   timestamptz default now()
```

### 9.2 Keamanan

- **RLS aktif** di semua tabel **tanpa kebijakan** untuk peran `anon`/`authenticated` → tidak ada akses langsung dari internet.
- Hanya Flask (memakai `service_role` key dari `.env`) yang membaca/menulis.
- Flask memastikan setiap query memakai `siswa_id` dari **sesi** (bukan dari isi permintaan), sehingga siswa hanya bisa mengubah datanya sendiri.
- Cookie sesi: `HttpOnly`, `Secure`, `SameSite=Lax`, masa berlaku 180 hari, ditandatangani `SECRET_KEY`.

### 9.3 Alur Masuk

```
Buka aplikasi
  └─ GET /api/saya ── 200 (cookie sesi valid) ──► #/beranda (lanjut progres terakhir)
                │
               401
                ▼
  Form: Nama panggilan (tanpa kode kelas)
  └─ POST /api/masuk
        ├─ nama kosong / > 40 huruf ──► 400 "Nama panggilan harus diisi"
        └─ valid ──► insert `siswa` → set cookie sesi → #/beranda
```

## 10. Desain API (Flask)

Semua respons JSON: sukses `{"ok": true, "data": ...}`, gagal `{"ok": false, "pesan": "..."}`.

| Metode | Rute | Masukan | Keluaran | Sesi |
|---|---|---|---|---|
| GET | `/api/kesehatan` | — | `{"status": "hidup"}` | tidak |
| POST | `/api/masuk` | `{nama}` | profil siswa `{id, nama}` | tidak |
| GET | `/api/saya` | — | profil + progres semua modul | ya |
| POST | `/api/keluar` | — | — | ya |
| PUT | `/api/progres/<modul>` | `{langkah_terakhir, selesai}` | progres | ya |
| POST | `/api/jawaban` | satu objek atau daftar jawaban (dengan `id_klien`) | jumlah tersimpan | ya |
| POST | `/api/kuis/<modul>` | `{jawaban: [{soal_id, jawaban}], ...}` | skor + rincian benar/salah | ya |
| POST | `/api/skala-beban` | `{modul, skor, penjelasan}` | — | ya |
| GET | `/data/soal.json` | — | bank soal | tidak |

Validasi & perlindungan:
- `modul` 0–6, `skor` 1–9, panjang teks dibatasi, daftar jawaban maks. 100 item per permintaan.
- Batas percobaan sederhana di `/api/masuk` (mis. 10 kali/menit per IP).
- `/api/kesehatan` dipanggil saat aplikasi dibuka untuk "menghangatkan" fungsi Vercel lebih awal (mengurangi jeda *cold start*).
- Batas percobaan masuk disimpan di memori per instance fungsi Vercel, jadi hanya perlindungan ringan.
