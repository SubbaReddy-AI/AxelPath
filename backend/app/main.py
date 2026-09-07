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
)

from app.routes.certificates import router as certificates_router


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="QodeKraft Technology Platform API",
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# CORS
# ============================================================

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://qode-kraft.vercel.app",
        "https://www.qodekraft.in",
        "https://qodekraft.in",
        "https://qodekraft.vercel.app",
    ],
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

# Course registration routes
app.include_router(
    course_registrations.router,
    prefix=API,
)

# Certificate routes
app.include_router(
    certificates_router,
    prefix=API,
)


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
        "name": "QodeKraft API",
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