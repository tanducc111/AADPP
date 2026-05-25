from app.core.config import get_settings
from app.schemas.health import HealthCheckResponse


def get_health_status() -> HealthCheckResponse:
    settings = get_settings()

    return HealthCheckResponse(
        status="ok",
        service=settings.app_name,
        environment=settings.environment,
    )
