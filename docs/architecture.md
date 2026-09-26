# AxelPath Architecture

## Overview

AxelPath is a three-application platform:

- `frontend/` — public React and Vite website
- `backend/` — FastAPI REST API and SQLAlchemy database layer
- `admin/` — protected React and Vite administration dashboard

## Application Flow

```text
Public Website / Admin Dashboard
              |
              | HTTPS REST API
              v
        FastAPI Backend
              |
              | SQLAlchemy ORM
              v
         PostgreSQL Database