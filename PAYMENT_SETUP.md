# Payment Setup (Razorpay)

## What's implemented today

- Server-side order creation via the real Razorpay Orders API (`server/src/lib/razorpay.ts` → `createRazorpayOrder`)
- A `pending` `Order` document is created in MongoDB **before** the Razorpay order, and updated to `paid`/`failed` as the flow progresses — real persistence, not just a pass-through
- Server-side price computation from the `Price`/`Coupon` MongoDB documents (the client never dictates the amount)
- Coupon validation via `GET /api/checkout/coupon/:code` (client-side preview) and again authoritatively inside `create-order`
- Client-side Razorpay Checkout modal (`client/src/lib/loadRazorpayScript.ts`, `components/checkout/CheckoutForm.tsx`)
- Server-side HMAC-SHA256 signature verification of the client callback (`verifyPaymentSignature`), using `crypto.timingSafeEqual`
- Server-side webhook signature verification (`verifyWebhookSignature`) at `POST /api/webhooks/razorpay`, which also updates the `Order` on `payment.captured`/`payment.failed`
- An honest "payment isn't connected yet" UI state when Razorpay env vars aren't set — checkout never fakes a success

## What's NOT implemented yet

- User accounts and product entitlements exist, and paid/refunded events grant or revoke access, but protected lesson content is not built yet.
- Unique provider order/payment IDs, idempotent entitlement upserts and a retained webhook-event ledger prevent duplicate delivery from applying the same event twice.
- Refund webhooks revoke entitlements, but initiating refunds and tracking partial-refund amounts still require operational work.

**The payment verification, persistence and entitlement layers are real foundations.** Protected lessons and production-grade payment reconciliation are the next milestones.

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
3. Select at least `payment.captured` and `payment.failed`.
4. Copy the generated webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
5. For local testing, tunnel the server (ngrok or similar) and trigger a test event from the dashboard.
6. Check server logs for `[razorpay-webhook] verified event: ...` — an invalid or missing signature returns `400`/`501` and is logged as a warning, never silently accepted.

Note: the webhook route is mounted with `express.raw({ type: "application/json" })` in `server/src/index.ts`, mounted *before* the global `express.json()` parser — this is required because the signature is computed over the exact raw request bytes, and a body-parser that re-serializes JSON would break verification.

## Signature verification reference

Razorpay's documented scheme, implemented exactly in `verifyPaymentSignature`:

```
expected_signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
```

Compared with a timing-safe comparison. Unit-tested in `server/tests/razorpay-signature.test.ts`, including "wrong secret," "tampered payload," and "secret not configured → fail closed" cases.

## Live mode checklist

Before switching to live `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`:

- [x] `User`/`Entitlement` models exist and a paid order grants product access
- [ ] Refund initiation and partial-refund tracking match the published Refund & Cancellation Policy
- [x] A webhook-event ledger deduplicates deliveries by Razorpay event ID
- [ ] Live webhook URL registered with its own secret set in the production environment
- [ ] A support process exists for failed/disputed payments before launch

## Troubleshooting

- **"Payment isn't connected yet" shown on checkout** — `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` aren't set. Expected without them.
- **Signature verification fails for a real payment** — confirm the key secret matches the mode (test vs. live) of the key ID used to create the order.
- **Webhook returns 400** — `RAZORPAY_WEBHOOK_SECRET` doesn't match the webhook's configured secret in the dashboard (regenerating the webhook rotates it).
- **`MONGODB_URI` not set** — `create-order` will throw before ever reaching Razorpay; check `server/.env`.
