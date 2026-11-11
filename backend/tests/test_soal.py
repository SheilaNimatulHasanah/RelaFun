"""Memeriksa bank soal data/soal.json agar kunci jawabannya konsisten.

Tes ini mencegah salah ketik kunci jawaban yang bisa merugikan siswa.
"""

import re

import pytest

from backend.app import FOLDER_DATA, muat_bank_soal
from backend.penilaian import cek_fungsi, nilai_soal

BANK = muat_bank_soal(FOLDER_DATA / "soal.json")
SEMUA = list(BANK.values())
TIPE_SAH = {"angka", "pilihan", "himpunan", "buat_relasi", "perbaiki_fungsi", "rumus", "isian", "sorot"}
MAKS_ANGGOTA = 5  # prinsip cognitive load: diagram tidak boleh padat (EL03, DS03)
MAKS_PANAH = 5


def _id(soal):
    return soal["id"]


def test_setiap_modul_punya_latihan_dan_kuis():
    for modul in range(0, 7):
        jenis = {s["jenis"] for s in SEMUA if s["modul"] == modul}
        assert jenis == {"latihan", "kuis"}, f"modul {modul}"


@pytest.mark.parametrize("soal", SEMUA, ids=_id)
def test_struktur_soal(soal):
    assert soal["tipe"] in TIPE_SAH
    assert soal["jenis"] in {"latihan", "kuis"}
    assert re.fullmatch(rf"m{soal['modul']}-[lk]\d+", soal["id"])
    assert soal["id"][3] == ("l" if soal["jenis"] == "latihan" else "k")
    assert soal["teks"].strip()
    assert soal.get("pembahasan", "").strip()
    if soal["jenis"] == "latihan":
        assert len(soal.get("hint", [])) == 3, "latihan wajib punya 3 tingkat petunjuk"


@pytest.mark.parametrize("soal", [s for s in SEMUA if s["tipe"] != "perbaiki_fungsi"], ids=_id)
def test_kunci_lolos_penilaiannya_sendiri(soal):
    kunci = soal["kunci"]
    if soal["tipe"] == "isian":
        kunci = [str(k) for k in kunci]
    assert nilai_soal(soal, kunci)


@pytest.mark.parametrize("soal", [s for s in SEMUA if s["tipe"] == "pilihan"], ids=_id)
def test_pilihan_kunci_dalam_rentang(soal):
    assert 0 <= soal["kunci"] < len(soal["opsi"])
    assert len(set(soal["opsi"])) == len(soal["opsi"])


@pytest.mark.parametrize("soal", [s for s in SEMUA if "diagram" in s.get("data", {})], ids=_id)
def test_diagram_tidak_padat(soal):
    diagram = soal["data"]["diagram"]
    A, B = diagram["A"]["anggota"], diagram["B"]["anggota"]
    assert len(A) <= MAKS_ANGGOTA and len(B) <= MAKS_ANGGOTA
    assert len(diagram["pasangan"]) <= MAKS_PANAH
    for x, y in diagram["pasangan"]:
        assert x in A and y in B
    if soal["tipe"] == "buat_relasi":
        assert len(soal["kunci"]) <= MAKS_PANAH
        for x, y in soal["kunci"]:
            assert x in A and y in B


@pytest.mark.parametrize("soal", [s for s in SEMUA if s["tipe"] == "perbaiki_fungsi"], ids=_id)
def test_perbaiki_fungsi_awalnya_bukan_fungsi(soal):
    diagram = soal["data"]["diagram"]
    awal = cek_fungsi(diagram["pasangan"], diagram["A"]["anggota"], diagram["B"]["anggota"])
    assert not awal["adalah_fungsi"]


@pytest.mark.parametrize("soal", [s for s in SEMUA if "titik" in s.get("data", {})], ids=_id)
def test_titik_sesuai_rumus(soal):
    if soal["tipe"] == "rumus":
        a, b = soal["kunci"]["a"], soal["kunci"]["b"]
    else:  # isian modul 5: rumus diambil dari dua titik
        (x1, y1), (x2, y2) = soal["data"]["titik"][:2]
        a = (y2 - y1) / (x2 - x1)
        b = y1 - a * x1
    for x, y in soal["data"]["titik"]:
        assert a * x + b == pytest.approx(y)


@pytest.mark.parametrize("soal", [s for s in SEMUA if s["tipe"] == "isian"], ids=_id)
def test_isian_jumlah_kotak_sesuai_kunci(soal):
    nomor = [int(n) for baris in soal["data"]["baris"] for n in re.findall(r"\{(\d+)\}", baris)]
    assert sorted(nomor) == list(range(len(soal["kunci"])))


@pytest.mark.parametrize("soal", [s for s in SEMUA if s["tipe"] == "sorot"], ids=_id)
def test_sorot_kunci_ada_di_cerita(soal):
    id_frasa = {b["id"] for b in soal["data"]["bagian"] if "id" in b}
    assert soal["kunci"]["a"] in id_frasa and soal["kunci"]["b"] in id_frasa
    assert soal["kunci"]["a"] != soal["kunci"]["b"]
