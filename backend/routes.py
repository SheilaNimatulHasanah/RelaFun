"""Rute API JSON (/api/...).

Format respons:
  sukses → {"ok": true, "data": ...}
  gagal  → {"ok": false, "pesan": "..."}
"""

from __future__ import annotations

import json
import threading
import time
from collections import defaultdict, deque
from functools import wraps
from typing import Any, Callable

from flask import Blueprint, current_app, jsonify, request, session

from .penilaian import hitung_skor_kuis, nilai_soal

api = Blueprint("api", __name__, url_prefix="/api")

MODUL_MIN, MODUL_MAX = 0, 6
MAKS_JAWABAN_PER_KIRIM = 100
MAKS_UKURAN_JAWABAN = 2000  # karakter JSON per satu jawaban
MAKS_PANJANG_ID = 80


# ---------------------------------------------------------------- bantuan

def sukses(data: Any = None, kode: int = 200):
    return jsonify({"ok": True, "data": data}), kode


def gagal(pesan: str, kode: int = 400):
    return jsonify({"ok": False, "pesan": pesan}), kode


def repo():
    return current_app.extensions["repo"]


def bank_soal() -> dict[str, dict]:
    return current_app.config["BANK_SOAL"]


def ambil_json() -> Any:
    """Body harus JSON. Ini juga melindungi dari formulir lintas situs (CSRF)."""
    if not request.is_json:
        return None
    return request.get_json(silent=True)


def bilangan_bulat(nilai: Any, minimum: int, maksimum: int) -> int | None:
    if isinstance(nilai, bool) or not isinstance(nilai, int):
        return None
    return nilai if minimum <= nilai <= maksimum else None


def teks_id(nilai: Any) -> str | None:
    if isinstance(nilai, str) and 0 < len(nilai) <= MAKS_PANJANG_ID:
        return nilai
    return None


def perlu_masuk(fungsi: Callable):
    """Dekorator: rute hanya untuk siswa yang sudah masuk."""

    @wraps(fungsi)
    def pembungkus(*args, **kwargs):
        siswa_id = session.get("siswa_id")
        if not siswa_id:
            return gagal("Silakan masuk terlebih dahulu.", 401)
        return fungsi(siswa_id, *args, **kwargs)

    return pembungkus


class PembatasMasuk:
    """Pembatas sederhana: maksimal N percobaan masuk per IP per menit."""

    def __init__(self) -> None:
        self._catatan: dict[str, deque] = defaultdict(deque)
        self._kunci = threading.Lock()

    def boleh(self, ip: str, batas: int) -> bool:
        kini = time.monotonic()
        with self._kunci:
            antrean = self._catatan[ip]
            while antrean and kini - antrean[0] > 60:
                antrean.popleft()
            if len(antrean) >= batas:
                return False
            antrean.append(kini)
            return True


pembatas_masuk = PembatasMasuk()


# ---------------------------------------------------------------- rute

@api.get("/kesehatan")
def kesehatan():
    return sukses({"status": "hidup", "mode_demo": current_app.config.get("MODE_DEMO", False)})


@api.post("/masuk")
def masuk():
    ip = request.access_route[0] if request.access_route else (request.remote_addr or "?")
    if not pembatas_masuk.boleh(ip, current_app.config["BATAS_MASUK_PER_MENIT"]):
        return gagal("Terlalu banyak percobaan. Tunggu satu menit lalu coba lagi.", 429)

    data = ambil_json()
    if not isinstance(data, dict):
        return gagal("Data tidak valid.")

    nama = " ".join(str(data.get("nama", "")).split())
    kode_kelas = str(data.get("kode_kelas", "")).strip().upper()
    if not 1 <= len(nama) <= 40:
        return gagal("Nama panggilan harus diisi (maksimal 40 huruf).")
    if not 1 <= len(kode_kelas) <= 20:
        return gagal("Kode kelas harus diisi.")

    if repo().cari_kelas(kode_kelas) is None:
        return gagal("Kode kelas tidak ditemukan. Tanyakan kode yang benar kepada gurumu.", 404)

    siswa = repo().buat_siswa(nama, kode_kelas)
    session.clear()
    session.permanent = True
    session["siswa_id"] = str(siswa["id"])
    return sukses(
        {"siswa": {"id": str(siswa["id"]), "nama": siswa["nama"], "kode_kelas": siswa["kode_kelas"]},
         "progres": []},
        201,
    )


@api.get("/saya")
@perlu_masuk
def saya(siswa_id: str):
    siswa = repo().ambil_siswa(siswa_id)
    if siswa is None:
        session.clear()
        return gagal("Sesi tidak ditemukan. Silakan masuk lagi.", 401)
    progres = [
        {
            "modul": p["modul"],
            "langkah_terakhir": p["langkah_terakhir"],
            "selesai": p["selesai"],
            "skor_kuis": p.get("skor_kuis"),
        }
        for p in repo().ambil_progres(siswa_id)
    ]
    return sukses(
        {"siswa": {"id": str(siswa["id"]), "nama": siswa["nama"], "kode_kelas": siswa["kode_kelas"]},
         "progres": progres}
    )


@api.post("/keluar")
def keluar():
    session.clear()
    return sukses()


@api.put("/progres/<int:modul>")
@perlu_masuk
def simpan_progres(siswa_id: str, modul: int):
    if bilangan_bulat(modul, MODUL_MIN, MODUL_MAX) is None:
        return gagal("Nomor modul tidak valid.", 404)
    data = ambil_json()
    if not isinstance(data, dict):
        return gagal("Data tidak valid.")
    langkah = bilangan_bulat(data.get("langkah_terakhir"), 0, 200)
    if langkah is None:
        return gagal("langkah_terakhir tidak valid.")
    # "selesai" & skor hanya ditentukan server lewat /api/kuis.
    hasil = repo().simpan_progres(siswa_id, modul, {"langkah_terakhir": langkah})
    return sukses({k: hasil.get(k) for k in ("modul", "langkah_terakhir", "selesai", "skor_kuis")})


