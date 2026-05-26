import json
import logging
from dataclasses import dataclass
from http import HTTPStatus
from pathlib import Path
from typing import Any

from pydantic import ValidationError

from app.core.config import get_settings
from app.core.exceptions import OcrProcessingError
from app.schemas.ocr_results import GeminiOcrResponse

logger = logging.getLogger(__name__)

OCR_PROMPT = """
Bạn là hệ thống OCR và trích xuất dữ liệu kế toán cho tài liệu Việt Nam.

Hãy đọc tài liệu đính kèm và trích xuất dữ liệu kế toán có cấu trúc.

Quy tắc bắt buộc:
- Chỉ trả về JSON hợp lệ.
- Không trả về markdown.
- Không giải thích.
- Nếu thiếu trường, trả về null.
- Nếu không thấy dòng hàng hóa/dịch vụ, trả về [].
- Chuẩn hóa tiền tệ thành số, không dùng dấu phân cách hàng nghìn.
- Chuẩn hóa invoice_date thành YYYY-MM-DD.
- Nếu không rõ loại tài liệu, trả về OTHER.
- confidence_score phải nằm trong khoảng 0 đến 1.

Các document_type hợp lệ:
- VAT_INVOICE
- RECEIPT
- PAYMENT_VOUCHER
- IMPORT_WAREHOUSE
- EXPORT_WAREHOUSE
- OTHER

JSON kỳ vọng:
{
  "document_type": "VAT_INVOICE",
  "company_name": "string or null",
  "tax_code": "string or null",
  "invoice_number": "string or null",
  "invoice_date": "YYYY-MM-DD or null",
  "subtotal": 0,
  "vat_amount": 0,
  "total_amount": 0,
  "currency": "VND",
  "confidence_score": 0.0,
  "line_items": [
    {
      "item_name": "string",
      "quantity": 0,
      "unit_price": 0,
      "amount": 0,
      "vat_rate": 0
    }
  ]
}
""".strip()


@dataclass(frozen=True)
class GeminiOcrResult:
    raw_text: str
    raw_json: dict[str, Any]
    parsed_response: GeminiOcrResponse


class GeminiOcrService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def extract_accounting_data(self, file_path: Path, mime_type: str) -> GeminiOcrResult:
        if not self.settings.gemini_api_key:
            raise OcrProcessingError("Gemini API key is not configured.")

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.settings.gemini_api_key)
            response = client.models.generate_content(
                model=self.settings.gemini_model,
                contents=[
                    types.Part.from_bytes(
                        data=file_path.read_bytes(),
                        mime_type=mime_type,
                    ),
                    OCR_PROMPT,
                ],
                config=types.GenerateContentConfig(
                    temperature=self.settings.gemini_temperature,
                    max_output_tokens=self.settings.gemini_max_output_tokens,
                    response_mime_type="application/json",
                    response_schema=GeminiOcrResponse,
                ),
            )
        except OcrProcessingError:
            raise
        except Exception as gemini_error:
            logger.warning("Gemini OCR request failed.", exc_info=True)
            raise self._map_gemini_error(gemini_error) from gemini_error

        raw_text = (getattr(response, "text", None) or "").strip()

        if not raw_text:
            raise OcrProcessingError("Gemini returned an empty OCR response.")

        raw_json = self._parse_json_response(raw_text)

        try:
            parsed_response = GeminiOcrResponse.model_validate(raw_json)
        except ValidationError as validation_error:
            raise OcrProcessingError(
                "Gemini OCR response did not match the expected schema.",
                details={"errors": validation_error.errors()},
            ) from validation_error

        return GeminiOcrResult(
            raw_text=raw_text,
            raw_json=raw_json,
            parsed_response=parsed_response,
        )

    def _parse_json_response(self, raw_text: str) -> dict[str, Any]:
        try:
            parsed_response = json.loads(raw_text)
        except json.JSONDecodeError:
            try:
                parsed_response = json.loads(self._strip_markdown_fences(raw_text))
            except json.JSONDecodeError as json_error:
                raise OcrProcessingError("Gemini OCR response was not valid JSON.") from json_error

        if not isinstance(parsed_response, dict):
            raise OcrProcessingError("Gemini OCR response must be a JSON object.")

        return parsed_response

    def _strip_markdown_fences(self, raw_text: str) -> str:
        normalized_text = raw_text.strip()

        if normalized_text.startswith("```json"):
            normalized_text = normalized_text.removeprefix("```json").strip()
        elif normalized_text.startswith("```"):
            normalized_text = normalized_text.removeprefix("```").strip()

        if normalized_text.endswith("```"):
            normalized_text = normalized_text.removesuffix("```").strip()

        return normalized_text

    def _map_gemini_error(self, gemini_error: Exception) -> OcrProcessingError:
        provider_status_code = getattr(gemini_error, "status_code", None)
        error_text = str(gemini_error)
        normalized_error_text = error_text.lower()
        error_details = {
            "provider": "gemini",
            "model": self.settings.gemini_model,
            "provider_status_code": provider_status_code,
        }

        if provider_status_code == HTTPStatus.TOO_MANY_REQUESTS or "resource_exhausted" in normalized_error_text:
            return OcrProcessingError(
                "Gemini API quota was exceeded. Check Google AI Studio quota/billing or use an API key/model with available quota.",
                details={**error_details, "reason": "quota_exceeded"},
                status_code=HTTPStatus.TOO_MANY_REQUESTS,
            )

        if provider_status_code in {HTTPStatus.UNAUTHORIZED, HTTPStatus.FORBIDDEN}:
            return OcrProcessingError(
                "Gemini API credentials are invalid or not permitted to use the configured model.",
                details={**error_details, "reason": "provider_auth_failed"},
            )

        if provider_status_code == HTTPStatus.BAD_REQUEST:
            return OcrProcessingError(
                "Gemini rejected the OCR request. Check the uploaded file type, file size, and configured Gemini model.",
                details={**error_details, "reason": "provider_rejected_request"},
            )

        return OcrProcessingError(
            "Gemini OCR request failed.",
            details={**error_details, "reason": "provider_request_failed"},
        )
