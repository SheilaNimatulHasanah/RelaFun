"""Pengaturan aplikasi, dibaca dari variabel lingkungan / file .env."""

from __future__ import annotations

import logging
import os
import secrets
from datetime import timedelta

log = logging.getLogger(__name__)


def di_vercel() -> bool:
    """Vercel otomatis mengisi variabel lingkungan VERCEL=1."""
    return bool(os.getenv("VERCEL"))


def buat_config() -> dict:
    """Membuat dict konfigurasi Flask. Dipanggil setelah .env dimuat."""
    kunci_rahasia = os.getenv("SECRET_KEY", "").strip()
    if not kunci_rahasia:
        if di_vercel():
            # Di Vercel ada banyak instance server; kunci acak per instance membuat
            # cookie sesi siswa tidak valid secara acak. Lebih baik gagal dengan jelas.
            raise RuntimeError(
                "SECRET_KEY belum diisi. Tambahkan di Vercel → Project → Settings → Environment Variables."
            )
        kunci_rahasia = secrets.token_hex(32)
        log.warning(
            "SECRET_KEY belum diisi; memakai kunci acak sementara. "
            "Siswa harus masuk ulang setiap server dinyalakan ulang."
        )

    cookie_aman = os.getenv("COOKIE_SECURE", "1" if di_vercel() else "0") == "1"

    return {
        "DI_VERCEL": di_vercel(),
        "SECRET_KEY": kunci_rahasia,
        "SUPABASE_URL": os.getenv("SUPABASE_URL", "").strip(),
        "SUPABASE_SERVICE_KEY": os.getenv("SUPABASE_SERVICE_KEY", "").strip(),
        # Cookie sesi siswa
        "SESSION_COOKIE_NAME": "fungsiku_sesi",
        "SESSION_COOKIE_HTTPONLY": True,
        "SESSION_COOKIE_SAMESITE": "Lax",
        "SESSION_COOKIE_SECURE": cookie_aman,
        "PERMANENT_SESSION_LIFETIME": timedelta(days=180),
        # File statis selalu dicek ulang; offline ditangani service worker.
        "SEND_FILE_MAX_AGE_DEFAULT": 0,
        # Batas ukuran permintaan (256 KB) agar server tidak dibanjiri data.
        "MAX_CONTENT_LENGTH": 256 * 1024,
        # Batas percobaan masuk per IP per menit.
        "BATAS_MASUK_PER_MENIT": 10,
    }
