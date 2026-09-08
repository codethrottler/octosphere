# OctoSphere

Enterprise Employee Workplace & Operations Platform — HRMS + Workforce
Management + Task Management + Internal Service Desk + Analytics, under
one shell.

Monorepo: Django + DRF + MySQL in `backend/`, React (Vite) + Tailwind in
`frontend/`. This is an early build — the application shell and one
module page (HRMS Overview) exist; every other module is a "coming soon"
placeholder. Read `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, and
`docs/MODULE_PLAN.md` before adding to it.

## Prerequisites

- Python 3.11+
- Node 20+
- MySQL 8 running locally (or reachable) with a database + user created
  for this app

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create the database + user once, e.g.:
#   mysql -u root -e "
#     CREATE DATABASE octosphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
#     CREATE USER 'octosphere'@'localhost' IDENTIFIED BY 'octosphere_dev_pw';
#     GRANT ALL PRIVILEGES ON octosphere.* TO 'octosphere'@'localhost';
#     GRANT ALL PRIVILEGES ON test_octosphere.* TO 'octosphere'@'localhost';  -- needed to run tests
#   "

cp .env.example .env   # adjust DB_* if your credentials differ
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver 127.0.0.1:8000
```

Verify it's up: `curl http://127.0.0.1:8000/api/core/health/` should
return `{"status": "ok", ..., "database": {"connected": true, ...}}`.

Run the backend test suite: `python manage.py test`.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # only needed if the backend isn't on localhost:8000
npm run dev
```

Open `http://localhost:5173` — it redirects to `/hrms/overview`. The
sidebar's bottom-left dot shows whether it reached the backend's health
endpoint ("API connected" / "API offline").

Other frontend scripts:

```bash
npm run build   # tsc -b && vite build
npm run lint    # oxlint
npm run preview # preview a production build
```

Run both `runserver` and `npm run dev` at once (two terminals) for the
full app; the frontend's CORS config (`backend/.env`'s
`CORS_ALLOWED_ORIGINS`) already allows `http://localhost:5173`.
