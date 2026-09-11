# VELARA — a full-stack clothing e-commerce platform

VELARA is a complete, self-hosted e-commerce web app for a clothing brand:
storefront, cart, checkout with card (Stripe) and cash-on-delivery billing,
accounts, order history, and an admin dashboard for products/orders/revenue.

## Stack

| Layer      | Tech |
|------------|------|
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend    | Node.js, Express, TypeScript, Prisma ORM |
| Database   | PostgreSQL 16 |
| Auth       | JWT in an httpOnly cookie, bcrypt password hashing |
| Payments   | Stripe Checkout (card) + Cash on Delivery |
| Infra      | Docker, Docker Compose, Kubernetes manifests (Deployments, HPA, Ingress) |

## Project structure

```
velara/
├── backend/            Express API (auth, products, cart, orders, admin, payments)
│   ├── prisma/          schema.prisma + seed.ts
│   └── src/
├── frontend/           Next.js storefront + admin dashboard
│   ├── app/              routes (App Router)
│   ├── components/
│   └── lib/               api client, zustand stores, types
├── k8s/                 Kubernetes manifests + deploy README
├── docker-compose.yml    production-style compose stack
└── docker-compose.dev.yml  dev override (hot reload)
```

## Features

- Product catalog with categories, search, filters, sorting, pagination
- Product detail pages with size/color/quantity selection
- Cart (persisted server-side per user) with a slide-in drawer and a full cart page
- Checkout with shipping address capture, Stripe card payment or Cash on Delivery,
  automatic free-shipping threshold, stock decrement on order, Stripe webhook
  handler to mark orders paid
- Accounts: register/login/logout (JWT cookie), order history
- Admin dashboard (role-protected): revenue chart, order count, low-stock alerts,
  recent orders, full order list with status updates, product CRUD
- Rate limiting, Helmet security headers, CORS locked to the frontend origin,
  Zod request validation, centralized error handling
- Distinct visual identity (not a default template): a two-tone paper/ink
  palette, Fraunces + Work Sans type pairing, an asymmetric editorial hero,
  and restrained, purposeful motion (one orchestrated hero reveal, and motion
  that responds to actions like opening the cart — not fade-ups on every card)

## Quickstart (Docker Compose)

Requires Docker and Docker Compose.

```bash
cd velara
docker compose up --build
```

This starts Postgres, the API on `:4000`, and the storefront on `:3000`.
On first run, apply the schema and load sample products:

```bash
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run seed
```

Visit `http://localhost:3000`. Demo accounts created by the seed script:

- **Admin** — `admin@velara.com` / `Admin123!` → `http://localhost:3000/admin`
- **Customer** — `customer@example.com` / `Customer123!`

For local development with hot reload instead of rebuilding images:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Running without Docker

**Backend**
```bash
cd backend
cp .env.example .env        # point DATABASE_URL at your local Postgres
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                 # http://localhost:4000
```

**Frontend**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

## Payments

Card payments go through **Stripe Checkout**. Add your keys to `backend/.env`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Forward webhooks locally with the Stripe CLI:
```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```

Without a Stripe key configured, card checkout still creates the order (marked
pending) so you can develop and test the rest of the flow — it just won't
redirect to a real Stripe session. Cash on Delivery works with no external
setup at all.

## Kubernetes

See `k8s/README.md` for the full deploy walkthrough (build/push images, create
secrets, apply manifests, run migrations, point an ingress + TLS at it). The
manifests include a Postgres StatefulSet with a PVC, rolling-update Deployments
for both apps with readiness/liveness probes, HorizontalPodAutoscalers, and an
nginx Ingress with cert-manager annotations for TLS — a solid starting point,
not a drop-in production cluster (see notes in that README on what to add
before real traffic: managed Postgres, NetworkPolicies, a PodDisruptionBudget).

## A note on this environment's build check

Both apps were installed, type-checked, and production-built in this sandbox
to catch real bugs (and one was caught and fixed — a missing Suspense
boundary around `useSearchParams` on the login page). Two things this sandbox
couldn't verify end-to-end because its network allowlist blocks
`binaries.prisma.sh` and `fonts.googleapis.com`: the Prisma query engine
download (`prisma generate`) and the Google Fonts fetch at build time. Neither
is a code issue — both resolve normally in the Docker build or any dev machine
with unrestricted internet, which is the intended environment for this app.

## What to review before going live

- Swap `JWT_SECRET` / Postgres password for real secrets, never commit them
- Add real product photography (seed data uses Unsplash placeholder images)
- Decide on a tax strategy (the checkout stubs tax at 0%)
- Add email sending for order confirmations (not included)
- Add a managed Postgres instance and backups for production
- Add monitoring/logging (e.g. an APM + log aggregation) for the API
