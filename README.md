# AADPP

AADPP is an enterprise Accounting AI Document Processing Platform. This repository contains a full-stack architecture foundation with Google SSO authentication, JWT session handling, role-based access control, client company management, document upload and management, Gemini OCR review workflows, a Next.js dashboard frontend, a FastAPI backend, PostgreSQL persistence, SQLAlchemy models, Alembic migrations, and Docker-ready local services.

Dashboard analytics and advanced OCR review tooling are intentionally not implemented yet.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, lucide-react, Axios, react-hook-form, Zod, Google OAuth
- Backend: FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL, JWT utilities, Google token verification, Google GenAI SDK
- DevOps: Docker, Docker Compose, environment-based configuration

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

Required frontend environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend

Create a backend environment file:

```bash
cd backend
cp .env.example .env
```

Install Python dependencies and run the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at [http://localhost:8000](http://localhost:8000). Swagger docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

Run database migrations:

```bash
alembic upgrade head
```

Required backend environment variables:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET_KEY=replace-with-a-secure-random-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
MAX_UPLOAD_SIZE_MB=10
UPLOAD_DIR=uploads
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_TEMPERATURE=0
GEMINI_MAX_OUTPUT_TOKENS=4096
```

### Docker Compose

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)
- Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- PostgreSQL: `localhost:5432`

## Folder Structure

```text
AADPP/
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
  docs/
```

## Architecture Notes

- Frontend state is organized through provider boundaries for auth, global loading, and toast notifications.
- API access is centralized through a typed Axios client.
- Google SSO exchanges a frontend Google ID token for a backend-issued JWT.
- Client company management is available at `/clients` with ADMIN CRUD and ACCOUNTANT read-only access to active companies.
- Document management is available at `/documents` with upload, metadata list/detail, download, delete, file validation, and RBAC enforcement.
- Gemini OCR is available from document detail pages and review pages with structured accounting extraction, editable line items, review, and approval workflow.
- Protected frontend routes load the current user from `/api/v1/auth/me`.
- Backend configuration is loaded from environment variables with Pydantic Settings.
- SQLAlchemy models use UUID primary keys, timezone-aware timestamps, enums, relationships, and indexes on searchable fields.
- Alembic is configured with migrations for the core accounting document schema, Google SSO user fields, client company management fields, document upload fields, audit log retention, and OCR review workflow fields.
- JWT and RBAC are implemented as reusable backend dependencies.
