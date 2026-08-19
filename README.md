# CogniSprint (MERN)

A structured 365-day brain-training and cognitive skills practice program — mental math, memory, focus, logical reasoning, observation and critical thinking in a 15-minute daily routine.

This is the **MERN-stack** rebuild of CogniSprint: a React (Vite) single-page app talking to an Express + MongoDB REST API. It includes a conversion-ready marketing site, the free interactive Brain Skills Challenge, account and entitlement foundations, Razorpay checkout with persisted orders, and the first protected learning workflow. It is not yet the complete advertised 365-day content library; see the implementation matrix and `PRODUCTION_READINESS.md` before treating it as launch-ready.

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
npm run seed                 # populates catalogue content and the initial published lessons
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

- `server/.env.example` — MongoDB, Razorpay, Resend, allowed client origins, cookie policy and server settings.
- `client/.env.example` — `VITE_API_URL` (leave unset in dev; Vite proxies `/api` to the server), `VITE_APP_URL`.

## Commands

| Where | Command | Purpose |
| --- | --- | --- |
| `server/` | `npm run dev` | Start Express with hot reload (tsx) |
| `server/` | `npm run build` / `npm start` | Compile to `dist/` and run it |
| `server/` | `npm run seed` | Populate catalogue content and initial published lessons |
| `server/` | `npm run migrate` | Apply pending production database migrations under a distributed lock |
| `server/` | `npm run migrate:status` | Report pending migrations without changing the database |
| `server/` | `npm run migrate:prod` | Apply migrations from a compiled production/container artifact |
| `server/` | `npm run reconcile` / `npm run reconcile:apply` | Inspect or repair stale payment/order and entitlement mismatches |
| `server/` | `npm run email:process` | Process up to 100 queued transactional emails with bounded retries |
| `server/` | `npm run alerts:scan` | Detect and deduplicate operational payment, webhook, email and entitlement alerts |
| `server/` | `npm run resource:import -- --file ...` | Validate and import a PDF resource as a draft for audited admin publication |
| `server/` | `npm run content:audit` | Report published content counts and fail if enrollment is open below launch targets |
| `server/` | `npm test` | Server unit and HTTP application tests (no live database required) |
| `server/` | `INTEGRATION_MONGODB_URI=mongodb://127.0.0.1:27017/cognisprint_integration npm run test:integration` | Destructive integration checks against a disposable MongoDB database |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | Typecheck + production build |
| `client/` | `npm test` | Unit tests (challenge scoring logic) |
| `client/` | `npm run test:e2e` | Playwright E2E (mocks the API layer — no live MongoDB needed) |

## Database

`server/src/models/` defines Mongoose schemas for catalogue content, users, sessions, account tokens, orders, entitlements, lessons, lesson progress, assessment attempts, persistent achievements, certificates and retained webhook events. `server/src/seed/` seeds catalogue content, three initial Getting Started lessons and one technical assessment baseline; users and transactional records are created by real application activity. The remaining eleven assessments still require qualified content review, while referrals and community features are not implemented.

## Razorpay integration

Unlike a marketing-only build, this one **persists real orders in MongoDB**:

1. Client submits customer details + optional coupon to `POST /api/checkout/create-order`.
2. Server re-derives the price from the `Price`/`Coupon` documents (never trusts a client-supplied amount), creates a `pending` `Order` document, then calls the real Razorpay Orders API.
3. If `RAZORPAY_KEY_ID`/`SECRET` aren't set, the route returns `501` and the UI shows an honest "payment isn't connected yet" state — never a fake success.
4. On payment, Razorpay Checkout's client callback POSTs to `/api/checkout/verify`, which recomputes the HMAC-SHA256 signature server-side and, if valid, marks the `Order` `paid`.
5. `/api/webhooks/razorpay` independently verifies `X-Razorpay-Signature`, deduplicates deliveries by Razorpay event ID, and updates the same `Order` on capture, failure or refund. Capture grants an entitlement; a full refund event revokes it.

See `PAYMENT_SETUP.md` for the full setup and test-mode walkthrough.

## Testing

- **Server unit tests** (`server/tests/`): pricing/coupon math, Razorpay signature verification (including tampered-signature and missing-secret cases), Zod validation schemas. No database needed.
- **Client unit tests** (`client/tests/unit/`): the challenge scoring engine (`scoreSkill`, `buildChallengeResult`, `feedbackForScore`).
- **Client E2E tests** (`client/tests/e2e/`): homepage, the full 5-skill challenge flow end-to-end, checkout form validation and its honest "payment not configured" failure state, and legal/about/contact pages. API calls are intercepted with Playwright's `page.route()` against fixture data (`tests/e2e/mockApi.ts`), so these run without a live MongoDB — useful in CI or any environment (like the one this was built in) where a database isn't available.

