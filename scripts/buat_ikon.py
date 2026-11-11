"""Membuat ikon aplikasi PWA (PNG) tanpa library tambahan.

Gambar: dua himpunan (oval) dengan dua panah dari kiri ke kanan, di atas latar biru.
Jalankan dari folder proyek:  python scripts/buat_ikon.py
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

FOLDER_IKON = Path(__file__).resolve().parent.parent / "frontend" / "icons"

BIRU = (37, 99, 235)
PUTIH = (255, 255, 255)
JINGGA = (245, 158, 11)
TOSKA = (94, 234, 212)


def _kotak_bulat(u: float, v: float, jari: float) -> bool:
    """Persegi 0..1 dengan sudut membulat."""
    if not (0 <= u <= 1 and 0 <= v <= 1):
        return False
    du = max(jari - u, 0, u - (1 - jari))
    dv = max(jari - v, 0, v - (1 - jari))
    return du * du + dv * dv <= jari * jari


def _cincin_elips(u, v, cx, cy, rx, ry, tebal):
    luar = ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1
    dalam = ((u - cx) / (rx - tebal)) ** 2 + ((v - cy) / (ry - tebal)) ** 2 <= 1
    return luar and not dalam


def _lingkaran(u, v, cx, cy, r):
    return (u - cx) ** 2 + (v - cy) ** 2 <= r * r


def _panah(u, v, y, x_awal=0.36, x_ujung=0.665, tebal=0.05, panjang_kepala=0.09, lebar_kepala=0.07):
    x_kepala = x_ujung - panjang_kepala
    if x_awal <= u <= x_kepala and abs(v - y) <= tebal / 2:
        return True
    if x_kepala <= u <= x_ujung:
        sisa = (x_ujung - u) / panjang_kepala  # 1 di pangkal kepala, 0 di ujung
        return abs(v - y) <= lebar_kepala * sisa
    return False


def warna_titik(u: float, v: float, penuh: bool, skala: float) -> tuple[int, int, int, int] | None:
    """Warna pada koordinat (u, v) 0..1. penuh=True untuk ikon maskable/apple (tanpa sudut transparan)."""
    if penuh:
        if not (0 <= u <= 1 and 0 <= v <= 1):
            return None
    elif not _kotak_bulat(u, v, 0.22):
        return None

    # Isi gambar diperkecil ke tengah (zona aman ikon maskable).
    x = 0.5 + (u - 0.5) / skala
    y = 0.5 + (v - 0.5) / skala

    if _panah(x, y, 0.38):
        return (*JINGGA, 255)
    if _panah(x, y, 0.62):
        return (*TOSKA, 255)
    for cx in (0.27, 0.73):
        if _cincin_elips(x, y, cx, 0.5, 0.15, 0.3, 0.035):
            return (*PUTIH, 255)
        if _lingkaran(x, y, cx, 0.38, 0.045) or _lingkaran(x, y, cx, 0.62, 0.045):
            return (*PUTIH, 255)
    return (*BIRU, 255)


def gambar_ikon(ukuran: int, penuh: bool, skala: float) -> bytes:
    sampel = ((0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75))
    baris = bytearray()
    for py in range(ukuran):
        baris.append(0)  # filter PNG: none
        for px in range(ukuran):
            r = g = b = a = 0
            for sx, sy in sampel:
                warna = warna_titik((px + sx) / ukuran, (py + sy) / ukuran, penuh, skala)
                if warna:
                    r += warna[0] * warna[3]
                    g += warna[1] * warna[3]
                    b += warna[2] * warna[3]
                    a += warna[3]
            if a:
                baris += bytes((r // a, g // a, b // a, a // len(sampel)))
            else:
                baris += b"\x00\x00\x00\x00"
    return bytes(baris)


def tulis_png(path: Path, ukuran: int, data_rgba: bytes) -> None:
    def potongan(jenis: bytes, isi: bytes) -> bytes:
        return struct.pack(">I", len(isi)) + jenis + isi + struct.pack(">I", zlib.crc32(jenis + isi) & 0xFFFFFFFF)

    kepala = struct.pack(">IIBBBBB", ukuran, ukuran, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + potongan(b"IHDR", kepala) + potongan(b"IDAT", zlib.compress(data_rgba, 9)) + potongan(b"IEND", b"")
    path.write_bytes(png)


def main() -> None:
    FOLDER_IKON.mkdir(parents=True, exist_ok=True)
    daftar = [
        ("icon-192.png", 192, False, 0.9),
        ("icon-512.png", 512, False, 0.9),
        ("maskable-512.png", 512, True, 0.72),
        ("apple-touch-icon.png", 180, True, 0.82),
    ]
    for nama, ukuran, penuh, skala in daftar:
        tulis_png(FOLDER_IKON / nama, ukuran, gambar_ikon(ukuran, penuh, skala))
        print(f"✓ {nama} ({ukuran}×{ukuran})")


if __name__ == "__main__":
    main()
