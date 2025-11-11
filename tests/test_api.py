import os
import json
import tempfile

from fastapi.testclient import TestClient

# Ensure tests use a temporary sqlite DB
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_db.sqlite")

from app.main import app
from app.database import init_db

client = TestClient(app)


def setup_module(module):
    # Create tables in the test DB
    init_db()


def teardown_module(module):
    # remove sqlite file if exists
    try:
        os.remove("test_db.sqlite")
    except OSError:
        pass


def test_create_and_get_cliente_and_pet():
    # create cliente
    r = client.post("/clientes", json={"nome": "Teste", "email": "teste@example.com"})
    assert r.status_code == 201
    data = r.json()
    cliente_id = data["id"]

    # create pet for cliente
    r = client.post("/pets", json={"nome": "Fido", "especie": "Cachorro", "cliente_id": cliente_id})
    assert r.status_code == 201
    pet = r.json()

    # list clientes
    r = client.get("/clientes")
    assert r.status_code == 200
    assert any(c["id"] == cliente_id for c in r.json())

    # list pets by cliente
    r = client.get(f"/clientes/{cliente_id}/pets")
    assert r.status_code == 200
    assert any(p["id"] == pet["id"] for p in r.json())

    # cleanup
    r = client.delete(f"/pets/{pet['id']}")
    assert r.status_code == 204
    r = client.delete(f"/clientes/{cliente_id}")
    assert r.status_code == 204
