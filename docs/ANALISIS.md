# ANALISIS.md — Tahap Analysis (ADDIE)

## 1. Identitas Kegiatan

| Item | Keterangan |
|---|---|
| Peneliti/pewawancara | Sheila Ni'matul Hasanah (2225250138) |
| Informan | S01, siswa kelas 9 (belajar Relasi & Fungsi di kelas VIII semester 2) |
| Tanggal | 08/11/2026 |
| Metode | Wawancara retrospektif semi-terstruktur via panggilan video, ±9 menit |
| Dokumentasi | Foto (tanpa rekaman suara/video), artefak catatan/latihan siswa |
| Kategori kode | **K** (konteks pembelajaran), **IL** (intrinsic load), **EL** (extraneous load), **GL** (germane load), **DS** (desain/usulan siswa) |

S01 memenuhi syarat informan retrospektif: ingat diagram panah, domain, kodomain, range, rumus f(x) = ax + b, serta jenis soal yang pernah dikerjakan (Skrining 1–3).

## 2. Kerangka Teori Singkat

**Cognitive Load Theory (Sweller):** kapasitas memori kerja terbatas, sehingga beban belajar perlu diatur:

| Jenis beban | Arti | Strategi di aplikasi |
|---|---|---|
| Intrinsic (IL) | Kerumitan materi itu sendiri, terutama banyaknya unsur yang saling terkait | **Kelola**: urutkan dari sederhana ke kompleks, pre-training prasyarat, pecah langkah, worked example lalu fading |
| Extraneous (EL) | Beban dari cara penyajian yang buruk | **Kurangi**: hindari split-attention, kurangi kepadatan visual, bahasa jelas, tempo diatur siswa |
| Germane (GL) | Usaha membangun skema/pemahaman | **Dorong**: self-explanation, variasi konteks, verifikasi, analogi |

**Literasi matematika (PISA):** siswa mampu **merumuskan** situasi nyata ke model matematika, **menerapkan** konsep dan prosedur, serta **menafsirkan** hasil kembali ke konteks. Untuk materi ini: dari soal cerita (tarif taksi, sewa) → fungsi linear f(x) = ax + b → hitung → maknai a dan b.

## 3. Matriks Temuan → Implikasi Desain

| Kode | Temuan inti (ringkasan kutipan S01) | Jenis | Implikasi desain | Fitur/komponen |
|---|---|---|---|---|
| Skrining 1 | Belajar di kelas VIII semester 2 | K | Informan valid untuk analisis retrospektif | — |
| Skrining 2 | Ingat diagram panah, domain, kodomain, range, f(x)=ax+b | K | Konsep inti aplikasi sudah tepat | Modul 1–4 |
| Skrining 3 | Soal: menentukan fungsi/bukan, menghitung f(x) | K | Jenis latihan utama yang perlu ada | Modul 2, 4 |
| K01 | Seru saat konteks "nama → makanan favorit"; bingung saat masuk aljabar & tabel pasangan berurutan | K, IL | Mulai dari konteks sehari-hari; transisi ke aljabar/tabel dibuat bertahap dan terhubung | Modul 1, Modul 3 (transisi bertahap) |
| K02 | Urutan guru: diagram panah → pasangan berurutan → latihan buku | K | Pertahankan urutan yang sudah dikenal siswa, tambahkan jembatan visual | Alur modul |
| K03 | Diagram panah mudah; soal mencari a dan b langsung bingung | K, IL | Bagian mencari a dan b butuh scaffolding paling banyak | Modul 5 (worked example → fading) |
| IL01 | Sulit membedakan aturan fungsi serta domain/kodomain/range di diagram Kartesius & rumus aljabar | IL | Satu relasi ditampilkan di beberapa representasi dengan warna konsisten; domain/kodomain/range selalu diberi label & warna tetap | Modul 3, `CartesianPlot` |
| IL02 | Harus memikirkan domain → substitusi → operasi aljabar → hasil | IL | Banyak unsur sekaligus (element interactivity) → tampilkan langkah satu per satu | `StepReveal`, Modul 4 |
| IL03 | Prasyarat aljabar (substitusi, eliminasi); sering salah hitung saat mencari rumus dari f(2)=5, f(4)=11 | IL | Pre-training aljabar singkat; langkah eliminasi dipandu | Mini-review prasyarat, Modul 5 |
| IL04 | Kesulitan naik saat pindah dari diagram panah ke f(x)=ax+b dan mencari a, b | IL | Jembatan: diagram panah → mesin fungsi → rumus | Modul 4 sebelum Modul 5 |
| IL05 | Salah tanda negatif-positif saat substitusi; tertukar x dan f(x) | IL | Substitusi negatif selalu dalam kurung; x & f(x) punya warna/label tetap; latihan bilangan bulat | Konvensi visual, mini-review |
| EL01 | Kalimat "faktor dari"/"kelipatan dari" membingungkan arah panah | EL | Redaksi ditulis eksplisit "dari A ke B"; latihan khusus membaca arah relasi | Modul 1 (latihan arah) |
| EL02 | Diagram & pertanyaan beda halaman → bolak-balik | EL | **Split-attention**: soal dan diagram selalu satu layar | Pola layar standar |
| EL03 | Panah menumpuk/rapat bikin salah lihat pasangan | EL | Batasi panah (maks. 5), jarak lega, warna per pasangan | `ArrowDiagram` |
| EL04 | Penjelasan guru terlalu cepat saat grafik Kartesius → rumus | EL | Tempo dikendalikan siswa (tombol lanjut, bisa mundur, ulangi) | Semua modul |
| EL05 | Soal cerita taksi/sewa: bingung mana konstanta (nilai awal) dan koefisien (tarif per km) | EL, IL | Sorot bagian kalimat: "nilai awal" → b, "per satuan" → a; latihan memetakan teks ke rumus | Modul 6 |
| GL01 | Paham jika diagram panah berwarna dulu, baru diubah ke pasangan berurutan/tabel | GL | Visual berwarna → simbol, warna dipertahankan antar-representasi | Modul 3 |
| GL02 | Mengecek jawaban dengan substitusi balik a dan b | GL | Tombol "Cek dengan substitusi balik" sebagai kebiasaan verifikasi | Modul 5, 6 |
| GL03 | Terbantu petunjuk visual "mesin" untuk f(x) | GL | Metafora mesin input → proses → output | `FunctionMachine`, Modul 4 |
| GL04 | Analogi "tidak boleh jomblo, tidak boleh mendua" membuat ingat | GL | Pakai analogi ini sebagai penjelasan utama fungsi; ajak siswa menjelaskan dengan kata sendiri | Modul 2, prompt self-explanation |
| GL05 | Sadar pola taksi & sewa lapangan sama-sama ax + b | GL | Variasi konteks dengan struktur sama (transfer) | Modul 6 |
| DS01 | Ingin geser x, terlihat proses hitung, y bergerak di grafik | DS | Slider x + langkah hitung + titik bergerak di grafik | Modul 4 |
| DS02 | Konsep relasi vs fungsi interaktif dulu (drag-and-drop), baru menulis rumus | DS | Urutan modul: interaktif → menulis rumus | Urutan Modul 1 → 6 |
| DS03 | Jangan banyak panah sekaligus; warna beda tiap pasangan | DS | Sama dengan EL03 | `ArrowDiagram` |

