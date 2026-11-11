"""Ekspor data penelitian dari Supabase ke file CSV (untuk Excel/SPSS).

Jalankan dari folder proyek:  python scripts/ekspor_data.py
Hasil disimpan di folder ekspor/ (tidak ikut Git karena berisi data siswa).
"""

from __future__ import annotations

import csv
import json
import os
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from statistics import mean

AKAR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(AKAR))

from dotenv import load_dotenv  # noqa: E402

from backend.db import RepoSupabase  # noqa: E402

TABEL = ["siswa", "progres_modul", "jawaban", "skala_beban"]


def tulis_csv(path: Path, baris: list[dict]) -> None:
    kolom: list[str] = []
    for b in baris:
        for k in b:
            if k not in kolom:
                kolom.append(k)
    with path.open("w", newline="", encoding="utf-8-sig") as berkas:  # utf-8-sig agar rapi di Excel
        penulis = csv.DictWriter(berkas, fieldnames=kolom)
        penulis.writeheader()
        for b in baris:
            penulis.writerow({k: json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v for k, v in b.items()})


def rata(nilai: list[float]) -> str:
    return f"{mean(nilai):.1f}" if nilai else "-"


def main() -> None:
    load_dotenv(AKAR / ".env")
    url = os.getenv("SUPABASE_URL", "").strip()
    kunci = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
    if not url or not kunci:
        sys.exit("SUPABASE_URL dan SUPABASE_SERVICE_KEY belum diisi di file .env")

    repo = RepoSupabase(url, kunci)
    folder = AKAR / "ekspor" / datetime.now().strftime("%Y-%m-%d_%H%M")
    folder.mkdir(parents=True, exist_ok=True)

    data = {}
    for nama in TABEL:
        data[nama] = repo.ambil_tabel(nama)
        tulis_csv(folder / f"{nama}.csv", data[nama])
        print(f"✓ {nama}: {len(data[nama])} baris")

    # Ringkasan per modul
    skor = defaultdict(list)
    for p in data["progres_modul"]:
        if p.get("skor_kuis") is not None:
            skor[p["modul"]].append(p["skor_kuis"])
    beban = defaultdict(list)
    for s in data["skala_beban"]:
        beban[s["modul"]].append(s["skor"])
    latihan = defaultdict(lambda: {"benar": 0, "total": 0, "hint": []})
    for j in data["jawaban"]:
        if j.get("jenis") == "latihan":
            latihan[j["modul"]]["total"] += 1
            latihan[j["modul"]]["benar"] += 1 if j.get("benar") else 0
            latihan[j["modul"]]["hint"].append(j.get("jumlah_hint") or 0)

    ringkasan = []
    for modul in range(0, 7):
        l = latihan[modul]
        ringkasan.append({
            "modul": modul,
            "jumlah_siswa_kuis": len(skor[modul]),
            "rata_skor_kuis": rata(skor[modul]),
            "rata_skala_beban_1_9": rata(beban[modul]),
            "jawaban_latihan": l["total"],
            "persen_latihan_benar": f"{100 * l['benar'] / l['total']:.1f}" if l["total"] else "-",
            "rata_petunjuk_dibuka": rata(l["hint"]),
        })
    tulis_csv(folder / "ringkasan_per_modul.csv", ringkasan)

    print(f"\nJumlah siswa: {len(data['siswa'])}")
    print(f"{'Modul':<6}{'Skor kuis':>11}{'Beban (1-9)':>13}{'Latihan benar %':>17}")
    for r in ringkasan:
        print(f"{r['modul']:<6}{r['rata_skor_kuis']:>11}{r['rata_skala_beban_1_9']:>13}{r['persen_latihan_benar']:>17}")
    print(f"\nFile tersimpan di: {folder}")


if __name__ == "__main__":
    main()
