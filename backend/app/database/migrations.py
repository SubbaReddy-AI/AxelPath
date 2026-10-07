"""
AxelPath — Complete Idempotent Schema Migration
================================================

This module reconciles the live production MySQL database against the current
SQLAlchemy model definitions.  It is executed automatically at every application
startup AFTER Base.metadata.create_all().

Design rules
------------
- Never drops a table.
- Never drops a column.
- Never deletes a row.
- Adds missing columns to existing tables (ADD COLUMN).
- Corrects NOT NULL → NULL on columns that are legitimately nullable in the
  model but were created NOT NULL by an older deployment (MODIFY COLUMN).
- New tables are handled by Base.metadata.create_all() before this runs.
- Every ALTER TABLE statement is guarded by a live-schema check (existence
  for ADD, current nullability for MODIFY) so it is fully idempotent.
- Running this multiple times is safe.
- No credentials are hard-coded; the existing DATABASE_URL engine is reused.
- Every action (add / modify / skip) is logged.
- Any unexpected exception aborts startup with a full traceback.

MODIFY COLUMN note
-------------------
MySQL MODIFY COLUMN rewrites the column definition in-place.  The UNIQUE
index and any other index on the column are preserved automatically by MySQL
when the column name, type and length are unchanged.  Only nullability is
altered.  All existing row data is preserved.

Source of truth
---------------
All column names, types, nullability and defaults are taken DIRECTLY from the
SQLAlchemy model files in backend/app/models/.  Nothing is guessed.

Tables covered
--------------
Table                   Models file                    Notes
-----------------------+------------------------------+-------------------------
course_registrations    models/course_registration.py  Main payment table
agreement_acceptances   models/agreement_acceptance.py New in v2
internship_applications models/internship_application  status, resume_path
job_applications        models/job_application.py      status, resume_path
contact_messages        models/contact_message.py      status
certificates            models/certificate.py          Full table (new)

Tables NOT covered (fully static, created by create_all on first boot)
----------------------------------------------------------------------
users, courses, services, mentors, internships, jobs, projects,
news, newsletter_subscribers, testimonials

These tables contain no nullable-default columns that could be added post-
deployment, so create_all() handles them completely.

MySQL DDL transaction note
--------------------------
In MySQL/InnoDB, DDL statements (ALTER TABLE) cause an implicit COMMIT before
and after execution.  They are NOT rolled back by a Python transaction.  This
migration guards each column individually before issuing ALTER TABLE so that a
partial failure leaves the database in a consistent, re-runnable state.
"""

import logging

from sqlalchemy import inspect, text

from app.database.connection import engine

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _column_info(inspector, table: str) -> dict:
    """Return {column_name: column_dict} for every column currently in *table*."""
    return {col["name"]: col for col in inspector.get_columns(table)}


def _existing_columns(inspector, table: str) -> set:
    """Return the set of column names that currently exist in *table*."""
    return set(_column_info(inspector, table).keys())


def _add_column(conn, existing: set, table: str, column: str, ddl: str) -> bool:
    """
    Issue ALTER TABLE … ADD COLUMN iff *column* is absent from *existing*.

    Returns True when the column was added, False when it was already present.
    """
    if column in existing:
        logger.debug("  [skip] %s.%s already present", table, column)
        return False

    logger.info("  [add ] %s.%s — executing ALTER TABLE ADD COLUMN", table, column)
    conn.execute(text(ddl))
    logger.info("  [done] %s.%s added", table, column)
    return True


def _fix_nullable(conn, info: dict, table: str, column: str, modify_ddl: str) -> bool:
    """
    Issue ALTER TABLE … MODIFY COLUMN iff the live column is currently NOT NULL
    but the SQLAlchemy model declares it nullable=True.

    *modify_ddl* must contain the complete new column definition (type + NULL)
    so that MySQL does not inadvertently change other properties.

    Returns True when the column was modified, False when already nullable or
    when the column does not exist yet (add_column handles that case).

    Idempotent: if the column is already NULL in the DB, nothing is executed.
    """
    col = info.get(column)
    if col is None:
        # Column doesn't exist yet — _add_column will create it as nullable.
        logger.debug("  [skip-null-fix] %s.%s not yet present", table, column)
        return False

    if col.get("nullable", True):  # already nullable — nothing to do
        logger.debug("  [skip-null-fix] %s.%s already nullable", table, column)
        return False

    logger.info(
        "  [fix ] %s.%s is NOT NULL in DB but nullable=True in model — "
        "executing MODIFY COLUMN",
        table, column,
    )
    conn.execute(text(modify_ddl))
    logger.info("  [done] %s.%s nullability corrected to NULL", table, column)
    return True


# ---------------------------------------------------------------------------
# Per-table migration functions
# ---------------------------------------------------------------------------

