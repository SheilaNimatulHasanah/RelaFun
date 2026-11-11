// Menampilkan satu soal dari bank soal, untuk mode 'latihan' (cek langsung + petunjuk)
// atau 'kuis' (tanpa petunjuk, dinilai di akhir oleh server).
// Prinsip: soal dan visualnya SELALU dalam satu kartu/layar (EL02 — split-attention).

import { bandingkanRelasi, cekFungsi, cekIsian, keAngka, keHimpunan, nilaiSoal, samaAngka } from '../penilaian.js';
import { fmt, fmtSub, h, kotakInfo, MINUS } from '../ui.js';
import { buatDiagramPanah } from './arrowDiagram.js';
import { buatBidangKartesius, rentangUntuk } from './cartesian.js';
import { buatUmpanBalik } from './feedback.js';
import { buatPetunjuk } from './hintBox.js';
import { buatSorotTeks } from './textHighlighter.js';

const TIPS_DIAGRAM = '✋ Tarik dari kiri ke kanan, atau ketuk anggota kiri lalu ketuk pasangannya di kanan. Ketuk panah untuk menghapusnya.';

/** Tabel fungsi dengan baris x (biru) dan f(x) (oranye). */
export function tabelFungsi(xs, fxs, { labelX = 'x', labelFx = 'f(x)' } = {}) {
  const ribuan = fxs.some((v) => typeof v === 'number' && Math.abs(v) >= 10000);
  return h('table', { class: 'tabel-fungsi' },
    h('tbody', {},
      h('tr', { class: 'baris-x' }, h('th', { scope: 'row' }, labelX), ...xs.map((x) => h('td', {}, typeof x === 'number' ? fmt(x) : x))),
      h('tr', { class: 'baris-fx' }, h('th', { scope: 'row' }, labelFx), ...fxs.map((y) => h('td', {}, typeof y === 'number' ? fmt(y, { ribuan }) : y)))));
}

/** Input angka dengan tombol ± agar mudah menulis bilangan negatif di HP (IL05). */
function inputAngka({ nilaiAwal = '', label, onUbah, lebar = '' }) {
  const input = h('input', {
    type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false',
    class: `input-angka ${lebar}`, 'aria-label': label, placeholder: '…',
  });
  input.value = nilaiAwal ?? '';
  input.addEventListener('input', () => onUbah?.());
  const tombol = h('button', {
    class: 'tombol-tanda', type: 'button', 'aria-label': `Ubah tanda positif/negatif untuk ${label}`,
    onclick: () => {
      const v = input.value.trim();
      input.value = /^[-−]/.test(v) ? v.slice(1) : MINUS + v;
      input.focus();
      onUbah?.();
    },
  }, `+/${MINUS}`);
  return { el: h('span', { class: 'grup-angka' }, tombol, input), input };
}

function buatVisual(soal) {
  const data = soal.data || {};
  const bagian = [];
  if (data.diagram && !['buat_relasi', 'perbaiki_fungsi'].includes(soal.tipe)) {
    bagian.push(buatDiagramPanah({ ...data.diagram, mode: 'tampil' }).el);
  }
  if (data.grafik) {
    const r = rentangUntuk(data.grafik.titik);
    const bidang = buatBidangKartesius(r);
    bidang.gambarTitik(data.grafik.titik.map(([x, y], i) => ({ x, y, kelas: `warna-pasangan-${i % 5}` })));
    bagian.push(h('div', { class: 'wadah-grafik' }, bidang.el));
  }
  if (data.tabel) bagian.push(tabelFungsi(data.tabel.x, data.tabel.fx));
  if (soal.tipe === 'rumus' && data.titik) {
    bagian.push(h('p', { class: 'label-kecil' }, 'Yang diketahui:'), tabelFungsi(data.titik.map(([x]) => x), data.titik.map(([, y]) => y)));
  }
  return bagian.length ? h('div', { class: 'visual-soal' }, ...bagian) : null;
}

// ---------------------------------------------------------------- masukan per tipe

function masukanAngka(soal, awal, onUbah) {
  const { el, input } = inputAngka({ nilaiAwal: awal, label: 'Jawaban', onUbah });
  return {
    el: h('div', { class: 'baris-masukan' }, h('span', { class: 'label-masukan' }, 'Jawaban:'), el),
    ambil: () => input.value.trim() || null,
    kunci: (v) => { input.disabled = v; },
  };
}

