# Salesmakrs — Product Roadmap

> This is the working plan used to build the app so far (phases 1–4). Kept in
> the repo so the reasoning behind the architecture — not just the resulting
> code — travels with the project. See [HANDOVER.md](HANDOVER.md) for current
> state, how to run things, and what's left.

## Context

Salesmakrs is a B2B distribution-management app: a **Distributor** sells products through a network of **Retailers**, worked by their own **Salespersons** (field reps). A first pass at the Distributor portal was already built (FastAPI + SQLAlchemy backend, React + Vite frontend) with signup/login and CRUD for Products, Retailers, and Salespersons — but it was scaffolded ad hoc, without planning for the rest of the app. Salespersons and Retailers were just *records* the distributor kept, not people who could log in themselves.

That first pass was **discarded**. This plan replaced it with a proper foundation designed up front for where the app is going: three portals (Distributor, Salesperson, Retailer) sharing one backend, built around **orders** as the core workflow — since taking and tracking orders is the actual point of a distribution business, and it's what makes the Salesperson and Retailer portals meaningful rather than read-only directories.

The roadmap is phased so each phase ships something usable and the next phase builds on proven ground rather than guessing ahead.

## Actors & Portals

| Actor | Portal | How they get an account |
|---|---|---|
| **Distributor** | Distributor Portal | Self-signup (email + password) |
| **Salesperson** | Salesperson App | Created *by* their distributor (distributor sets an initial email + password when adding them) |
| **Retailer** | Retailer Portal | Created *by* their distributor (same pattern) |

All three roles are tenants of a single distributor — a salesperson/retailer's JWT carries `role` + `distributor_id`, and every query is scoped to that distributor. One distributor's data is never visible to another's.

## Architecture decisions

- **One FastAPI backend** serves all three portals. Role lives in the JWT (`distributor` / `salesperson` / `retailer`); route dependencies enforce role + tenant scoping per endpoint.
- **One React + Vite frontend**, not three separate apps. After login, the app reads the role from the JWT and renders a role-specific dashboard shell (different nav, different pages) from shared building blocks (API client, auth context, form/table primitives). This avoids standing up and maintaining three separate deployable frontends before there's real need for that separation (e.g. white-labeling or separate domains) — that split is easy to do later if it becomes necessary, and is called out explicitly here since it's a judgment call, not a hard requirement from the request.
- **Orders are the spine of the data model.** Product/Retailer/Salesperson CRUD from phase 1 exists to support order-taking in phase 2+, so phase 1's data model includes the fields orders will need (e.g. login credentials on Retailer/Salesperson) rather than bolting them on later.

## Data model (target shape, built incrementally across phases)

- `Distributor` — company_name, email, hashed_password
- `Product` — distributor_id, name, sku, category, price, unit
- `Retailer` — distributor_id, name, contact info, **email + hashed_password** (nullable until phase 4 makes login required), address/city
- `Salesperson` — distributor_id, name, contact info, **email + hashed_password**, region
- `Order` (phase 2) — distributor_id, retailer_id, **placed_by_role** (`distributor`/`salesperson`/`retailer`), **placed_by_id** (id of whichever of those placed it — always captured, and surfaced in the UI as "Placed by: <name> (<role>)"), status, rejection_reason (nullable), created_at
- `OrderItem` (phase 2) — order_id, product_id, product_name (snapshot), quantity, unit_price (snapshot)

### Order status lifecycle (approval workflow)

Orders placed **by the distributor themselves** skip approval — they start `approved` (the distributor is the approver). Orders placed by a **salesperson or retailer** start `pending` and require distributor action:

```
pending ──approve──▶ approved ──fulfill──▶ fulfilled
   │                     │
   └──reject──▶ rejected │   (terminal, optional reason)
   │                     │
   └──────────cancel─────┘──▶ cancelled
```

- `approve` / `reject` / `fulfill`: distributor only. Reject accepts an optional `reason` shown back to whoever placed the order.
- `cancel`: the distributor can cancel any non-terminal order; a salesperson/retailer can cancel only their own order while it's still `pending`.

## Phased roadmap

