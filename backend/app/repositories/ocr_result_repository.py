import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.ocr_result import LineItem, OcrResult
from app.repositories.base import BaseRepository


class OcrResultRepository(BaseRepository[OcrResult]):
    def __init__(self, database_session: Session) -> None:
        super().__init__(OcrResult, database_session)

    def get_by_document_id(self, document_id: uuid.UUID) -> OcrResult | None:
        statement = (
            select(OcrResult)
            .options(joinedload(OcrResult.line_items))
            .where(OcrResult.document_id == document_id)
        )

        return self.database_session.execute(statement).unique().scalar_one_or_none()

    def replace_line_items(
        self,
        ocr_result: OcrResult,
        line_items: list[LineItem],
    ) -> None:
        ocr_result.line_items.clear()

        for line_item in line_items:
            ocr_result.line_items.append(line_item)
