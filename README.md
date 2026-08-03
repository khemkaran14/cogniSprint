# CogniSprint (MERN)

A structured 365-day brain-training and cognitive skills practice program — mental math, memory, focus, logical reasoning, observation and critical thinking in a 15-minute daily routine.

This is the **MERN-stack** rebuild of CogniSprint: a React (Vite) single-page app talking to an Express + MongoDB REST API. It covers the same scope as the platform's Phase 1–2 (conversion-ready marketing site + the free interactive Brain Skills Challenge), plus a working Razorpay checkout with real order persistence in MongoDB — a step further than a marketing-only build, since the "M" in MERN calls for the database to actually be doing something.

A companion Next.js version of this same product exists in a sibling repository; this one is a from-scratch reimplementation on Express/MongoDB/React/Node, not a port of that app's code.

## Monorepo layout

```
server/   Express + MongoDB (Mongoose) REST API
client/   React 18 + Vite + TypeScript + Tailwind v4 SPA
docker-compose.yml   Local MongoDB for development
```

See `server/README.md`-equivalent notes below and `ARCHITECTURE.md` for how the two talk to each other.

## Tech stack

**Server**: Express, MongoDB/Mongoose, Zod validation, `express-rate-limit`, Razorpay REST integration (order creation, signature verification, webhook verification — all hand-rolled against Razorpay's documented HMAC scheme, no SDK).

**Client**: React 18, Vite, TypeScript, Tailwind CSS v4, React Router v7, TanStack Query (data fetching/caching/loading-error states), React Hook Form + Zod, Framer Motion (reduced-motion aware), Radix UI primitives, react-helmet-async (per-page SEO tags in a CSR app).

**Testing**: Vitest (unit, both server and client), Playwright (E2E, client — API responses mocked via route interception so tests don't require a live database).

## Local setup

```bash
# 1. Start MongoDB
docker compose up -d

# 2. Server
cd server
npm install
cp .env.example .env        # MONGODB_URI defaults to the docker-compose instance
npm run seed                 # populates product, price, coupon, curriculum, FAQ, blog
npm run dev                  # http://localhost:4000

# 3. Client (separate terminal)
cd client
npm install
npm run dev                  # http://localhost:5173, proxies /api to :4000
```

Nothing beyond MongoDB is required to see the full marketing site, curriculum, blog and free challenge working. Razorpay and Resend both degrade to an honest "not configured" state (see below) rather than failing or faking success.

## Environment variables

- `server/.env.example` — `MONGODB_URI`, `RAZORPAY_KEY_ID`/`SECRET`/`WEBHOOK_SECRET`, `RESEND_API_KEY`/`EMAIL_FROM`/`SUPPORT_EMAIL`, `CLIENT_URL` (for CORS), `PORT`.
- `client/.env.example` — `VITE_API_URL` (leave unset in dev; Vite proxies `/api` to the server), `VITE_APP_URL`.

## Commands

| Where | Command | Purpose |
| --- | --- | --- |
| `server/` | `npm run dev` | Start Express with hot reload (tsx) |
| `server/` | `npm run build` / `npm start` | Compile to `dist/` and run it |
| `server/` | `npm run seed` | Populate MongoDB with product/curriculum/FAQ/blog seed data |
| `server/` | `npm test` | Unit tests (pricing math, Razorpay signature verification, validation schemas) |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | Typecheck + production build |
| `client/` | `npm test` | Unit tests (challenge scoring logic) |
| `client/` | `npm run test:e2e` | Playwright E2E (mocks the API layer — no live MongoDB needed) |

## Database

`server/src/models/` defines Mongoose schemas for `Product`, `Price`, `Coupon`, `Order`, `Module` (curriculum), `FaqItem`, `BlogArticle`. `server/src/seed/` seeds all of them except orders (orders are created by real checkout attempts). This is deliberately a smaller entity set than a full learning-platform schema — users, entitlements, lessons, progress, assessments, achievements and certificates are Phase 4/5 work and not built here; see "What's not built yet."

## Razorpay integration

Unlike a marketing-only build, this one **persists real orders in MongoDB**:

1. Client submits customer details + optional coupon to `POST /api/checkout/create-order`.
2. Server re-derives the price from the `Price`/`Coupon` documents (never trusts a client-supplied amount), creates a `pending` `Order` document, then calls the real Razorpay Orders API.
3. If `RAZORPAY_KEY_ID`/`SECRET` aren't set, the route returns `501` and the UI shows an honest "payment isn't connected yet" state — never a fake success.
4. On payment, Razorpay Checkout's client callback POSTs to `/api/checkout/verify`, which recomputes the HMAC-SHA256 signature server-side and, if valid, marks the `Order` `paid`.
5. `/api/webhooks/razorpay` independently verifies `X-Razorpay-Signature` and updates the same `Order` on `payment.captured`/`payment.failed` — a second, server-to-server confirmation path independent of the client callback.

See `PAYMENT_SETUP.md` for the full setup and test-mode walkthrough.

## Testing

- **Server unit tests** (`server/tests/`): pricing/coupon math, Razorpay signature verification (including tampered-signature and missing-secret cases), Zod validation schemas. No database needed.
- **Client unit tests** (`client/tests/unit/`): the challenge scoring engine (`scoreSkill`, `buildChallengeResult`, `feedbackForScore`).
- **Client E2E tests** (`client/tests/e2e/`): homepage, the full 5-skill challenge flow end-to-end, checkout form validation and its honest "payment not configured" failure state, and legal/about/contact pages. API calls are intercepted with Playwright's `page.route()` against fixture data (`tests/e2e/mockApi.ts`), so these run without a live MongoDB — useful in CI or any environment (like the one this was built in) where a database isn't available.

## What's not built yet

Consistent with the companion Next.js build's approach — say plainly what's missing rather than stub it out:

- Authentication, user accounts, sessions
- The learner dashboard, lesson pages, progress tracking, monthly assessments, certificates
- Entitlement granting after payment (the `Order` model and payment verification are real and working; there's no `User`/`Entitlement` model yet to grant access to)
- Gamification backend (streaks, XP, achievement unlocking)
- Admin panel
- Community/referrals

## Deployment notes

- `server/` and `client/` deploy independently (e.g. server on Render/Railway/Fly, client static build on Vercel/Netlify/S3+CloudFront). Set `CLIENT_URL` on the server for CORS and `VITE_API_URL` on the client to the deployed API origin.
- MongoDB: Atlas or any managed MongoDB-compatible host works; just set `MONGODB_URI`.
- Because this is a client-rendered SPA, true search-engine SEO is weaker than a server-rendered app (see `ARCHITECTURE.md` for the specific trade-off and what `react-helmet-async` does and doesn't cover).
