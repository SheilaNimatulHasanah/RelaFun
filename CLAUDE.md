# CLAUDE.md — Panduan Pengembangan Aplikasi "Relasi & Fungsi"

File ini dibaca oleh AI asisten (Claude) dan pengembang sebelum menulis kode.
Baca juga dokumen di folder `docs/` sebelum mengerjakan fitur baru.

## 1. Ringkasan Proyek

| Item | Keterangan |
|---|---|
| Nama kerja | **FungsiKu** — Belajar Relasi & Fungsi Bertahap |
| Pengembang | Sheila Ni'matul Hasanah (NIM 2225250138), Pendidikan Matematika |
| Mata kuliah | Algoritma dan Pemrograman — Dosen: Dr. Aan Hendrayana, S.Si., M.Pd. |
| Materi | Relasi dan Fungsi (SMP Kelas VIII) |
| Sasaran | Siswa SMP kelas VIII–IX, diakses lewat smartphone dan browser laptop |
| Bentuk aplikasi | **PWA (Progressive Web App)** — dapat **dipasang di HP tanpa Play Store/App Store** |
| Bahasa pemrograman | **Python** (backend Flask) + **JavaScript** (frontend PWA) |
| Tujuan | Mengelola *cognitive load* siswa agar kemampuan **literasi matematika** meningkat |
| Model pengembangan | ADDIE (Analysis → Design → Development → Implementation → Evaluation) |
| Dasar kebutuhan | Wawancara siswa S01 (lihat `docs/ANALISIS.md`) |

## 2. Dokumen Perencanaan

| File | Isi | Tahap ADDIE |
|---|---|---|
| `docs/ANALISIS.md` | Temuan wawancara S01 → implikasi desain | Analysis |
| `docs/PRD.md` | Kebutuhan produk, fitur per modul, kriteria keberhasilan | Analysis → Design |
| `docs/DESAIN.md` | Arsitektur, API, PWA, alur, wireframe, komponen, desain data | Design |
| `docs/ROADMAP.md` | Urutan tugas coding, uji coba, evaluasi | Development → Evaluation |

Jika ada keputusan baru yang mengubah rencana, **perbarui dokumen terkait** terlebih dahulu.

## 3. Stack Teknologi & Aturan

### 3.1 Arsitektur Singkat

```
 HP / Laptop (browser atau PWA terpasang)              Vercel                       Database
┌───────────────────────────────────┐  HTTPS  ┌──────────────────────────────┐   ┌──────────┐
│ JavaScript: tampilan & interaksi  │ ──────► │ CDN: file frontend/ (PWA)    │   │          │
│ Service worker (offline)          │         │ Fungsi Python api/index.py:  │──►│ Supabase │
│ Antrean offline (localStorage)    │ ◄────── │  Flask → /api/*, soal.json,  │◄──│ Postgres │
└───────────────────────────────────┘  JSON   │  penilaian kuis              │   └──────────┘
                                              └──────────────────────────────┘
```

Di Vercel, file `frontend/` disajikan langsung oleh CDN (cepat). Hanya `/api/*` dan `/data/soal.json`
yang diteruskan (lewat `rewrites` di `vercel.json`) ke fungsi Python `api/index.py`, yang menjalankan
aplikasi Flask yang **sama persis** dengan di laptop.

### 3.2 Frontend — JavaScript (folder `frontend/`)
- **HTML + CSS + JavaScript murni** (ES Modules). **Tanpa** framework dan **tanpa** proses build.
- Semua interaksi pembelajaran (diagram panah, mesin fungsi, grafik, umpan balik langsung) berjalan di browser agar cepat dan tetap jalan saat offline.
- **PWA wajib**: `manifest.webmanifest`, `service-worker.js`, ikon 192/512/maskable, tombol "Pasang Aplikasi" (`install.js`).
- Frontend **tidak pernah** mengakses Supabase langsung; semua data lewat API Flask melalui `js/api.js`.
- Jika kirim data gagal (offline/server tidur), simpan ke antrean `js/offlineQueue.js` (localStorage, dibungkus try/catch) lalu kirim ulang saat online.
- Grafik dan diagram dibuat dengan **SVG** buatan sendiri (tanpa library chart).

