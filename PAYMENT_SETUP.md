# Payment Setup (Razorpay)

## What's implemented today

- Server-side order creation via the real Razorpay Orders API (`server/src/lib/razorpay.ts` → `createRazorpayOrder`)
- A `pending` `Order` document is created in MongoDB **before** the Razorpay order, and updated to `paid`/`failed` as the flow progresses — real persistence, not just a pass-through
- Server-side price computation from the `Price`/`Coupon` MongoDB documents (the client never dictates the amount)
- Coupon validation via `GET /api/checkout/coupon/:code` (client-side preview) and again authoritatively inside `create-order`
- Client-side Razorpay Checkout modal (`client/src/lib/loadRazorpayScript.ts`, `components/checkout/CheckoutForm.tsx`)
- Server-side HMAC-SHA256 signature verification of the client callback (`verifyPaymentSignature`), using `crypto.timingSafeEqual`
- Server-side webhook signature verification (`verifyWebhookSignature`) at `POST /api/webhooks/razorpay`, which also updates the `Order` on `payment.captured`/`payment.failed`
- Webhook delivery deduplication keyed by `X-Razorpay-Event-Id`, with retained processing/processed/failed records
- Idempotent product-entitlement grant on capture and entitlement revocation on full refund events
- Signed-in checkout ownership and owner-scoped order status lookup
- An honest "payment isn't connected yet" UI state when Razorpay env vars aren't set — checkout never fakes a success

## What remains before Live Mode

- Legal approval that the implemented partial-refund access-retention behavior matches the published policy
- Production validation of the implemented dispute handling, reconciliation and queued payment/refund email delivery, plus legally reviewed tax invoices
- A human-owned process for submitting dispute evidence and communicating with affected customers
- Staging and Live provider tests covering callback loss, redelivery, refunds and entitlement state (MongoDB-backed CI race/refund coverage exists)
- Owner-controlled Razorpay KYC, Live credentials, production webhook registration and a real payment/refund smoke test

**The payment verification, persistence and entitlement layers are real foundations.** They are not a substitute for completing and testing the operational items above.

## Test mode setup

1. Create a Razorpay account and switch to **Test Mode**.
2. Copy the test **Key ID** and **Key Secret** from Settings → API Keys.
3. Set in `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```
4. Restart the server. On the client, go to `/pricing` → Buy Now → fill the checkout form — the real Razorpay Checkout modal should open.
5. Use Razorpay's [published test card/UPI details](https://razorpay.com/docs/payments/payments/test-card-upi-details/) to simulate a payment.
6. On success, `POST /api/checkout/verify` runs; if the signature is valid, the client redirects to `/checkout/success?order=...`, which calls `GET /api/checkout/order/:providerOrderId` to display the real persisted amount/status.

## Webhook setup

1. Razorpay dashboard → Settings → Webhooks → Add New Webhook.
2. URL: `https://<your-deployed-api-domain>/api/webhooks/razorpay`
3. Select at least `payment.captured`, `payment.failed` and `payment.refunded`; add applicable dispute events before Live Mode.
4. Copy the generated webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
5. For local testing, tunnel the server (ngrok or similar) and trigger a test event from the dashboard.
6. Check server logs for `[razorpay-webhook] verified event: ...` — an invalid or missing signature returns `400`/`501` and is logged as a warning, never silently accepted.

Note: the webhook route is mounted with `express.raw({ type: "application/json" })` in `server/src/app.ts`, before the global `express.json()` parser. Signature verification requires the exact raw request bytes; parsing and re-serializing JSON first would invalidate the signature.

## Signature verification reference

Razorpay's documented scheme, implemented exactly in `verifyPaymentSignature`:

```
expected_signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
```

Compared with a timing-safe comparison. Unit-tested in `server/tests/razorpay-signature.test.ts`, including "wrong secret," "tampered payload," and "secret not configured → fail closed" cases.

## Live mode checklist

Before switching to live `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`:

- [x] `User`/`Entitlement` models exist and a paid order grants product access
- [x] Refund initiation and partial-refund tracking are implemented; legal approval against the published policy remains external
- [x] A webhook-event ledger deduplicates deliveries by Razorpay event ID
- [x] Pending-order reconciliation and payment/entitlement mismatch alerting are implemented; production scheduling/monitoring remains external
- [x] Payment, refund and receipt emails use a monitored queue/provider-event foundation; production domain and delivery validation remain external
- [ ] Live webhook URL registered with its own secret set in the production environment
- [ ] A real low-value Live payment and full refund have passed end to end
- [ ] A support process exists for failed/disputed payments before launch

## Troubleshooting

- **"Payment isn't connected yet" shown on checkout** — `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` aren't set. Expected without them.
- **Signature verification fails for a real payment** — confirm the key secret matches the mode (test vs. live) of the key ID used to create the order.
- **Webhook returns 400** — `RAZORPAY_WEBHOOK_SECRET` doesn't match the webhook's configured secret in the dashboard (regenerating the webhook rotates it).
- **`MONGODB_URI` not set** — `create-order` will throw before ever reaching Razorpay; check `server/.env`.

## Scheduled reconciliation

An hourly serialized GitHub Actions workflow runs `npm run reconcile:apply` using repository secrets. Run `npm run reconcile` for a non-mutating report before applying manually. Each run and its bounded findings are retained in MongoDB for operational review. Configure the workflow secrets before enabling it.

## Transactional email queue

Purchase confirmations, payment failures and refunds use idempotent outbox records rather than depending on a single request-time provider call. The scheduled `email-delivery.yml` worker processes 100 messages per run, stores Resend message IDs, retries failures with bounded exponential backoff and supports audited administrator retries. Configure `MONGODB_URI`, `RESEND_API_KEY` and `EMAIL_FROM` as repository secrets.

## Operational alerts

`operational-alerts.yml` scans every ten minutes for payment failures, stale pending orders, failed webhook processing, exhausted email retries, reconciliation findings and paid orders missing active access. Findings are deduplicated by fingerprint, can notify `SUPPORT_EMAIL`, and must be acknowledged or resolved from `/admin/alerts`. Persistent conditions reopen on the next scan.

## Payment disputes and chargebacks

Enable Razorpay dispute lifecycle webhooks (`payment.dispute.created`, `payment.dispute.won`, `payment.dispute.lost` and `payment.dispute.closed`) on the same signed endpoint. Open disputes create critical operational alerts and appear at `/admin/disputes`; submit evidence and communicate with the provider from an authorized Razorpay account. A won dispute restores the paid order/access state, while a lost dispute records a chargeback and revokes the order entitlement. Webhook state is authoritative and duplicate deliveries remain protected by the event ledger.

## Resend delivery events

Register `POST /api/webhooks/resend` in Resend and store its signing secret as `RESEND_WEBHOOK_SECRET`. Subscribe to sent, delivered, delayed, bounced and complained email events. The API verifies the Svix signature and timestamp against the raw body, deduplicates event IDs, updates the matching provider message, and raises a critical operational alert for bounces or complaints. Review provider outcomes at `/admin/email-deliveries`; do not blindly retry a bounce or complaint.
