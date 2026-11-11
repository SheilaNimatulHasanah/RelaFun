"""Akses data. Semua query database HANYA ada di file ini.

Ada dua penyimpanan dengan fungsi yang sama:
- RepoSupabase : dipakai saat SUPABASE_URL & SUPABASE_SERVICE_KEY diisi (produksi).
- RepoMemori   : MODE DEMO / pengujian; data hilang saat server dimatikan.
"""

from __future__ import annotations

import threading
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any, Protocol


def _sekarang() -> str:
    return datetime.now(timezone.utc).isoformat()


def gabung_progres(lama: dict | None, baru: dict) -> dict:
    """Menggabungkan progres lama dan baru.

    - langkah_terakhir: posisi terbaru yang dikirim
    - selesai: sekali selesai tetap selesai
    - skor_kuis: skor percobaan PERTAMA dipertahankan (sesuai desain penilaian)
    """
    lama = lama or {}
    hasil = {
        "langkah_terakhir": lama.get("langkah_terakhir", 0),
        "selesai": bool(lama.get("selesai", False)),
        "skor_kuis": lama.get("skor_kuis"),
    }
    if baru.get("langkah_terakhir") is not None:
        hasil["langkah_terakhir"] = baru["langkah_terakhir"]
    if baru.get("selesai"):
        hasil["selesai"] = True
    if hasil["skor_kuis"] is None and baru.get("skor_kuis") is not None:
        hasil["skor_kuis"] = baru["skor_kuis"]
    return hasil


class Repo(Protocol):
    def cari_kelas(self, kode_kelas: str) -> dict | None: ...
    def buat_siswa(self, nama: str, kode_kelas: str) -> dict: ...
    def ambil_siswa(self, siswa_id: str) -> dict | None: ...
    def ambil_progres(self, siswa_id: str) -> list[dict]: ...
    def simpan_progres(self, siswa_id: str, modul: int, data: dict) -> dict: ...
    def simpan_jawaban(self, baris: list[dict]) -> int: ...
    def simpan_skala(self, baris: dict) -> None: ...
    def ambil_tabel(self, nama_tabel: str) -> list[dict]: ...


class RepoMemori:
    """Penyimpanan sementara di memori (MODE DEMO dan pengujian otomatis)."""

    def __init__(self, kode_kelas_awal: tuple[str, ...] = ("DEMO",)) -> None:
        self._kunci = threading.Lock()
        self.kelas = {
            k: {"kode_kelas": k, "nama_sekolah": "Kelas percobaan", "dibuat_pada": _sekarang()}
            for k in kode_kelas_awal
        }
        self.siswa: dict[str, dict] = {}
        self.progres: dict[tuple[str, int], dict] = {}
        self.jawaban: dict[str, dict] = {}
        self.skala: dict[str, dict] = {}

    def cari_kelas(self, kode_kelas: str) -> dict | None:
        return deepcopy(self.kelas.get(kode_kelas))

    def buat_siswa(self, nama: str, kode_kelas: str) -> dict:
        with self._kunci:
            baris = {
                "id": str(uuid.uuid4()),
                "nama": nama,
                "kode_kelas": kode_kelas,
                "dibuat_pada": _sekarang(),
            }
            self.siswa[baris["id"]] = baris
            return deepcopy(baris)

    def ambil_siswa(self, siswa_id: str) -> dict | None:
        return deepcopy(self.siswa.get(siswa_id))

    def ambil_progres(self, siswa_id: str) -> list[dict]:
        hasil = [deepcopy(v) for (sid, _), v in self.progres.items() if sid == siswa_id]
        return sorted(hasil, key=lambda p: p["modul"])

    def simpan_progres(self, siswa_id: str, modul: int, data: dict) -> dict:
        with self._kunci:
            lama = self.progres.get((siswa_id, modul))
            baris = {"siswa_id": siswa_id, "modul": modul, **gabung_progres(lama, data)}
            baris["updated_at"] = _sekarang()
            self.progres[(siswa_id, modul)] = baris
            return deepcopy(baris)

    def simpan_jawaban(self, baris: list[dict]) -> int:
        with self._kunci:
            jumlah = 0
            for b in baris:
                if b["id_klien"] in self.jawaban:
                    continue  # data ganda dari antrean offline diabaikan
                self.jawaban[b["id_klien"]] = {**deepcopy(b), "dibuat_pada": _sekarang()}
                jumlah += 1
            return jumlah

    def simpan_skala(self, baris: dict) -> None:
        with self._kunci:
            if baris["id_klien"] not in self.skala:
                self.skala[baris["id_klien"]] = {**deepcopy(baris), "dibuat_pada": _sekarang()}

    def ambil_tabel(self, nama_tabel: str) -> list[dict]:
        sumber = {
            "kelas": self.kelas.values(),
            "siswa": self.siswa.values(),
            "progres_modul": self.progres.values(),
            "jawaban": self.jawaban.values(),
            "skala_beban": self.skala.values(),
        }[nama_tabel]
        return [deepcopy(b) for b in sumber]


