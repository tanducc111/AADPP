import logging
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import InvalidFileUploadError, StoredFileNotFoundError

logger = logging.getLogger(__name__)

ALLOWED_FILE_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}
UPLOAD_CHUNK_SIZE_BYTES = 1024 * 1024


@dataclass(frozen=True)
class StoredDocumentFile:
    original_file_name: str
    stored_file_name: str
    file_path: str
    file_size: int
    mime_type: str


@dataclass(frozen=True)
class DownloadableDocumentFile:
    path: Path
    file_name: str
    mime_type: str


class FileStorageService:
    def __init__(self) -> None:
        settings = get_settings()
        upload_root = Path(settings.upload_dir)
        self.upload_root = upload_root if upload_root.is_absolute() else Path.cwd() / upload_root
        self.max_upload_size_bytes = settings.max_upload_size_mb * 1024 * 1024

    async def store_document_file(
        self,
        uploaded_file: UploadFile,
        document_id: uuid.UUID,
        uploaded_at: datetime,
    ) -> StoredDocumentFile:
        original_file_name = self._normalize_original_file_name(uploaded_file.filename)
        file_extension = self._validate_file_extension(original_file_name)
        mime_type = self._validate_mime_type(uploaded_file.content_type)
        stored_file_name = f"{uuid.uuid4()}{file_extension}"
        relative_file_path = Path(
            "documents",
            f"{uploaded_at.year:04d}",
            f"{uploaded_at.month:02d}",
            str(document_id),
            stored_file_name,
        )
        target_file_path = self._resolve_upload_path(relative_file_path)
        target_file_path.parent.mkdir(parents=True, exist_ok=True)

        file_size = 0

        try:
            with target_file_path.open("wb") as target_file:
                while file_chunk := await uploaded_file.read(UPLOAD_CHUNK_SIZE_BYTES):
                    file_size += len(file_chunk)

                    if file_size > self.max_upload_size_bytes:
                        raise InvalidFileUploadError(
                            "Uploaded file exceeds the maximum allowed size.",
                            details={"max_upload_size_bytes": self.max_upload_size_bytes},
                        )

                    target_file.write(file_chunk)
        except Exception:
            self.delete_file_if_exists(relative_file_path.as_posix())
            raise
        finally:
            await uploaded_file.close()

        if file_size == 0:
            self.delete_file_if_exists(relative_file_path.as_posix())
            raise InvalidFileUploadError("Uploaded file is empty.")

        return StoredDocumentFile(
            original_file_name=original_file_name,
            stored_file_name=stored_file_name,
            file_path=relative_file_path.as_posix(),
            file_size=file_size,
            mime_type=mime_type,
        )

    def get_downloadable_file(
        self,
        file_path: str,
        original_file_name: str,
        mime_type: str,
    ) -> DownloadableDocumentFile:
        resolved_file_path = self._resolve_upload_path(Path(file_path))

        if not resolved_file_path.is_file():
            raise StoredFileNotFoundError()

        return DownloadableDocumentFile(
            path=resolved_file_path,
            file_name=original_file_name,
            mime_type=mime_type,
        )

    def get_stored_file_path(self, file_path: str) -> Path:
        resolved_file_path = self._resolve_upload_path(Path(file_path))

        if not resolved_file_path.is_file():
            raise StoredFileNotFoundError()

        return resolved_file_path

    def delete_file_if_exists(self, file_path: str) -> bool:
        resolved_file_path = self._resolve_upload_path(Path(file_path))

        try:
            if resolved_file_path.is_file():
                resolved_file_path.unlink()
                return True
        except OSError:
            logger.warning("Unable to delete uploaded file.", extra={"file_path": file_path})

        return False

    def _resolve_upload_path(self, relative_file_path: Path) -> Path:
        upload_root = self.upload_root.resolve()
        resolved_file_path = (upload_root / relative_file_path).resolve()

        if upload_root != resolved_file_path and upload_root not in resolved_file_path.parents:
            raise InvalidFileUploadError("Invalid upload file path.")

        return resolved_file_path

    def _normalize_original_file_name(self, file_name: str | None) -> str:
        if not file_name:
            raise InvalidFileUploadError("Uploaded file must have a file name.")

        original_file_name = Path(file_name).name.strip()

        if not original_file_name:
            raise InvalidFileUploadError("Uploaded file must have a file name.")

        return original_file_name[:255]

    def _validate_file_extension(self, file_name: str) -> str:
        file_extension = Path(file_name).suffix.lower()

        if file_extension not in ALLOWED_FILE_EXTENSIONS:
            raise InvalidFileUploadError(
                "Unsupported file extension.",
                details={"allowed_extensions": sorted(ALLOWED_FILE_EXTENSIONS)},
            )

        return file_extension

    def _validate_mime_type(self, mime_type: str | None) -> str:
        if mime_type not in ALLOWED_MIME_TYPES:
            raise InvalidFileUploadError(
                "Unsupported file MIME type.",
                details={"allowed_mime_types": sorted(ALLOWED_MIME_TYPES)},
            )

        return mime_type