function masukanPilihan(soal, awal, onUbah) {
  const nama = `pilihan-${soal.id}-${Math.random().toString(36).slice(2, 7)}`;
  const radio = [];
  const daftar = h('div', { class: 'daftar-opsi', role: 'radiogroup' });
  soal.opsi.forEach((teks, i) => {
    const r = h('input', { type: 'radio', name: nama, value: String(i) });
    r.checked = awal === i;
    r.addEventListener('change', () => onUbah());
    radio.push(r);
    daftar.append(h('label', { class: 'opsi' }, r, h('span', {}, teks)));
  });
  return {
    el: daftar,
    ambil: () => {
      const i = radio.findIndex((r) => r.checked);
      return i < 0 ? null : i;
    },
    kunci: (v) => radio.forEach((r) => { r.disabled = v; }),
  };
}

function masukanHimpunan(soal, awal, onUbah) {
  const input = h('input', {
    type: 'text', inputmode: 'text', autocomplete: 'off', spellcheck: 'false',
    class: 'input-himpunan', placeholder: 'contoh: 1, 3, 5', 'aria-label': 'Anggota himpunan, dipisah koma',
  });
  input.value = awal ?? '';
  input.addEventListener('input', onUbah);
  return {
    el: h('div', { class: 'baris-masukan' }, h('span', { class: 'kurung-himpunan' }, '{'), input, h('span', { class: 'kurung-himpunan' }, '}')),
    ambil: () => input.value.trim() || null,
    kunci: (v) => { input.disabled = v; },
  };
}

function masukanDiagram(soal, awal, onUbah) {
  const d = soal.data.diagram;
  const diagram = buatDiagramPanah({
    A: d.A, B: d.B, pasangan: awal || d.pasangan, mode: 'bebas', onUbah,
  });
  return {
    el: h('div', {}, kotakInfo('tips', TIPS_DIAGRAM), diagram.el),
    ambil: () => {
      const p = diagram.ambilPasangan();
      return soal.tipe === 'buat_relasi' && p.length === 0 ? null : p;
    },
    diagram,
    kunci: (v) => diagram.kunci(v),
  };
}

function masukanRumus(soal, awal, onUbah, mode) {
  const a = inputAngka({ nilaiAwal: awal?.a, label: 'nilai a', onUbah, lebar: 'input-lebar' });
  const b = inputAngka({ nilaiAwal: awal?.b, label: 'nilai b', onUbah, lebar: 'input-lebar' });
  const baris = h('div', { class: 'baris-rumus' },
    h('span', {}, 'f(x) = '),
    h('span', { class: 'kotak-koefisien koef-a' }, h('span', { class: 'nama-koef' }, 'a'), a.el),
    h('span', { class: 'rumus-tetap' },
      h('span', {}, 'x +'),
      h('span', { class: 'kotak-koefisien koef-b' }, h('span', { class: 'nama-koef' }, 'b'), b.el)));

  const ambil = () => {
    const va = a.input.value.trim();
    const vb = b.input.value.trim();
    return va || vb ? { a: va, b: vb } : null;
  };

  const bagian = [baris];
  // Alat verifikasi: substitusi balik (GL02)
  if (mode === 'latihan' && soal.data?.titik) {
    const hasilCek = h('div', { class: 'hasil-cek-balik', 'aria-live': 'polite' });
    bagian.push(
      h('button', {
        class: 'tombol tombol-sekunder', type: 'button',
        onclick: () => {
          const na = keAngka(a.input.value);
          const nb = keAngka(b.input.value);
          if (na === null || nb === null) {
            hasilCek.replaceChildren(h('p', {}, 'Isi nilai a dan b dulu, lalu cek lagi.'));
            return;
          }
          hasilCek.replaceChildren(
            h('p', { class: 'label-kecil' }, `Masukkan kembali setiap x ke f(x) = ${fmt(na)}x ${nb < 0 ? MINUS : '+'} ${fmt(Math.abs(nb))}:`),
            h('ul', { class: 'daftar-cek' }, ...soal.data.titik.map(([x, y]) => {
              const hasil = na * x + nb;
              const cocok = samaAngka(hasil, y);
              const ribuan = Math.abs(y) >= 10000;
              return h('li', { class: cocok ? 'cocok' : 'tidak-cocok' },
                `f(${fmt(x)}) = ${fmt(na, { ribuan })} · ${fmtSub(x)} ${nb < 0 ? MINUS : '+'} ${fmt(Math.abs(nb), { ribuan })} = ${fmt(hasil, { ribuan })} `,
                cocok ? '✓ cocok' : `✗ seharusnya ${fmt(y, { ribuan })}`);
            })));
        },
      }, '🔍 Cek dengan substitusi balik'),
      hasilCek,
    );
  }
  return {
    el: h('div', { class: 'masukan-rumus' }, ...bagian),
    ambil,
    kunci: (v) => { a.input.disabled = v; b.input.disabled = v; },
  };
}

