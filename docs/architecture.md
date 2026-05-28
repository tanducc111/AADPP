# AADPP Architecture

AADPP follows a modular full-stack architecture designed for maintainability, clear ownership boundaries, and enterprise accounting workflows. The system is organized around business modules rather than technical shortcuts: authentication, client companies, documents, OCR, approval, dashboard analytics, audit logs, and Chrome Extension region OCR.

## Architecture Principles

- Keep HTTP routing, business logic, persistence, and external integrations separated.
- Keep frontend pages thin and delegate data access to typed service modules.
- Enforce authorization on the backend, regardless of frontend visibility rules.
- Store original documents securely and never expose server file paths.
- Treat AI extraction as a reviewable workflow, not an automatic source of truth.
- Keep extension code isolated from the main web application.

## High-Level System

```text
Chrome Browser
  |
  | Google SSO, dashboard UI, document review UI
  v
Next.js Frontend
  |
  | JWT-authenticated API requests
  v
FastAPI Backend
  |
  | SQLAlchemy ORM
  v
PostgreSQL

FastAPI Backend
  |
  | Secure file access
  v
Local Upload Storage

FastAPI Backend
  |
  | Backend-only Gemini API key
  v
Gemini API

Chrome Extension
  |
  | Region selection coordinates
  v
Next.js Frontend -> FastAPI Backend -> Crop Service -> Gemini API
```

## Frontend Architecture

The frontend uses Next.js App Router, TypeScript, Tailwind CSS, and reusable shadcn-style primitives. Business features are implemented as route-level pages supported by shared components, hooks, service modules, and typed domain contracts.

Key directories:

| Directory               | Responsibility                                                  |
| ----------------------- | --------------------------------------------------------------- |
| `app/`                  | Route entry points and App Router layouts                       |
| `components/layout/`    | Dashboard shell, sidebar, header, navigation                    |
| `components/providers/` | Auth, loading, Google OAuth, and toast providers                |
| `components/auth/`      | Login UI and protected route boundaries                         |
| `components/documents/` | Document table, upload, preview, OCR, review, and region OCR UI |
| `components/clients/`   | Client company table, forms, dialogs, detail views              |
| `components/dashboard/` | KPI cards, charts, recent activity, analytics widgets           |
| `components/admin/`     | Admin user management and audit log views                       |
| `components/ui/`        | Shared UI primitives and polished design-system components      |
| `hooks/`                | Feature-specific client-side state and loading orchestration    |
| `services/`             | Typed API access modules                                        |
| `types/`                | Frontend domain types and API response contracts                |
| `utils/`                | Formatting, error extraction, auth storage helpers              |

### Frontend Data Flow

```text
Page Component
  -> Feature Component
  -> Hook or Service
  -> Axios API Client
  -> FastAPI Endpoint
```

The Axios client centralizes:

- API base URL configuration
- JWT `Authorization` header injection
- 401 handling
- token cleanup on expired sessions

## Backend Architecture

The backend uses FastAPI with a clean service-oriented structure.

Key directories:

| Directory       | Responsibility                                 |
| --------------- | ---------------------------------------------- |
| `core/`         | Settings, security, RBAC, exception handling   |
| `db/`           | SQLAlchemy base, session, engine, dependencies |
| `models/`       | SQLAlchemy models and database enums           |
| `schemas/`      | Pydantic request and response contracts        |
| `routers/`      | HTTP layer only                                |
| `services/`     | Business logic and workflow orchestration      |
| `repositories/` | Database query boundaries                      |
| `middleware/`   | Request context and cross-cutting concerns     |
| `utils/`        | Shared backend helpers                         |

### Backend Request Flow

```text
Router
  -> Dependency validation and current user lookup
  -> Service
  -> Repository
  -> SQLAlchemy Session
  -> PostgreSQL
```

Routers should not contain business rules. Services own workflow decisions. Repositories own query logic.

## Domain Modules

### Authentication

Google SSO is implemented as a passwordless authentication flow:

1. The frontend receives a Google ID token.
2. The frontend sends the ID token to `POST /api/v1/auth/google`.
3. The backend verifies signature, audience, and email verification status.
4. The backend creates or updates the user record.
5. The first user becomes `ADMIN`; later users become `ACCOUNTANT` by default.
6. The backend returns a JWT access token and user profile.

Protected APIs use reusable dependencies:

- `get_current_user`
- `require_admin`
- `require_accountant_or_admin`

### Client Companies

Client companies are the business anchor for document processing. Every uploaded document belongs to a client company.

