"""Memastikan konfigurasi deploy Vercel konsisten dengan isi proyek."""

import importlib.util
import json

import pytest

from backend.app import AKAR, create_app
from backend.config import buat_config

VERCEL = json.loads((AKAR / "vercel.json").read_text(encoding="utf-8"))


def _muat_entry_point():
    spec = importlib.util.spec_from_file_location("vercel_entry", AKAR / "api" / "index.py")
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    return modul


def test_folder_statis_berisi_pwa():
    folder = AKAR / VERCEL["outputDirectory"]
    for nama in ("index.html", "service-worker.js", "manifest.webmanifest", "offline.html"):
        assert (folder / nama).is_file(), nama


def test_rewrite_api_dan_bank_soal_ke_fungsi_python():
    tujuan = {r["source"]: r["destination"] for r in VERCEL["rewrites"]}
    assert tujuan["/api/(.*)"] == "/api/index"
    assert tujuan["/data/soal.json"] == "/api/index"
    assert (AKAR / "api" / "index.py").is_file()
    assert "api/index.py" in VERCEL["functions"]


def test_entry_point_menjalankan_flask_yang_sama():
    app = _muat_entry_point().app
    klien = app.test_client()
    assert klien.get("/api/kesehatan").get_json()["data"]["status"] == "hidup"
    soal = klien.get("/data/soal.json")
    assert soal.status_code == 200 and soal.get_json()["soal"]


def test_header_service_worker_tidak_di_cache():
    header = {h["source"]: {x["key"]: x["value"] for x in h["headers"]} for h in VERCEL["headers"]}
    assert header["/service-worker.js"]["Cache-Control"] == "no-cache"
    assert header["/manifest.webmanifest"]["Content-Type"] == "application/manifest+json"


def test_file_rahasia_tidak_ikut_diunggah():
    abaikan = (AKAR / ".vercelignore").read_text(encoding="utf-8").splitlines()
    assert ".env" in abaikan and ".venv/" in abaikan


def test_requirements_produksi_ramping():
    isi = (AKAR / "requirements.txt").read_text(encoding="utf-8").lower()
    assert "flask" in isi and "supabase" in isi
    assert "pytest" not in isi and "gunicorn" not in isi


def test_di_vercel_secret_key_wajib(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        buat_config()


def test_di_vercel_cookie_otomatis_https(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setenv("SECRET_KEY", "x")
    monkeypatch.delenv("COOKIE_SECURE", raising=False)
    assert buat_config()["SESSION_COOKIE_SECURE"] is True


def test_di_vercel_mode_demo_ditolak(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setenv("SECRET_KEY", "x")
    with pytest.raises(RuntimeError, match="SUPABASE"):
        create_app({"SUPABASE_URL": "", "SUPABASE_SERVICE_KEY": ""})
