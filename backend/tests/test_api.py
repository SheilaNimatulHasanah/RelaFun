def test_kesehatan(klien):
    respons = klien.get("/api/kesehatan")
    assert respons.status_code == 200
    assert respons.get_json()["data"]["status"] == "hidup"


def test_masuk_berhasil_dan_kode_kelas_tidak_peka_huruf(klien):
    respons = klien.post("/api/masuk", json={"nama": "  Rina   Ayu ", "kode_kelas": " demo "})
    assert respons.status_code == 201
    siswa = respons.get_json()["data"]["siswa"]
    assert siswa["nama"] == "Rina Ayu"
    assert siswa["kode_kelas"] == "DEMO"

    saya = klien.get("/api/saya")
    assert saya.status_code == 200
    assert saya.get_json()["data"]["siswa"]["id"] == siswa["id"]


def test_masuk_kode_kelas_salah(klien):
    respons = klien.post("/api/masuk", json={"nama": "Rina", "kode_kelas": "SALAH"})
    assert respons.status_code == 404
    assert "Kode kelas" in respons.get_json()["pesan"]


def test_masuk_nama_kosong(klien):
    assert klien.post("/api/masuk", json={"nama": "   ", "kode_kelas": "DEMO"}).status_code == 400


def test_masuk_harus_json(klien):
    respons = klien.post("/api/masuk", data={"nama": "Rina", "kode_kelas": "DEMO"})
    assert respons.status_code == 400


def test_masuk_dibatasi_per_menit(klien, app):
    batas = app.config["BATAS_MASUK_PER_MENIT"]
    for _ in range(batas):
        klien.post("/api/masuk", json={"nama": "x", "kode_kelas": "SALAH"})
    assert klien.post("/api/masuk", json={"nama": "x", "kode_kelas": "DEMO"}).status_code == 429


def test_rute_terlindungi_tanpa_sesi(klien):
    assert klien.get("/api/saya").status_code == 401
    assert klien.put("/api/progres/1", json={"langkah_terakhir": 2}).status_code == 401
    assert klien.post("/api/jawaban", json=[]).status_code == 401
    assert klien.post("/api/kuis/1", json={}).status_code == 401
    assert klien.post("/api/skala-beban", json={}).status_code == 401


def test_keluar_menghapus_sesi(klien_masuk):
    assert klien_masuk.post("/api/keluar").status_code == 200
    assert klien_masuk.get("/api/saya").status_code == 401


def test_sesi_hilang_bila_siswa_tidak_ada(klien_masuk, repo):
    repo.siswa.clear()  # mis. server MODE DEMO dinyalakan ulang
    assert klien_masuk.get("/api/saya").status_code == 401


def test_simpan_progres(klien_masuk):
    respons = klien_masuk.put("/api/progres/2", json={"langkah_terakhir": 4, "selesai": True})
    assert respons.status_code == 200
    data = respons.get_json()["data"]
    assert data["langkah_terakhir"] == 4
    assert data["selesai"] is False  # "selesai" hanya dari kuis

    progres = klien_masuk.get("/api/saya").get_json()["data"]["progres"]
    assert progres == [{"modul": 2, "langkah_terakhir": 4, "selesai": False, "skor_kuis": None}]


def test_progres_modul_tidak_valid(klien_masuk):
    assert klien_masuk.put("/api/progres/9", json={"langkah_terakhir": 1}).status_code == 404
    assert klien_masuk.put("/api/progres/1", json={"langkah_terakhir": -1}).status_code == 400
    assert klien_masuk.put("/api/progres/1", json={"langkah_terakhir": "3"}).status_code == 400


def _jawaban(id_klien="j1", **lain):
    data = {
        "id_klien": id_klien,
        "modul": 4,
        "soal_id": "m4-l1",
        "jenis": "latihan",
        "jawaban": "−8",
        "benar": False,  # sengaja salah: server harus menghitung ulang
        "percobaan_ke": 1,
        "jumlah_hint": 2,
        "durasi_detik": 30,
    }
    data.update(lain)
    return data


