from http import HTTPStatus
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = HTTPStatus.BAD_REQUEST,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class InvalidCredentialsError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Invalid authentication credentials.",
            status_code=HTTPStatus.UNAUTHORIZED,
        )


class GoogleAuthenticationError(AppException):
    def __init__(self, message: str = "Google login could not be verified.") -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.UNAUTHORIZED,
        )


class AccountAccessBlockedError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="User account is inactive or locked.",
            status_code=HTTPStatus.FORBIDDEN,
        )


class ForbiddenAccessError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Insufficient permissions for this action.",
            status_code=HTTPStatus.FORBIDDEN,
        )


class ResourceNotFoundError(AppException):
    def __init__(self, resource_name: str = "Resource") -> None:
        super().__init__(
            message=f"{resource_name} was not found.",
            status_code=HTTPStatus.NOT_FOUND,
        )


class ResourceConflictError(AppException):
    def __init__(self, message: str) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.CONFLICT,
        )


class InvalidFileUploadError(AppException):
    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.BAD_REQUEST,
            details=details,
        )


class InvalidDocumentOperationError(AppException):
    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.BAD_REQUEST,
            details=details,
        )


class StoredFileNotFoundError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Uploaded file was not found.",
            status_code=HTTPStatus.NOT_FOUND,
        )


class OcrProcessingError(AppException):
    def __init__(
        self,
        message: str,
        details: dict[str, Any] | None = None,
        status_code: int = HTTPStatus.BAD_GATEWAY,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status_code,
            details=details,
        )


class OcrResultNotFoundError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="OCR result was not found.",
            status_code=HTTPStatus.NOT_FOUND,
        )


class InvalidOcrOperationError(AppException):
    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.BAD_REQUEST,
            details=details,
        )


class InvalidDateRangeError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="from_date must be earlier than or equal to to_date.",
            status_code=HTTPStatus.BAD_REQUEST,
        )


async def app_exception_handler(request: Request, exception: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exception.status_code,
        content={
            "message": exception.message,
            "details": exception.details,
            "path": str(request.url.path),
        },
    )


async def validation_exception_handler(
    request: Request,
    exception: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=HTTPStatus.UNPROCESSABLE_ENTITY,
        content={
            "message": "Request validation failed.",
            "details": {"errors": exception.errors()},
            "path": str(request.url.path),
        },
    )


async def unhandled_exception_handler(request: Request, exception: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
        content={
            "message": "An unexpected server error occurred.",
            "details": {},
            "path": str(request.url.path),
        },
    )


def register_exception_handlers(application: FastAPI) -> None:
    application.add_exception_handler(AppException, app_exception_handler)
    application.add_exception_handler(RequestValidationError, validation_exception_handler)
    application.add_exception_handler(Exception, unhandled_exception_handler)
