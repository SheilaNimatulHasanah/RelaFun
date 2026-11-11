# PRD.md — Product Requirements Document

**Produk:** RelaFun — Belajar Relasi & Fungsi Bertahap
**Versi dokumen:** 1.0 (11/11/2026)
**Penyusun:** Sheila Ni'matul Hasanah (2225250138)

## 1. Latar Belakang

Wawancara siswa S01 (lihat `ANALISIS.md`) menunjukkan bahwa siswa mudah memahami relasi lewat diagram panah dan konteks sehari-hari, tetapi kesulitan meningkat tajam saat materi beralih ke bentuk aljabar f(x) = ax + b, terutama ketika harus **mencari nilai a dan b**. Kesulitan diperparah oleh penyajian yang menambah beban (soal dan diagram terpisah, panah padat, tempo penjelasan cepat, redaksi soal yang ambigu).

## 2. Masalah

1. Beban intrinsik tinggi saat banyak langkah harus diproses bersamaan (domain → substitusi → operasi → hasil).
2. Beban ekstra akibat tata letak dan bahasa soal.
3. Prasyarat aljabar (bilangan negatif, substitusi, eliminasi) belum kuat.
4. Siswa kesulitan memodelkan soal cerita (literasi) ke rumus fungsi.

## 3. Tujuan Produk

- Menyajikan materi Relasi & Fungsi secara **bertahap, visual, dan interaktif** sesuai prinsip Cognitive Load Theory.
- Membantu siswa beralih dari representasi visual ke simbolik dengan jembatan yang jelas.
- Melatih literasi matematika: merumuskan, menerapkan, dan menafsirkan fungsi linear dalam konteks nyata.
- Mengumpulkan data belajar (skor, petunjuk yang dipakai, skala beban kognitif) di Supabase untuk tahap evaluasi penelitian.
- Dapat **dipasang di smartphone tanpa Play Store/App Store** (Progressive Web App) dan tetap bisa dipakai saat sinyal lemah/offline.
- Dibangun dengan **Python (Flask) untuk backend** dan **JavaScript untuk frontend**.

## 4. Indikator Keberhasilan

| Indikator | Cara mengukur | Target awal |
|---|---|---|
| Penguasaan materi | Skor kuis akhir tiap modul | Rata-rata ≥ 75 |
| Beban kognitif | Skala usaha mental Paas (1–9) setelah tiap modul | Rata-rata ≤ 5 dan menurun dari modul awal ke akhir pada soal sejenis |
| Literasi | Skor soal cerita Modul 6 / post-test | Meningkat dibanding pre-test |
| Kepraktisan | Angket kepraktisan siswa | Kategori "praktis" (≥ 70%) |
| Teknis | Waktu muat pertama di HP 4G (server sudah aktif) | < 3 detik |
| Pemasangan | Aplikasi lolos kriteria *installable* (Lighthouse) & berhasil dipasang di Android dan iPhone | Ya |
| Offline | Aplikasi yang sudah dipasang terbuka tanpa internet; jawaban tersinkron setelah online | Ya |

## 5. Pengguna

**Persona utama — Siswa SMP (berdasarkan S01)**
- Kelas VIII–IX, memakai HP Android, kadang sinyal tidak stabil.
- Suka konteks sehari-hari dan visual berwarna; mudah bingung dengan rumus aljabar dan soal cerita berbelit.
- Kebutuhan: langkah kecil, bisa mengulang, contoh yang jelas, cara mengecek jawaban sendiri.

**Persona sekunder — Guru/peneliti**
- Membagikan tautan aplikasi ke siswa (tidak perlu kode kelas).
- Melihat data hasil belajar lewat **dashboard Supabase** (belum ada dasbor guru di aplikasi pada fase ini).

## 6. Ruang Lingkup Fitur

### 6.1 Fitur Umum