def _migrate_course_registrations(inspector, conn) -> None:
    """
    Reconcile course_registrations against CourseRegistration model.

    Phase A — ADD missing columns
    ------------------------------
    Columns that may be absent from an older production table:
      - razorpay_signature   VARCHAR(128) NULL
      - utr                  VARCHAR(100) NULL
      - agreement_accepted   BOOLEAN NOT NULL DEFAULT FALSE
      - agreement_version    VARCHAR(120) NULL
      - enrollment_status    VARCHAR(50) NOT NULL DEFAULT 'pending'
      - google_drive_folder_id   VARCHAR(255) NULL
      - google_drive_folder_url  VARCHAR(512) NULL
      - google_drive_status      VARCHAR(50) NULL DEFAULT 'pending'
      - paid_at              DATETIME NULL

    Phase B — FIX incorrect NOT NULL constraints
    ---------------------------------------------
    These columns were legitimately nullable in the model from the start but
    the production table may have been created with them as NOT NULL (by an
    older migration or an older create_all() pass):

      razorpay_order_id    VARCHAR(80) NULL   (NULL before order is created)
      razorpay_payment_id  VARCHAR(80) NULL   (NULL before payment)
      razorpay_signature   VARCHAR(128) NULL  (NULL before payment)
      utr                  VARCHAR(100) NULL  (NULL before payment)
      paid_at              DATETIME NULL      (NULL before payment)

    This is the root cause of:
      IntegrityError: (1048, "Column 'razorpay_order_id' cannot be null")

    Core columns present in the original table (not migrated):
      id, registration_id, full_name, email, phone, referral_id,
      course_id, course_slug, course_title, amount,
      payment_status, created_at
    """
    table = "course_registrations"
    info = _column_info(inspector, table)   # {name: col_dict} — for nullability checks
    ex   = set(info.keys())                 # set of names — for existence checks

    # ────────────────────────────────────────────────────────────────────────
    # Phase A — ADD COLUMN (only when the column does not yet exist)
    # ────────────────────────────────────────────────────────────────────────

    # Razorpay extended fields
    _add_column(conn, ex, table, "razorpay_signature",
        f"ALTER TABLE {table} ADD COLUMN razorpay_signature VARCHAR(128) NULL"
    )
    _add_column(conn, ex, table, "utr",
        f"ALTER TABLE {table} ADD COLUMN utr VARCHAR(100) NULL"
    )

    # Agreement fields (v2)
    _add_column(conn, ex, table, "agreement_accepted",
        f"ALTER TABLE {table} ADD COLUMN agreement_accepted BOOLEAN NOT NULL DEFAULT FALSE"
    )
    _add_column(conn, ex, table, "agreement_version",
        f"ALTER TABLE {table} ADD COLUMN agreement_version VARCHAR(120) NULL"
    )

    # Enrollment status (v2) — NOT NULL with DEFAULT so existing rows get 'pending'
    _add_column(conn, ex, table, "enrollment_status",
        f"ALTER TABLE {table} ADD COLUMN enrollment_status VARCHAR(50) NOT NULL DEFAULT 'pending'"
    )

    # Google Drive fields (v3, future-ready)
    _add_column(conn, ex, table, "google_drive_folder_id",
        f"ALTER TABLE {table} ADD COLUMN google_drive_folder_id VARCHAR(255) NULL"
    )
    _add_column(conn, ex, table, "google_drive_folder_url",
        f"ALTER TABLE {table} ADD COLUMN google_drive_folder_url VARCHAR(512) NULL"
    )
    _add_column(conn, ex, table, "google_drive_status",
        f"ALTER TABLE {table} ADD COLUMN google_drive_status VARCHAR(50) NULL DEFAULT 'pending'"
    )

    # Timestamp fields
    _add_column(conn, ex, table, "paid_at",
        f"ALTER TABLE {table} ADD COLUMN paid_at DATETIME NULL"
    )

    # ────────────────────────────────────────────────────────────────────────
    # Phase B — FIX nullability (MODIFY COLUMN only when currently NOT NULL)
    #
    # These five columns must be nullable because a registration starts without
    # a Razorpay order and is only linked to a payment after the student pays.
    # An older production schema may have them as NOT NULL, causing:
    #   IntegrityError: (1048, "Column '...' cannot be null")
    #
    # MODIFY COLUMN preserves the existing UNIQUE index on each column.
    # MySQL keeps indexes intact when the column name and type are unchanged.
    # ────────────────────────────────────────────────────────────────────────

    # Re-read info after Phase A in case columns were just added this run
    # (they are added as NULL so the fix would be a no-op, but it is cleaner
    # to re-inspect than to reason about ordering)
    info = _column_info(inspector, table)

    _fix_nullable(conn, info, table, "razorpay_order_id",
        f"ALTER TABLE {table} MODIFY COLUMN razorpay_order_id VARCHAR(80) NULL"
    )
    _fix_nullable(conn, info, table, "razorpay_payment_id",
        f"ALTER TABLE {table} MODIFY COLUMN razorpay_payment_id VARCHAR(80) NULL"
    )
    _fix_nullable(conn, info, table, "razorpay_signature",
        f"ALTER TABLE {table} MODIFY COLUMN razorpay_signature VARCHAR(128) NULL"
    )
    _fix_nullable(conn, info, table, "utr",
        f"ALTER TABLE {table} MODIFY COLUMN utr VARCHAR(100) NULL"
    )
    _fix_nullable(conn, info, table, "paid_at",
        f"ALTER TABLE {table} MODIFY COLUMN paid_at DATETIME NULL"
    )