## Account foundation

CogniSprint now includes secure account registration, sign-in/out, opaque database-backed sessions in HttpOnly cookies, email verification, and password recovery. Passwords use Node's `scrypt`; raw session and account-action tokens are never stored in MongoDB. The account page lists product entitlements and links active learners to their protected dashboard.

## Current implementation matrix

| Area | Status | What that means |
| --- | --- | --- |
| Marketing, curriculum catalogue, blog, legal and free challenge | Implemented | Public pages and API-backed catalogue content exist. |
| Accounts and sessions | Foundation implemented | Registration, login/logout, verification, reset, profile preferences and secure owner-scoped device/session revocation exist; data-rights export/deletion workflows remain. |
| Checkout and entitlements | Foundation implemented | Server-priced Razorpay orders, signed callback/webhook verification, persisted orders, grant/revoke behavior, owner history, printable receipts, audited refunds, and dispute/chargeback handling exist; production reconciliation and legally reviewed tax invoices remain. |
| Protected learning | Foundation implemented | Active entitlements gate lessons and versioned workbook/worksheet downloads; sequential prerequisites, daily unlocks, resumable drafts, idempotent submissions and completion are implemented for three lessons. The remaining 362 sessions and reviewed resource files are not present. |
| Progress and gamification | Foundation implemented | Overall, per-skill, per-module and daily activity analytics, CSV export, completion, attempts, recorded duration, best score, computed XP, timezone-aware streak and four badge rules exist. Earned badges are persisted idempotently with their original award date and included in learner data exports. |
| Certificates | Foundation | Eligibility/status, claim, print/save-PDF UI, queued email delivery, signed provider outcome tracking, public verification and audited admin revocation exist. Eligibility deliberately requires at least 365 published and completed lessons. |
| Monthly assessments | Foundation | Entitlement-gated attempts, server scoring, skill results and one technical baseline exist; eleven qualified and reviewed assessment banks remain. |
| Admin/support | Foundation | Operational metrics, learner support, paid-order-backed access repair, validated lesson/assessment drafting, safe preview, immutable revisions, scoped permissions and auditable release exist. Qualified content creation/review remains human work. |
| Community and referrals | Not implemented | No routes, models or UI exist for these product areas. |
| Deployment operations | Foundation | CI, containers, Render staging blueprint, migrations, workers, smoke checks and MongoDB integration tests exist. Owner-provisioned staging, monitoring and recovery validation remain. |

## Learning foundation

Paid learners have a protected `/learn` dashboard backed by active product entitlements. Published lessons are stored separately from curriculum marketing metadata, learner-facing responses omit answer keys, submissions are scored server-side, and best score, attempt count and completion status are persisted. XP and streak are derived from progress records rather than trusted client state; earned badges are derived server-side and recorded idempotently with their first award date.

Only three initial Getting Started lessons are seeded. They prove the workflow; they do **not** constitute the complete 365-day product. Content claims must remain limited to reviewed, published material until all remaining lessons and assessments are delivered.

The protected resource delivery foundation stores versioned PDFs in GridFS, checks product-specific entitlements and audits downloads. See `RESOURCE_DELIVERY.md`. No advertised workbook is bundled by default; an owner must import, review and publish the real approved files before making that claim.

Public lesson and assessment totals are loaded from `/api/content-availability`; the operator and staging checks are documented in `CONTENT_AVAILABILITY.md`. Roadmap module totals remain plans and are deliberately separated from published inventory.

## Administrator access

There is no shared default administrator password. Register and verify the owner account normally, then promote that exact account from a trusted server shell:

```bash
cd server
npm run admin:promote -- owner@example.com
```

Sign in through the normal `/login` page with that account and open `/admin` (the header also displays an **Admin** link). Never expose the promotion command through a public HTTP route. Admin APIs re-check the server-side role; the client redirect is convenience, not authorization.

Learners can download their account, commerce and learning data or open/cancel a deletion request from `/account`. Administrators process those requests at `/admin/privacy-requests`; every status change requires a note and is written to the audit ledger. Completing a request records the reviewed operational outcome—it does not automatically erase transaction records that may be subject to legal retention requirements.

