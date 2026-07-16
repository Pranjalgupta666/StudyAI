from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Only ONE external key needed
    GEMINI_API_KEY: str

    # All local — no accounts
    DATABASE_URL: str = "sqlite+aiosqlite:///./studyai.db"
    UPLOAD_DIR: str = "./uploads"
    CHROMA_DIR: str = "./chromadb"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Limits
    MAX_FILE_SIZE_MB: int = 50
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    TOP_K_RESULTS: int = 5

    # Models (both free/local)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"   # downloads once ~90MB
    GEMINI_MODEL: str = "gemini-2.0-flash-lite"        # free tier

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
