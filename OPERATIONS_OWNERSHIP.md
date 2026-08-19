# Operations ownership and incident response

This runbook defines the roles that must be assigned before enrollment opens. Replace every `UNASSIGNED` value with a named person or monitored team address in the private operations system; do not commit personal phone numbers or provider recovery codes.

| Responsibility | Primary owner | Backup owner | Initial response target |
| --- | --- | --- | --- |
| Incident commander | UNASSIGNED | UNASSIGNED | 30 minutes for critical alerts |
| Payment/refund/dispute operations | UNASSIGNED | UNASSIGNED | 4 business hours |
| Privacy and deletion requests | UNASSIGNED | UNASSIGNED | 2 business days |
| Learner support | UNASSIGNED | UNASSIGNED | 1 business day |
| Content correctness and release | UNASSIGNED | UNASSIGNED | Before publication |
| Security and credential rotation | UNASSIGNED | UNASSIGNED | 30 minutes for suspected compromise |

## Severity and first response

- **Critical:** payment integrity, unauthorized access, exposed credentials, widespread outage, data loss, or a lost chargeback deadline. Acknowledge immediately, close enrollment if commerce integrity is uncertain, preserve logs, and assign an incident commander.
- **High:** repeated email failure, entitlement mismatch, material learner-access failure, or a security control degradation. Acknowledge within four business hours and create a tracked remediation.
- **Routine:** individual support, content correction, or non-urgent privacy operations. Process through the audited administrator workflow.

## Response sequence

1. Record start time, reporter, affected environment, release SHA and request/provider IDs.
2. Contain the issue without deleting audit, webhook, migration, order or email records.
3. Use `/admin/alerts`, `/admin/orders`, `/admin/disputes`, `/admin/email-deliveries` and `/admin/users` to establish impact.
4. Rotate credentials through the provider and secret manager when exposure is suspected; never paste replacement secrets into the incident record.
5. Reconcile payment and entitlement state in dry-run mode before applying a repair.
6. Communicate status through the monitored support route and provider dashboards.
7. Validate recovery with health/readiness checks and the staging smoke workflow.
8. Record resolution, customer impact, follow-up owner and due date. Preserve evidence according to the approved retention policy.

## Stop conditions

Keep `ENROLLMENT_OPEN=false` when payment state, entitlement state, content inventory, legal approval, security review, support ownership or recovery evidence is incomplete. Code and automated tests cannot approve an external launch gate.
