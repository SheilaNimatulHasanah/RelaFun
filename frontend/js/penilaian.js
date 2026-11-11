// Penilaian jawaban di HP untuk umpan balik langsung (juga saat offline).
// CERMIN dari backend/penilaian.py. Jika mengubah salah satu, ubah juga yang lain.
// Skor kuis resmi tetap dihitung oleh server (Python).

const POLA_RIBUAN = /^[+-]?\d{1,3}(\.\d{3})+$/;
const POLA_PECAHAN = /^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/;
const POLA_ANGKA = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/;

export function keAngka(nilai) {
  if (typeof nilai === 'number') return Number.isFinite(nilai) ? nilai : null;
  if (typeof nilai !== 'string') return null;
  let t = nilai.trim().toLowerCase().replaceAll('rp', '').replace(/\s+/g, '').replace(/[−–]/g, '-');
  if (!t) return null;
  if (POLA_RIBUAN.test(t)) t = t.replaceAll('.', '');
  t = t.replaceAll(',', '.');
  const pecahan = t.match(POLA_PECAHAN);
  if (pecahan) {
    const penyebut = Number(pecahan[2]);
    return penyebut === 0 ? null : Number(pecahan[1]) / penyebut;
  }
  if (!POLA_ANGKA.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function samaAngka(a, b) {
  const x = keAngka(a);
  const y = keAngka(b);
  if (x === null || y === null) return false;
  return Math.abs(x - y) <= Math.max(1e-9 * Math.max(Math.abs(x), Math.abs(y)), 1e-6);
}

function keElemen(nilai) {
  const n = keAngka(nilai);
  if (n !== null) return String(Math.round(n * 1e6) / 1e6);
  return String(nilai).trim().toLowerCase();
}

export function keHimpunan(jawaban) {
  if (typeof jawaban === 'string') {
    const teks = jawaban.trim().replace(/^\{|\}$/g, '').trim();
    if (!teks) return new Set();
    return new Set(teks.split(/[;,]/).filter((b) => b.trim()).map(keElemen));
  }
  if (Array.isArray(jawaban)) return new Set(jawaban.map(keElemen));
  return null;
}

function samaHimpunan(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

export function cekHimpunan(jawaban, kunci) {
  const himpunan = keHimpunan(jawaban);
  return himpunan !== null && samaHimpunan(himpunan, new Set(kunci.map(keElemen)));
}

export function cekPilihan(jawaban, kunci) {
  if (typeof jawaban === 'string' && /^-?\d+$/.test(jawaban.trim())) jawaban = Number(jawaban);
  return Number.isInteger(jawaban) && jawaban === kunci;
}

function kePasangan(daftar) {
  if (!Array.isArray(daftar)) return null;
  const hasil = new Set();
  for (const item of daftar) {
    if (!Array.isArray(item) || item.length !== 2) return null;
    hasil.add(JSON.stringify([String(item[0]), String(item[1])]));
  }
  return hasil;
}

export function cekRelasi(jawaban, kunci) {
  const pasangan = kePasangan(jawaban);
  return pasangan !== null && samaHimpunan(pasangan, kePasangan(kunci));
}

/** Membandingkan relasi siswa dengan kunci: berapa panah kurang dan berapa yang salah. */
export function bandingkanRelasi(jawaban, kunci) {
  const pasangan = kePasangan(jawaban) || new Set();
  const benar = kePasangan(kunci);
  let kurang = 0;
  let salah = 0;
  for (const p of benar) if (!pasangan.has(p)) kurang += 1;
  for (const p of pasangan) if (!benar.has(p)) salah += 1;
  return { kurang, salah };
}

/** Aturan fungsi: tidak boleh jomblo, tidak boleh mendua. */
export function cekFungsi(pasangan, domain, kodomain = null) {
  const daftar = kePasangan(pasangan);
  if (daftar === null) return { adalahFungsi: false, jomblo: [], mendua: [], diLuar: [] };
  const domainStr = domain.map(String);
  const kodomainStr = kodomain ? new Set(kodomain.map(String)) : null;
  const jumlah = new Map(domainStr.map((x) => [x, 0]));
  const diLuar = [];
  for (const teks of daftar) {
    const [x, y] = JSON.parse(teks);
    if (!jumlah.has(x) || (kodomainStr && !kodomainStr.has(y))) {
      diLuar.push([x, y]);
      continue;
    }
    jumlah.set(x, jumlah.get(x) + 1);
  }
  const jomblo = domainStr.filter((x) => jumlah.get(x) === 0);
  const mendua = domainStr.filter((x) => jumlah.get(x) > 1);
  return { adalahFungsi: !jomblo.length && !mendua.length && !diLuar.length, jomblo, mendua, diLuar };
}

export function cekRumus(jawaban, kunci) {
  if (!jawaban || typeof jawaban !== 'object') return false;
  return samaAngka(jawaban.a, kunci.a) && samaAngka(jawaban.b, kunci.b);
}

export function cekIsian(jawaban, kunci) {
  const daftar = Array.isArray(jawaban) ? jawaban : [];
  return kunci.map((k, i) => i < daftar.length && samaAngka(daftar[i], k));
}

export function cekSorot(jawaban, kunci) {
  if (!jawaban || typeof jawaban !== 'object') return false;
  return jawaban.a === kunci.a && jawaban.b === kunci.b;
}

export function nilaiSoal(soal, jawaban) {
  try {
    switch (soal.tipe) {
      case 'angka': return samaAngka(jawaban, soal.kunci);
      case 'pilihan': return cekPilihan(jawaban, soal.kunci);
      case 'himpunan': return cekHimpunan(jawaban, soal.kunci);
      case 'buat_relasi': return cekRelasi(jawaban, soal.kunci);
      case 'perbaiki_fungsi': {
        const d = soal.data.diagram;
        return cekFungsi(jawaban, d.A.anggota, d.B.anggota).adalahFungsi;
      }
      case 'rumus': return cekRumus(jawaban, soal.kunci);
      case 'isian': return cekIsian(jawaban, soal.kunci).every(Boolean);
      case 'sorot': return cekSorot(jawaban, soal.kunci);
      default: return false;
    }
  } catch {
    return false;
  }
}

export function hitungSkorKuis(daftarSoal, jawabanSiswa) {
  const rincian = daftarSoal.map((soal) => ({
    soal_id: soal.id,
    benar: soal.id in jawabanSiswa && nilaiSoal(soal, jawabanSiswa[soal.id]),
  }));
  const jumlahBenar = rincian.filter((r) => r.benar).length;
  const total = daftarSoal.length;
  return {
    skor: total ? Math.round((100 * jumlahBenar) / total) : 0,
    jumlah_benar: jumlahBenar,
    total,
    rincian,
  };
}
