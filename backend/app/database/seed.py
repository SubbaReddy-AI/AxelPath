from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.service import Service
from app.models.course import Course
from app.models.project import Project
from app.models.internship import Internship
from app.models.job import Job
from app.models.user import User

from app.utils.security import hash_password


def seed_database():

    db: Session = SessionLocal()

    try:

        # -------------------------
        # ADMIN USER
        # -------------------------

        admin = (
            db.query(User)
            .filter(
                User.email == "admin@AxelPath.com"
            )
            .first()
        )

        if not admin:

            admin = User(
                name="AxelPath Admin",
                email="admin@AxelPath.com",
                password_hash=hash_password(
                    "ChangeThisPassword123!"
                ),
                is_admin=True,
                is_active=True
            )

            db.add(admin)

        # -------------------------
        # SERVICES
        # -------------------------

        services = [
            {
                "title": "AI & Machine Learning",
                "slug": "ai-machine-learning",
                "category": "Artificial Intelligence",
                "description":
                    "AI and machine learning solutions "
                    "for modern businesses.",
                "icon": "brain",
                "display_order": 1,
            },
            {
                "title": "Generative AI",
                "slug": "generative-ai",
                "category": "Artificial Intelligence",
                "description":
                    "Generative AI applications powered "
                    "by modern foundation models.",
                "icon": "sparkles",
                "display_order": 2,
            },
            {
                "title": "Web Development",
                "slug": "web-development",
                "category": "Development",
                "description":
                    "Modern and scalable web applications "
                    "for businesses.",
                "icon": "globe",
                "display_order": 3,
            },
            {
                "title": "Cloud & DevOps",
                "slug": "cloud-devops",
                "category": "Cloud",
                "description":
                    "Cloud infrastructure, deployment "
                    "and DevOps solutions.",
                "icon": "cloud",
                "display_order": 4,
            },
        ]

        for data in services:

            existing = (
                db.query(Service)
                .filter(
                    Service.slug == data["slug"]
                )
                .first()
            )

            if not existing:
                db.add(Service(**data))

        # -------------------------
        # COURSES
        # Payment amount is kept internally for Razorpay; it is not displayed
        # on the public website UI.
        COURSE_FEE = 8550  # ₹8,550 — matches COURSE_REGISTRATION_FEE_RUPEES in route

        courses = [
            {"title": "Web Development", "slug": "web-development", "description": "Build responsive, accessible and modern web experiences with practical frontend engineering.", "level": "Beginner", "duration": "10 Weeks", "price": COURSE_FEE},
            {"title": "Data Science & Data Analytics", "slug": "data-science-data-analytics", "description": "Turn data into clear insights using Python, statistics, visualization, SQL and machine learning.", "level": "Intermediate", "duration": "12 Weeks", "price": COURSE_FEE},
            {"title": "AI & Machine Learning", "slug": "ai-machine-learning", "description": "Learn model development, evaluation and deployment through practical AI and machine learning projects.", "level": "Intermediate", "duration": "12 Weeks", "price": COURSE_FEE},
            {"title": "Generative AI & Agentic AI", "slug": "generative-ai-agentic-ai", "description": "Build modern AI applications with LLMs, prompt engineering, tools, workflows and intelligent agents.", "level": "Advanced", "duration": "10 Weeks", "price": COURSE_FEE},
            {"title": "Full Stack Development", "slug": "full-stack-development", "description": "Create complete web applications across frontend, backend, databases and deployment.", "level": "Intermediate", "duration": "12 Weeks", "price": COURSE_FEE},
            {"title": "Python Development", "slug": "python-development", "description": "Build a strong Python foundation through automation, APIs, backend development and portfolio projects.", "level": "Beginner", "duration": "10 Weeks", "price": COURSE_FEE},
            {"title": "RAG & AI Applications", "slug": "rag-ai-applications", "description": "Design grounded AI applications with retrieval, embeddings, vector databases and LLM workflows.", "level": "Advanced", "duration": "8 Weeks", "price": COURSE_FEE},
        ]

        for data in courses:
            existing = db.query(Course).filter(Course.slug == data["slug"]).first()
            if not existing:
                db.add(Course(**data))
            else:
                existing.title = data["title"]
                existing.description = data["description"]
                existing.level = data["level"]
                existing.duration = data["duration"]
                existing.price = COURSE_FEE
                existing.is_active = True

        # -------------------------
        # PROJECTS
        # -------------------------

        projects = [
            {
                "title": "AI Resume Analyzer",
                "slug": "ai-resume-analyzer",
                "category": "Generative AI",
                "description":
                    "AI-powered resume analysis "
                    "and recommendation platform.",
                "technologies":
                    "Python, FastAPI, React, RAG, LLM",
                "is_featured": True,
            },
            {
                "title": "Smart Business Platform",
                "slug": "smart-business-platform",
                "category": "Web Development",
                "description":
                    "Modern full-stack business "
                    "management platform.",
                "technologies":
                    "React, FastAPI, PostgreSQL, Docker",
                "is_featured": True,
            },
        ]

        for data in projects:

            existing = (
                db.query(Project)
                .filter(
                    Project.slug == data["slug"]
                )
                .first()
            )

            if not existing:
                db.add(Project(**data))

        # -------------------------
        # INTERNSHIPS
        # -------------------------

        internships = [
            {
                "title": "AI & ML Internship",
                "slug": "ai-ml-internship",
                "description":
                    "Practical AI and machine learning "
                    "internship program.",
                "duration": "3 Months",
                "eligibility":
                    "Students and recent graduates",
            },
            {
                "title": "Full Stack Development Internship",
                "slug": "full-stack-internship",
                "description":
                    "Hands-on frontend and backend "
                    "development internship.",
                "duration": "3 Months",
                "eligibility":
                    "Students and recent graduates",
            },
        ]

        for data in internships:

            existing = (
                db.query(Internship)
                .filter(
                    Internship.slug == data["slug"]
                )
                .first()
            )

            if not existing:
                db.add(Internship(**data))

        # -------------------------
        # JOBS
        # -------------------------

        jobs = [
            {
                "title": "Python Developer",
                "slug": "python-developer",
                "location": "Hyderabad",
                "employment_type": "Full Time",
                "description":
                    "Develop scalable Python applications "
                    "and backend services.",
                "requirements":
                    "Python, FastAPI, SQL",
            },
            {
                "title": "AI Engineer",
                "slug": "ai-engineer",
                "location": "Hyderabad",
                "employment_type": "Full Time",
                "description":
                    "Build AI and machine learning "
                    "applications.",
                "requirements":
                    "Python, ML, LLMs, RAG",
            },
        ]

        for data in jobs:

            existing = (
                db.query(Job)
                .filter(
                    Job.slug == data["slug"]
                )
                .first()
            )

            if not existing:
                db.add(Job(**data))

        db.commit()

        print(
            "AxelPath database seeded successfully."
        )

    except Exception as error:

        db.rollback()

        print(
            f"Database seed failed: {error}"
        )

    finally:

        db.close()


if __name__ == "__main__":
    seed_database()