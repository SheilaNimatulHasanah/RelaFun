// Satu-satunya pintu komunikasi ke server Flask (/api/...).
// Frontend TIDAK PERNAH mengakses Supabase langsung.

export class GalatJaringan extends Error {}

export class GalatApi extends Error {
  constructor(pesan, status) {
    super(pesan);
    this.status = status;
  }
  /** Galat yang layak dicoba lagi nanti (server sibuk/tidur). */
  get bisaDiulang() {
    return this.status >= 500 || this.status === 429 || this.status === 408;
  }
}

async function panggil(metode, path, body, { batasWaktu = 20000 } = {}) {
  const pengendali = new AbortController();
  const pewaktu = setTimeout(() => pengendali.abort(), batasWaktu);
  let respons;
  try {
    respons = await fetch(path, {
      method: metode,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      signal: pengendali.signal,
    });
  } catch {
    throw new GalatJaringan('Tidak dapat terhubung ke server.');
  } finally {
    clearTimeout(pewaktu);
  }

  let isi = null;
  try {
    isi = await respons.json();
  } catch {
    /* respons bukan JSON, mis. halaman galat proxy */
  }
  if (!respons.ok || !isi || isi.ok !== true) {
    throw new GalatApi(isi?.pesan || `Server menjawab dengan kode ${respons.status}.`, respons.status);
  }
  return isi.data;
}

export const api = {
  kesehatan: () => panggil('GET', '/api/kesehatan', undefined, { batasWaktu: 60000 }),
  masuk: (nama) => panggil('POST', '/api/masuk', { nama }, { batasWaktu: 60000 }),
  saya: () => panggil('GET', '/api/saya'),
  keluar: () => panggil('POST', '/api/keluar'),
  progres: (modul, langkahTerakhir) => panggil('PUT', `/api/progres/${modul}`, { langkah_terakhir: langkahTerakhir }),
  jawaban: (daftar) => panggil('POST', '/api/jawaban', daftar),
  kuis: (modul, data) => panggil('POST', `/api/kuis/${modul}`, data),
  skalaBeban: (data) => panggil('POST', '/api/skala-beban', data),
};