def _rapikan_jawaban(item: Any, siswa_id: str) -> dict | None:
    """Memvalidasi satu jawaban latihan dari HP. Nilai benar/salah dihitung ulang di server."""
    if not isinstance(item, dict):
        return None
    id_klien = teks_id(item.get("id_klien"))
    soal = bank_soal().get(item.get("soal_id"))
    modul = bilangan_bulat(item.get("modul"), MODUL_MIN, MODUL_MAX)
    if id_klien is None or soal is None or modul is None or soal["modul"] != modul:
        return None
    if item.get("jenis", "latihan") != "latihan" or soal.get("jenis") != "latihan":
        return None  # jawaban kuis hanya lewat /api/kuis
    jawaban = item.get("jawaban")
    if len(json.dumps(jawaban, ensure_ascii=False)) > MAKS_UKURAN_JAWABAN:
        return None
    return {
        "id_klien": id_klien,
        "siswa_id": siswa_id,
        "modul": modul,
        "soal_id": soal["id"],
        "jenis": "latihan",
        "jawaban": jawaban,
        "benar": nilai_soal(soal, jawaban),
        "percobaan_ke": bilangan_bulat(item.get("percobaan_ke"), 1, 1000) or 1,
        "jumlah_hint": bilangan_bulat(item.get("jumlah_hint"), 0, 3) or 0,
        "durasi_detik": bilangan_bulat(item.get("durasi_detik"), 0, 86400),
    }


@api.post("/jawaban")
@perlu_masuk
def simpan_jawaban(siswa_id: str):
    data = ambil_json()
    daftar = data if isinstance(data, list) else [data]
    if not daftar or len(daftar) > MAKS_JAWABAN_PER_KIRIM:
        return gagal(f"Kirim 1 sampai {MAKS_JAWABAN_PER_KIRIM} jawaban sekaligus.")

    baris = [b for b in (_rapikan_jawaban(item, siswa_id) for item in daftar) if b]
    tersimpan = repo().simpan_jawaban(baris) if baris else 0
    return sukses({"diterima": len(baris), "tersimpan": tersimpan, "ditolak": len(daftar) - len(baris)})


@api.post("/kuis/<int:modul>")
@perlu_masuk
def kirim_kuis(siswa_id: str, modul: int):
    if bilangan_bulat(modul, MODUL_MIN, MODUL_MAX) is None:
        return gagal("Nomor modul tidak valid.", 404)
    data = ambil_json()
    if not isinstance(data, dict):
        return gagal("Data tidak valid.")
    id_kirim = teks_id(data.get("id_kirim"))
    daftar_jawaban = data.get("jawaban")
    if id_kirim is None or not isinstance(daftar_jawaban, list) or len(daftar_jawaban) > 50:
        return gagal("Data kuis tidak valid.")

    soal_kuis = [s for s in bank_soal().values() if s["modul"] == modul and s["jenis"] == "kuis"]
    if not soal_kuis:
        return gagal("Modul ini tidak punya kuis.", 404)
    id_soal_kuis = {s["id"] for s in soal_kuis}

    jawaban_siswa: dict[str, Any] = {}
    for item in daftar_jawaban:
        if isinstance(item, dict) and item.get("soal_id") in id_soal_kuis:
            jwb = item.get("jawaban")
            if len(json.dumps(jwb, ensure_ascii=False)) <= MAKS_UKURAN_JAWABAN:
                jawaban_siswa[item["soal_id"]] = jwb

    hasil = hitung_skor_kuis(soal_kuis, jawaban_siswa)
    percobaan = bilangan_bulat(data.get("percobaan_ke"), 1, 1000) or 1
    durasi = bilangan_bulat(data.get("durasi_detik"), 0, 86400)

    repo().simpan_jawaban([
        {
            "id_klien": f"{id_kirim}:{r['soal_id']}",
            "siswa_id": siswa_id,
            "modul": modul,
            "soal_id": r["soal_id"],
            "jenis": "kuis",
            "jawaban": jawaban_siswa.get(r["soal_id"]),
            "benar": r["benar"],
            "percobaan_ke": percobaan,
            "jumlah_hint": 0,
            "durasi_detik": durasi,
        }
        for r in hasil["rincian"]
    ])
    progres = repo().simpan_progres(siswa_id, modul, {"selesai": True, "skor_kuis": hasil["skor"]})
    return sukses({**hasil, "skor_tercatat": progres.get("skor_kuis")})


@api.post("/skala-beban")
@perlu_masuk
def simpan_skala_beban(siswa_id: str):
    data = ambil_json()
    if not isinstance(data, dict):
        return gagal("Data tidak valid.")
    id_klien = teks_id(data.get("id_klien"))
    modul = bilangan_bulat(data.get("modul"), MODUL_MIN, MODUL_MAX)
    skor = bilangan_bulat(data.get("skor"), 1, 9)
    penjelasan = data.get("penjelasan") or None
    if id_klien is None or modul is None or skor is None:
        return gagal("Data skala tidak valid.")
    if penjelasan is not None:
        if not isinstance(penjelasan, str):
            return gagal("Penjelasan harus berupa teks.")
        penjelasan = penjelasan.strip()[:500] or None

    repo().simpan_skala(
        {"id_klien": id_klien, "siswa_id": siswa_id, "modul": modul, "skor": skor, "penjelasan": penjelasan}
    )
    return sukses()


@api.errorhandler(413)
def terlalu_besar(_):
    return gagal("Data terlalu besar.", 413)