### 3.3 Backend — Python (folder `backend/`)
- **Python 3.11+** dengan **Flask**.
- Tugas backend: menyajikan file PWA, API JSON (`/api/...`), masuk siswa (nama + kode kelas) dengan **sesi cookie Flask** yang ditandatangani, **penilaian kuis di server** (`penilaian.py`), dan menyimpan data ke Supabase.
- Akses Supabase memakai library `supabase` (supabase-py) dengan **service_role key** yang **hanya** ada di file `.env` (laptop) atau Environment Variables Vercel. `.env` **tidak boleh** masuk Git.
- Backend bersifat **stateless** (cocok untuk serverless Vercel): tidak menyimpan data di memori/berkas server. Sesi ada di cookie bertanda tangan, data di Supabase. Pembatas percobaan masuk hanya per instance (perlindungan ringan).
- Di Vercel (`VERCEL=1`), aplikasi **menolak berjalan** tanpa `SECRET_KEY` atau tanpa Supabase (MODE DEMO hanya untuk laptop).
- Semua input dari klien divalidasi di server (tipe, rentang, panjang teks).
- Skrip analisis data penelitian di `scripts/` (Python).

### 3.4 Database — Supabase
- Dipakai sebagai database Postgres saja (tanpa Supabase Auth).
- **RLS aktif** di semua tabel tanpa kebijakan untuk publik/anon, sehingga hanya server (service_role) yang bisa membaca/menulis.

### 3.5 Aturan Umum
- **Mobile-first**: desain dimulai dari lebar 360px.
- Semua teks antarmuka dalam **Bahasa Indonesia** yang sederhana dan ramah siswa SMP.
- Bank soal tunggal di `data/soal.json`, dibaca oleh JavaScript (tampilan/umpan balik) **dan** Python (penilaian kuis). Jangan menduplikasi soal di dua tempat.
- Aplikasi harus ringan untuk HP dengan kuota terbatas.

## 4. Struktur Folder

```
/
├── CLAUDE.md
├── requirements.txt            # produksi (dipasang Vercel): flask, supabase, python-dotenv
├── requirements-dev.txt        # laptop: requirements.txt + pytest
├── pytest.ini                  # konfigurasi tes
├── vercel.json                 # deploy Vercel: folder statis, rewrites, header, region sin1
├── .vercelignore               # file yang tidak diunggah ke Vercel (.env, .venv, tes, docs)
├── .python-version             # versi Python (3.12)
├── .env.example                # contoh variabel (tanpa nilai rahasia)
├── .gitignore                  # .env, .venv/, __pycache__/, ekspor/
├── api/
│   └── index.py                # entry point fungsi Python Vercel → `app = create_app()`
├── backend/                    # ===== PYTHON =====
│   ├── app.py                  # create_app(); menyajikan frontend/ di "/" dan data/soal.json
│   ├── config.py               # baca .env: SUPABASE_URL, SUPABASE_SERVICE_KEY, SECRET_KEY, COOKIE_SECURE
│   ├── db.py                   # RepoSupabase (produksi) & RepoMemori (MODE DEMO/tes)
│   ├── routes.py               # Blueprint /api
│   ├── penilaian.py            # cek jawaban per tipe soal, hitung skor kuis
│   └── tests/                  # test_penilaian, test_api, test_soal (cek kunci jawaban), test_pwa, test_vercel
├── frontend/                   # ===== JAVASCRIPT (PWA) =====
│   ├── index.html, offline.html, manifest.webmanifest, service-worker.js
│   ├── icons/                  # dibuat oleh scripts/buat_ikon.py
│   ├── css/                    # tokens.css (warna terang/gelap), style.css
│   └── js/
│       ├── main.js             # titik masuk, daftar service worker, indikator simpan
│       ├── router.js           # navigasi hash (#/masuk, #/beranda, #/modul/1, #/pasang, #/rangkuman)
│       ├── api.js              # fetch ke /api/... (satu-satunya pintu data)
│       ├── auth.js             # profil, progres, masuk/keluar
│       ├── install.js          # tombol Pasang Aplikasi & panduan iPhone
│       ├── offlineQueue.js     # antrean kirim ulang
│       ├── penilaian.js        # CERMIN backend/penilaian.py (umpan balik langsung)
│       ├── soal.js             # memuat data/soal.json
│       ├── ui.js               # pembuat elemen, format angka, localStorage aman
│       ├── components/         # arrowDiagram, cartesian, functionMachine, stepReveal, hintBox,
│       │                       # feedback, skalaBeban, textHighlighter, soalView
│       ├── modules/            # engine.js, daftar.js, modul0-prasyarat.js … modul6-soal-cerita.js
│       └── pages/              # masuk, beranda, pasang, rangkuman
├── data/
│   └── soal.json               # bank soal bersama (JS + Python)
├── supabase/
│   └── schema.sql              # tabel + RLS
├── scripts/
│   ├── buat_ikon.py            # membuat ikon PNG tanpa library tambahan
│   └── ekspor_data.py          # ekspor tabel Supabase → CSV + ringkasan per modul
└── docs/
    ├── ANALISIS.md
    ├── PRD.md
    ├── DESAIN.md
    └── ROADMAP.md
```

