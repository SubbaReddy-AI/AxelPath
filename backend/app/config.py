from functools import lru_cache
from typing import List

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ============================================================
    # SETTINGS CONFIGURATION  (must be first in pydantic-settings)
    # ============================================================
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    # ============================================================
    # APPLICATION
    # ============================================================
    APP_NAME: str = "AxelPath API"
    APP_ENV: str = "production"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # ============================================================
    # DATABASE / SECURITY
    # ============================================================
    DATABASE_URL: str
    SECRET_KEY: SecretStr
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ============================================================
    # FRONTEND / ADMIN
    # ============================================================
    FRONTEND_URL: str = "https://www.axelpath.in"
    OLD_FRONTEND_URL: str = "https://axelpath.vercel.app"
    ADMIN_URL: str = "https://axelpath-admin.vercel.app"

    # Legacy domain support
    LEGACY_FRONTEND_URL: str = "https://qodekraft.in"
    LEGACY_WWW_FRONTEND_URL: str = "https://www.qodekraft.in"

    # Local development
    LOCAL_FRONTEND_URL: str = "http://localhost:5173"
    LOCAL_ADMIN_URL: str = "http://localhost:5174"

    # ============================================================
    # FILE UPLOADS
    # ============================================================
    UPLOAD_DIR: str = "app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 25

    # ============================================================
    # EMAIL
    # ============================================================
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: SecretStr = SecretStr("")
    EMAIL_FROM: str = ""
    ADMIN_EMAIL: str = ""

    # ============================================================
    # ADMIN ACCOUNT
    # ============================================================
    ADMIN_PASSWORD: SecretStr = SecretStr("")

    # ============================================================
    # RAZORPAY
    # ============================================================
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: SecretStr = SecretStr("")
    RAZORPAY_WEBHOOK_SECRET: SecretStr = SecretStr("")

    # ============================================================
    # GOOGLE DRIVE
    # ============================================================
    GOOGLE_DRIVE_FOLDER_ID: str = ""
    GOOGLE_DRIVE_FOLDER_URL: str = ""

    # ============================================================
    # GOOGLE SHEETS
    # ============================================================
    GOOGLE_SHEET_ID: str = ""
    GOOGLE_SHEET_NAME: str = "Student Registrations"


def _build_allowed_origins(s: "Settings") -> List[str]:
    """Single source of truth for CORS-allowed origins."""
    candidates = [
        s.FRONTEND_URL,
        s.OLD_FRONTEND_URL,
        s.ADMIN_URL,
        s.LEGACY_FRONTEND_URL,
        s.LEGACY_WWW_FRONTEND_URL,
        s.LOCAL_FRONTEND_URL,
        s.LOCAL_ADMIN_URL,
        # Vercel preview deployment
        "https://axelpath-git-main-rag-air-esume.vercel.app",
    ]
    seen: set = set()
    result: List[str] = []
    for origin in candidates:
        if origin and origin not in seen:
            seen.add(origin)
            result.append(origin)
    return result


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Pre-computed CORS origins — use this everywhere instead of a hardcoded list.
ALLOWED_ORIGINS: List[str] = _build_allowed_origins(settings)