def test_simpan_jawaban_dinilai_ulang_server(klien_masuk, repo):
    respons = klien_masuk.post("/api/jawaban", json=_jawaban())
    assert respons.get_json()["data"] == {"diterima": 1, "tersimpan": 1, "ditolak": 0}
    tersimpan = repo.jawaban["j1"]
    assert tersimpan["benar"] is True
    assert tersimpan["jumlah_hint"] == 2


def test_simpan_jawaban_batch_dan_tidak_ganda(klien_masuk, repo):
    batch = [_jawaban("a"), _jawaban("b", jawaban="5"), _jawaban("a")]
    data = klien_masuk.post("/api/jawaban", json=batch).get_json()["data"]
    assert data["tersimpan"] == 2
    assert repo.jawaban["b"]["benar"] is False

    # Antrean offline mengirim ulang data yang sama → tidak dobel
    data = klien_masuk.post("/api/jawaban", json=batch).get_json()["data"]
    assert data["tersimpan"] == 0
    assert len(repo.jawaban) == 2


def test_simpan_jawaban_menolak_yang_tidak_valid(klien_masuk):
    batch = [
        _jawaban("x1", soal_id="tidak-ada"),
        _jawaban("x2", modul=3),  # modul tidak cocok dengan soal
        _jawaban("x3", soal_id="m4-k1"),  # soal kuis tidak boleh lewat rute ini
        _jawaban("x4", jawaban="9" * 3000),  # terlalu panjang
        _jawaban("ok"),
    ]
    data = klien_masuk.post("/api/jawaban", json=batch).get_json()["data"]
    assert data == {"diterima": 1, "tersimpan": 1, "ditolak": 4}


def test_kuis_dinilai_server_dan_skor_pertama_dipertahankan(klien_masuk, repo):
    kirim = {
        "id_kirim": "kuis-1",
        "jawaban": [
            {"soal_id": "m4-k1", "jawaban": "-9"},
            {"soal_id": "m4-k2", "jawaban": "8"},
            {"soal_id": "m4-k3", "jawaban": 1},  # salah
            {"soal_id": "m4-k4", "jawaban": "3"},
        ],
    }
    data = klien_masuk.post("/api/kuis/4", json=kirim).get_json()["data"]
    assert data["skor"] == 75
    assert data["skor_tercatat"] == 75
    assert len([j for j in repo.jawaban.values() if j["jenis"] == "kuis"]) == 4

    kirim_ulang = {"id_kirim": "kuis-2", "jawaban": [{"soal_id": "m4-k3", "jawaban": 0}] + kirim["jawaban"][:2]}
    kirim_ulang["jawaban"].append({"soal_id": "m4-k4", "jawaban": "3"})
    data = klien_masuk.post("/api/kuis/4", json=kirim_ulang).get_json()["data"]
    assert data["skor"] == 100
    assert data["skor_tercatat"] == 75

    progres = klien_masuk.get("/api/saya").get_json()["data"]["progres"]
    assert progres[0]["selesai"] is True and progres[0]["skor_kuis"] == 75


def test_kuis_tidak_valid(klien_masuk):
    assert klien_masuk.post("/api/kuis/4", json={"jawaban": []}).status_code == 400
    assert klien_masuk.post("/api/kuis/8", json={"id_kirim": "x", "jawaban": []}).status_code == 404


def test_skala_beban(klien_masuk, repo):
    respons = klien_masuk.post(
        "/api/skala-beban", json={"id_klien": "s1", "modul": 2, "skor": 4, "penjelasan": " Fungsi itu tidak jomblo "}
    )
    assert respons.status_code == 200
    assert repo.skala["s1"]["penjelasan"] == "Fungsi itu tidak jomblo"
    assert klien_masuk.post("/api/skala-beban", json={"id_klien": "s2", "modul": 2, "skor": 10}).status_code == 400


def test_api_tidak_dikenal_mengembalikan_json(klien):
    respons = klien.get("/api/tidak-ada")
    assert respons.status_code == 404
    assert respons.get_json()["ok"] is False
