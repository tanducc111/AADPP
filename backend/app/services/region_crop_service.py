import logging
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image
from pdf2image import convert_from_path

from app.core.exceptions import InvalidDocumentOperationError, OcrProcessingError
from app.schemas.ocr_results import OcrRegionRequest

MIN_REGION_SIZE_PX = 8
MAX_CROP_DIMENSION_PX = 4096
PDF_RENDER_DPI = 180
REGION_CROP_MIME_TYPE = "image/jpeg"
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class CroppedRegionFile:
    path: Path
    mime_type: str
    width: int
    height: int


class RegionCropService:
    def crop_document_region(
        self,
        source_file_path: Path,
        mime_type: str,
        region_request: OcrRegionRequest,
    ) -> CroppedRegionFile:
        self._validate_display_region(region_request)

        if mime_type in {"image/jpeg", "image/png"}:
            return self._crop_image_region(source_file_path, region_request)

        if mime_type == "application/pdf":
            return self._crop_pdf_region(source_file_path, region_request)

        raise InvalidDocumentOperationError("OCR region is not supported for this file type.")

    def delete_cropped_region(self, cropped_region_file: CroppedRegionFile) -> None:
        try:
            cropped_region_file.path.unlink(missing_ok=True)
        except OSError:
            logger.warning(
                "Unable to clean up temporary OCR region file.",
                extra={"path": str(cropped_region_file.path)},
                exc_info=True,
            )

    def _crop_image_region(
        self,
        source_file_path: Path,
        region_request: OcrRegionRequest,
    ) -> CroppedRegionFile:
        with Image.open(source_file_path) as source_image:
            return self._crop_pillow_image(source_image.convert("RGB"), region_request)

    def _crop_pdf_region(
        self,
        source_file_path: Path,
        region_request: OcrRegionRequest,
    ) -> CroppedRegionFile:
        try:
            rendered_pages = convert_from_path(
                source_file_path,
                dpi=PDF_RENDER_DPI,
                first_page=region_request.page,
                last_page=region_request.page,
            )
        except Exception as pdf_error:
            raise OcrProcessingError(
                "Unable to render the selected PDF page for region OCR.",
            ) from pdf_error

        if not rendered_pages:
            raise InvalidDocumentOperationError("The selected PDF page could not be rendered.")

        return self._crop_pillow_image(rendered_pages[0].convert("RGB"), region_request)

    def _crop_pillow_image(
        self,
        source_image: Image.Image,
        region_request: OcrRegionRequest,
    ) -> CroppedRegionFile:
        source_width, source_height = source_image.size
        crop_box = self._build_crop_box(source_width, source_height, region_request)
        left, top, right, bottom = crop_box
        cropped_width = right - left
        cropped_height = bottom - top

        if cropped_width > MAX_CROP_DIMENSION_PX or cropped_height > MAX_CROP_DIMENSION_PX:
            raise InvalidDocumentOperationError(
                "Selected region is too large for OCR.",
                details={"max_crop_dimension_px": MAX_CROP_DIMENSION_PX},
            )

        cropped_image = source_image.crop(crop_box)
        temporary_file = tempfile.NamedTemporaryFile(
            delete=False,
            prefix="aadpp_ocr_region_",
            suffix=".jpg",
        )
        temporary_path = Path(temporary_file.name)
        temporary_file.close()
        cropped_image.save(temporary_path, format="JPEG", quality=92)

        return CroppedRegionFile(
            path=temporary_path,
            mime_type=REGION_CROP_MIME_TYPE,
            width=cropped_width,
            height=cropped_height,
        )

    def _build_crop_box(
        self,
        source_width: int,
        source_height: int,
        region_request: OcrRegionRequest,
    ) -> tuple[int, int, int, int]:
        scale_x = source_width / region_request.display_width
        scale_y = source_height / region_request.display_height
        left = round(region_request.x * scale_x)
        top = round(region_request.y * scale_y)
        right = round((region_request.x + region_request.width) * scale_x)
        bottom = round((region_request.y + region_request.height) * scale_y)

        if left < 0 or top < 0 or right > source_width or bottom > source_height:
            raise InvalidDocumentOperationError("Selected OCR region is outside the document preview.")

        if right - left < MIN_REGION_SIZE_PX or bottom - top < MIN_REGION_SIZE_PX:
            raise InvalidDocumentOperationError("Selected OCR region is too small.")

        return left, top, right, bottom

    def _validate_display_region(self, region_request: OcrRegionRequest) -> None:
        if region_request.x + region_request.width > region_request.display_width:
            raise InvalidDocumentOperationError("Selected OCR region exceeds preview width.")

        if region_request.y + region_request.height > region_request.display_height:
            raise InvalidDocumentOperationError("Selected OCR region exceeds preview height.")

        if region_request.width < MIN_REGION_SIZE_PX or region_request.height < MIN_REGION_SIZE_PX:
            raise InvalidDocumentOperationError("Selected OCR region is too small.")
