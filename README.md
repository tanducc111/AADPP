# AADPP

**AADPP** is an AI-powered Accounting Document Processing Platform built for accounting service companies that manage documents for multiple client companies. The platform supports Google SSO, JWT sessions, role-based access control, client company management, secure document upload, Gemini OCR extraction, human review, approval workflow, analytics dashboards, audit logs, and a Chrome Extension MVP for OCR region selection.

The goal of AADPP is to turn manual accounting document intake into a controlled, auditable, AI-assisted workflow.

## Core Capabilities

- Google SSO authentication with backend-verified Google ID tokens
- JWT-protected API requests with ADMIN and ACCOUNTANT roles
- Client company management with search, pagination, status control, and RBAC
- Secure PDF/JPG/JPEG/PNG upload with local backend storage
- Document list, detail, preview, download, and deletion workflows
- Gemini OCR for structured accounting data extraction
- OCR review UI with editable fields and line items
- Approval workflow with locked approved results
- Dashboard analytics for document volume, OCR outcomes, status distribution, and client company activity
- Admin user management and audit log browsing
- Chrome Extension MVP for selecting a document region and running OCR on that region only
- Docker-ready local development stack

## Tech Stack

| Layer           | Technology                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Frontend        | Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Framer Motion, Recharts |
| API Client      | Axios with centralized auth and error handling                                                    |
| Forms           | React Hook Form, Zod                                                                              |
| Authentication  | Google OAuth, backend JWT                                                                         |
| Backend         | FastAPI, Pydantic, SQLAlchemy, Alembic                                                            |
| Database        | PostgreSQL                                                                                        |
| AI OCR          | Google GenAI SDK with Gemini                                                                      |
| File Processing | Pillow, pdf2image, Poppler                                                                        |
| DevOps          | Docker, Docker Compose                                                                            |
| Extension       | Chrome Manifest V3, TypeScript                                                                    |

## System Roles

| Role       | Access                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| ADMIN      | Global dashboard, all client companies, all documents, OCR/review/approve any document, user management, audit logs |
| ACCOUNTANT | Active client companies, own uploaded documents, OCR/review/approve own documents, scoped dashboard metrics         |

Backend RBAC is the source of truth. Frontend route guards only improve user experience.

## Quick Start With Docker

Create environment files:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

Update the required values:

```env
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

```env
# backend/.env
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
JWT_SECRET_KEY=replace-with-a-secure-random-secret
GEMINI_API_KEY=your-gemini-api-key
```

Start the stack:

```powershell
docker compose up --build
```

Run migrations:

```powershell
docker compose exec backend alembic upgrade head
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- PostgreSQL: `localhost:5432`

## Local Development

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Useful checks:

```powershell
npm run typecheck
npm run lint
npm run build
```

### Backend

```powershell
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Useful checks:

```powershell
python -m compileall app alembic
alembic upgrade head
```

### Chrome Extension

```powershell
cd extensions/chrome-extension
npm install
npm run build
```

Load `extensions/chrome-extension/dist` in Chrome through `chrome://extensions` with Developer Mode enabled.

## Environment Variables

### Frontend

| Variable                       | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`     | Public frontend API base URL                   |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID used by the browser |

### Backend

| Variable                          | Purpose                                        |
| --------------------------------- | ---------------------------------------------- |
| `APP_NAME`                        | FastAPI application name                       |
| `ENVIRONMENT`                     | Runtime environment                            |
| `API_V1_PREFIX`                   | API prefix, usually `/api/v1`                  |
| `DATABASE_URL`                    | PostgreSQL SQLAlchemy connection string        |
| `GOOGLE_CLIENT_ID`                | Google OAuth Web Client ID verified by backend |
| `JWT_SECRET_KEY`                  | Secret used to sign JWT access tokens          |
| `JWT_ALGORITHM`                   | JWT signing algorithm                          |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime                          |
| `CORS_ORIGINS`                    | Allowed browser origins                        |
| `MAX_UPLOAD_SIZE_MB`              | Maximum document upload size                   |
| `UPLOAD_DIR`                      | Backend upload storage root                    |
| `GEMINI_API_KEY`                  | Backend-only Gemini API key                    |
| `GEMINI_MODEL`                    | Gemini model used for OCR                      |
| `GEMINI_TEMPERATURE`              | OCR generation temperature                     |
| `GEMINI_MAX_OUTPUT_TOKENS`        | Maximum OCR response tokens                    |

## Project Structure

```text
AADPP/
  backend/
    alembic/
    app/
      core/
      db/
      middleware/
      models/
      repositories/
      routers/
      schemas/
      services/
      utils/
      main.py
  frontend/
    app/
    components/
    constants/
    hooks/
    lib/
    services/
    styles/
    types/
    utils/
  docs/
    architecture.md
    demo-guide.md
  extensions/
    chrome-extension/
      public/
      scripts/
      src/
```

## Main User Flow

1. User signs in with Google SSO.
2. Backend verifies the Google ID token and returns a JWT access token.
3. User selects or creates a client company.
4. User uploads an accounting document.
5. Backend validates and stores the original file securely.
6. User runs Gemini OCR.
7. Extracted accounting data is saved as an OCR result with line items.
8. User reviews and corrects OCR data.
9. User approves the document.
10. Dashboard and audit logs reflect the full workflow.

## API Highlights

- `POST /api/v1/auth/google`
- `GET /api/v1/auth/me`
- `GET /api/v1/client-companies`
- `POST /api/v1/documents/upload`
- `GET /api/v1/documents`
- `POST /api/v1/documents/{document_id}/ocr`
- `GET /api/v1/documents/{document_id}/ocr-result`
- `PUT /api/v1/documents/{document_id}/ocr-result`
- `POST /api/v1/documents/{document_id}/approve`
- `POST /api/v1/documents/{document_id}/ocr-region`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/admin/activity-logs`

OpenAPI documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Security Notes

- Secrets are never hardcoded in source code.
- Gemini API keys are backend-only and are never exposed to the frontend.
- Backend validates Google ID tokens server-side.
- Every protected API route requires JWT authentication.
- RBAC is enforced on the backend.
- Uploaded file names are not trusted for storage.
- Stored file paths are not exposed to the frontend.
- OCR region coordinates are validated server-side before cropping.
- Temporary cropped files are cleaned up after OCR.

## Demo Readiness

Recommended demo route:

```text
Login -> Dashboard -> Client Companies -> Upload Document -> Document Detail
-> Run OCR -> Review OCR -> Approve -> Admin Users -> Audit Logs
-> Chrome Extension Region OCR
```

See [docs/demo-guide.md](docs/demo-guide.md) for a presentation-focused demo plan.

## Current Scope

AADPP is implemented as a local demo-ready enterprise SaaS MVP. It focuses on the complete accounting document workflow, AI-assisted OCR, operational analytics, RBAC, and auditability. Future production work could add cloud object storage, background OCR queues, multi-page PDF region mapping, advanced extraction confidence review, deployment infrastructure, and automated test coverage.