| ID | Fitur | Keterangan | Prioritas |
|---|---|---|---|
| U1 | Masuk dengan nama panggilan | `POST /api/masuk` (Flask) memvalidasi nama, membuat data siswa, dan memberi sesi cookie; **tanpa kode kelas** sehingga siapa pun bisa langsung belajar | Wajib |
| U2 | Beranda & daftar modul | Menampilkan modul, status (belum/sedang/selesai), lanjutkan dari langkah terakhir | Wajib |
| U3 | Mini-review prasyarat | Operasi bilangan bulat (tanda negatif), substitusi, eliminasi sederhana; bisa dilewati jika lulus tes singkat | Wajib |
| U4 | Petunjuk bertingkat | Hint 1 (arah), Hint 2 (langkah), Hint 3 (contoh serupa); jumlah hint dicatat | Wajib |
| U5 | Umpan balik penjelas | Jika salah: tunjukkan bagian yang keliru + alasannya | Wajib |
| U6 | Skala beban kognitif | Setelah tiap modul: "Seberapa besar usaha pikiranmu?" (1–9) | Wajib |
| U7 | Penyimpanan progres & jawaban | Lewat API Flask ke Supabase; antrean lokal saat offline, sinkron ulang otomatis | Wajib |
| U8 | Rangkuman/kartu konsep | Ringkasan tiap modul yang bisa dibuka lagi | Sebaiknya |
| U9 | Mode gelap | Mengikuti pengaturan HP | Opsional |
| U10 | **Pasang aplikasi (PWA)** | Tombol "📲 Pasang Aplikasi" di Android/desktop, panduan "Tambahkan ke Layar Utama" di iPhone; ikon di layar utama, tampil layar penuh, tanpa Play Store/App Store | **Wajib** |
| U11 | Mode offline | Service worker menyimpan tampilan & bank soal; latihan tetap bisa dikerjakan tanpa internet | Wajib |
| U12 | Penilaian kuis di server | Skor kuis dihitung Python (`penilaian.py`) agar data penelitian terpercaya | Wajib |
| U13 | Ekspor data penelitian | Skrip Python `scripts/ekspor_data.py` → CSV + ringkasan per modul | Wajib |

### 6.2 Modul Pembelajaran (urutan sederhana → kompleks, sesuai DS02)

Setiap modul mengikuti alur: **Pengantar → Eksplorasi → Contoh → Latihan → Kuis singkat → Refleksi**.

**Modul 1 — Mengenal Relasi**
- Konteks sehari-hari: nama teman → makanan favorit (K01).
- Siswa menarik panah dengan **drag-and-drop**; tiap pasangan otomatis berwarna berbeda (DS02, DS03).
- Latihan membaca kalimat relasi "faktor dari", "kelipatan dari", "lebih dari" dengan penegasan arah **dari A ke B** (EL01).
- Maksimal 5 anggota per himpunan.

**Modul 2 — Relasi vs Fungsi**
- Analogi utama: anggota A **"tidak boleh jomblo"** (setiap anggota A punya pasangan) dan **"tidak boleh mendua"** (tepat satu pasangan) (GL04).
- Siswa memperbaiki diagram agar menjadi fungsi; aplikasi menyorot anggota yang "jomblo" atau "mendua".
- Prompt self-explanation: "Jelaskan dengan kata-katamu mengapa ini fungsi/bukan."

**Modul 3 — Domain, Kodomain, Range & Representasi**
- Satu fungsi ditampilkan bertahap: diagram panah → himpunan pasangan berurutan → tabel → grafik Kartesius (GL01, K02).
- Warna tiap pasangan **tetap sama** di semua representasi; domain, kodomain, range diberi label & warna tetap (IL01).
- Siswa mengetuk anggota untuk menandai domain/kodomain/range.

**Modul 4 — Mesin Fungsi f(x) = ax + b**
- Ilustrasi mesin: **input x → proses (×a, +b) → output f(x)** (GL03).
- **Slider x** (termasuk negatif); langkah substitusi muncul satu per satu; titik (x, f(x)) bergerak di grafik (DS01, IL02).
- Substitusi negatif selalu dalam kurung: `f(−3) = 2·(−3) + 5 = −6 + 5 = −1` (IL05).
- Latihan: tabel nilai fungsi, menebak aturan mesin dari pasangan input–output.

**Modul 5 — Mencari a dan b**
- Contoh dikerjakan penuh (worked example) → contoh setengah jadi (fading) → mandiri (K03, IL03, IL04).
- Kasus inti: diketahui f(2) = 5 dan f(4) = 11 → tulis dua persamaan → eliminasi b → cari a → substitusi → cari b.
- Langkah eliminasi dipandu kotak isian per langkah.
- Tombol **"Cek dengan substitusi balik"**: masukkan x dari soal ke rumus yang ditemukan, bandingkan hasil (GL02).

