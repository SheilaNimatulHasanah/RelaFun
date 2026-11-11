// Mesin modul: menjalankan langkah-langkah satu modul, satu langkah = satu layar.
// Alur: materi/latihan (dari definisi modul) → kuis (otomatis dari bank soal) → hasil kuis → refleksi.
// Tempo diatur siswa: tidak ada perpindahan otomatis (EL04).

import { api, GalatApi } from '../api.js';
import { ambilProgres, catatKuis, catatLangkah } from '../auth.js';
import { buatSkalaBeban } from '../components/skalaBeban.js';
import { tampilkanSoal } from '../components/soalView.js';
import { antre } from '../offlineQueue.js';
import { hitungSkorKuis } from '../penilaian.js';
import { ambilSoal, soalModul } from '../soal.js';
import { beriTahu, h, idAcak, kotakInfo } from '../ui.js';

const LABEL_JENIS = {
  'kuis-soal': 'Kuis',
  'kuis-hasil': 'Kuis',
  refleksi: 'Refleksi',
  latihan: 'Latihan',
};

export function jalankanModul(def, wadah, { keBeranda }) {
  const soalKuis = soalModul(def.nomor, 'kuis');
  const langkah = [
    ...def.langkah,
    ...soalKuis.map((s, i) => ({ jenis: 'kuis-soal', soal: s.id, judul: `Soal ${i + 1} dari ${soalKuis.length}` })),
    { jenis: 'kuis-hasil', judul: 'Kirim & lihat hasil' },
    { jenis: 'refleksi', judul: 'Bagaimana rasanya?' },
  ];
  const iKuisPertama = def.langkah.length;
  const ctx = {
    jawabanLatihan: {},
    jawabanKuis: {},
    kuisTerkirim: false,
    percobaanKuis: 1,
    mulaiKuis: null,
    hasilKuis: null,
    refleksiTersimpan: false,
  };

  const progres = ambilProgres(def.nomor);
  let indeks = progres.selesai ? 0 : Math.min(progres.langkah_terakhir || 0, iKuisPertama);
  let bersihkan = null;

  const kepala = h('div', { class: 'kepala-modul' });
  const isi = h('div', { class: 'isi-langkah' });
  const tombolKembali = h('button', { class: 'tombol tombol-sekunder', type: 'button', onclick: () => pindah(indeks - 1) }, '◄ Kembali');
  const tombolLanjut = h('button', { class: 'tombol tombol-utama', type: 'button', onclick: () => pindah(indeks + 1) }, 'Lanjut ►');
  wadah.append(h('div', { class: 'halaman-modul' },
    kepala,
    isi,
    h('nav', { class: 'navigasi-langkah', 'aria-label': 'Navigasi langkah' }, tombolKembali, tombolLanjut)));

  function gambarKepala(l) {
    const total = langkah.length;
    const bar = h('div', {
      class: 'bar-langkah', role: 'progressbar',
      'aria-valuemin': 1, 'aria-valuemax': total, 'aria-valuenow': indeks + 1,
      'aria-label': `Langkah ${indeks + 1} dari ${total}`,
    });
    for (let i = 0; i < total; i++) {
      bar.append(h('span', { class: i < indeks ? 'lewat' : i === indeks ? 'kini' : '' }));
    }
    const label = l.label || LABEL_JENIS[l.jenis] || 'Materi';
    const judul = h('h2', { class: 'judul-langkah', tabindex: '-1' },
      h('span', { class: `label-jenis jenis-${l.jenis}` }, label), ' ', l.judul || '');
    kepala.replaceChildren(h('p', { class: 'teks-langkah' }, `Modul ${def.nomor} · langkah ${indeks + 1} dari ${total}`), bar, judul);
    return judul;
  }

  function pindah(i) {
    if (i < 0) return keBeranda();
    if (i >= langkah.length) {
      beriTahu(`🎉 Modul ${def.nomor} selesai. Hebat!`);
      return keBeranda();
    }
    if (langkah[indeks]?.jenis === 'kuis-hasil' && i > indeks && !ctx.kuisTerkirim) return;
    bersihkan?.();
    bersihkan = null;
    indeks = i;
    catatLangkah(def.nomor, indeks);
    gambar();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function gambar() {
    const l = langkah[indeks];
    const judul = gambarKepala(l);
    isi.replaceChildren();
    tombolLanjut.disabled = false;
    tombolLanjut.textContent = indeks === langkah.length - 1 ? 'Selesai ✓' : 'Lanjut ►';

    if (l.jenis === 'materi') bersihkan = l.tampil(isi, ctx) || null;
    else if (l.jenis === 'latihan') gambarLatihan(l);
    else if (l.jenis === 'kuis-soal') gambarKuisSoal(l);
    else if (l.jenis === 'kuis-hasil') gambarKuisHasil();
    else if (l.jenis === 'refleksi') gambarRefleksi();

    judul.focus({ preventScroll: true });
  }

  // ---------------------------------------------------------- latihan
  function gambarLatihan(l) {
    const soal = ambilSoal(l.soal);
    if (l.pengantar) isi.append(kotakInfo('tips', l.pengantar));
    const tampilan = tampilkanSoal(soal, {
      mode: 'latihan',
      jawabanAwal: ctx.jawabanLatihan[soal.id] ?? null,
      onJawab: (j) => { ctx.jawabanLatihan[soal.id] = j; },
      onCek: (hasil) => antre('jawaban', { id_klien: idAcak(), modul: def.nomor, jenis: 'latihan', ...hasil }),
    });
    isi.append(tampilan.el);
  }

  // ---------------------------------------------------------- kuis
  function gambarKuisSoal(l) {
    const soal = ambilSoal(l.soal);
    if (!ctx.mulaiKuis) ctx.mulaiKuis = Date.now();
    if (indeks === iKuisPertama && !ctx.kuisTerkirim) {
      isi.append(kotakInfo('info',
        'Saatnya kuis! Tidak ada petunjuk dan jawaban belum langsung dicek. ',
        'Jawab semampumu, lalu kirim di akhir. Kamu boleh kembali untuk mengubah jawaban sebelum dikirim.'));
    }
    const tampilan = tampilkanSoal(soal, {
      mode: 'kuis',
      jawabanAwal: ctx.jawabanKuis[soal.id] ?? null,
      onJawab: (j) => {
        if (!ctx.kuisTerkirim) ctx.jawabanKuis[soal.id] = j;
      },
    });
    if (ctx.kuisTerkirim) {
      isi.append(kotakInfo('info', 'Kuis sudah dikirim. Untuk mengerjakan lagi, pilih “Ulangi kuis” di halaman hasil.'));
      tampilan.kunci(true);
    }
    isi.append(tampilan.el);
  }

  async function kirimKuis(tombol, pesanGalat) {
    tombol.disabled = true;
    tombol.textContent = 'Mengirim…';
    const data = {
      id_kirim: idAcak(),
      percobaan_ke: ctx.percobaanKuis,
      durasi_detik: Math.round((Date.now() - (ctx.mulaiKuis || Date.now())) / 1000),
      jawaban: soalKuis.map((s) => ({ soal_id: s.id, jawaban: ctx.jawabanKuis[s.id] ?? null })),
    };
    try {
      const hasil = await api.kuis(def.nomor, data);
      catatKuis(def.nomor, hasil.skor_tercatat ?? hasil.skor, false);
      ctx.hasilKuis = { ...hasil, sementara: false };
    } catch (galat) {
      if (galat instanceof GalatApi && !galat.bisaDiulang) {
        pesanGalat.textContent = galat.status === 401
          ? 'Sesi masuk berakhir. Keluar lalu masuk lagi untuk mengirim kuis.'
          : galat.message;
        tombol.disabled = false;
        tombol.textContent = 'Kirim jawaban kuis';
        return;
      }
      // Offline / server sedang tidur → nilai sementara di HP, kirim ke server nanti.
      const jawabanMap = Object.fromEntries(data.jawaban.map((j) => [j.soal_id, j.jawaban]));
      const lokal = hitungSkorKuis(soalKuis, jawabanMap);
      antre('kuis', data, def.nomor);
      catatKuis(def.nomor, lokal.skor, true);
      ctx.hasilKuis = { ...lokal, sementara: true };
    }
    ctx.kuisTerkirim = true;
    gambar();
  }

  function gambarKuisHasil() {
    if (!ctx.kuisTerkirim) {
      tombolLanjut.disabled = true;
      const dijawab = soalKuis.filter((s) => (ctx.jawabanKuis[s.id] ?? null) !== null).length;
      const pesanGalat = h('p', { class: 'pesan-galat', role: 'alert' });
      const tombol = h('button', { class: 'tombol tombol-utama tombol-besar', type: 'button', onclick: () => kirimKuis(tombol, pesanGalat) }, 'Kirim jawaban kuis');
      isi.append(h('section', { class: 'kartu' },
        h('p', {}, `Kamu sudah menjawab ${dijawab} dari ${soalKuis.length} soal.`),
        dijawab < soalKuis.length
          ? kotakInfo('peringatan', 'Masih ada soal yang kosong. Tekan “◄ Kembali” untuk melengkapinya, atau kirim sekarang.')
          : null,
        tombol,
        pesanGalat));
      return;
    }

    const hasil = ctx.hasilKuis;
    const pesanSemangat = hasil.skor >= 75
      ? 'Hebat! Kamu sudah memahami modul ini. 🎉'
      : 'Tidak apa-apa. Baca pembahasan soal yang belum tepat, lalu coba ulangi kuisnya.';
    const tercatat = hasil.skor_tercatat ?? null;

    isi.append(
      h('section', { class: 'kartu kartu-skor' },
        h('p', { class: 'angka-skor' }, String(hasil.skor)),
        h('p', {}, `${hasil.jumlah_benar} dari ${hasil.total} soal benar`),
        h('p', {}, pesanSemangat),
        hasil.sementara
          ? kotakInfo('info', '⏳ Skor sementara (dihitung di HP karena belum tersambung ke server). Akan dikirim otomatis saat online.')
          : null,
        tercatat !== null && tercatat !== hasil.skor
          ? h('p', { class: 'label-kecil' }, `Skor yang tercatat untuk penelitian adalah percobaan pertamamu: ${tercatat}.`)
          : null),
      h('h3', {}, 'Pembahasan'),
      h('ol', { class: 'daftar-rincian' }, ...hasil.rincian.map((r) => {
        const soal = ambilSoal(r.soal_id);
        return h('li', { class: r.benar ? 'benar' : 'salah' },
          h('p', {}, r.benar ? '✅ ' : '❌ ', soal.teks),
          h('details', {}, h('summary', {}, 'Lihat pembahasan'), h('p', {}, soal.pembahasan)));
      })),
      h('button', {
        class: 'tombol tombol-sekunder', type: 'button',
        onclick: () => {
          ctx.jawabanKuis = {};
          ctx.kuisTerkirim = false;
          ctx.hasilKuis = null;
          ctx.mulaiKuis = null;
          ctx.percobaanKuis += 1;
          pindah(iKuisPertama);
        },
      }, '↺ Ulangi kuis'),
    );
  }

  // ---------------------------------------------------------- refleksi
  function gambarRefleksi() {
    const skala = buatSkalaBeban();
    const teks = h('textarea', { class: 'input-refleksi', rows: 4, maxlength: 500, placeholder: 'Tulis dengan kata-katamu sendiri…' });
    const status = h('p', { class: 'pesan-status', 'aria-live': 'polite' });
    const tombol = h('button', {
      class: 'tombol tombol-utama', type: 'button',
      onclick: () => {
        if (skala.nilai() === null) {
          status.textContent = 'Pilih dulu angka 1 sampai 9, ya.';
          return;
        }
        antre('skala', { id_klien: idAcak(), modul: def.nomor, skor: skala.nilai(), penjelasan: teks.value.trim() || null });
        ctx.refleksiTersimpan = true;
        tombol.disabled = true;
        teks.disabled = true;
        status.textContent = '✓ Terima kasih! Refleksimu tersimpan.';
      },
    }, 'Simpan refleksi');

    if (ctx.refleksiTersimpan) {
      isi.append(kotakInfo('info', '✓ Refleksi modul ini sudah tersimpan. Tekan “Selesai ✓” untuk kembali ke beranda.'));
      return;
    }
    isi.append(h('section', { class: 'kartu' },
      skala.el,
      h('label', { class: 'label-refleksi' }, h('span', {}, def.refleksi), teks),
      tombol,
      status));
  }

  gambar();
  return () => bersihkan?.();
}
