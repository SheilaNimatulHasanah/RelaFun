"""Logika penilaian jawaban siswa.

Semua fungsi di sini adalah fungsi murni (tanpa database) sehingga mudah diuji.
Logika yang sama juga ada di frontend/js/penilaian.js untuk umpan balik langsung
saat latihan. Jika mengubah salah satu, ubah juga yang lain.
"""

from __future__ import annotations

import math
import re
from typing import Any

_POLA_RIBUAN = re.compile(r"[+-]?\d{1,3}(\.\d{3})+")
_POLA_PECAHAN = re.compile(r"([+-]?\d+(?:\.\d+)?)/([+-]?\d+(?:\.\d+)?)")


def ke_angka(nilai: Any) -> float | None:
    """Mengubah jawaban siswa menjadi angka.

    Menerima: 5, "-3", "−3" (tanda minus matematika), "2,5", "Rp27.000",
    "27.000" (titik ribuan), "3/2". Mengembalikan None bila tidak bisa dibaca.
    """
    if isinstance(nilai, bool) or nilai is None:
        return None
    if isinstance(nilai, (int, float)):
        return float(nilai) if math.isfinite(nilai) else None
    if not isinstance(nilai, str):
        return None

    teks = nilai.strip().lower()
    teks = teks.replace("rp", "").replace(" ", "")
    teks = teks.replace("−", "-").replace("–", "-")
    if not teks:
        return None

    if _POLA_RIBUAN.fullmatch(teks):
        teks = teks.replace(".", "")
    teks = teks.replace(",", ".")

    cocok = _POLA_PECAHAN.fullmatch(teks)
    if cocok:
        pembilang, penyebut = float(cocok.group(1)), float(cocok.group(2))
        return None if penyebut == 0 else pembilang / penyebut

    try:
        hasil = float(teks)
    except ValueError:
        return None
    return hasil if math.isfinite(hasil) else None


def sama_angka(a: Any, b: Any) -> bool:
    """True jika a dan b bernilai angka yang sama."""
    x, y = ke_angka(a), ke_angka(b)
    if x is None or y is None:
        return False
    return math.isclose(x, y, rel_tol=1e-9, abs_tol=1e-6)


def cek_jawaban_angka(jawaban: Any, kunci: Any) -> bool:
    return sama_angka(jawaban, kunci)


def _ke_elemen(nilai: Any) -> str:
    """Normalisasi satu anggota himpunan: angka → bentuk angka, teks → huruf kecil."""
    angka = ke_angka(nilai)
    if angka is not None:
        return repr(round(angka, 6))
    return str(nilai).strip().lower()


def ke_himpunan(jawaban: Any) -> set[str] | None:
    """Mengubah "{1, 3, 5}" atau [1, 3, 5] menjadi himpunan yang sudah dinormalisasi."""
    if isinstance(jawaban, str):
        teks = jawaban.strip().strip("{}").strip()
        if not teks:
            return set()
        # Di dalam himpunan, koma dan titik koma selalu dianggap pemisah anggota.
        bagian = re.split(r"[;,]", teks)
        return {_ke_elemen(b) for b in bagian if b.strip()}
    if isinstance(jawaban, (list, tuple)):
        return {_ke_elemen(b) for b in jawaban}
    return None


def cek_himpunan(jawaban: Any, kunci: list[Any]) -> bool:
    himpunan = ke_himpunan(jawaban)
    return himpunan is not None and himpunan == {_ke_elemen(k) for k in kunci}


def cek_pilihan(jawaban: Any, kunci: int) -> bool:
    if isinstance(jawaban, bool):
        return False
    if isinstance(jawaban, str) and jawaban.strip().lstrip("-").isdigit():
        jawaban = int(jawaban)
    return isinstance(jawaban, int) and jawaban == kunci


def _ke_pasangan(daftar: Any) -> set[tuple[str, str]] | None:
    if not isinstance(daftar, list):
        return None
    hasil: set[tuple[str, str]] = set()
    for item in daftar:
        if not isinstance(item, (list, tuple)) or len(item) != 2:
            return None
        hasil.add((str(item[0]), str(item[1])))
    return hasil


def cek_relasi(jawaban: Any, kunci: list[list[Any]]) -> bool:
    """Diagram panah buatan siswa harus sama persis dengan kunci (urutan bebas)."""
    pasangan = _ke_pasangan(jawaban)
    return pasangan is not None and pasangan == _ke_pasangan(kunci)


