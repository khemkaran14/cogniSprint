# Production Readiness

This document is the authoritative launch checklist for CogniSprint. A checked item must be supported by repository evidence or a recorded external validation; a feature foundation is not the same as a production-approved capability.

## Status definitions

- **Implemented** — the primary repository workflow exists and is covered by automated checks.
- **Foundation** — a safe vertical slice exists, but advertised scope or production operations are incomplete.
- **External gate** — requires owner/provider/professional action and cannot be completed by a code change.

## Repository implementation status

| Capability | Status | Evidence and remaining boundary |
| --- | --- | --- |
| Public marketing/catalogue/challenge | Implemented | Public React routes, catalogue APIs and mocked browser flows exist. |
| Accounts and opaque sessions | Foundation | Register/login/logout, verification and reset exist; profile, device/session management and privacy workflows remain. |
| Razorpay checkout and entitlements | Foundation | Server-priced persisted orders, signed verification, event dedupe and entitlement grant/revoke exist; operational refunds, reconciliation and customer history remain. |
| Protected lessons and progress | Foundation | Entitlement gating, three lessons, server scoring and progress persistence exist; the remaining 362 sessions and progression rules remain. |
| XP, streak and badges | Foundation | Derived UTC streak, XP and four badge rules exist; persistent achievement events, timezone preference and reminders remain. |
| Certificates | Foundation | Eligibility, claim and public verification APIs exist; UI, PDF/email delivery and admin revocation remain. |
| Assessments | Not implemented | No assessment models, routes, UI or reviewed question bank. |
| Admin/support tooling | Not implemented | No admin console, scoped permissions or audit ledger. |
| Community/referrals | Not implemented | No product implementation or moderation operation. |
| Runtime/deployment foundation | Foundation | CI, containers, SPA fallback, request IDs, readiness and graceful shutdown exist; provider deployment, migrations, monitoring and real full-stack tests remain. |

## Repository gates before a staging deployment

- [ ] Add a versioned MongoDB migration runner and migration lock; do not use seed execution as a production schema migration.
- [ ] Add provider-specific staging deployment configuration for both client and API.
- [ ] Build and scan both container images in CI.
- [ ] Add a real MongoDB-backed integration suite for auth, entitlements, learning and webhook replay.
- [ ] Add centralized error reporting and structured-log collection.
- [ ] Add post-deployment smoke tests for `/api/health`, `/api/ready`, auth and protected learning.
- [ ] Verify production cookie/CORS/trusted-origin behavior on the actual staging origins.
- [ ] Update sales copy so it promises only reviewed and published content available at launch.

## Repository gates before accepting Live payments

- [ ] Implement refund records, provider refund IDs and partial-refund amount/state handling.
- [ ] Define and implement entitlement behavior for partial refunds and disputes.
- [ ] Add scheduled reconciliation for pending and inconsistent orders.
- [ ] Add owner-scoped order history and receipt/invoice delivery.
- [ ] Add reliable queued purchase, failure and refund email delivery with provider status tracking.
- [ ] Alert on payment failures, stale pending orders, failed webhook events and entitlement mismatches.
- [ ] Pass real-database tests for callback/webhook races, duplicate delivery and refund revocation.
- [ ] Complete the applicable security, privacy, accessibility and legal gates below.

## Repository gates before selling the complete 365-day product

- [ ] Author and review the remaining 362 daily sessions, exercises, explanations and required media.
- [ ] Reconcile database counts with every lesson/exercise claim on public pages.
- [ ] Add prerequisites, daily scheduling, resumable attempts and module/course completion rules.
- [ ] Add detailed per-skill and per-module progress analytics.
- [ ] Implement twelve monthly assessments with server-side scoring and reviewed question banks.
- [ ] Add learner certificate status/claim UI, accessible PDF output, email delivery and admin revocation.
- [ ] Deliver the advertised workbook and worksheets through entitlement-protected downloads.
- [ ] Add content draft/review/approval/publish states and an auditable release process.

## External owner gates

### Credentials and providers

- [ ] Rotate any Razorpay credential disclosed outside the secret manager; never reuse an exposed secret.
- [ ] Complete Razorpay business activation/KYC and generate separate Live credentials.
- [ ] Register the production Razorpay webhook and its unique production secret.
- [ ] Configure MongoDB Atlas least-privilege users, network access, backups and alerts.
- [ ] Verify the Resend sender domain and configure SPF, DKIM and DMARC.
- [ ] Configure hosting projects, environment secrets, custom domains, DNS and TLS.

### Professional and operational approval

- [ ] Legal review approves Terms, Privacy Policy, Refund Policy, business identity, tax/GST and invoice handling.
- [ ] A security review and independent penetration test cover authentication, authorization, payment and webhook paths.
- [ ] A WCAG 2.2 AA review covers public, auth, checkout and learning flows plus downloadable documents.
- [ ] A qualified human reviews educational correctness, difficulty progression and cognitive/medical claims.
- [ ] Customer-support and incident-response owners, contact routes and response expectations are documented.
- [ ] Community features, if introduced, have funded moderation, reporting, blocking and age-safety operations.

### Live validation

- [ ] Perform a low-value Live payment and verify order, entitlement, receipt and logs.
- [ ] Confirm a lost browser callback is recovered through the webhook path.
- [ ] Perform the supported refund flows and verify customer communication and entitlement state.
- [ ] Restore a production-like Atlas backup into an isolated environment and record the recovery time.
- [ ] Exercise deployment rollback and incident escalation in staging.

## Launch decision

The application must not be described as production-ready solely because builds and unit tests pass. Launch approval requires all gates applicable to the claims and payment mode being enabled. Deferred items must be removed from sales copy or explicitly described as unavailable; they must not be represented by placeholder content or unchecked operational assumptions.
