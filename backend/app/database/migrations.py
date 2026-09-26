"""
Idempotent schema migrations for the AxelPath production database.

Rules
-----
- Never drops columns, tables, or rows.
- Safe to run on every application startup (add-only, checked before ALTER).
- Column types match the SQLAlchemy model definitions exactly.
- Errors are logged clearly; startup is aborted on unexpected failures so that
  a broken migration is visible immediately rather than causing silent 500s.

Tables covered
--------------
  course_registrations  — adds columns added after initial deployment
  agreement_acceptances — created by Base.metadata.create_all(); migration
                          only ensures it exists and back-fills nothing
"""

import logging

from sqlalchemy import inspect, text

from app.database.connection import engine

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _columns(inspector, table: str) -> set:
    """Return a set of column names currently in *table*."""
    return {col["name"] for col in inspector.get_columns(table)}


def _add_column_if_missing(
    connection,
    existing: set,
    table: str,
    column: str,
    ddl: str,
) -> None:
    """Execute ALTER TABLE … ADD COLUMN only when the column does not exist."""
    if column not in existing:
        logger.info("Migration: adding column '%s.%s'", table, column)
        connection.execute(text(ddl))
        logger.info("Migration: column '%s.%s' added successfully", table, column)
    else:
        logger.debug("Migration: column '%s.%s' already present — skipped", table, column)


# ---------------------------------------------------------------------------
# Public entry-point
# ---------------------------------------------------------------------------

def run_database_migrations() -> None:
    """
    Apply all pending schema migrations.

    Called once at application startup, after Base.metadata.create_all().
    """
    logger.info("Migration: starting schema migration check")

    try:
        inspector = inspect(engine)

        # ----------------------------------------------------------------
        # course_registrations
        # ----------------------------------------------------------------
        if not inspector.has_table("course_registrations"):
            logger.warning(
                "Migration: table 'course_registrations' does not exist — "
                "skipping (create_all should have created it)."
            )
        else:
            existing = _columns(inspector, "course_registrations")

            with engine.begin() as conn:

                # ---- Agreement columns (added in v2) ----

                _add_column_if_missing(
                    conn, existing,
                    "course_registrations", "agreement_accepted",
                    """
                    ALTER TABLE course_registrations
                    ADD COLUMN agreement_accepted BOOLEAN NOT NULL DEFAULT FALSE
                    """,
                )

                _add_column_if_missing(
                    conn, existing,
                    "course_registrations", "agreement_version",
                    """
                    ALTER TABLE course_registrations
                    ADD COLUMN agreement_version VARCHAR(120) NULL
                    """,
                )

                # ---- Google Drive columns (added in v3, future-ready) ----

                _add_column_if_missing(
                    conn, existing,
                    "course_registrations", "google_drive_folder_id",
                    """
                    ALTER TABLE course_registrations
                    ADD COLUMN google_drive_folder_id VARCHAR(255) NULL
                    """,
                )

                _add_column_if_missing(
                    conn, existing,
                    "course_registrations", "google_drive_folder_url",
                    """
                    ALTER TABLE course_registrations
                    ADD COLUMN google_drive_folder_url VARCHAR(512) NULL
                    """,
                )

                _add_column_if_missing(
                    conn, existing,
                    "course_registrations", "google_drive_status",
                    """
                    ALTER TABLE course_registrations
                    ADD COLUMN google_drive_status VARCHAR(50) NULL DEFAULT 'pending'
                    """,
                )

        # ----------------------------------------------------------------
        # agreement_acceptances
        # ----------------------------------------------------------------
        # This table is created by Base.metadata.create_all().
        # The migration check below is a safety net for environments where
        # create_all was not run (e.g. tests against a frozen schema).
        if not inspector.has_table("agreement_acceptances"):
            logger.warning(
                "Migration: table 'agreement_acceptances' does not exist — "
                "it should have been created by Base.metadata.create_all()."
            )
        else:
            logger.debug("Migration: table 'agreement_acceptances' present — OK")

        logger.info("Migration: schema migration check complete")

    except Exception as exc:
        # Surface migration failures loudly so Render logs capture them.
        logger.error("Migration: FAILED with exception: %s", exc, exc_info=True)
        raise