# Handover

For a Claude agent (or anyone) picking this project up fresh. Read this before [PLAN.md](PLAN.md) — this tells you where things stand *now*; PLAN.md is the historical reasoning behind how it got there.

## What this is

Salesmakrs: a B2B distribution-management app. A **Distributor** sells products through **Retailers**, worked by the distributor's own **Salespersons**. Three portals, one backend, one frontend. Orders are the core workflow — salespersons and retailers place orders, the distributor approves/rejects/fulfills them.

Repo: `git@github.com:pradeeppathak9/salesmakrs.git`, branch `main`.

## Current status: phases 1–4 done, phase 5 not started

Everything below is built, working, and was verified end-to-end (curl for the API, in-browser for every role's full flow) before being committed:

- Distributor signup/login, CRUD for Products/Retailers/Salespersons
- Order placement + the full approval lifecycle (`pending → approved/rejected → fulfilled`, or `cancelled`) — see PLAN.md's state diagram
- Salesperson App and Retailer Portal, both logging into the same app via role-scoped JWTs
- Dark-mode dashboard UI on a token-based design system (`frontend/src/styles/theme.css`) — re-theme by editing that file only
- Frontend and backend both dockerized (`docker-compose.yml`: `db`, `backend`, `frontend` services)

**Not built**: Phase 5 (invoicing, payments, reporting/dashboards) — see PLAN.md's "Phase 5" section, which is intentionally left directional rather than detailed. If asked to build it, do a short planning pass first (the same way phases 2–4 got one) rather than assuming the shape.

**Deferred by design, not forgotten**: salesperson↔retailer territory assignment (salespersons can currently order for any retailer of their distributor), and splitting the frontend into separate per-portal apps. Both are noted in PLAN.md's "Deferred decisions" section — don't be surprised these are missing, and don't build them speculatively.

## How to run it

```bash
# Full stack, dockerized
docker compose up -d --build

# Or dev mode (faster frontend iteration via Vite HMR):
docker compose up -d db backend   # or run backend locally, see below
cd frontend && npm install && cp .env.example .env && npm run dev
```

Local (non-docker) backend dev loop:
```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
cp .env.example .env
./venv/bin/uvicorn app.main:app --reload --port 8000
```

App: http://localhost:5173 · API docs: http://localhost:8000/docs

No seed data — the database starts empty. Sign up as a distributor at `/signup`, then create products/retailers/salespersons from the dashboard (retailers/salespersons need a password set to get portal logins at `/retailer/login` / `/sales/login`).

## Architecture at a glance

- **Backend**: FastAPI + SQLAlchemy + Postgres. One JWT auth scheme for all three roles — `backend/app/auth.py` has `Principal` (role/id/distributor_id decoded from the token) and `require_roles(*roles)`, a dependency factory used wherever more than one role can hit an endpoint. `get_current_distributor` is still used directly for distributor-only endpoints (unchanged from phase 1).
- **Frontend**: one React app. `AuthContext` holds `{ role, profile }`; `ProtectedRoute` takes a `role` prop; `constants/roles.js` maps role → login/home paths. Each portal has a thin layout wrapper (`Layout.jsx` / `SalespersonLayout.jsx` / `RetailerLayout.jsx`) around a shared `DashboardShell`.
- **Orders**: `OrderForm` (cart-builder), `OrderDetail`, `OrderStatusBadge` are shared components reused by all three portals' order UI — don't fork them per-portal, extend with props instead (see how `OrderForm`'s `retailers` prop is optional to toggle the retailer picker).

## File map

```
backend/app/
  auth.py            JWT issuing/decoding, Principal, require_roles, get_current_distributor
  models.py          SQLAlchemy models (Distributor, Product, Retailer, Salesperson, Order, OrderItem)
  schemas.py         Pydantic request/response schemas
  routers/
    auth.py          signup/login for all three roles + /me endpoints
    products.py      CRUD (list relaxed to all 3 roles, mutations distributor-only)
    retailers.py      "     (list relaxed to distributor+salesperson)
    salespersons.py   "     (distributor-only throughout)
    orders.py        create/list/detail + approve/reject/fulfill/cancel

frontend/src/
  context/AuthContext.jsx        role-aware session state + login/signup functions
  components/ProtectedRoute.jsx  role-gated route wrapper
  components/DashboardShell.jsx  shared sidebar shell; Layout/SalespersonLayout/RetailerLayout wrap it
  components/OrderForm.jsx       shared order cart-builder
  components/OrderDetail.jsx     shared order detail view
  components/ui/                 Button, Modal, EmptyState, Badge — generic primitives
  components/icons.jsx           inline SVG icons, no icon library
  styles/theme.css                design tokens — edit this file to re-theme
  pages/                          distributor pages (flat) + pages/salesperson/, pages/retailer/
```

## Things that bit us while building this — worth knowing

- **Vite version**: `npm create vite@latest` on this machine pulled in a Vite 8 beta (rolldown-vite) that needs Node ≥22.12; the host had 22.6. `frontend/package.json` is pinned to Vite 5 + `@vitejs/plugin-react` 4 deliberately — don't let a `npm install`/upgrade drift back to the beta without checking the Node version first.
- **VITE_API_BASE_URL is baked in at build time.** The frontend Docker image needs a rebuild (`docker compose build frontend`), not just a restart, after changing the backend URL or any frontend code.
- **CORS**: `backend/.env`'s `CORS_ORIGINS` must include whatever origin the frontend is actually served from. If a dev preview tool assigns a random port (because 5173 was taken by something else), update `CORS_ORIGINS` and restart the backend.
- **Docker Desktop** isn't always running by default on this machine — `docker compose` fails with a socket-connect error until it's started (`open -a Docker`, then wait for `docker info` to succeed).
- **Icon sizing**: `components/icons.jsx`'s shared `base` props object defaults every icon to 18×18; pass explicit `width`/`height` props to override per-use (e.g. 16px inside buttons). Forgetting this once produced a giant unstyled logout icon — if an icon looks huge, check it's not missing this.

## Verification expectations

Don't skip this when extending the app: exercise new backend endpoints with `curl` against the dockerized stack first, then walk the real flow in-browser (this repo's history has examples — full role-by-role order lifecycle tests via `curl`, then the same flows clicked through in the browser). Clean up any test data created against the dev database afterward (`docker compose exec db psql -U salesmakrs -d salesmakrs -c "TRUNCATE ... RESTART IDENTITY CASCADE;"`).