Rules:

- `company_name` is required.
- `tax_code` is unique when provided.
- inactive companies cannot be used for new document upload.
- ADMIN can manage all companies.
- ACCOUNTANT can view active companies.

Primary API area: `/api/v1/client-companies`

### Documents

Documents store metadata in PostgreSQL and original files in local backend storage.

Storage pattern:

```text
uploads/documents/{year}/{month}/{document_id}/{stored_file_name}
```

Security rules:

- original file names are preserved only as metadata.
- stored file names are generated UUID-based names.
- supported types are PDF, JPG, JPEG, and PNG.
- backend validates extension, MIME type, and size.
- server file paths are never returned to the browser.

Primary API area: `/api/v1/documents`

### Gemini OCR

OCR is implemented as a backend-only integration with Gemini. The frontend never sees `GEMINI_API_KEY`.

Workflow:

```text
UPLOADED or FAILED
  -> PROCESSING
  -> OCR_DONE
  -> REVIEWED
  -> APPROVED
```

Failure flow:

```text
PROCESSING -> FAILED
```

Extracted data is stored in `ocr_results` and related `line_items`. Users review and correct structured fields before approval.

Primary APIs:

- `POST /api/v1/documents/{document_id}/ocr`
- `GET /api/v1/documents/{document_id}/ocr-result`
- `PUT /api/v1/documents/{document_id}/ocr-result`
- `POST /api/v1/documents/{document_id}/approve`

### Chrome Extension Region OCR

The Chrome Extension is isolated under `extensions/chrome-extension` and uses Manifest V3.

Flow:

```text
Popup button
  -> content script overlay
  -> user drags bounding box
  -> extension posts viewport coordinates to AADPP frontend
  -> frontend converts coordinates relative to document preview
  -> backend validates coordinates
  -> crop service crops image/PDF region
  -> Gemini OCR reads cropped region
  -> frontend displays extracted text
```

Backend endpoint:

```text
POST /api/v1/documents/{document_id}/ocr-region
```

The region OCR MVP supports:

- JPG and PNG previews
- PDF page rendering through Poppler/pdf2image
- RBAC on document ownership
- temporary cropped file cleanup
- server-side coordinate validation

Known MVP limitation: PDF region mapping currently targets the selected rendered page path and is optimized for demo usage. A production-grade PDF viewer can improve multi-page and zoom-aware mapping.

### Dashboard Analytics

Dashboard APIs aggregate:

- total client companies
- document counts by status
- document counts by type
- OCR success rate
- uploads over time
- top client companies
- recent activities

ADMIN sees global metrics. ACCOUNTANT sees metrics scoped to their own uploaded documents plus active client company counts.

Primary API area: `/api/v1/dashboard`

### Admin Audit Logs

Audit logs record important workflow events such as login, upload, OCR, review, approval, deletion, and region OCR.

ADMIN-only API:

```text
GET /api/v1/admin/activity-logs
```

Supported filters include search, action, user, date range, pagination, and sorting.

## Database Design Notes

All primary entities use UUID primary keys and timezone-aware timestamps.

Core models:

- `User`
- `ClientCompany`
- `Document`
- `OcrResult`
- `LineItem`
- `ActivityLog`

Important enum groups:

- `UserRole`: `ADMIN`, `ACCOUNTANT`
- `DocumentType`: `VAT_INVOICE`, `RECEIPT`, `PAYMENT_VOUCHER`, `IMPORT_WAREHOUSE`, `EXPORT_WAREHOUSE`, `OTHER`
- `DocumentStatus`: `UPLOADED`, `PROCESSING`, `OCR_DONE`, `REVIEWED`, `APPROVED`, `FAILED`

## Security Model

- Google ID tokens are verified server-side.
- JWT signing secrets are loaded from environment variables.
- Backend RBAC is required for protected operations.
- Inactive or blocked users cannot log in.
- Uploaded files are validated before storage.
- File paths are resolved safely below the configured upload root.
- OCR region coordinates are validated against preview dimensions and source dimensions.
- Gemini errors are mapped to safe API messages without exposing stack traces.

## Operational Checks

Recommended verification commands:

```powershell
cd frontend
npm run typecheck
npm run lint
npm run build
```

```powershell
cd backend
python -m compileall app alembic
alembic upgrade head
```

```powershell
cd extensions/chrome-extension
npm run build
```

```powershell
docker compose build backend frontend
docker compose up -d
```

Health and documentation:

- Health: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
