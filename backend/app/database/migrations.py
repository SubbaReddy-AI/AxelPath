from sqlalchemy import inspect, text

from app.database.connection import engine


def run_database_migrations():
    """
    Apply small, idempotent schema migrations required by the application.

    This function is safe to run multiple times.
    It only adds missing columns and never drops existing data.
    """

    inspector = inspect(engine)

    # ------------------------------------------------------------
    # course_registrations
    # ------------------------------------------------------------

    if not inspector.has_table("course_registrations"):
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("course_registrations")
    }

    with engine.begin() as connection:

        # Add agreement_accepted if it does not exist
        if "agreement_accepted" not in existing_columns:
            connection.execute(
                text(
                    """
                    ALTER TABLE course_registrations
                    ADD COLUMN agreement_accepted BOOLEAN
                    NOT NULL DEFAULT FALSE
                    """
                )
            )

        # Add agreement_version if it does not exist
        if "agreement_version" not in existing_columns:
            connection.execute(
                text(
                    """
                    ALTER TABLE course_registrations
                    ADD COLUMN agreement_version VARCHAR(255) NULL
                    """
                )
            )