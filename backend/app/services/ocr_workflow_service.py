import uuid
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import (
    AppException,
    InvalidOcrOperationError,
    OcrProcessingError,
    OcrResultNotFoundError,
    ResourceNotFoundError,
)
from app.models.document import Document
from app.models.enums import DocumentStatus, UserRole
from app.models.ocr_result import LineItem, OcrResult
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.ocr_result_repository import OcrResultRepository
from app.schemas.ocr_results import (
    GeminiOcrResponse,
    OcrRegionRequest,
    OcrRegionResponse,
    OcrResultRead,
    OcrResultUpdate,
)
from app.services.activity_log_service import ActivityLogAction, ActivityLogService
from app.services.file_storage_service import FileStorageService
from app.services.gemini_ocr_service import GeminiOcrService
from app.services.region_crop_service import RegionCropService
from app.utils.datetime import utc_now


class OcrWorkflowService:
    def __init__(self, database_session: Session) -> None:
        self.database_session = database_session
        self.document_repository = DocumentRepository(database_session)
        self.ocr_result_repository = OcrResultRepository(database_session)
        self.activity_log_service = ActivityLogService(database_session)
        self.file_storage_service = FileStorageService()
        self.gemini_ocr_service = GeminiOcrService()
        self.region_crop_service = RegionCropService()

    def run_ocr(self, document_id: uuid.UUID, current_user: User) -> OcrResultRead:
        document = self._get_accessible_document(document_id, current_user)
        self._ensure_ocr_can_start(document)
        document.status = DocumentStatus.PROCESSING
        self.activity_log_service.record_document_event(
            action=ActivityLogAction.START_OCR,
            user_id=current_user.id,
            document_id=document.id,
            description=f"Started OCR for document {document.original_file_name}.",
            event_metadata=self._build_document_event_metadata(document),
        )
        self.database_session.commit()

        try:
            stored_file_path = self.file_storage_service.get_stored_file_path(document.file_path)
            gemini_result = self.gemini_ocr_service.extract_accounting_data(
                file_path=stored_file_path,
                mime_type=document.mime_type,
            )
            ocr_result = self._save_gemini_result(
                document=document,
                gemini_response=gemini_result.parsed_response,
                raw_text=gemini_result.raw_text,
                raw_json=gemini_result.raw_json,
            )
            document.status = DocumentStatus.OCR_DONE
            self.activity_log_service.record_document_event(
                action=ActivityLogAction.OCR_SUCCESS,
                user_id=current_user.id,
                document_id=document.id,
                description=f"OCR completed for document {document.original_file_name}.",
                event_metadata=self._build_ocr_event_metadata(ocr_result),
            )
            self.database_session.commit()
            return OcrResultRead.model_validate(ocr_result)
        except Exception as ocr_error:
            self.database_session.rollback()
            failed_document = self.document_repository.get_by_id(document_id)

            if failed_document:
                failed_document.status = DocumentStatus.FAILED
                self.activity_log_service.record_document_event(
                    action=ActivityLogAction.OCR_FAILED,
                    user_id=current_user.id,
                    document_id=failed_document.id,
                    description=f"OCR failed for document {failed_document.original_file_name}.",
                    event_metadata=self._build_document_event_metadata(failed_document),
                )
                self.database_session.commit()

            if isinstance(ocr_error, AppException):
                raise

            raise OcrProcessingError("OCR processing failed.") from ocr_error

    def run_region_ocr(
        self,
        document_id: uuid.UUID,
        region_request: OcrRegionRequest,
        current_user: User,
    ) -> OcrRegionResponse:
        document = self._get_accessible_document(document_id, current_user)
        cropped_region_file = None

        try:
            stored_file_path = self.file_storage_service.get_stored_file_path(document.file_path)
            cropped_region_file = self.region_crop_service.crop_document_region(
                source_file_path=stored_file_path,
                mime_type=document.mime_type,
                region_request=region_request,
            )
            gemini_result = self.gemini_ocr_service.extract_region_text(
                file_path=cropped_region_file.path,
                mime_type=cropped_region_file.mime_type,
            )
            parsed_response = gemini_result.parsed_response
            self.activity_log_service.record_document_event(
                action=ActivityLogAction.OCR_REGION,
                user_id=current_user.id,
                document_id=document.id,
                description=f"Ran region OCR for document {document.original_file_name}.",
                event_metadata={
                    **self._build_document_event_metadata(document),
                    "page": region_request.page,
                    "region_x": int(region_request.x),
                    "region_y": int(region_request.y),
                    "region_width": int(region_request.width),
                    "region_height": int(region_request.height),
                    "crop_width": cropped_region_file.width,
                    "crop_height": cropped_region_file.height,
                },
            )
            self.database_session.commit()

            return OcrRegionResponse(
                text=parsed_response.text,
                raw_json=gemini_result.raw_json,
                confidence_score=parsed_response.confidence_score,
            )
        except AppException:
            self.database_session.rollback()
            raise
        except Exception as region_error:
            self.database_session.rollback()
            raise OcrProcessingError("OCR region processing failed.") from region_error
        finally:
            if cropped_region_file:
                self.region_crop_service.delete_cropped_region(cropped_region_file)

    def get_ocr_result(self, document_id: uuid.UUID, current_user: User) -> OcrResultRead:
        self._get_accessible_document(document_id, current_user)
        ocr_result = self._get_existing_ocr_result(document_id)

        return OcrResultRead.model_validate(ocr_result)

    def update_ocr_result(
        self,
        document_id: uuid.UUID,
        ocr_result_update: OcrResultUpdate,
        current_user: User,
    ) -> OcrResultRead:
        document = self._get_accessible_document(document_id, current_user)
        self._ensure_ocr_result_can_be_edited(document)
        ocr_result = self._get_existing_ocr_result(document_id)

        self._apply_ocr_result_update(ocr_result, ocr_result_update)
        ocr_result.reviewed_by_user_id = current_user.id
        ocr_result.reviewed_at = utc_now()
        ocr_result.approved_by_user_id = None
        ocr_result.approved_at = None
        document.status = DocumentStatus.REVIEWED
        self.activity_log_service.record_document_event(
            action=ActivityLogAction.UPDATE_OCR_RESULT,
            user_id=current_user.id,
            document_id=document.id,
            description=f"Updated OCR result for document {document.original_file_name}.",
            event_metadata=self._build_ocr_event_metadata(ocr_result),
        )
        self.database_session.commit()

        return OcrResultRead.model_validate(ocr_result)

    def approve_document(self, document_id: uuid.UUID, current_user: User) -> OcrResultRead:
        document = self._get_accessible_document(document_id, current_user)
        self._ensure_document_can_be_approved(document)
        ocr_result = self._get_existing_ocr_result(document_id)
        ocr_result.approved_by_user_id = current_user.id
        ocr_result.approved_at = utc_now()
        document.status = DocumentStatus.APPROVED
        self.activity_log_service.record_document_event(
            action=ActivityLogAction.APPROVE_DOCUMENT,
            user_id=current_user.id,
            document_id=document.id,
            description=f"Approved document {document.original_file_name}.",
            event_metadata=self._build_ocr_event_metadata(ocr_result),
        )
        self.database_session.commit()

        return OcrResultRead.model_validate(ocr_result)

    def _save_gemini_result(
        self,
        document: Document,
        gemini_response: GeminiOcrResponse,
        raw_text: str,
        raw_json: dict,
    ) -> OcrResult:
        ocr_result = self.ocr_result_repository.get_by_document_id(document.id)

        if not ocr_result:
            ocr_result = OcrResult(document_id=document.id)
            self.ocr_result_repository.add(ocr_result)

        ocr_result.document_type = gemini_response.document_type
        ocr_result.company_name = gemini_response.company_name
        ocr_result.tax_code = gemini_response.tax_code
        ocr_result.invoice_number = gemini_response.invoice_number
        ocr_result.invoice_date = gemini_response.invoice_date
        ocr_result.subtotal = gemini_response.subtotal
        ocr_result.vat_amount = gemini_response.vat_amount
        ocr_result.total_amount = gemini_response.total_amount
        ocr_result.currency = gemini_response.currency or "VND"
        ocr_result.confidence_score = gemini_response.confidence_score
        ocr_result.raw_text = raw_text
        ocr_result.raw_json = raw_json
        ocr_result.processed_at = utc_now()
        ocr_result.reviewed_by_user_id = None
        ocr_result.reviewed_at = None
        ocr_result.approved_by_user_id = None
        ocr_result.approved_at = None
        self.ocr_result_repository.replace_line_items(
            ocr_result,
            [
                LineItem(
                    item_name=line_item.item_name,
                    quantity=line_item.quantity,
                    unit_price=line_item.unit_price,
                    amount=line_item.amount,
                    vat_rate=line_item.vat_rate,
                )
                for line_item in gemini_response.line_items
            ],
        )

        return ocr_result

    def _apply_ocr_result_update(
        self,
        ocr_result: OcrResult,
        ocr_result_update: OcrResultUpdate,
    ) -> None:
        ocr_result.document_type = ocr_result_update.document_type
        ocr_result.company_name = ocr_result_update.company_name
        ocr_result.tax_code = ocr_result_update.tax_code
        ocr_result.invoice_number = ocr_result_update.invoice_number
        ocr_result.invoice_date = ocr_result_update.invoice_date
        ocr_result.subtotal = ocr_result_update.subtotal
        ocr_result.vat_amount = ocr_result_update.vat_amount
        ocr_result.total_amount = ocr_result_update.total_amount
        ocr_result.currency = ocr_result_update.currency or "VND"
        ocr_result.confidence_score = ocr_result_update.confidence_score
        ocr_result.raw_text = ocr_result_update.raw_text
        ocr_result.raw_json = ocr_result_update.raw_json
        self.ocr_result_repository.replace_line_items(
            ocr_result,
            [
                LineItem(
                    item_name=line_item.item_name,
                    quantity=line_item.quantity,
                    unit_price=line_item.unit_price,
                    amount=line_item.amount,
                    vat_rate=line_item.vat_rate,
                )
                for line_item in ocr_result_update.line_items
            ],
        )

    def _get_accessible_document(self, document_id: uuid.UUID, current_user: User) -> Document:
        document = self.document_repository.get_by_id_with_details(document_id)

        if not document:
            raise ResourceNotFoundError("Document")

        if current_user.role != UserRole.ADMIN and document.uploaded_by_user_id != current_user.id:
            raise ResourceNotFoundError("Document")

        return document

    def _get_existing_ocr_result(self, document_id: uuid.UUID) -> OcrResult:
        ocr_result = self.ocr_result_repository.get_by_document_id(document_id)

        if not ocr_result:
            raise OcrResultNotFoundError()

        return ocr_result

    def _ensure_ocr_can_start(self, document: Document) -> None:
        allowed_statuses = {DocumentStatus.UPLOADED, DocumentStatus.FAILED}

        if document.status not in allowed_statuses:
            raise InvalidOcrOperationError(
                "OCR can only be started for uploaded or failed documents.",
                details={"status": document.status.value},
            )

    def _ensure_ocr_result_can_be_edited(self, document: Document) -> None:
        if document.status == DocumentStatus.APPROVED:
            raise InvalidOcrOperationError("Approved documents cannot be edited.")

        allowed_statuses = {DocumentStatus.OCR_DONE, DocumentStatus.REVIEWED}

        if document.status not in allowed_statuses:
            raise InvalidOcrOperationError(
                "OCR result can only be edited after OCR is complete.",
                details={"status": document.status.value},
            )

    def _ensure_document_can_be_approved(self, document: Document) -> None:
        allowed_statuses = {DocumentStatus.OCR_DONE, DocumentStatus.REVIEWED}

        if document.status not in allowed_statuses:
            raise InvalidOcrOperationError(
                "Document can only be approved after OCR is complete or reviewed.",
                details={"status": document.status.value},
            )

    def _build_document_event_metadata(self, document: Document) -> dict[str, str | int | None]:
        return {
            "document_id": str(document.id),
            "uploaded_by_user_id": str(document.uploaded_by_user_id),
            "original_file_name": document.original_file_name,
            "status": document.status.value,
            "file_size": document.file_size,
        }

    def _build_ocr_event_metadata(self, ocr_result: OcrResult) -> dict[str, str | int | None]:
        total_amount: Decimal | None = ocr_result.total_amount

        return {
            "document_id": str(ocr_result.document_id),
            "ocr_result_id": str(ocr_result.id),
            "document_type": ocr_result.document_type.value if ocr_result.document_type else None,
            "company_name": ocr_result.company_name,
            "invoice_number": ocr_result.invoice_number,
            "total_amount": str(total_amount) if total_amount is not None else None,
            "currency": ocr_result.currency,
        }
