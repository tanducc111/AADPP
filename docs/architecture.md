# AADPP Architecture Foundation

## Frontend

The frontend uses Next.js App Router with TypeScript and Tailwind CSS. The first screen is the operational dashboard shell rather than a marketing page. Shared concerns are organized into providers, hooks, services, constants, types, and utilities.

Key boundaries:

- `app/`: route entry points and application layout
- `components/layout/`: sidebar, header, and responsive dashboard shell
- `components/providers/`: auth, global loading, and toast provider structure
- `components/auth/`: Google login and protected route guards
- `components/ui/`: shadcn/ui-style primitives
- `lib/`: shared infrastructure such as Axios and class name composition
- `services/`: API-facing service modules
- `types/`: domain and API TypeScript contracts

## Backend

The backend uses FastAPI with a clean layering approach. Routers stay thin, services hold application behavior, repositories isolate persistence access, and models define database structure.

Key boundaries:

- `core/`: settings, security, RBAC, and exception handling
- `db/`: SQLAlchemy base, engine, sessions, and dependencies
- `models/`: persistence models and database enums
- `schemas/`: Pydantic API contracts
- `routers/`: HTTP route modules
- `services/`: application service layer
- `repositories/`: persistence abstractions
- `middleware/`: request-level cross-cutting concerns
- `utils/`: shared helpers

## Domain Models

Initial database models:

- `User`
- `ClientCompany`
- `Document`
- `OcrResult`
- `ActivityLog`

All primary keys are UUIDs. All models include `created_at` and `updated_at` with timezone-aware database timestamps. Document and user classification values are represented with enums.

## Client Companies

Client company management is the business anchor for future document uploads. Backend access is enforced by role:

- `ADMIN`: create, update, delete, activate, deactivate, and view all client companies
- `ACCOUNTANT`: view and search active client companies only

The API exposes paginated search and filtering through `/api/v1/client-companies`. The frontend module lives under `/clients`.

## Documents

Document management stores original PDF and image uploads under backend local storage while keeping metadata in PostgreSQL. Files are written below `uploads/documents/{year}/{month}/{document_id}` with generated stored file names, backend extension and MIME validation, and a configurable max file size.

Backend access is enforced by role:

- `ADMIN`: upload, view, download, list, and delete all documents
- `ACCOUNTANT`: upload documents, list/view/download their own documents, and delete their own documents only while status is `UPLOADED` or `FAILED`

The API exposes `/api/v1/documents/upload`, `/api/v1/documents`, `/api/v1/documents/{id}`, `/api/v1/documents/{id}/download`, and `DELETE /api/v1/documents/{id}`. The frontend module lives under `/documents`.

## OCR Review Workflow

OCR uses the backend-only Google GenAI SDK with Gemini. The frontend never receives the Gemini API key. Document files are loaded from secure local storage, sent to Gemini by the backend, parsed as JSON, and persisted in `ocr_results` with structured accounting fields plus `line_items`.

Document status transitions:

- `UPLOADED` or `FAILED` -> `PROCESSING` when OCR starts
- `PROCESSING` -> `OCR_DONE` when Gemini extraction succeeds
- `PROCESSING` -> `FAILED` when OCR fails
- `OCR_DONE` or `REVIEWED` -> `REVIEWED` when users save reviewed data
- `OCR_DONE` or `REVIEWED` -> `APPROVED` when users approve the result

The API exposes `/api/v1/documents/{id}/ocr`, `/api/v1/documents/{id}/ocr-result`, and `/api/v1/documents/{id}/approve`. The frontend review UI lives under `/documents/{id}/review`.

## Security Foundation

Secrets are read from environment variables. Google ID tokens are verified server-side with the official Google auth library, then exchanged for backend JWT access tokens. The API exposes `/api/v1/auth/google`, `/api/v1/auth/me`, and `/api/v1/auth/logout`.

RBAC is enforced through backend dependencies:

- `get_current_user`
- `require_admin`
- `require_accountant_or_admin`

Frontend route guards improve user experience, but backend role checks remain the source of truth.
