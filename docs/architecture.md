# AADPP Architecture Foundation

## Frontend

The frontend uses Next.js App Router with TypeScript and Tailwind CSS. The first screen is the operational dashboard shell rather than a marketing page. Shared concerns are organized into providers, hooks, services, constants, types, and utilities.

Key boundaries:

- `app/`: route entry points and application layout
- `components/layout/`: sidebar, header, and responsive dashboard shell
- `components/providers/`: auth, global loading, and toast provider structure
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

## Security Foundation

Secrets are read from environment variables. JWT creation, token decoding, password hashing, and RBAC dependency helpers are prepared for future authentication endpoints. Upload validation and OCR business logic are intentionally deferred.
