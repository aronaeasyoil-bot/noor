# Deploying NOOR on Cloudflare Workers

NOOR is a Next.js 16 application deployed to Cloudflare Workers with the OpenNext adapter (`@opennextjs/cloudflare`).

## 1. Prerequisites

| Item | Why | Status to check |
|---|---|---|
| PostgreSQL database (e.g. Neon, region close to Dubai/EU) | accounts, bookings, quotes, visas, prices | required |
| Cloudflare account with Workers | hosting | required |
| R2 buckets `noor-documents` and `noor-documents-preview` | private visa documents | required for visa uploads |
| Hyperdrive config pointing to the database | pooled, low-latency DB access | recommended |
| Stripe account (UAE entity) + webhook | online payment | optional until launch |
| Resend account + verified domain | emails | recommended |
| Amadeus credentials | live flight search | optional (searches go to advisers meanwhile) |

## 2. Database

```bash
DATABASE_URL=postgres://… npm run db:migrate
DATABASE_URL=postgres://… SEED_ADMIN_EMAIL=you@company SEED_ADMIN_PASSWORD='long-unique-password' npm run db:seed
```

The seed creates one row per catalogue item **without any price** (shown as "price on request"), the first super admin, and a starter knowledge base for the assistant. Prices, slots and promotions are then set in `/admin`.

## 3. Cloudflare resources

```bash
npx wrangler r2 bucket create noor-documents
npx wrangler r2 bucket create noor-documents-preview
# Optional but recommended:
npx wrangler hyperdrive create noor-db --connection-string="postgres://…"
# then uncomment the "hyperdrive" block in wrangler.jsonc with the returned id
```

## 4. Secrets (never in Git)

```bash
npx wrangler secret put DATABASE_URL --env preview
npx wrangler secret put STRIPE_SECRET_KEY --env preview
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env preview
npx wrangler secret put RESEND_API_KEY --env preview
npx wrangler secret put CRON_SECRET --env preview
```

Non-secret variables (`EMAIL_FROM`, `OPS_EMAIL`, `NEXT_PUBLIC_SITE_URL`) go in `wrangler.jsonc` `vars`.

## 5. Build and deploy

```bash
npm ci
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy -- --env preview   # pre-production
npx opennextjs-cloudflare deploy                    # production, only after validation
```

Or connect the GitHub repository in **Workers & Pages → Create → Import a repository** (Workers Builds) with build command `npx opennextjs-cloudflare build` and deploy command `npx opennextjs-cloudflare deploy`.

## 6. Payments webhook

In Stripe, add an endpoint `https://<domain>/api/payments/stripe/webhook` with events:
`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.
A booking is marked paid **only** by this signed webhook, never by the browser redirect.

## 7. Exchange rates

Call `POST /api/cron/rates` with `Authorization: Bearer $CRON_SECRET` once a day (Cloudflare Cron Trigger on a tiny scheduler Worker, or any external scheduler), or use **Admin → Settings → Refresh now**.

## 8. Checks after each deploy

```bash
E2E_BASE_URL=https://<preview-url> npx playwright test --trace off
```

## Workers Builds (Git-connected deployment)

The Worker `noor-travel` is connected to this repository in the Cloudflare dashboard:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Builds for non-production branches | on (each branch gets a preview URL) |
| Build command | `npm run cf:build` (runs `scripts/cf-build.mjs`) |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Version command (previews) | `npx opennextjs-cloudflare upload` |

Build variables (Settings → Builds → Variables and secrets), set by the account owner, never committed:

- `DATABASE_URL`: when present, the build applies migrations and the idempotent seed before building.
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`: optional, creates the first super admin once.

Runtime secrets (Settings → Variables and secrets): `DATABASE_URL` again (the Worker reads it at runtime), plus
Stripe, Resend and Amadeus keys when available.

R2 is not yet enabled on the account; the `DOCUMENTS` binding stays commented out in `wrangler.jsonc` until it is.