**Modul 6 — Soal Cerita / Literasi**
- Konteks: tarif taksi, sewa lapangan, sewa sepeda, biaya parkir, pulsa/kuota (GL05).
- Siswa **menyorot** bagian kalimat: "nilai awal/biaya tetap" → **b**, "per km/per jam" → **a** (EL05).
- Tahap literasi: Merumuskan (tulis f(x)) → Menerapkan (hitung) → Menafsirkan (jawab dalam kalimat konteks).
- Perbandingan dua konteks berdampingan untuk menunjukkan pola yang sama (transfer).

### 6.3 Di Luar Cakupan (fase ini)

- Dasbor guru di dalam aplikasi.
- Login email/Google.
- Aplikasi native (APK/Play Store/App Store).
- Materi selain Relasi & Fungsi.
- Fitur sosial (chat, papan peringkat).

## 7. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Teknologi | Backend **Python 3.11+ / Flask**; frontend **HTML, CSS, JavaScript** murni (tanpa build); database Supabase (Postgres) |
| Pemasangan | PWA: manifest + service worker, situs HTTPS; dapat dipasang dari Chrome Android, Edge/Chrome desktop, Safari iPhone |
| Perangkat | Chrome Android ≥ 2 versi terakhir, Safari iOS 16.4+, Chrome/Edge/Firefox desktop; lebar layar mulai 360px |
| Performa | Ringan; total aset awal < 500 KB; setelah dipasang, aplikasi terbuka dari cache |
| Hosting | Vercel paket Hobby (gratis, HTTPS otomatis): CDN untuk file PWA + fungsi Python serverless untuk Flask, region Singapura |
| Aksesibilitas | Kontras teks memenuhi WCAG AA; area sentuh ≥ 44px; warna tidak menjadi satu-satunya penanda (ada label/pola) |
| Keandalan | Tetap bisa belajar saat offline sementara; jawaban diantrekan dan dikirim ulang |
| Keamanan & privasi | Supabase hanya diakses server Flask (service_role key di `.env`, tidak di repo/klien); RLS aktif tanpa akses publik; cookie sesi HttpOnly + Secure; hanya menyimpan nama panggilan |
| Bahasa | Bahasa Indonesia baku sederhana, kalimat pendek |

## 8. Asumsi & Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Cookie sesi terhapus (hapus data browser/ganti HP) | Progres tidak tersambung | Beri tahu siswa memakai HP & aplikasi terpasang yang sama; data tetap tersimpan di server untuk analisis; fase berikutnya bisa menambah "kode pemulihan" |
| *Cold start* fungsi Python Vercel setelah lama tidak dipakai | Permintaan pertama ke server lebih lambat (biasanya beberapa detik) | Tampilan disajikan CDN & service worker sehingga tetap instan; `/api/kesehatan` dipanggil saat aplikasi dibuka; jawaban masuk antrean bila lambat |
| Proyek Supabase gratis dijeda setelah ±1 minggu tidak aktif | Masuk & simpan data gagal | Buka dashboard Supabase dan *Restore* sebelum uji coba kelas; data tetap aman |
| iPhone tidak menampilkan tombol pasang otomatis | Siswa iPhone tidak tahu cara memasang | Kartu panduan "Bagikan → Tambahkan ke Layar Utama" + halaman `#/pasang` |
| Batas paket gratis Supabase/Vercel | Layanan terhenti | Uji kapasitas sebelum uji coba kelas; data penelitian rutin diekspor ke CSV |
| Tanpa kode kelas, siapa pun yang punya tautan bisa masuk | Data penelitian tercampur pengguna non-sampel | Catat waktu uji coba & daftar nama peserta; saring data berdasarkan `dibuat_pada` dan nama saat ekspor; pembatas percobaan masuk per IP tetap aktif |
| Data dari satu informan | Kebutuhan kurang lengkap | Validasi ahli dan uji coba perorangan sebelum uji kelompok |
| Drag-and-drop sulit di layar kecil | Frustrasi | Alternatif ketuk-ketuk (ketuk anggota A lalu ketuk anggota B) |