Catatan: Flask menyajikan `frontend/` di root (`/`), sehingga `service-worker.js` berada di `/service-worker.js` dan bisa mengendalikan seluruh aplikasi. `data/soal.json` disajikan lewat rute `/data/soal.json`.

## 5. Prinsip Wajib Cognitive Load (cek di SETIAP layar)

Setiap layar/fitur baru **wajib** lolos daftar periksa ini. Kode dalam kurung merujuk temuan wawancara.

- [ ] **Satu konsep per layar.** Materi dipecah menjadi langkah kecil (segmenting).
- [ ] **Soal dan diagram berada di satu layar**, berdekatan, tidak perlu scroll bolak-balik (EL02 — split-attention).
- [ ] **Maksimal 5 panah** per diagram, jarak antaranggota lega, **tiap pasangan beda warna** dan juga diberi label/pola (EL03, DS03).
- [ ] **Tempo dikendalikan siswa**: tombol "Lanjut"/"Langkah berikutnya", **tidak ada** perpindahan otomatis (EL04).
- [ ] **Langkah perhitungan ditampilkan bertahap**, satu langkah sekali tampil (IL02).
- [ ] **Bilangan negatif disubstitusi di dalam kurung**, mis. `f(−3) = 2·(−3) + 5` (IL05).
- [ ] **x (input) dan f(x) (output) selalu diberi warna/label tetap** di seluruh aplikasi (IL05).
- [ ] Kalimat relasi ditulis dengan arah eksplisit: "**dari A ke B**" (EL01).
- [ ] Visual dulu (diagram berwarna) → baru simbol/rumus (GL01, DS02).
- [ ] Ada **petunjuk bertingkat** dan **umpan balik yang menjelaskan**, bukan hanya "Benar/Salah".
- [ ] Tidak ada hiasan, suara, atau animasi yang tidak membantu belajar (redundancy/coherence).

## 6. Konvensi Kode

### JavaScript
- Nama file: `camelCase.js` untuk komponen, `kebab-case.js` untuk modul. Fungsi/variabel `camelCase` berbahasa Indonesia bila memungkinkan (`hitungNilaiFungsi`, `simpanJawaban`).
- Setiap modul mengekspor `render(container, state)` dan `destroy()`.
- Warna hanya dari variabel CSS di `css/tokens.css`.
- Ukuran area sentuh minimal **44 × 44 px**.
- Gunakan `textContent` (bukan `innerHTML`) untuk menampilkan input siswa.
- Setiap kali aset frontend berubah, **naikkan versi cache** di `service-worker.js` (`const VERSI_CACHE = 'fungsiku-v2'`).

### Python
- Ikuti **PEP 8**; nama fungsi/variabel `snake_case` berbahasa Indonesia (`hitung_skor_kuis`, `simpan_jawaban`).
- Gunakan **type hints** dan docstring singkat berbahasa Indonesia.
- Query database hanya di `db.py`; logika penilaian hanya di `penilaian.py` (fungsi murni, mudah diuji).
- Respons API selalu JSON: sukses `{"ok": true, "data": ...}`, gagal `{"ok": false, "pesan": "..."}` dengan kode HTTP yang sesuai.
- Setiap fungsi di `penilaian.py` wajib punya tes di `backend/tests/`.

## 7. Cara Menjalankan

### 7.1 Persiapan (sekali)
1. Instal **Python 3.11+** dan **VS Code**.
2. Buat proyek di Supabase → jalankan `supabase/schema.sql` di SQL Editor → isi beberapa kode kelas di tabel `kelas`.
3. Di folder proyek:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate          # Windows (macOS/Linux: source .venv/bin/activate)
   pip install -r requirements-dev.txt
   copy .env.example .env          # lalu isi SUPABASE_URL, SUPABASE_SERVICE_KEY, SECRET_KEY
   ```

### 7.2 Menjalankan di laptop
```bash
.venv\Scripts\python.exe -m flask --app backend.app run --debug --host 0.0.0.0
```
Buka `http://localhost:5000`.

