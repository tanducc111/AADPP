# AADPP

AADPP is an enterprise Accounting AI Document Processing Platform. This repository contains a full-stack architecture foundation with Google SSO authentication, JWT session handling, role-based access control, client company management, a Next.js dashboard frontend, a FastAPI backend, PostgreSQL persistence, SQLAlchemy models, Alembic migrations, and Docker-ready local services.

OCR and accounting business workflows are intentionally not implemented yet.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, lucide-react, Axios, react-hook-form, Zod, Google OAuth
- Backend: FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL, JWT utilities, Google token verification
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
- Protected frontend routes load the current user from `/api/v1/auth/me`.
- Backend configuration is loaded from environment variables with Pydantic Settings.
- SQLAlchemy models use UUID primary keys, timezone-aware timestamps, enums, relationships, and indexes on searchable fields.
- Alembic is configured with migrations for the core accounting document schema, Google SSO user fields, and client company management fields.
- JWT and RBAC are implemented as reusable backend dependencies.
