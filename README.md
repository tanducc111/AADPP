# AADPP

AADPP is an enterprise Accounting AI Document Processing Platform. This repository contains the initial full-stack architecture foundation only: a Next.js dashboard frontend, a FastAPI backend, PostgreSQL persistence, SQLAlchemy models, Alembic migrations, JWT/RBAC scaffolding, and Docker-ready local services.

OCR and accounting business workflows are intentionally not implemented yet.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, lucide-react, Axios, react-hook-form, Zod
- Backend: FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL, JWT utilities
- DevOps: Docker, Docker Compose, environment-based configuration

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

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
- Backend configuration is loaded from environment variables with Pydantic Settings.
- SQLAlchemy models use UUID primary keys, timezone-aware timestamps, enums, relationships, and indexes on searchable fields.
- Alembic is configured with an initial migration for the core accounting document schema.
- JWT and RBAC are prepared as reusable utilities without implementing authentication business workflows yet.
