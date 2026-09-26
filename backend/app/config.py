from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
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
    SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ============================================================
    # FRONTEND / ADMIN
    # ============================================================

    FRONTEND_URL: str = "https://www.axelpath.in"
    OLD_FRONTEND_URL: str = "https://axelpath.vercel.app"
    ADMIN_URL: str = "https://axelpath-admin.vercel.app"

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
    SMTP_PASSWORD: str = ""

    EMAIL_FROM: str = ""
    ADMIN_EMAIL: str = ""

    # ============================================================
    # RAZORPAY
    # ============================================================

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # ============================================================
    # GOOGLE DRIVE (future — leave empty until configured)
    # ============================================================

    GOOGLE_DRIVE_FOLDER_ID: str = ""
    GOOGLE_DRIVE_FOLDER_URL: str = ""

    # ============================================================
    # SETTINGS CONFIGURATION
    # ============================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()