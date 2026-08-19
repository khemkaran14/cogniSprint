# Architecture

## System overview

Two independent applications, talking over a plain REST API:

```
Browser
  │
  ├── React SPA (client/) — Vite dev server proxies /api/* to :4000 in dev;
  │     in production the client is a static build served from any host,
  │     pointed at the API origin via VITE_API_URL.
  │
  └── Express API (server/, :4000)
        ├── /api/products, /api/curriculum, /api/faq, /api/blog[/:slug]  → MongoDB reads
        ├── /api/newsletter, /api/contact, /api/challenge/report        → Resend (optional) or console log
        ├── /api/checkout/create-order, /api/checkout/verify,
        │   /api/checkout/coupon/:code, /api/checkout/order/:id          → MongoDB + Razorpay
        ├── /api/auth/*, /api/entitlements                              → MongoDB accounts + access
        ├── /api/learning/*, /api/assessments/*, /api/certificates/*     → MongoDB learning records
        ├── /api/resources/*                                             → entitlement checks + GridFS PDFs
        ├── /api/admin/*                                                  → role-gated operations + audit records
        └── /api/webhooks/razorpay                                      → signed, deduplicated provider events
```

There is no server-side rendering. Every page is a client-rendered React component; `react-helmet-async` sets `<title>`/meta tags per route for whatever SEO benefit a crawler that executes JavaScript can get from that (see "SEO trade-off" below — this is the one place where the Next.js sibling repo is architecturally stronger).

## Directory structure

```
server/
  src/
    models/       Catalogue, accounts, orders, entitlements, learning records, certificates, audit/webhook events
    routes/       Public APIs plus auth, checkout, learning and role-gated administration
    lib/          Database, auth/security, Razorpay, email, pricing, validation and gamification helpers
    middleware/   Authentication, entitlement, rate-limit and request-context middleware
    seed/         data.ts (source content) + run.ts (upserts everything into MongoDB)
    migrations/   Immutable ordered migrations, distributed lease lock and CLI runner
    app.ts        Testable Express construction, middleware ordering and route mounting
    index.ts      Environment validation, database startup, listening and graceful shutdown
  tests/          Vitest — pure logic, schemas and HTTP guards; no DB required
  integration/    Vitest — real MongoDB-backed account, entitlement, learning and webhook replay checks

client/
  src/
    pages/                route-level components (one per URL)
    components/
      ui/                 design-system primitives (Button, Card, Accordion, Form, Alert…)
      marketing/            homepage sections, header/footer, forms, pricing card
      course/                curriculum browser/accordion/card
      challenge/             the 5-skill interactive challenge
      checkout/              checkout form, order summary, payment status
      shared/                Reveal (scroll animation), ThemeToggle, Seo, QueryStates (loading/error/empty)
    lib/                  api.ts (fetch wrapper), queries.ts (TanStack Query hooks), challengeScoring.ts,
                           loadRazorpayScript.ts, utils.ts
    config/                brand.ts, navigation.ts, seo.ts — static brand/copy, not DB-backed
    content/                challengeQuestions.ts — the free challenge's fixed question bank
    types/                  content.ts, challenge.ts
  tests/
    unit/                 Vitest — challenge scoring logic
    e2e/                   Playwright — mocks /api/* via page.route(), no live MongoDB needed
```

## What's static config vs. what's in MongoDB

Deliberate split, not an oversight:

- **In MongoDB** (`server/src/models/`): catalogue content, users, hashed sessions/account tokens with device activity metadata, orders, entitlements, lessons, lesson progress, certificates, versioned GridFS learning resources, download audit records and retained webhook-event state.
- Owner-scoped checkout APIs expose newest-first order history and paid/refunded payment receipts; raw provider credentials and other customers' records are never included.
- **Static in client config** (`client/src/config/`, `client/src/content/`): brand copy, navigation structure, the free challenge's question bank. These are presentation/identity concerns, not data an admin needs to edit without a deploy, and keeping them in version control makes brand-copy review a normal PR rather than a database migration.

