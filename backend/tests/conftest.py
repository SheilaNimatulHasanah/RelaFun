import pytest

from backend.app import create_app
from backend.db import RepoMemori
from backend.routes import pembatas_masuk


@pytest.fixture
def repo():
    return RepoMemori(kode_kelas_awal=("DEMO", "9A-UJI"))


@pytest.fixture
def app(repo):
    pembatas_masuk._catatan.clear()
    return create_app({"TESTING": True, "SECRET_KEY": "kunci-tes"}, repo=repo)


@pytest.fixture
def klien(app):
    return app.test_client()


@pytest.fixture
def klien_masuk(klien):
    respons = klien.post("/api/masuk", json={"nama": "Rina", "kode_kelas": "demo"})
    assert respons.status_code == 201
    return klien
