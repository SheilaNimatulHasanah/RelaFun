import pytest

from backend.penilaian import (
    cek_fungsi,
    cek_himpunan,
    cek_isian,
    cek_pilihan,
    cek_relasi,
    cek_rumus,
    cek_sorot,
    hitung_skor_kuis,
    ke_angka,
    nilai_soal,
)


@pytest.mark.parametrize(
    "masukan, harapan",
    [
        (5, 5.0),
        ("-3", -3.0),
        ("−3", -3.0),  # tanda minus matematika (U+2212)
        (" 7 ", 7.0),
        ("2,5", 2.5),
        ("2.5", 2.5),
        ("27.000", 27000.0),
        ("Rp27.000", 27000.0),
        ("Rp 1.250.000", 1250000.0),
        ("-1.000", -1000.0),
        ("3/2", 1.5),
        ("-6/3", -2.0),
    ],
)
def test_ke_angka_membaca_berbagai_format(masukan, harapan):
    assert ke_angka(masukan) == pytest.approx(harapan)


@pytest.mark.parametrize("masukan", ["", "abc", None, True, "1/0", "--2", [], {}])
def test_ke_angka_menolak_yang_bukan_angka(masukan):
    assert ke_angka(masukan) is None


def test_cek_himpunan_urutan_dan_format_bebas():
    assert cek_himpunan("1, 3, 5", [1, 3, 5])
    assert cek_himpunan("{5,1,3}", [1, 3, 5])
    assert cek_himpunan("−1, 0, 1, 2", [-1, 0, 1, 2])
    assert cek_himpunan("5, 5, 6, 7", [5, 6, 7])  # anggota ganda ditulis sekali
    assert cek_himpunan([1, 3, 5], [1, 3, 5])
    assert not cek_himpunan("1, 3", [1, 3, 5])
    assert not cek_himpunan("1, 3, 5, 7", [1, 3, 5])
    assert cek_himpunan("a, B, c", ["a", "b", "c"])


def test_cek_pilihan():
    assert cek_pilihan(2, 2)
    assert cek_pilihan("2", 2)
    assert not cek_pilihan(1, 2)
    assert not cek_pilihan(True, 1)
    assert not cek_pilihan(None, 0)


def test_cek_relasi_urutan_bebas():
    kunci = [["1", "2"], ["2", "4"]]
    assert cek_relasi([["2", "4"], ["1", "2"]], kunci)
    assert cek_relasi([[2, 4], [1, 2]], kunci)  # angka dibandingkan sebagai teks
    assert not cek_relasi([["1", "2"]], kunci)
    assert not cek_relasi([["2", "1"], ["4", "2"]], kunci)  # arah terbalik
    assert not cek_relasi("bukan daftar", kunci)


def test_cek_fungsi_jomblo_dan_mendua():
    domain = ["1", "2", "3"]
    assert cek_fungsi([["1", "p"], ["2", "q"], ["3", "r"]], domain)["adalah_fungsi"]

    jomblo = cek_fungsi([["1", "p"], ["2", "q"]], domain)
    assert not jomblo["adalah_fungsi"] and jomblo["jomblo"] == ["3"]

    mendua = cek_fungsi([["1", "p"], ["2", "p"], ["2", "q"], ["3", "r"]], domain)
    assert not mendua["adalah_fungsi"] and mendua["mendua"] == ["2"]


def test_cek_fungsi_anggota_b_boleh_dipakai_berulang():
    assert cek_fungsi([["1", "p"], ["2", "p"], ["3", "p"]], ["1", "2", "3"], ["p", "q"])["adalah_fungsi"]


def test_cek_fungsi_menolak_pasangan_di_luar_himpunan():
    hasil = cek_fungsi([["1", "p"], ["2", "z"]], ["1", "2"], ["p", "q"])
    assert not hasil["adalah_fungsi"] and hasil["di_luar"] == [["2", "z"]]


def test_cek_rumus():
    assert cek_rumus({"a": "3", "b": "−2"}, {"a": 3, "b": -2})
    assert cek_rumus({"a": "8.000", "b": "9.000"}, {"a": 8000, "b": 9000})
    assert not cek_rumus({"a": 3, "b": 2}, {"a": 3, "b": -2})
    assert not cek_rumus({"a": 3}, {"a": 3, "b": -2})
    assert not cek_rumus("3x-2", {"a": 3, "b": -2})


def test_cek_isian_per_kotak():
    assert cek_isian(["4", "2", "2", "3"], [4, 2, 2, 3]) == [True] * 4
    assert cek_isian(["4", "3"], [4, 2, 2, 3]) == [True, False, False, False]
    assert cek_isian(None, [1]) == [False]


def test_cek_sorot():
    assert cek_sorot({"a": "p2", "b": "p1"}, {"a": "p2", "b": "p1"})
    assert not cek_sorot({"a": "p1", "b": "p2"}, {"a": "p2", "b": "p1"})
    assert not cek_sorot({"a": "p2"}, {"a": "p2", "b": "p1"})


def test_nilai_soal_tipe_tidak_dikenal_dianggap_salah():
    assert not nilai_soal({"tipe": "aneh", "kunci": 1}, 1)


def test_hitung_skor_kuis():
    soal = [
        {"id": "k1", "tipe": "angka", "kunci": 3},
        {"id": "k2", "tipe": "pilihan", "kunci": 0},
        {"id": "k3", "tipe": "angka", "kunci": -9},
    ]
    hasil = hitung_skor_kuis(soal, {"k1": "3", "k2": 1})  # k3 tidak dijawab
    assert hasil["skor"] == 33
    assert hasil["jumlah_benar"] == 1
    assert [r["benar"] for r in hasil["rincian"]] == [True, False, False]