## Data flow: the free challenge

Entirely client-side except the final "email me a report" step:

1. `ChallengeFlow` (client component) runs a small state machine: `intro → math → memory → pattern → observation → critical → results`.
2. Each step component owns its own question data (`content/challengeQuestions.ts`) and calls `onComplete(correct, total)`.
3. `ChallengeFlow` accumulates `SkillScore[]` and calls `buildChallengeResult()` (`lib/challengeScoring.ts` — pure, unit-tested) to compute the overall score, strongest skill, and focus-area suggestion.
4. The results screen shows the breakdown, a shareable card (Web Share API + clipboard fallback), and an email-capture form posting to `POST /api/challenge/report`.

Challenge attempts are not persisted. A `User` model now exists, but associating the free lead-generation challenge with accounts remains deliberately unimplemented.

## Learning and certificate flow

1. `requireAuth` resolves the opaque session cookie and `requireActiveEntitlement` requires an active product entitlement for every learning endpoint.
2. `GET /api/learning/dashboard` joins globally sequenced published lessons with progress, calculates the program day in the learner's IANA timezone, enforces scheduled/prerequisite availability, derives module/course completion, XP and streak, and idempotently records newly earned badges.
3. `GET /api/learning/lessons/:slug` rejects locked lessons, creates an idempotent started-progress record and returns content, resumable draft answers and navigation without `correctIndex` or explanations.
4. `PATCH /api/learning/lessons/:slug/draft` persists partial answer indexes after validating them against the server-side option lists.
5. `POST /api/learning/lessons/:slug/complete` validates every answer, scores against server-side keys, applies the pass mark and atomically records attempts/best score. A UUID and answer hash make client retries idempotent and reject conflicting reuse.
6. `PATCH /api/learning/preferences` validates and stores the learner's IANA timezone for calendar-day unlock behavior.
7. `GET /api/learning/analytics` aggregates submissions and progress into overall, module, skill and learner-local daily activity views; `analytics.csv` provides a portable owner-scoped export.
8. `/api/resources` lists only published files attached to an actively entitled product; downloads repeat that product-specific check, record the request and stream integrity-hashed PDFs from GridFS without public asset URLs.
8. `/api/assessments` lists published checks without answer keys; assessment detail returns safe questions, and submission uses retry-safe UUIDs, server-only scoring and owner-scoped per-skill attempt history.
8. Certificate status and claim routes require active entitlement. Claiming also requires at least 365 published lessons and completion of every required lesson, preventing the initial demonstration content from yielding a program certificate; delivery attempts are recorded and the client provides an accessible print/save-PDF view.
9. Public verification returns only the learner name, issue date and product for an existing non-revoked certificate. Provider retry operations and audited admin revocation remain launch gates.

The engine remains a foundation: the reviewed assessment bank and remaining curriculum content are not present. Current skill analytics inherit skills from each lesson's module; future mixed-skill lessons may need exercise-level skill tags.

## Payment flow

1. `CheckoutForm` posts customer details + optional coupon code to `POST /api/checkout/create-order`.
2. The server re-derives the price from the `Price`/`Coupon` documents — the client-supplied amount is never trusted — creates a `pending` `Order` document, then (only if Razorpay env vars are set) calls the real Razorpay Orders API and stores the returned `providerOrderId` on the order.
3. If Razorpay isn't configured, the route returns `501` and the client shows an honest "payment isn't connected yet" state instead of faking success.
4. The client opens Razorpay's real Checkout modal; on success, Razorpay's `handler` callback POSTs `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` to `POST /api/checkout/verify`, which recomputes the HMAC-SHA256 signature server-side (`crypto.timingSafeEqual`, not `===`) and, if valid, marks the matching `Order` `paid`.
5. `POST /api/webhooks/razorpay` independently verifies `X-Razorpay-Signature` against the raw body, claims a unique provider event ID, and applies capture/failure/refund changes. Processed duplicates are acknowledged without replaying the state transition; failed or stale event records can be retried.
6. `GET /api/checkout/order/:providerOrderId` lets the success page display the real, persisted order status/amount — not a value trusted from the URL or client state.