class RepoSupabase:
    """Penyimpanan di Supabase memakai service_role key (hanya di server)."""

    def __init__(self, url: str, kunci_service: str) -> None:
        from supabase import create_client  # diimpor di sini agar tes tidak butuh koneksi

        self.klien = create_client(url, kunci_service)

    def _tabel(self, nama: str):
        return self.klien.table(nama)

    def cari_kelas(self, kode_kelas: str) -> dict | None:
        hasil = self._tabel("kelas").select("*").eq("kode_kelas", kode_kelas).limit(1).execute()
        return hasil.data[0] if hasil.data else None

    def buat_siswa(self, nama: str, kode_kelas: str) -> dict:
        hasil = self._tabel("siswa").insert({"nama": nama, "kode_kelas": kode_kelas}).execute()
        return hasil.data[0]

    def ambil_siswa(self, siswa_id: str) -> dict | None:
        try:
            uuid.UUID(siswa_id)
        except (ValueError, TypeError):
            return None
        hasil = (
            self._tabel("siswa").select("id,nama,kode_kelas").eq("id", siswa_id).limit(1).execute()
        )
        return hasil.data[0] if hasil.data else None

    def ambil_progres(self, siswa_id: str) -> list[dict]:
        hasil = self._tabel("progres_modul").select("*").eq("siswa_id", siswa_id).order("modul").execute()
        return hasil.data or []

    def simpan_progres(self, siswa_id: str, modul: int, data: dict) -> dict:
        lama = (
            self._tabel("progres_modul")
            .select("*")
            .eq("siswa_id", siswa_id)
            .eq("modul", modul)
            .limit(1)
            .execute()
        ).data
        baris = {
            "siswa_id": siswa_id,
            "modul": modul,
            **gabung_progres(lama[0] if lama else None, data),
            "updated_at": _sekarang(),
        }
        hasil = self._tabel("progres_modul").upsert(baris, on_conflict="siswa_id,modul").execute()
        return hasil.data[0] if hasil.data else baris

    def simpan_jawaban(self, baris: list[dict]) -> int:
        if not baris:
            return 0
        hasil = (
            self._tabel("jawaban")
            .upsert(baris, on_conflict="id_klien", ignore_duplicates=True)
            .execute()
        )
        return len(hasil.data or [])

    def simpan_skala(self, baris: dict) -> None:
        self._tabel("skala_beban").upsert(baris, on_conflict="id_klien", ignore_duplicates=True).execute()

    def ambil_tabel(self, nama_tabel: str) -> list[dict]:
        semua: list[dict] = []
        ukuran = 1000
        awal = 0
        while True:
            hasil = self._tabel(nama_tabel).select("*").range(awal, awal + ukuran - 1).execute()
            data = hasil.data or []
            semua.extend(data)
            if len(data) < ukuran:
                return semua
            awal += ukuran


def buat_repo(url: str, kunci_service: str) -> Any:
    """Memilih penyimpanan: Supabase bila dikonfigurasi, selain itu MODE DEMO."""
    if url and kunci_service:
        return RepoSupabase(url, kunci_service)
    return RepoMemori()