function masukanIsian(soal, awal, onUbah) {
  const kotak = [];
  const baris = soal.data.baris.map((teks) => {
    const li = h('li', { class: 'baris-isian' });
    for (const potong of teks.split(/(\{\d+\})/)) {
      const cocok = potong.match(/^\{(\d+)\}$/);
      if (!cocok) {
        if (potong) li.append(potong);
        continue;
      }
      const i = Number(cocok[1]);
      const input = h('input', {
        type: 'text', inputmode: 'decimal', autocomplete: 'off',
        class: 'input-angka input-isian', 'aria-label': `Kotak isian ${i + 1}`,
      });
      input.value = awal?.[i] ?? '';
      input.addEventListener('input', () => { input.classList.remove('benar', 'salah'); onUbah(); });
      kotak[i] = input;
      li.append(input);
    }
    return li;
  });
  return {
    el: h('ol', { class: 'daftar-isian' }, ...baris),
    ambil: () => {
      const nilai = kotak.map((k) => k.value.trim());
      return nilai.some(Boolean) ? nilai : null;
    },
    tandai: (perKotak) => kotak.forEach((k, i) => {
      k.classList.toggle('benar', perKotak[i]);
      k.classList.toggle('salah', !perKotak[i]);
    }),
    kunci: (v) => kotak.forEach((k) => { k.disabled = v; }),
  };
}

function masukanSorot(soal, awal, onUbah) {
  const sorot = buatSorotTeks(soal.data.bagian, { nilaiAwal: awal, onUbah });
  return {
    el: sorot.el,
    ambil: () => {
      const n = sorot.nilai();
      return n.a === null && n.b === null ? null : n;
    },
    kunci: (v) => sorot.kunci(v),
  };
}

function buatMasukan(soal, awal, onUbah, mode) {
  switch (soal.tipe) {
    case 'angka': return masukanAngka(soal, awal, onUbah);
    case 'pilihan': return masukanPilihan(soal, awal, onUbah);
    case 'himpunan': return masukanHimpunan(soal, awal, onUbah);
    case 'buat_relasi':
    case 'perbaiki_fungsi': return masukanDiagram(soal, awal, onUbah);
    case 'rumus': return masukanRumus(soal, awal, onUbah, mode);
    case 'isian': return masukanIsian(soal, awal, onUbah);
    case 'sorot': return masukanSorot(soal, awal, onUbah);
    default: throw new Error(`Tipe soal tidak dikenal: ${soal.tipe}`);
  }
}

// ---------------------------------------------------------------- umpan balik khusus