Paid checkout now requires a signed-in account. Each order belongs to that user, and successful client verification or a verified `payment.captured` webhook idempotently upserts a product entitlement. A refund webhook revokes the entitlement. Owner-scoped order lookups prevent another user from reading a payment merely by knowing its provider order ID.

## SEO trade-off (CSR vs. the Next.js sibling)

This is a client-rendered single-page app. `react-helmet-async` updates `document.title` and meta tags after React mounts, which Google's crawler (which executes JavaScript) can pick up, but:

- The initial HTML response is the same near-empty shell for every route — crawlers or tools that don't execute JS see nothing route-specific.
- There's no per-route static generation, so the sitemap (`client/public/sitemap.xml`) is hand-maintained rather than generated from the same data the app renders.
- JSON-LD structured data is injected via `react-helmet-async` on the blog article page, same caveat as above.

If SEO is a hard requirement for a specific page (most likely the homepage, course, curriculum and blog), the standard MERN answer is either a prerendering step (e.g. `vite-plugin-ssr`/rendering a static snapshot at build time for public marketing routes) or moving those specific routes to a server-rendered framework — which is exactly what the companion Next.js build already does. Treat that as the honest trade-off of choosing MERN for this rebuild, not an oversight.

## Security decisions

- **Payment amounts are always computed server-side** from the `Price`/`Coupon` documents, never accepted from the client.
- **Signature verification uses `crypto.timingSafeEqual`**, not `===`.
- **Webhook and payment verification fail closed**: a missing secret means "not verified," not "assume success."
- **Rate limiting** (`express-rate-limit`) on all public POST routes: newsletter, contact, challenge report, checkout order creation.
- **Honeypot field** on the contact form as a lightweight spam filter alongside rate limiting.
- **`helmet()`** for standard security headers on the API; the API's own CSP is disabled (`contentSecurityPolicy: false`) since it serves JSON, not HTML — CSP is the client app's concern when it's deployed as its own static site.
- **CORS and browser writes are locked to configured client origins**, not a wildcard. Cookie `SameSite`, `Secure` and domain attributes are environment-driven.
- **No secrets in the client bundle**: `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `RAZORPAY_WEBHOOK_SECRET`, `MONGODB_URI` are read only server-side.
- **Learning answers are authoritative on the server**: learner responses never include `correctIndex`, and completion is scored server-side.
- **Operational visibility**: every request receives a request ID, JSON request/error logs are emitted, and liveness is separate from MongoDB readiness.

## Known trade-offs

- **Rate limiting is in-memory** (`express-rate-limit`'s default store) — fine for a single server instance, needs a shared store (Redis) before scaling horizontally.
- **No SSR/prerendering** — see the SEO section above.
- **Challenge questions are a fixed set**, not randomized or DB-backed — acceptable for a lead-generation tool; a determined visitor could look up answers, which doesn't matter for an honest practice snapshot that explicitly isn't a secure assessment.
- **Browser E2E tests mock the API layer** for deterministic UI coverage. A separate server integration suite runs against a real MongoDB 7 service in CI and covers persisted authentication, entitlement-gated learning and webhook replay; it does not replace a future browser-through-API system test against a deployed environment.
- **Only three lessons and one technical assessment baseline are seeded** — the workflow is implemented, but the complete 365-day library and twelve qualified, reviewed assessments require human authoring and approval.
- **Gamification uses progress as its authority** — XP, UTC streak and four badge rules are computed from lesson progress. Badge awards are persisted once with their first award date; reminder and notification preferences remain future work.
- **Certificate delivery is API-only** — eligibility, claiming and public verification exist; learner UI, PDF/email delivery and admin revocation tooling do not.