### Phase 1 — Foundation: Distributor Portal ✅ done
- Distributor signup/login (JWT), bcrypt + JWT bearer tokens
- CRUD for Products, Retailers, Salespersons — Retailer and Salesperson carry email + password fields from day one (set by the distributor when creating them), even though login for those roles wasn't wired up until phases 3–4. This avoided a schema migration later.
- Distributor dashboard: Products / Retailers / Salespersons pages (table + add/edit modal)

### Phase 2 — Order Management (distributor-side) + approval engine ✅ done
- `Order` + `OrderItem` models; order endpoints support the full approval lifecycle from day one (so phases 3–4 didn't need backend rework)
- Distributor portal Orders page: create an order directly against a retailer (auto-approved), order list with color-coded status badges, order detail with line items and who placed it, Approve/Reject/Fulfill/Cancel actions per status

### Phase 3 — Salesperson App ✅ done
- Salesperson login (role-scoped JWT, own login page)
- Browses their distributor's retailer list and product catalog (read-only, scoped to their distributor), places an order on behalf of any retailer (`placed_by_role = salesperson` → starts `pending`), sees own order history with live status
- Salespersons can order for **any** retailer of their distributor (no territory/assignment mapping — deferred, see below)

### Phase 4 — Retailer Portal ✅ done
- Retailer login (role-scoped JWT, own login page)
- Browses the distributor's catalog, places own orders (`placed_by_role = retailer` → starts `pending`), sees order history/status (including orders a salesperson placed on their behalf)

### Phase 5 — Invoicing, payments, reporting — not started
- Generate an invoice from a fulfilled order
- Track payment status / outstanding dues per retailer
- Dashboards: sales by product / retailer / salesperson over time

This phase is directional only — it needs its own short planning pass before implementation, the same way phases 2–4 did once phase 1 was in use.

## Deferred decisions (intentionally not built yet)

- **Salesperson↔retailer assignment.** Salespersons can currently place orders for *any* retailer under their distributor. Territory/assignment mapping (restricting a salesperson to specific retailers) was explicitly deferred for simplicity. Revisit if a real user asks for it.
- **Separate frontend apps per portal.** All three portals live in one React app with role-based routing. Splitting into separate deployable frontends (e.g. for white-labeling or separate domains) is a later option, not a current need.

## Implementation notes (phases 2–4, as built)

**Backend**
- `backend/app/auth.py` — `Principal` (role, id, distributor_id) decoded from any of the three JWT shapes; `require_roles(*roles)` dependency factory for endpoints multiple roles can hit. `get_current_distributor` still used directly for distributor-only endpoints.
- `backend/app/routers/orders.py` — create/list/detail scoped by role; `/approve`, `/reject`, `/fulfill`, `/cancel` as separate PATCH endpoints enforcing the legal transitions.
- `backend/app/routers/products.py`, `retailers.py` — `GET` (list) endpoints relaxed to accept `salesperson`/`retailer` roles too (read-only); create/update/delete stay distributor-only.
- New login endpoints: `POST /api/auth/salesperson/login`, `GET /api/auth/salesperson/me`, and the retailer equivalents. No signup for these two roles — accounts only exist if a distributor set a password on that record.

**Frontend**
- `AuthContext` generalized to `{ role, profile }` + `distributorLogin` / `distributorSignup` / `salespersonLogin` / `retailerLogin`.
- `ProtectedRoute` takes a `role` prop; `constants/roles.js` maps role → login path / home path.
- `DashboardShell` is one shared shell component; `Layout.jsx`, `SalespersonLayout.jsx`, `RetailerLayout.jsx` are thin wrappers passing role-specific nav items.
- `OrderForm` (shared cart-builder), `OrderDetail`, `OrderStatusBadge` reused across all three portals' order UI.

## Verification approach

- Backend: exercised every endpoint with `curl` against the dockerized stack (`docker compose up -d`) — order create/approve/reject/fulfill/cancel for each role, and the 401/403/404s for out-of-scope access — before touching the frontend.
- Frontend: walked each role's real flow end-to-end in-browser: distributor creates + approves an order; salesperson logs in, places an order for a retailer, sees it pending, sees it flip to approved after the distributor acts; retailer logs in, places their own order, sees it rejected with a reason. Confirmed "placed by" is visible and correct in every case.
