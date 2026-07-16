import os
import aiofiles
from pathlib import Path
from app.core.config import get_settings

settings = get_settings()


def _get_path(user_id: str, doc_id: str, filename: str) -> Path:
    """Local path: uploads/{user_id}/{doc_id}/{filename}"""
    path = Path(settings.UPLOAD_DIR) / user_id / doc_id
    path.mkdir(parents=True, exist_ok=True)
    return path / filename.replace(" ", "_")


async def upload(user_id: str, doc_id: str, filename: str, contents: bytes) -> str:
    """Save PDF bytes to local disk. Returns the storage key (relative path)."""
    file_path = _get_path(user_id, doc_id, filename)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)
    # Return relative key for storage in DB
    return str(file_path)


async def get_file_url(storage_key: str) -> str:
    """Return a local URL the frontend can use to view the PDF."""
    # FastAPI serves /uploads/ as a static mount — see main.py
    parts = Path(storage_key).parts
    # parts = ('uploads', user_id, doc_id, filename)
    relative = "/".join(parts[-3:])
    return f"http://localhost:8000/uploads/{relative}"


async def read_file(storage_key: str) -> bytes:
    """Read PDF bytes from local disk."""
    async with aiofiles.open(storage_key, "rb") as f:
        return await f.read()


async def delete_file(storage_key: str) -> None:
    """Delete PDF from local disk."""
    try:
        os.remove(storage_key)
    except FileNotFoundError:
        pass
