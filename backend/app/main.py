from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.base import Base
from app.database.connection import engine

# Import models so SQLAlchemy registers all tables
import app.models  # noqa: F401

from app.routes import (
    auth,
    users,
    services,
    courses,
    mentors,
    internships,
    projects,
    careers,
    contacts,
    newsletter,
    testimonials,
    news,
    course_registrations,
    agreement,
)

from app.routes.certificates import router as certificates_router


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AxelPath Technology Platform API",
)


# ============================================================
# DATABASE
# ============================================================
# Creates missing tables without deleting existing data.
# NOTE: create_all() does NOT modify existing table columns.
Base.metadata.create_all(bind=engine)


# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS = [
    settings.FRONTEND_URL,
    settings.OLD_FRONTEND_URL,
    settings.ADMIN_URL,
    settings.LEGACY_FRONTEND_URL,
    settings.LEGACY_WWW_FRONTEND_URL,
    settings.LOCAL_FRONTEND_URL,
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API PREFIX
# ============================================================

API = settings.API_PREFIX


# ============================================================
# ROUTES
# ============================================================

app.include_router(auth.router, prefix=API)
app.include_router(users.router, prefix=API)
app.include_router(services.router, prefix=API)
app.include_router(courses.router, prefix=API)
app.include_router(mentors.router, prefix=API)
app.include_router(internships.router, prefix=API)
app.include_router(projects.router, prefix=API)
app.include_router(careers.router, prefix=API)
app.include_router(contacts.router, prefix=API)
app.include_router(newsletter.router, prefix=API)
app.include_router(testimonials.router, prefix=API)
app.include_router(news.router, prefix=API)
app.include_router(course_registrations.router, prefix=API)
app.include_router(agreement.router, prefix=API)
app.include_router(certificates_router, prefix=API)


# ============================================================
# STATIC UPLOADS
# ============================================================

upload_directory = Path(settings.UPLOAD_DIR)

upload_directory.mkdir(
    parents=True,
    exist_ok=True,
)

app.mount(
    "/uploads",
    StaticFiles(directory=str(upload_directory)),
    name="uploads",
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "name": "AxelPath API",
        "status": "running",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
    }