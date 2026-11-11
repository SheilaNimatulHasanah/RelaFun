"""Titik masuk aplikasi Flask.

Menjalankan di laptop:   flask --app backend.app run --debug --host 0.0.0.0
Menjalankan di Vercel:   lewat api/index.py (lihat vercel.json)
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

from .config import buat_config
from .db import RepoMemori, buat_repo
from .routes import api

AKAR = Path(__file__).resolve().parent.parent
FOLDER_FRONTEND = AKAR / "frontend"
FOLDER_DATA = AKAR / "data"

log = logging.getLogger(__name__)


def muat_bank_soal(path: Path) -> dict[str, dict]:
    """Membaca data/soal.json → {id_soal: soal}. Gagal keras bila ada id ganda."""
    with path.open(encoding="utf-8") as berkas:
        isi = json.load(berkas)
    bank: dict[str, dict] = {}
    for soal in isi["soal"]:
        if soal["id"] in bank:
            raise ValueError(f"ID soal ganda di soal.json: {soal['id']}")
        bank[soal["id"]] = soal
    return bank


def create_app(pengaturan: dict | None = None, repo: Any = None) -> Flask:
    load_dotenv(AKAR / ".env")
    logging.basicConfig(level=logging.INFO)

    app = Flask(__name__, static_folder=str(FOLDER_FRONTEND), static_url_path="")
    app.config.update(buat_config())
    if pengaturan:
        app.config.update(pengaturan)
    app.json.sort_keys = False
    app.json.ensure_ascii = False

    app.config["BANK_SOAL"] = muat_bank_soal(FOLDER_DATA / "soal.json")

    if repo is None:
        if app.config["DI_VERCEL"] and not (app.config["SUPABASE_URL"] and app.config["SUPABASE_SERVICE_KEY"]):
            # MODE DEMO menyimpan data di memori satu instance; di Vercel data akan hilang/terpecah.
            raise RuntimeError(
                "SUPABASE_URL dan SUPABASE_SERVICE_KEY wajib diisi di Vercel → Settings → Environment Variables."
            )
        repo = buat_repo(app.config["SUPABASE_URL"], app.config["SUPABASE_SERVICE_KEY"])
    app.extensions["repo"] = repo
    app.config["MODE_DEMO"] = isinstance(repo, RepoMemori)
    if app.config["MODE_DEMO"] and not app.config.get("TESTING"):
        log.warning("MODE DEMO: Supabase belum diatur. Data hanya di memori dan hilang saat server dimatikan.")

    app.register_blueprint(api)

    @app.get("/")
    def beranda():
        return app.send_static_file("index.html")

    @app.get("/data/soal.json")
    def soal_json():
        return send_from_directory(FOLDER_DATA, "soal.json", mimetype="application/json")

    @app.after_request
    def tambah_header(respons):
        respons.headers.setdefault("X-Content-Type-Options", "nosniff")
        respons.headers.setdefault("Referrer-Policy", "same-origin")
        respons.headers.setdefault("X-Frame-Options", "DENY")
        if request.path == "/service-worker.js":
            respons.headers["Cache-Control"] = "no-cache"
            respons.headers["Service-Worker-Allowed"] = "/"
        elif request.path.endswith(".webmanifest"):
            respons.mimetype = "application/manifest+json"
        if request.path.startswith("/api/"):
            respons.headers["Cache-Control"] = "no-store"
        return respons

    @app.errorhandler(404)
    def tidak_ditemukan(galat):
        if request.path.startswith("/api/"):
            return jsonify({"ok": False, "pesan": "Alamat API tidak ditemukan."}), 404
        return galat

    @app.errorhandler(405)
    def metode_salah(galat):
        if request.path.startswith("/api/"):
            return jsonify({"ok": False, "pesan": "Metode tidak diizinkan."}), 405
        return galat

    @app.errorhandler(500)
    def galat_server(galat):
        log.exception("Galat server: %s", galat)
        if request.path.startswith("/api/"):
            return jsonify({"ok": False, "pesan": "Terjadi kesalahan di server. Coba lagi nanti."}), 500
        return galat

    return app