## 4. Rangkuman Kebutuhan

1. **Titik kesulitan utama**: peralihan dari representasi visual (diagram panah) ke simbolik (f(x) = ax + b), terutama **mencari a dan b** dari dua nilai fungsi (K03, IL03, IL04).
2. **Sumber beban ekstra**: tata letak soal terpisah, diagram padat, tempo cepat, redaksi soal ambigu (EL01–EL05).
3. **Yang sudah membantu siswa**: warna, metafora mesin, analogi, cek substitusi balik, konteks sehari-hari (GL01–GL05).
4. **Prasyarat yang perlu diperkuat**: operasi bilangan bulat (tanda negatif), substitusi, eliminasi (IL03, IL05).
5. **Tujuan literasi**: siswa mampu memodelkan soal cerita ke f(x) = ax + b dan menafsirkan arti a dan b dalam konteks.
6. **Kebutuhan akses**: wawancara dilakukan lewat HP (panggilan video), menunjukkan siswa terbiasa dengan smartphone. Aplikasi harus nyaman di HP, **bisa dipasang tanpa Play Store/App Store** (PWA), dan tetap bisa dipakai saat sinyal lemah.

## 5. Tujuan Pembelajaran (turunan analisis)

Setelah memakai aplikasi, siswa dapat:
1. Menyatakan relasi antara dua himpunan dengan diagram panah sesuai kalimat relasi (arah A → B).
2. Membedakan relasi yang merupakan fungsi dan yang bukan, beserta alasannya.
3. Menentukan domain, kodomain, dan range dari diagram panah, pasangan berurutan, tabel, dan grafik.
4. Menghitung nilai fungsi f(x) = ax + b untuk x bilangan bulat (termasuk negatif).
5. Menentukan rumus fungsi linear dari dua nilai fungsi dan memeriksanya dengan substitusi balik.
6. Memodelkan dan menyelesaikan soal cerita fungsi linear serta menafsirkan makna a dan b.

## 6. Keterbatasan & Tindak Lanjut

- Data berasal dari **satu informan**; temuan bersifat awal. Disarankan menambah 2–4 siswa dan wawancara/angket guru.
- Istilah "korespondensi satu-satu" (catatan IL01) perlu dikonfirmasi agar tidak tertukar dengan konsep fungsi.
- Analisis artefak catatan siswa dapat diperdalam (jenis kesalahan yang muncul).
- Desain perlu **validasi ahli materi & ahli media** sebelum uji coba (lihat `ROADMAP.md`).
