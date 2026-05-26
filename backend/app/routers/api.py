from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.admin_users import router as admin_users_router
from app.routers.client_companies import router as client_companies_router
from app.routers.dashboard import admin_router, dashboard_router
from app.routers.documents import router as documents_router
from app.routers.health import router as health_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(admin_users_router)
api_router.include_router(client_companies_router)
api_router.include_router(dashboard_router)
api_router.include_router(admin_router)
api_router.include_router(documents_router)
api_router.include_router(health_router)
