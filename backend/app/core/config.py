import json
from typing import Any, List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TiConta v2 ERP"
    ENVIRONMENT: str = "dev"  # dev, staging, prod

    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], Any]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            if isinstance(v, str):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str

    # Licensing
    LICENSE_MASTER_KEY: str = "TICONTAV2_MASTER_SECRET_KEY_MOZAMBIQUE_2026"
    LICENSE_COMPANY_ID: str = "TIC-MZ-001"

    # Twilio (WhatsApp & SMS)
    TWILIO_ACCOUNT_SID: str = "AC_MOCK_ACCOUNT_SID_TICONTA"
    TWILIO_AUTH_TOKEN: str = "MOCK_AUTH_TOKEN_TICONTA"
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"
    TWILIO_SMS_NUMBER: str = "+15005550006"

    # Cloud Storage (S3 / Cloudflare R2)
    STORAGE_PROVIDER: str = "mock"  # mock, s3, r2
    S3_BUCKET: str = "ticonta-documents"
    CLOUDFLARE_R2_BUCKET: str = "ticonta-documents"
    CLOUDFLARE_R2_ACCESS_KEY: str = "mock_r2_access_key"
    CLOUDFLARE_R2_SECRET_KEY: str = "mock_r2_secret_key"
    STORAGE_PUBLIC_BASE_URL: str = "https://documents.ticonta.co.mz"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