def _migrate_agreement_acceptances(inspector, conn) -> None:
    """
    Reconcile agreement_acceptances against AgreementAcceptance model.

    This table is new (v2) — create_all() creates it on first boot.
    If for any reason create_all() did not create it, we log a warning.
    The migration does NOT create tables (only create_all does).

    Columns that may be absent from a partial earlier creation:
      - ip_address   VARCHAR(60) NULL
      - user_agent   TEXT NULL
      - updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    """
    table = "agreement_acceptances"
    ex = _existing_columns(inspector, table)

    _add_column(conn, ex, table, "ip_address",
        f"ALTER TABLE {table} ADD COLUMN ip_address VARCHAR(60) NULL"
    )
    _add_column(conn, ex, table, "user_agent",
        f"ALTER TABLE {table} ADD COLUMN user_agent TEXT NULL"
    )
    _add_column(conn, ex, table, "updated_at",
        f"ALTER TABLE {table} "
        f"ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP "
        f"ON UPDATE CURRENT_TIMESTAMP"
    )


def _migrate_internship_applications(inspector, conn) -> None:
    """
    Reconcile internship_applications against InternshipApplication model.

    Columns that may be absent:
      - resume_path  VARCHAR(500) NULL
      - status       VARCHAR(50) NULL DEFAULT 'pending'
    """
    table = "internship_applications"
    ex = _existing_columns(inspector, table)

    _add_column(conn, ex, table, "resume_path",
        f"ALTER TABLE {table} ADD COLUMN resume_path VARCHAR(500) NULL"
    )
    _add_column(conn, ex, table, "status",
        f"ALTER TABLE {table} ADD COLUMN status VARCHAR(50) NULL DEFAULT 'pending'"
    )


def _migrate_job_applications(inspector, conn) -> None:
    """
    Reconcile job_applications against JobApplication model.

    Columns that may be absent:
      - resume_path  VARCHAR(500) NULL
      - status       VARCHAR(50) NULL DEFAULT 'pending'
    """
    table = "job_applications"
    ex = _existing_columns(inspector, table)

    _add_column(conn, ex, table, "resume_path",
        f"ALTER TABLE {table} ADD COLUMN resume_path VARCHAR(500) NULL"
    )
    _add_column(conn, ex, table, "status",
        f"ALTER TABLE {table} ADD COLUMN status VARCHAR(50) NULL DEFAULT 'pending'"
    )


def _migrate_contact_messages(inspector, conn) -> None:
    """
    Reconcile contact_messages against ContactMessage model.

    Columns that may be absent:
      - status  VARCHAR(50) NULL DEFAULT 'new'
    """
    table = "contact_messages"
    ex = _existing_columns(inspector, table)

    _add_column(conn, ex, table, "status",
        f"ALTER TABLE {table} ADD COLUMN status VARCHAR(50) NULL DEFAULT 'new'"
    )


# ---------------------------------------------------------------------------
# Public entry-point
# ---------------------------------------------------------------------------

# Map each table name to its migration function.
# Tables that are fully handled by create_all() and have no post-deployment
# column additions are NOT listed here.
_TABLE_MIGRATIONS = {
    "course_registrations":    _migrate_course_registrations,
    "agreement_acceptances":   _migrate_agreement_acceptances,
    "internship_applications": _migrate_internship_applications,
    "job_applications":        _migrate_job_applications,
    "contact_messages":        _migrate_contact_messages,
}


def run_database_migrations() -> None:
    """
    Execute all pending schema migrations.

    Called from main.py at application startup, immediately after
    Base.metadata.create_all(bind=engine).

    Raises on any unexpected error so that Render logs capture a full
    traceback instead of silently swallowing the problem.
    """
    logger.info("=" * 60)
    logger.info("Migration: starting schema reconciliation")
    logger.info("=" * 60)

    try:
        inspector = inspect(engine)
        existing_tables = set(inspector.get_table_names())

        logger.info("Migration: tables present in DB: %s", sorted(existing_tables))

        with engine.begin() as conn:
            for table_name, migrate_fn in _TABLE_MIGRATIONS.items():
                if table_name not in existing_tables:
                    # Table doesn't exist yet — create_all() should have made it.
                    # Log a warning but do not fail; create_all runs before us
                    # so this should only happen in unusual environments.
                    logger.warning(
                        "Migration: table '%s' not found — "
                        "skipping column migrations (create_all should handle it).",
                        table_name,
                    )
                    continue

                logger.info("Migration: checking table '%s'", table_name)
                migrate_fn(inspector, conn)

        logger.info("=" * 60)
        logger.info("Migration: schema reconciliation complete")
        logger.info("=" * 60)

    except Exception as exc:
        logger.error(
            "Migration: FAILED — %s",
            exc,
            exc_info=True,
        )
        raise