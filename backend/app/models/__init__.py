from app.models.user import User
from app.models.service import Service
from app.models.course import Course
from app.models.mentor import Mentor
from app.models.internship import Internship
from app.models.internship_application import InternshipApplication
from app.models.project import Project
from app.models.job import Job
from app.models.job_application import JobApplication
from app.models.contact_message import ContactMessage
from app.models.newsletter import Newsletter
from app.models.testimonial import Testimonial
from app.models.news import News
from app.models.course_registration import CourseRegistration
from app.models.agreement_acceptance import AgreementAcceptance

__all__ = [
    "User",
    "Service",
    "Course",
    "Mentor",
    "Internship",
    "InternshipApplication",
    "Project",
    "Job",
    "JobApplication",
    "ContactMessage",
    "Newsletter",
    "Testimonial",
    "News",
    "CourseRegistration",
    "AgreementAcceptance",
]