## What remains

- Author and independently review the remaining 362 daily sessions, associated media and twelve assessments.
- Complete the qualified assessment bank and production-validate certificate delivery. Audited retry/revocation, progression, daily scheduling, resumable drafts, detailed analytics and learner-facing certificate delivery now exist.
- Validate dispute operations with the production Razorpay account, complete production reconciliation, obtain legally reviewed tax invoices, and validate reliable transactional email delivery.
- Expand the admin foundation with full content authoring; scoped permissions, learner support, paid-order-backed access repair, content release, orders/refunds, privacy handling and audit history now exist. Add referrals and—only with moderation operations—community functionality.
- Add provider-specific deployment, centralized monitoring, backup/restore validation and real database/full-stack tests. A versioned, locked migration runner is available via `npm run migrate`.
- Complete the owner-controlled launch gates in `PRODUCTION_READINESS.md`: secret rotation, Razorpay KYC/live setup, Atlas/DNS/email setup, legal/security/accessibility review and educational approval.

## Consolidating cumulative pull requests

When several milestone branches overlap, consolidate them into the newest cumulative pull request rather than merging each branch independently. The conflict-resolution procedure and automated guard are documented in [`CONSOLIDATION.md`](CONSOLIDATION.md); run `npm run verify:consolidation` from `server/` before pushing the resolved branch.

## Deployment notes

The repository includes a Render staging blueprint and ordered operator procedure in `DEPLOYMENT.md`. The blueprint keeps automatic deploys disabled, executes database migrations before API promotion, and references dashboard-managed values rather than embedding credentials.

Paid enrollment fails closed. Seeded products are drafts, public product APIs return no offers, and order creation returns `503` unless `ENROLLMENT_OPEN=true` is deliberately configured after reviewed content and external launch gates are approved. The public curriculum is labelled as a roadmap; only three foundation lessons and one technical assessment baseline are currently represented as published.

- `server/` and `client/` deploy independently (e.g. server on Render/Railway/Fly, client static build on Vercel/Netlify/S3+CloudFront). Set `CLIENT_URL` on the server for CORS and `VITE_API_URL` on the client to the deployed API origin.
- MongoDB: Atlas or any managed MongoDB-compatible host works; just set `MONGODB_URI`.
- Keep `.env` values as plain text (for example, `CLIENT_URL=http://localhost:5173`, not a Markdown link). An Atlas
  URI must contain the real database-user password rather than `<db_password>`; URL-encode special characters.
- `querySrv ECONNREFUSED` means the DNS resolver refused Atlas's SRV lookup. Try another DNS resolver or disable the
  VPN/firewall that blocks SRV records. For local development, start `docker compose up -d` and use
  `mongodb://127.0.0.1:27017/cognisprint`.
- Production container definitions are provided for the API and SPA. `/api/health` is the liveness probe and
  `/api/ready` is the readiness probe; the latter returns `503` until MongoDB is connected.
- Pull requests build both production images after linting their Dockerfiles. Trivy scans OS packages, application dependencies, secrets and image misconfiguration; unresolved HIGH or CRITICAL findings fail the container-security workflow.
- Configure the `STAGING_API_URL` and `STAGING_APP_URL` repository variables to run `staging-smoke.yml` after a successful `staging` deployment or on demand. The same checks are available locally with `API_URL=https://api.example.com APP_URL=https://app.example.com npm run smoke:deployment` from `server/`.
- CI starts a real MongoDB 7 service and runs `npm run test:integration` to exercise persisted sessions, entitlement-protected learning, payment capture, and duplicate webhook delivery. Locally, point `INTEGRATION_MONGODB_URI` at a disposable database; the suite deletes all records in that database.
- API request, lifecycle and uncaught error events are emitted as redacted structured JSON. Set `LOG_DRAIN_URL` (HTTPS in production) and optional `LOG_DRAIN_TOKEN`, `LOG_SERVICE` and `LOG_ENVIRONMENT` values to forward the same events to a centralized collector; log delivery is bounded and never delays an HTTP response.
- Because this is a client-rendered SPA, true search-engine SEO is weaker than a server-rendered app (see `ARCHITECTURE.md` for the specific trade-off and what `react-helmet-async` does and doesn't cover).
- Deployment artifacts are a foundation, not evidence of a live production environment. Use the acceptance gates in `PRODUCTION_READINESS.md`.