function pesanSalah(soal, jawaban, masukan) {
  switch (soal.tipe) {
    case 'angka': {
      const n = keAngka(jawaban);
      if (n === null) return 'Jawabanmu belum terbaca sebagai angka. Tulis angka saja, mis. −8 atau 27000.';
      if (n !== 0 && samaAngka(-n, soal.kunci)) {
        return 'Angkanya sudah benar, tetapi tandanya (positif/negatif) tertukar. Periksa lagi perkalian dengan bilangan negatif.';
      }
      return null;
    }
    case 'buat_relasi': {
      const { kurang, salah } = bandingkanRelasi(jawaban, soal.kunci);
      return [
        salah ? `Ada ${salah} panah yang tidak sesuai kalimat relasi. Ketuk panah itu untuk menghapusnya.` : '',
        kurang ? `Masih ada ${kurang} panah yang belum ditarik.` : '',
      ].filter(Boolean).join(' ');
    }
    case 'perbaiki_fungsi': {
      const d = soal.data.diagram;
      const hasil = cekFungsi(jawaban, d.A.anggota, d.B.anggota);
      masukan.diagram?.sorot(hasil);
      return [
        hasil.jomblo.length ? `${hasil.jomblo.join(', ')} masih jomblo (belum punya pasangan).` : '',
        hasil.mendua.length ? `${hasil.mendua.join(', ')} masih mendua (punya lebih dari satu pasangan).` : '',
      ].filter(Boolean).join(' ');
    }
    case 'rumus': {
      const aBenar = samaAngka(jawaban.a, soal.kunci.a);
      const bBenar = samaAngka(jawaban.b, soal.kunci.b);
      if (aBenar && !bBenar) return 'Nilai a sudah benar 👍. Periksa lagi nilai b. Coba tombol “Cek dengan substitusi balik”.';
      if (!aBenar && bBenar) return 'Nilai b sudah benar 👍. Periksa lagi nilai a.';
      return 'Coba tombol “Cek dengan substitusi balik” untuk melihat bagian yang belum cocok.';
    }
    case 'isian': {
      const perKotak = cekIsian(jawaban, soal.kunci);
      masukan.tandai?.(perKotak);
      const salah = perKotak.filter((b) => !b).length;
      return `${salah} kotak bertanda merah belum tepat. Kotak hijau sudah benar.`;
    }
    case 'himpunan': {
      const himpunan = keHimpunan(jawaban);
      if (himpunan && himpunan.size < soal.kunci.length) return 'Masih ada anggota yang belum kamu tulis.';
      if (himpunan && himpunan.size > soal.kunci.length) return 'Ada anggota yang seharusnya tidak ikut ditulis.';
      return 'Periksa lagi anggotanya. Tulis setiap anggota sekali saja, dipisah koma.';
    }
    case 'sorot': {
      if (jawaban.a === soal.kunci.b && jawaban.b === soal.kunci.a) {
        return 'Kamu menukar a dan b. Ingat: nilai awal dibayar SEKALI (b), sedangkan tarif per satuan dikalikan x (a).';
      }
      if (!jawaban.a || !jawaban.b) return 'Tandai dua frasa: satu sebagai nilai awal (b) dan satu sebagai per satuan (a).';
      return 'Satu tanda belum tepat. Cari kata “per” atau “setiap” untuk a, dan biaya yang dibayar sekali untuk b.';
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------- tampilan utama

export function tampilkanSoal(soal, { mode = 'latihan', jawabanAwal = null, onJawab, onCek } = {}) {
  const mulai = performance.now();
  let percobaan = 0;
  let sudahBenar = false;

  const umpan = buatUmpanBalik();
  const petunjuk = mode === 'latihan' ? buatPetunjuk(soal.hint) : null;
  const masukan = buatMasukan(soal, jawabanAwal, () => {
    onJawab?.(masukan.ambil());
    if (!sudahBenar) umpan.sembunyi();
  }, mode);

  const kartu = h('article', { class: 'kartu kartu-soal' },
    h('p', { class: 'teks-soal' }, soal.teks),
    buatVisual(soal),
    h('div', { class: 'area-masukan' }, masukan.el));

  if (mode === 'latihan') {
    const pembahasan = h('div', { class: 'pembahasan' }, h('p', { class: 'judul-umpan' }, '📖 Pembahasan'), h('p', {}, soal.pembahasan));
    pembahasan.hidden = true;
    const tombolPembahasan = h('button', {
      class: 'tombol tombol-teks', type: 'button',
      onclick: () => { pembahasan.hidden = false; tombolPembahasan.hidden = true; },
    }, '📖 Lihat pembahasan');
    tombolPembahasan.hidden = true;

    const tombolCek = h('button', { class: 'tombol tombol-utama', type: 'button', onclick: cek }, 'Cek jawaban');

    function cek() {
      const jawaban = masukan.ambil();
      if (jawaban === null) {
        umpan.tampil('info', 'Isi jawabanmu dulu, ya.');
        return;
      }
      percobaan += 1;
      const benar = nilaiSoal(soal, jawaban);
      if (benar) {
        sudahBenar = true;
        masukan.tandai?.(soal.kunci.map(() => true));
        masukan.diagram?.hapusSorot();
        umpan.tampil('benar', '✅ Benar!', soal.pembahasan);
        tombolPembahasan.hidden = true;
      } else {
        umpan.tampil('salah', '❌ Belum tepat.', pesanSalah(soal, jawaban, masukan), 'Coba lagi, atau buka petunjuk 💡.');
        if (percobaan >= 2 && pembahasan.hidden) tombolPembahasan.hidden = false;
      }
      onCek?.({
        soal_id: soal.id,
        jawaban,
        benar,
        percobaan_ke: percobaan,
        jumlah_hint: petunjuk.jumlah(),
        durasi_detik: Math.round((performance.now() - mulai) / 1000),
      });
    }

    kartu.append(
      h('div', { class: 'baris-tombol baris-cek' }, tombolCek),
      umpan.el,
      petunjuk.el,
      tombolPembahasan,
      pembahasan,
    );
  }

  return {
    el: kartu,
    ambilJawaban: () => masukan.ambil(),
    kunci: (v = true) => masukan.kunci?.(v),
  };
}
