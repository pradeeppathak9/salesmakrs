# Salesmakrs

Distributor portal — React + Vite frontend, FastAPI backend, Postgres database.

## Quickstart

```bash
# 1. Start Postgres (dockerized)
docker compose up -d db

# 2. Backend
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
cp .env.example .env
./venv/bin/uvicorn app.main:app --reload --port 8000

# 3. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173 · API docs: http://localhost:8000/docs

Alternatively, run the whole backend + db via Docker: `docker compose up -d` (frontend still runs locally with `npm run dev` for fast HMR).

## Design system

All colors, spacing, radii, and typography are defined once as CSS custom properties in [frontend/src/styles/theme.css](frontend/src/styles/theme.css). Components never hardcode a color — they use the classes in [components.css](frontend/src/styles/components.css) and [layout.css](frontend/src/styles/layout.css), which consume those tokens. To re-theme the app, edit `theme.css` only.

Reusable UI building blocks live in `frontend/src/components/ui/` (`Button`, `Modal`, `EmptyState`, `Badge`) and `frontend/src/components/icons.jsx` (inline SVG icons, no icon-library dependency).

## Distributor Portal (Phase 1)

- Distributor signup/login with email + password (JWT auth)
- Dashboard with:
  - **Products** — the products a distributor sells
  - **Retailers** — the retailers a distributor supplies
  - **Salespersons** — the distributor's sales team

Retailers and salespersons can optionally be given a portal password now (for phases 3–4, the Salesperson App and Retailer Portal); login for those roles isn't wired up yet.

All data is scoped per distributor account.
