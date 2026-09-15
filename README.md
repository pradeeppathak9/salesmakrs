# SalesMakrs

Distribution-management app — React + Vite frontend, FastAPI backend, Postgres database. Three portals share one backend: **Distributor**, **Salesperson**, and **Retailer**.

Picking this project up fresh (including as an AI agent)? Read [HANDOVER.md](HANDOVER.md) first — it covers current status, architecture, and gotchas. [PLAN.md](PLAN.md) has the fuller roadmap and reasoning behind the design decisions.

## Quickstart (dev)

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

`docker compose up -d db backend` also works if you don't want a local Python venv — the frontend still runs via `npm run dev` for fast HMR during development.

## Production

All three services are dockerized:

```bash
docker compose up -d --build
```

- `db` — Postgres
- `backend` — FastAPI, served by uvicorn
- `frontend` — Vite production build served by nginx, with SPA routing (`frontend/nginx.conf`) so client-side routes like `/orders` or `/sales/orders` work on a hard refresh

The frontend bakes `VITE_API_BASE_URL` in at build time (Vite env vars aren't runtime-configurable), so it needs a rebuild — not just a restart — to pick up either a code change or a different backend URL:

```bash
VITE_API_BASE_URL=https://api.example.com docker compose build frontend
docker compose up -d frontend
```

Set `SECRET_KEY` and `CORS_ORIGINS` via a `.env` file at the repo root before deploying for real; the defaults in `docker-compose.yml` are dev-only.

## Design system

All colors, spacing, radii, and typography are defined once as CSS custom properties in [frontend/src/styles/theme.css](frontend/src/styles/theme.css). Components never hardcode a color — they use the classes in [components.css](frontend/src/styles/components.css) and [layout.css](frontend/src/styles/layout.css), which consume those tokens. To re-theme the app, edit `theme.css` only.

The current theme: a warm-neutral dark ground (never pure black), teal as the only interface hue (primary actions, active nav, focus rings — never on data), radius 0 everywhere, and structure drawn with rules (2px for section/table-header seams, 1px hairlines between table rows) instead of card fills, borders, or shadows. Two type faces: **Archivo** (weight 800 for headings, 400 for body) for language, **IBM Plex Mono** for every figure — prices, quantities, dates, counts — always via the `.num` utility class (`font-variant-numeric: tabular-nums`) so columns of numbers align. Order status colors: `accent` (teal, approved), `up` (green, fulfilled), `down` (amber, rejected — no red anywhere in the app), `neutral`/`neutral-muted` (pending/cancelled).

Reusable UI building blocks live in `frontend/src/components/ui/` (`Button`, `Modal`, `EmptyState`, `Badge`) and `frontend/src/components/icons.jsx` (inline SVG icons, no icon-library dependency).

## Portals

- **Distributor** (`/login`, `/signup`) — self-signup. Manages Products, Retailers, Salespersons, and Orders (create, approve, reject, fulfill, cancel).
- **Salesperson** (`/sales/login`) — account created by the distributor. Places orders on behalf of any retailer; orders start `pending` until the distributor approves them.
- **Retailer** (`/retailer/login`) — account created by the distributor. Places their own orders; also sees orders a salesperson placed on their behalf.

Orders placed by the distributor auto-approve. Orders placed by a salesperson or retailer require distributor approval: `pending → approved → fulfilled`, or `pending → rejected` (with an optional reason), or `cancelled` (by the distributor at any non-terminal stage, or by the original placer while still `pending`).

All data is scoped per distributor account.
