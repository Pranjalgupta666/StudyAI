from sqlalchemy import String, Integer, Text, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class DocumentStatus(str, enum.Enum):
    UPLOADING   = "uploading"
    PROCESSING  = "processing"
    READY       = "ready"
    FAILED      = "failed"


class Document(Base):
    __tablename__ = "documents"

    id:              Mapped[str]            = mapped_column(String(36), primary_key=True)
    user_id:         Mapped[str]            = mapped_column(String(36), nullable=False, index=True)
    filename:        Mapped[str]            = mapped_column(String(255), nullable=False)
    storage_key:     Mapped[str]            = mapped_column(String(500), nullable=False)
    status:          Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus), default=DocumentStatus.UPLOADING)
    page_count:      Mapped[int]            = mapped_column(Integer, default=0)
    chunk_count:     Mapped[int]            = mapped_column(Integer, default=0)
    file_size_bytes: Mapped[int]            = mapped_column(Integer, default=0)
    error_message:   Mapped[str | None]     = mapped_column(Text, nullable=True)
    created_at:      Mapped[DateTime]       = mapped_column(DateTime, server_default=func.now())
