from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="AADPP API", validation_alias="APP_NAME")
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    api_v1_prefix: str = Field(default="/api/v1", validation_alias="API_V1_PREFIX")
    database_url: str = Field(validation_alias="DATABASE_URL")
    google_client_id: str = Field(validation_alias="GOOGLE_CLIENT_ID")
    jwt_secret_key: str = Field(
        validation_alias=AliasChoices("JWT_SECRET_KEY", "SECRET_KEY"),
    )
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(
        default=60,
        validation_alias=AliasChoices(
            "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
            "ACCESS_TOKEN_EXPIRE_MINUTES",
        ),
    )
    cors_origins: str = Field(
        default="http://localhost:3000",
        validation_alias="CORS_ORIGINS",
    )
    max_upload_size_mb: int = Field(default=10, validation_alias="MAX_UPLOAD_SIZE_MB")
    upload_dir: str = Field(default="uploads", validation_alias="UPLOAD_DIR")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            cors_origin.strip()
            for cors_origin in self.cors_origins.split(",")
            if cors_origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
