"""Entry point Vercel (Python Serverless Function).

Vercel menjalankan objek WSGI bernama `app` dari file ini.
Lewat `rewrites` di vercel.json, semua permintaan /api/* dan /data/soal.json
diteruskan ke sini dengan path aslinya, sehingga rute Flask tetap sama seperti di laptop.
File frontend (HTML, CSS, JS, ikon) TIDAK lewat sini: disajikan langsung oleh CDN Vercel.
"""

import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
if str(AKAR) not in sys.path:
    sys.path.insert(0, str(AKAR))

from backend.app import create_app  # noqa: E402

app = create_app()
