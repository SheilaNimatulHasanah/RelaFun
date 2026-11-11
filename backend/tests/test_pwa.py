"""Memastikan aplikasi tetap bisa DIPASANG (PWA) dan dibuka offline."""

import json
import re
import struct

from backend.app import FOLDER_FRONTEND


def _daftar_aset() -> list[str]:
    isi = (FOLDER_FRONTEND / "service-worker.js").read_text(encoding="utf-8")
    blok = re.search(r"const ASET = \[(.*?)\];", isi, re.S).group(1)
    return re.findall(r"'([^']+)'", blok)


def test_semua_aset_service_worker_tersedia(klien):
    """Jika satu file hilang, service worker gagal dipasang dan aplikasi tidak bisa offline."""
    for url in _daftar_aset():
        respons = klien.get(url)
        assert respons.status_code == 200, url


def test_semua_file_js_masuk_daftar_cache():
    aset = set(_daftar_aset())
    for path in (FOLDER_FRONTEND / "js").rglob("*.js"):
        url = "/" + path.relative_to(FOLDER_FRONTEND).as_posix()
        assert url in aset, f"{url} belum dimasukkan ke ASET di service-worker.js"


def test_manifest_memenuhi_syarat_pasang(klien):
    respons = klien.get("/manifest.webmanifest")
    assert respons.status_code == 200
    assert respons.mimetype == "application/manifest+json"
    manifest = json.loads(respons.data)
    assert manifest["display"] == "standalone"
    assert manifest["start_url"].startswith("/")
    assert manifest["name"] and manifest["short_name"]
    ukuran = {i["sizes"] for i in manifest["icons"]}
    assert {"192x192", "512x512"} <= ukuran
    assert any(i.get("purpose") == "maskable" for i in manifest["icons"])


def test_ikon_berukuran_benar():
    manifest = json.loads((FOLDER_FRONTEND / "manifest.webmanifest").read_text(encoding="utf-8"))
    for ikon in manifest["icons"]:
        data = (FOLDER_FRONTEND / ikon["src"].lstrip("/")).read_bytes()
        assert data[:8] == b"\x89PNG\r\n\x1a\n"
        lebar, tinggi = struct.unpack(">II", data[16:24])
        assert f"{lebar}x{tinggi}" == ikon["sizes"]


def test_service_worker_tidak_di_cache_browser(klien):
    respons = klien.get("/service-worker.js")
    assert respons.status_code == 200
    assert respons.headers["Cache-Control"] == "no-cache"


def test_halaman_utama_terhubung_ke_manifest(klien):
    html = klien.get("/").data.decode("utf-8")
    assert 'rel="manifest"' in html
    assert 'src="/js/main.js"' in html
