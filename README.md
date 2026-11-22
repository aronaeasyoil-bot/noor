# NOOR Travel & Tours

**Your World, Your Journey.** International travel and online booking platform of NOOR Travel & Tours (EASYOIL FZE), headquartered in Dubai.

Languages: English, Français, العربية (RTL). Display currencies: AED (billing), USD, EUR, XOF, GBP.

## Stack

- Next.js 16 (App Router, React 19, strict TypeScript), Tailwind CSS 4
- PostgreSQL + Drizzle ORM, Zod validation
- Cloudflare Workers via OpenNext, R2 for private documents, optional Hyperdrive
- Stripe Checkout (hosted page, signed webhooks) behind a provider interface
- Vitest (unit) and Playwright (end-to-end)

## What is real and what waits for a supplier

| Area | Status |
|---|---|
| Accounts (register, sign-in, reset, profile, travellers, favourites, notifications) | working |
| Desert safaris, activities, transfers, cars | bookable: price and dates set by NOOR in admin; "price on request" until then |
| Packages and other services | quote requests stored and handled in admin |
| Flights | search validated; live fares need Amadeus credentials (adapter included). Without them the search is sent to an adviser |
| Hotels | areas and requests; live inventory needs a hotel supplier contract |
| Visa assistance | applications with private document upload and status tracking |
| Payments | Stripe Checkout once keys are set; never stores card numbers |
| Admin | 16 back-office screens with server-side roles |

No fictitious price, review, ticket or availability is ever shown.

## Develop

```bash
npm ci
cp .env.example .env.local   # fill DATABASE_URL at least
npm run db:migrate && npm run db:seed
npm run dev
```

Tests:

```bash
npm run typecheck
TEST_DATABASE_URL=postgres://… npm test
npm run build && npm start &   # then
npm run test:e2e
```

Deployment: see [DEPLOYMENT.md](DEPLOYMENT.md).

## Brand and photos

- Logo: official NOOR Travel & Tours logo (`public/brand/noor-logo-official.jpg`), used unmodified.
- Photos: Unsplash License, registered with their source in `src/lib/media.ts`; the public credits page is `/en/legal/credits`.