- **MODE DEMO**: jika `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` kosong, data disimpan di memori server (hilang saat server dimatikan). Masuk dengan kode kelas **`DEMO`**.
- **Cache service worker saat mengembangkan**: tampilan diambil dari cache HP/browser. Setelah mengubah file frontend, di Chrome DevTools → Application → Service Workers centang **Update on reload**, atau naikkan `VERSI_CACHE` di `service-worker.js`. Untuk rilis, `VERSI_CACHE` **wajib** dinaikkan.
- Setiap file JS baru wajib ditambahkan ke daftar `ASET` di `service-worker.js` (dicek oleh `test_pwa.py`).
- Ikon dibuat ulang dengan `python scripts/buat_ikon.py`.

### 7.3 Uji di HP
- **Tampilan & interaksi**: sambungkan HP ke Wi-Fi yang sama, buka `http://<IP-laptop>:5000`.
- **Pemasangan PWA** butuh **HTTPS**, jadi uji "Pasang Aplikasi" di alamat hasil deploy Vercel (`https://<nama-proyek>.vercel.app`).
- Alternatif cepat di laptop: Chrome DevTools → *Toggle device toolbar* (360 × 740) dan tab *Application → Manifest / Service Workers*.

### 7.4 Tes otomatis
```bash
pytest
```

### 7.5 Deploy (Vercel)

Cara kerja (sudah diatur di `vercel.json`, tidak perlu diubah):

| Bagian | Diatur oleh | Keterangan |
|---|---|---|
| File PWA (`/`, `/css`, `/js`, `/icons`, `/service-worker.js`) | `"outputDirectory": "frontend"` | Disajikan CDN Vercel, tanpa proses build |
| `/api/*` dan `/data/soal.json` | `rewrites` → `api/index.py` | Fungsi Python menjalankan Flask (`create_app()`) |
| Library Python | `requirements.txt` | Dipasang otomatis oleh Vercel |
| Region fungsi | `"regions": ["sin1"]` | Singapura, terdekat ke Indonesia; buat proyek Supabase di region Singapura juga |
| Header khusus | `headers` | `service-worker.js` tanpa cache, tipe MIME manifest |

Langkah deploy:
1. Unggah proyek ke repositori GitHub (pastikan `.env` **tidak** ikut, sudah diatur `.gitignore`).
2. vercel.com → **Add New → Project** → impor repositori. *Framework Preset*: **Other**. Biarkan Build/Install/Output command kosong (diambil dari `vercel.json`).
3. **Settings → Environment Variables** (centang Production & Preview):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (service_role key, rahasia)
   - `SECRET_KEY` (buat dengan `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `COOKIE_SECURE` **tidak perlu** (otomatis HTTPS di Vercel).
4. Deploy (atau **Redeploy** setelah mengubah environment variable; variabel baru hanya berlaku untuk deploy berikutnya).
5. Uji: buka `https://<nama-proyek>.vercel.app/api/kesehatan` → harus `"status": "hidup"` dan `"mode_demo": false`.

Setiap `git push` ke cabang utama otomatis membuat deploy baru. Jangan lupa naikkan `VERSI_CACHE` di `service-worker.js` bila ada file frontend yang berubah.

Alternatif tanpa GitHub (perlu Node.js): `npm i -g vercel` → `vercel login` → `vercel` (preview) → `vercel --prod`.

Jika muncul galat: lihat **Vercel → Project → Logs**. Pesan `SECRET_KEY belum diisi` atau `SUPABASE_URL ... wajib diisi` berarti environment variable belum lengkap.

## 8. Definisi "Selesai" untuk Sebuah Fitur

- Berjalan di Chrome Android dan Chrome/Edge desktop (dan Safari iPhone bila tersedia).
- Lolos daftar periksa cognitive load (bagian 5).
- Data tersimpan ke Supabase lewat API Flask dan tetap aman saat koneksi putus.
- `pytest` lulus semua (termasuk `test_vercel.py` untuk konfigurasi deploy).
- Aplikasi tetap **dapat dipasang** (Lighthouse/DevTools: manifest & service worker valid) dan halaman yang sudah dibuka bisa diakses offline.
- Tidak ada error di Console browser maupun log Flask.
- Dokumen di `docs/` diperbarui bila ada perubahan rencana.