def cek_fungsi(pasangan: Any, domain: list[Any], kodomain: list[Any] | None = None) -> dict:
    """Memeriksa apakah relasi merupakan fungsi dari domain ke kodomain.

    Aturan "tidak boleh jomblo, tidak boleh mendua":
    - jomblo: anggota domain yang tidak punya pasangan
    - mendua: anggota domain yang punya lebih dari satu pasangan
    - di_luar: pasangan yang anggotanya tidak ada di himpunan
    """
    himpunan_pasangan = _ke_pasangan(pasangan)
    if himpunan_pasangan is None:
        return {"adalah_fungsi": False, "jomblo": [], "mendua": [], "di_luar": []}

    domain_str = [str(x) for x in domain]
    kodomain_str = None if kodomain is None else {str(y) for y in kodomain}

    jumlah = {x: 0 for x in domain_str}
    di_luar = []
    for x, y in sorted(himpunan_pasangan):
        if x not in jumlah or (kodomain_str is not None and y not in kodomain_str):
            di_luar.append([x, y])
            continue
        jumlah[x] += 1

    jomblo = [x for x in domain_str if jumlah[x] == 0]
    mendua = [x for x in domain_str if jumlah[x] > 1]
    return {
        "adalah_fungsi": not jomblo and not mendua and not di_luar,
        "jomblo": jomblo,
        "mendua": mendua,
        "di_luar": di_luar,
    }


def cek_rumus(jawaban: Any, kunci: dict) -> bool:
    """Jawaban {"a": .., "b": ..} untuk f(x) = ax + b."""
    if not isinstance(jawaban, dict):
        return False
    return sama_angka(jawaban.get("a"), kunci["a"]) and sama_angka(jawaban.get("b"), kunci["b"])


def cek_isian(jawaban: Any, kunci: list[Any]) -> list[bool]:
    """Isian bertahap: mengembalikan benar/salah untuk setiap kotak."""
    if not isinstance(jawaban, list):
        jawaban = []
    return [i < len(jawaban) and sama_angka(jawaban[i], k) for i, k in enumerate(kunci)]


def cek_sorot(jawaban: Any, kunci: dict) -> bool:
    """Soal cerita: siswa menandai frasa nilai awal (b) dan per satuan (a)."""
    if not isinstance(jawaban, dict):
        return False
    return jawaban.get("a") == kunci["a"] and jawaban.get("b") == kunci["b"]


def nilai_soal(soal: dict, jawaban: Any) -> bool:
    """Menilai satu soal sesuai tipenya. Jawaban yang formatnya salah dianggap salah."""
    tipe = soal.get("tipe")
    kunci = soal.get("kunci")
    try:
        if tipe == "angka":
            return cek_jawaban_angka(jawaban, kunci)
        if tipe == "pilihan":
            return cek_pilihan(jawaban, kunci)
        if tipe == "himpunan":
            return cek_himpunan(jawaban, kunci)
        if tipe == "buat_relasi":
            return cek_relasi(jawaban, kunci)
        if tipe == "perbaiki_fungsi":
            diagram = soal["data"]["diagram"]
            hasil = cek_fungsi(jawaban, diagram["A"]["anggota"], diagram["B"]["anggota"])
            return hasil["adalah_fungsi"]
        if tipe == "rumus":
            return cek_rumus(jawaban, kunci)
        if tipe == "isian":
            return all(cek_isian(jawaban, kunci))
        if tipe == "sorot":
            return cek_sorot(jawaban, kunci)
    except (KeyError, TypeError, ValueError):
        return False
    return False


def hitung_skor_kuis(daftar_soal: list[dict], jawaban_siswa: dict[str, Any]) -> dict:
    """Menghitung skor kuis 0–100.

    daftar_soal: semua soal kuis untuk satu modul.
    jawaban_siswa: {soal_id: jawaban}. Soal yang tidak dijawab dihitung salah.
    """
    rincian = []
    for soal in daftar_soal:
        dijawab = soal["id"] in jawaban_siswa
        benar = dijawab and nilai_soal(soal, jawaban_siswa[soal["id"]])
        rincian.append({"soal_id": soal["id"], "benar": benar})

    total = len(daftar_soal)
    jumlah_benar = sum(1 for r in rincian if r["benar"])
    skor = round(100 * jumlah_benar / total) if total else 0
    return {"skor": skor, "jumlah_benar": jumlah_benar, "total": total, "rincian": rincian}
