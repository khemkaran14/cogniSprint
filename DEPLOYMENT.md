# Staging deployment on Render

`render.yaml` is the provider-specific staging blueprint. It creates a Docker-based API and a static React site, both with automatic deploys disabled so a reviewed commit can be promoted deliberately. It does not create or share production credentials.

## 1. Prerequisites

1. Rotate every credential that has appeared outside a secret manager.
2. Create a dedicated staging MongoDB database/user with no production access, Atlas network rules, backups and alerts.
3. Create separate Razorpay **Test** credentials and a staging webhook secret. Never put Live credentials in staging.
4. Verify a non-production Resend sender and choose a monitored support address.
5. Connect this repository to Render and create a Blueprint from `render.yaml`.

## 2. Required Render values

The blueprint deliberately declares secrets with `sync: false`. Enter them in the Render dashboard; do not edit them into the YAML.

### API service

| Variable | Staging value |
| --- | --- |
| `MONGODB_URI` | Dedicated staging database URI |
| `CLIENT_URL` | Exact HTTPS origin of `cognisprint-staging-web`; comma-separate preview origins if required |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Matching Razorpay Test pair |
| `RAZORPAY_WEBHOOK_SECRET` | Unique staging webhook secret |
| `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `EMAIL_FROM`, `SUPPORT_EMAIL` | Staging transactional-email and signed delivery-event configuration |
| `LOG_DRAIN_URL`, `LOG_DRAIN_TOKEN` | Optional HTTPS collector and credential |

The Blueprint fixes `ENROLLMENT_OPEN=false`. Do not override it during staging setup. Opening enrollment is a separate launch decision after every applicable gate in `PRODUCTION_READINESS.md` has evidence and owner approval.

Leave `COOKIE_DOMAIN` unset for Render hostnames. `COOKIE_SAME_SITE=none` and `NODE_ENV=production` produce a `Secure; SameSite=None` session cookie for the separately hosted SPA and API.

### Web service

| Variable | Staging value |
| --- | --- |
| `VITE_API_URL` | Exact HTTPS API origin, without `/api` or a trailing slash |
| `VITE_APP_URL` | Exact HTTPS web origin, without a trailing slash |

Vite values are compiled into the static bundle. Rebuild the web service after changing either value.

## 3. First deployment

1. Deploy the API. Render runs `npm run migrate:prod` as the pre-deploy command and refuses promotion if a migration fails.
2. Confirm `GET /api/health` returns `200` and `GET /api/ready` reports a connected database.
3. Enter the resulting API origin as `VITE_API_URL`, enter the web origin as API `CLIENT_URL`, and deploy the web service.
4. Register `/api/webhooks/razorpay` in Razorpay Test mode and `/api/webhooks/resend` in Resend using their separate staging signing secrets.
5. Add repository variables `STAGING_API_URL` and `STAGING_APP_URL`, then manually run **Staging deployment smoke tests**.
6. Promote an owner account from the API shell with `npm run admin:promote -- owner@example.com`; do not create a shared administrator login.

## 4. Release and rollback

- Deploy an immutable reviewed commit, record its SHA, migration status and smoke-test run.
- Migrations must remain backward-compatible with the immediately preceding application version. The migration runner does not automatically roll data backward.
- For an application rollback, redeploy the previous known-good SHA, then rerun smoke tests. Do not manually delete migration ledger entries.
- If a migration is not backward-compatible, stop the rollout and restore the tested staging backup into an isolated database before deciding on a forward repair.

## 5. Staging acceptance

Before treating the deployment as validated, verify registration/login/logout, cross-origin cookie behavior, a Razorpay Test payment, webhook recovery, entitlement access, a refund, queued email delivery, administrator access, structured logs and the full checklist in `PRODUCTION_READINESS.md`.
