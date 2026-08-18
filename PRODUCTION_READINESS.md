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
| Accounts and opaque sessions | Foundation | Register/login/logout, verification, reset, profile preferences, owner-scoped device/session revocation, portable data export and audited deletion-request intake exist; approved deletion/anonymization remains dependent on the legal retention policy. |
| Razorpay checkout and entitlements | Foundation | Server-priced orders, signed verification, event dedupe, audited refunds/disputes, reconciliation, entitlement grant/revoke, owner history and printable payment receipts exist; production validation and legally reviewed tax invoices remain. |
| Protected lessons and progress | Foundation | Entitlement gating, progression, resumable drafts, retry-safe scoring, overall/module/skill/activity analytics and CSV export exist for three lessons; the remaining 362 sessions remain. |
| XP, streak and badges | Foundation | Derived UTC streak, XP and four badge rules exist; persistent achievement events, timezone preference and reminders remain. |
| Certificates | Foundation | Eligibility, claim, printable UI, public verification, queued/provider-tracked email delivery with audited retry, and audited admin revocation exist; production provider validation remains. |
| Assessments | Foundation | Entitlement-protected catalogue, attempt UI, retry-safe server scoring, per-skill results and one technical baseline exist; eleven assessments and qualified content review remain. |
| Admin/support tooling | Foundation | Operational dashboards, refund/dispute/email/privacy operations, certificate revocation, auditable content review/publishing and immutable mutation records exist; user management, content authoring and granular permissions remain. |
| Community/referrals | Not implemented | No product implementation or moderation operation. |
| Runtime/deployment foundation | Foundation | CI, containers, SPA fallback, request IDs, readiness and graceful shutdown exist; provider deployment, migrations, monitoring and real full-stack tests remain. |

## Repository gates before a staging deployment

- [x] Add a versioned MongoDB migration runner and migration lock; seed execution remains separate from production schema migration.
- [x] Add a Render staging blueprint for the API and web client, including pre-deploy migrations, health checks, secret placeholders and an operator runbook; owner-managed services and values must still be provisioned.
- [x] Build and scan both container images in CI; Dockerfiles are linted and HIGH/CRITICAL fixed vulnerabilities fail the workflow.
- [x] Add a real MongoDB-backed integration suite for auth, entitlements, learning and webhook replay, executed against a MongoDB service in CI.
- [x] Add centralized error reporting and structured-log collection through redacted JSON events and an optional authenticated HTTPS log drain; the owner must configure and retain the external collector.
- [x] Add post-deployment smoke tests for `/api/health`, `/api/ready`, auth, protected learning and the SPA fallback; staging URLs must be configured before the workflow can execute.
- [ ] Verify production cookie/CORS/trusted-origin behavior on the actual staging origins.
- [x] Replace incomplete-program sales claims with explicit published-versus-planned availability, remove unavailable download promotion, hide active products by default and fail checkout closed unless `ENROLLMENT_OPEN=true` is deliberately configured after launch approval.

## Repository gates before accepting Live payments

- [x] Implement audited refund records, provider refund IDs and partial-refund amount/state handling.
- [x] Record Razorpay dispute lifecycle webhooks, flag open disputes for operations, notify affected learners, restore access after a win and revoke access after a lost chargeback; evidence must still be submitted by an authorized owner in Razorpay.
- [x] Add dry-run/apply reconciliation for stale pending orders and paid-order entitlement mismatches, with an hourly serialized workflow and retained findings.
- [x] Add owner-scoped order history and printable payment receipts. Tax invoices remain subject to finalized legal/GST requirements.
- [x] Add idempotent queued purchase, failure and refund email delivery with provider acceptance IDs, bounded retries, scheduled processing, audited admin retry, and signed Resend delivery/bounce/complaint webhook tracking.
- [x] Detect, deduplicate and notify on payment failures, stale orders, failed webhooks, exhausted email retries, reconciliation review and entitlement mismatches, with audited acknowledge/resolve operations.
- [x] Pass real-database tests for callback/webhook races, duplicate delivery, partial-refund access retention and full-refund revocation.
- [ ] Complete the applicable security, privacy, accessibility and legal gates below.

## Repository gates before selling the complete 365-day product

- [ ] Author and review the remaining 362 daily sessions, exercises, explanations and required media.
- [x] Back public lesson/assessment availability counts with a live MongoDB inventory endpoint, expose launch targets, make catalogue/checkout fail closed below those targets, add an unsafe-enrollment audit command, and validate the inventory in staging smoke checks.
- [x] Add prerequisites, timezone-aware daily scheduling, resumable drafts, idempotent attempts and module/course completion rules.
- [x] Add owner-scoped overall, per-skill, per-module and daily progress analytics with an accessible UI and CSV export.
- [ ] Expand the retry-safe assessment foundation into twelve monthly assessments with qualified, reviewed question banks (one technical baseline is seeded).
- [x] Add provider-backed certificate email retry operations; learner claim, print/save-PDF UI, provider delivery status, public verification and audited admin revocation are implemented.
- [x] Add versioned, integrity-checked GridFS PDF storage, product-specific entitlement checks, audited downloads, and audited administrator publishing for workbooks and worksheets.
- [ ] Author, professionally review, import and publish the actual advertised workbook and worksheet files.
- [x] Add content draft/review/changes-requested/approval/publish/archive states and an auditable administrator release process for lessons and assessments.

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
