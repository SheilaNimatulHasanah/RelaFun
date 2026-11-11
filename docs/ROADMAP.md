# ROADMAP.md — Development, Implementation, Evaluation (ADDIE)

Centang `[x]` setiap tugas yang selesai. Kerjakan berurutan; setiap fase diakhiri pengecekan di HP.

## Fase 0 — Persiapan
- [x] Instal Python 3.11+, buat virtual environment `.venv`.
- [x] Buat `requirements.txt` (produksi: flask, supabase, python-dotenv) dan `requirements-dev.txt` (+ pytest); jalankan `pip install -r requirements-dev.txt`.
- [x] Buat `.env.example` dan `.gitignore` (`.env`, `.venv/`, `__pycache__/`).
- [x] Konfigurasi deploy Vercel: `vercel.json`, `api/index.py`, `.vercelignore`, `.python-version` (+ `test_vercel.py`).
- [ ] Buat proyek Supabase (region **Southeast Asia (Singapore)**); jalankan `supabase/schema.sql` (tabel + RLS sesuai `DESAIN.md` §9).
- [ ] Isi `.env` (SUPABASE_URL, SUPABASE_SERVICE_KEY, SECRET_KEY acak).
- [ ] Inisialisasi Git & repositori GitHub (dibutuhkan untuk deploy Vercel otomatis).
- [ ] Buat akun Vercel (paket Hobby, gratis) dengan login GitHub.
- [ ] Impor repositori ke Vercel & isi Environment Variables (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SECRET_KEY`).

## Fase 1 — Kerangka Backend (Python) & Frontend (JavaScript)
- [x] `backend/app.py` (`create_app`, menyajikan `frontend/` di root), `config.py`, `db.py`.
- [x] `backend/routes.py`: `/api/kesehatan`, `/api/masuk`, `/api/saya`, `/api/keluar`.
- [x] Tes `test_api.py` untuk rute masuk (nama valid, nama kosong/terlalu panjang, pembatas percobaan).
- [x] `frontend/index.html`, `css/tokens.css`, `css/style.css` (mobile-first, mode gelap).
- [x] `js/router.js`, `js/main.js`, `js/api.js`, `js/auth.js`.
- [x] Halaman **Masuk** (cukup nama panggilan; kode kelas dihapus agar semua siswa bisa langsung belajar) dan **Beranda** (daftar modul + status).
- [x] Pola layar standar (bilah atas, progres langkah, tombol Kembali/Lanjut).

## Fase 2 — PWA (bisa dipasang tanpa Play Store/App Store)
- [x] Ikon aplikasi: 192px, 512px, maskable 512px, apple-touch-icon 180px.
- [x] `manifest.webmanifest` + tautan di `index.html` (termasuk meta `theme-color` & tag Apple).
- [x] `service-worker.js`: cache aset tampilan + `soal.json`, `/api/*` lewat jaringan, `offline.html` cadangan.
- [x] `js/install.js`: tombol "📲 Pasang Aplikasi" (Android/desktop) & panduan iPhone.
- [x] `js/offlineQueue.js`: antrean jawaban/progres, kirim batch saat online.
- [ ] Deploy awal ke Vercel → cek `https://<proyek>.vercel.app/api/kesehatan` (`mode_demo: false`) → uji pasang di HP Android (Chrome) dan iPhone (Safari).

## Fase 3 — Komponen Inti & Penilaian
- [x] `backend/penilaian.py`: `cek_fungsi`, `cek_jawaban_angka`, `hitung_skor_kuis` + `test_penilaian.py`.
- [x] `data/soal.json` (struktur sesuai `DESAIN.md` §8).
- [x] Rute `/api/progres/<modul>`, `/api/jawaban`, `/api/kuis/<modul>`, `/api/skala-beban`.
- [x] Komponen JS: `ArrowDiagram`, `CartesianPlot`, `FunctionMachine`, `StepReveal`, `HintBox`, `FeedbackBanner`, `TextHighlighter`, `SkalaBeban`.

## Fase 4 — Konten Modul
- [x] Mini-review prasyarat (bilangan bulat, substitusi, eliminasi).
- [x] Modul 1 — Mengenal Relasi.
- [x] Modul 2 — Relasi vs Fungsi.
- [x] Modul 3 — Domain, Kodomain, Range & Representasi.
- [x] Modul 4 — Mesin Fungsi.
- [x] Modul 5 — Mencari a dan b.
- [x] Modul 6 — Soal Cerita / Literasi.
- [x] Halaman Rangkuman.

## Fase 5 — Penyempurnaan & Uji Teknis
- [ ] Periksa setiap layar dengan daftar periksa cognitive load (`CLAUDE.md` §5).
- [x] `pytest` lulus semua.
- [ ] Lighthouse (Chrome DevTools): PWA *installable*, performa & aksesibilitas baik.
- [ ] Uji di HP Android nyata (layar 360px), iPhone (bila ada), dan desktop.
- [ ] Uji offline: pasang aplikasi → matikan data → buka aplikasi & jawab soal → nyalakan data → data terkirim.
- [ ] Uji *cold start* Vercel: buka aplikasi setelah lama tidak dipakai; tampilan tetap instan dari cache, masuk & kirim kuis tetap berhasil.
- [ ] Uji keamanan: Supabase tidak bisa diakses langsung dari browser; `.env` tidak ada di repositori; file `backend/` tidak bisa dibuka lewat URL Vercel.
- [ ] Deploy final ke Vercel (naikkan `VERSI_CACHE`); bagikan tautan + panduan pemasangan untuk siswa.

## Implementation — Uji Coba
1. **Validasi ahli** sebelum uji siswa:
   - Ahli materi (kebenaran konsep, soal, tujuan pembelajaran).
   - Ahli media (tampilan, navigasi, keterbacaan, kemudahan pemasangan).
   - Revisi berdasarkan masukan.
2. **Uji coba perorangan** (one-to-one, 3 siswa termasuk S01 bila bersedia): amati kesulitan, catat komentar, revisi.
3. **Uji coba kelompok kecil** (6–9 siswa): ukur kepraktisan & beban kognitif, revisi.
4. (Jika memungkinkan) **Uji lapangan** satu kelas.

Panduan pemasangan untuk siswa (dibagikan saat uji coba):
- **Android**: buka tautan di Chrome → ketuk tombol "📲 Pasang Aplikasi" (atau menu ⋮ → *Instal aplikasi*/*Tambahkan ke layar utama*).
- **iPhone**: buka tautan di Safari → ketuk ikon Bagikan → *Tambahkan ke Layar Utama*.

## Evaluation — Instrumen & Data

| Aspek | Instrumen | Sumber data |
|---|---|---|
| Kevalidan | Lembar validasi ahli materi & media (skala Likert) | Validator |
| Kepraktisan | Angket respon siswa (dan guru) | Siswa, guru |
| Beban kognitif | Skala usaha mental Paas 1–9 per modul | Tabel `skala_beban` |
| Proses belajar | Jumlah hint, percobaan, durasi | Tabel `jawaban` |
| Keefektifan / literasi | Pre-test & post-test soal literasi fungsi linear | Tes tertulis / Modul 6 |

Ekspor data: jalankan `python scripts/ekspor_data.py` → menghasilkan file CSV per tabel (siap dianalisis di Excel/SPSS). Ringkasan sederhana (rata-rata skor & skala beban per modul) juga dicetak oleh skrip ini.

## Pengembangan Lanjutan (setelah fase ini)
- Dasbor guru di dalam aplikasi (rute Flask khusus guru).
- Kode pemulihan akun agar progres bisa dibawa ke perangkat lain.
- Penambahan informan wawancara & materi lanjutan (persamaan garis lurus).
