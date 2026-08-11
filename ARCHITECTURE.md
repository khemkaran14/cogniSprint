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
        └── /api/webhooks/razorpay                                      → MongoDB + Razorpay signature check
```

There is no server-side rendering. Every page is a client-rendered React component; `react-helmet-async` sets `<title>`/meta tags per route for whatever SEO benefit a crawler that executes JavaScript can get from that (see "SEO trade-off" below — this is the one place where the Next.js sibling repo is architecturally stronger).

## Directory structure

```
server/
  src/
    models/       Mongoose schemas: Product, Price, Coupon, Order, Module, FaqItem, BlogArticle
    routes/       catalogue.ts, newsletter.ts, contact.ts, challenge.ts, checkout.ts, webhooks.ts
    lib/          db.ts (connection), razorpay.ts, email.ts, pricing.ts, validation.ts (all Zod schemas)
    middleware/   rateLimit.ts (express-rate-limit configs)
    seed/         data.ts (source content) + run.ts (upserts everything into MongoDB)
    index.ts      Express app: helmet, cors, raw-body webhook route, json body parser, route mounting
  tests/          Vitest — pure logic + signature verification, no DB required

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

- **In MongoDB** (`server/src/models/`): `Product`, `Price`, `Coupon` (commerce — must be authoritative and server-validated), `Order` (transactional record), `Module` (curriculum — content that could reasonably change without a redeploy), `FaqItem`, `BlogArticle`.
- **Static in client config** (`client/src/config/`, `client/src/content/`): brand copy, navigation structure, the free challenge's question bank. These are presentation/identity concerns, not data an admin needs to edit without a deploy, and keeping them in version control makes brand-copy review a normal PR rather than a database migration.

## Data flow: the free challenge

Entirely client-side except the final "email me a report" step:

1. `ChallengeFlow` (client component) runs a small state machine: `intro → math → memory → pattern → observation → critical → results`.
2. Each step component owns its own question data (`content/challengeQuestions.ts`) and calls `onComplete(correct, total)`.
3. `ChallengeFlow` accumulates `SkillScore[]` and calls `buildChallengeResult()` (`lib/challengeScoring.ts` — pure, unit-tested) to compute the overall score, strongest skill, and focus-area suggestion.
4. The results screen shows the breakdown, a shareable card (Web Share API + clipboard fallback), and an email-capture form posting to `POST /api/challenge/report`.

No challenge attempt is persisted — there's no `User` model yet for it to belong to. That's the natural place to extend once Phase 4 auth lands.

## Payment flow

1. `CheckoutForm` posts customer details + optional coupon code to `POST /api/checkout/create-order`.
2. The server re-derives the price from the `Price`/`Coupon` documents — the client-supplied amount is never trusted — creates a `pending` `Order` document, then (only if Razorpay env vars are set) calls the real Razorpay Orders API and stores the returned `providerOrderId` on the order.
3. If Razorpay isn't configured, the route returns `501` and the client shows an honest "payment isn't connected yet" state instead of faking success.
4. The client opens Razorpay's real Checkout modal; on success, Razorpay's `handler` callback POSTs `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` to `POST /api/checkout/verify`, which recomputes the HMAC-SHA256 signature server-side (`crypto.timingSafeEqual`, not `===`) and, if valid, marks the matching `Order` `paid`.
5. `POST /api/webhooks/razorpay` independently verifies `X-Razorpay-Signature` against the raw request body and updates the same `Order` on `payment.captured`/`payment.failed` — a second confirmation path that doesn't depend on the client callback firing.
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
- **CORS locked to `CLIENT_URL`**, not a wildcard.
- **No secrets in the client bundle**: `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `RAZORPAY_WEBHOOK_SECRET`, `MONGODB_URI` are read only server-side.

## Known trade-offs

- **Rate limiting is in-memory** (`express-rate-limit`'s default store) — fine for a single server instance, needs a shared store (Redis) before scaling horizontally.
- **No SSR/prerendering** — see the SEO section above.
- **Challenge questions are a fixed set**, not randomized or DB-backed — acceptable for a lead-generation tool; a determined visitor could look up answers, which doesn't matter for an honest practice snapshot that explicitly isn't a secure assessment.
- **E2E tests mock the API layer** rather than running against a live MongoDB, because this environment couldn't reach MongoDB's download servers (network policy, not a shortcut) — see the client's `tests/e2e/mockApi.ts`. Wire up a MongoDB instance (the included `docker-compose.yml`) to additionally run these against the real backend.
