"""
Simple JSON file-based user store.
Free, no database required.
For production scale → swap with SQLite or PostgreSQL.
"""
import json
import os
import uuid
from datetime import datetime
from pathlib import Path

DB_PATH = Path(os.getenv("USER_DB_PATH", "./users_db.json"))


def _load() -> dict:
    if not DB_PATH.exists():
        DB_PATH.write_text(json.dumps({"users": []}))
    try:
        return json.loads(DB_PATH.read_text())
    except Exception:
        return {"users": []}


def _save(data: dict):
    DB_PATH.write_text(json.dumps(data, indent=2))


def find_user_by_email(email: str) -> dict | None:
    db = _load()
    email = email.lower().strip()
    return next((u for u in db["users"] if u["email"] == email), None)


def find_user_by_id(user_id: str) -> dict | None:
    db = _load()
    return next((u for u in db["users"] if u["id"] == user_id), None)


def create_user(name: str, email: str, hashed_password: str) -> dict:
    db = _load()
    user = {
        "id": str(uuid.uuid4()),
        "name": name.strip(),
        "email": email.lower().strip(),
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
    }
    db["users"].append(user)
    _save(db)
    return user


def count_users() -> int:
    return len(_load()["users"])
