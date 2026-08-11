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

### Prerequisite

Use **Node.js 22.13 or newer** with npm 10 or newer. The committed lockfiles use
`lockfileVersion: 3`, which the npm 6 bundled with Node.js 14 cannot install.
With `nvm`, select the repository's pinned version before installing:

```bash
nvm install
nvm use
node --version   # v22.13.0
npm --version    # 10.x or newer
```

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

If `npm ci` reports that it cannot find a usable lockfile while showing Node 14
or npm 6 in verbose output, it is a toolchain mismatch—not a missing lockfile.
Run `nvm install && nvm use`, remove any partially created `node_modules`
directory, and run `npm ci` again inside both `server/` and `client/`.

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

`server/src/models/` defines Mongoose schemas for catalogue content, users, sessions, account tokens, orders and product entitlements. `server/src/seed/` seeds catalogue content; users and transactional records are created by real application activity. Lessons, progress, assessments, achievements and certificates remain future learning-platform work; see "What's not built yet."

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

## Account foundation

CogniSprint now includes secure account registration, sign-in/out, opaque database-backed sessions in HttpOnly cookies, email verification, and password recovery. Passwords use Node's `scrypt`; raw session and account-action tokens are never stored in MongoDB. The account page lists product entitlements and links active learners to their protected dashboard.

## Learning foundation

Paid learners have a protected `/learn` dashboard backed by active product entitlements. Published lessons are seeded separately from curriculum marketing metadata, omit answer keys from learner-facing responses, accept server-scored submissions, and persist each learner's best score, attempt count and completion status. The initial Getting Started lessons establish the workflow; authoring and reviewing the full advertised curriculum remains content work rather than generated filler.

## What's not built yet

Consistent with the companion Next.js build's approach — say plainly what's missing rather than stub it out:

- The complete 365-day lesson library, detailed progress analytics, monthly assessments and certificates
- Gamification backend (streaks, XP, achievement unlocking)
- Admin panel
- Community/referrals

## Deployment notes

- `server/` and `client/` deploy independently (e.g. server on Render/Railway/Fly, client static build on Vercel/Netlify/S3+CloudFront). Set `CLIENT_URL` on the server for CORS and `VITE_API_URL` on the client to the deployed API origin.
- MongoDB: Atlas or any managed MongoDB-compatible host works; just set `MONGODB_URI`.
- Keep `.env` values as plain text (for example, `CLIENT_URL=http://localhost:5173`, not a Markdown link). An Atlas
  URI must contain the real database-user password rather than `<db_password>`; URL-encode special characters.
- `querySrv ECONNREFUSED` means the DNS resolver refused Atlas's SRV lookup. Try another DNS resolver or disable the
  VPN/firewall that blocks SRV records. For local development, start `docker compose up -d` and use
  `mongodb://127.0.0.1:27017/cognisprint`.
- Production container definitions are provided for the API and SPA. `/api/health` is the liveness probe and
  `/api/ready` is the readiness probe; the latter returns `503` until MongoDB is connected.
- Because this is a client-rendered SPA, true search-engine SEO is weaker than a server-rendered app (see `ARCHITECTURE.md` for the specific trade-off and what `react-helmet-async` does and doesn't cover).
