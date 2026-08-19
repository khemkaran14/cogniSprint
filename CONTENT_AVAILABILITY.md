# Published content availability

Public availability statements are backed by `GET /api/content-availability`, not hand-maintained lesson or assessment totals. The endpoint counts published lessons and their exercises, published assessments and their questions, and published workbook/worksheet resources directly from MongoDB. It also returns the declared launch targets and whether all launch-critical content targets are met.

The seed contains a structurally complete 365-day lesson sequence, but only independently approved records may have `published` status. The remaining authored lessons are seeded as `in_review`, so they do not inflate availability counts or permit enrollment before human approval.

The home and curriculum pages use this inventory for their published counts and enrollment label. Roadmap module figures remain explicitly labelled as plans rather than delivered purchase content.

## Operator audit

Run the database audit before changing enrollment configuration:

```bash
cd server
npm run content:audit
```

The command emits a structured `content_availability_audit` record. It exits unsuccessfully when `ENROLLMENT_OPEN=true` but the published database contains fewer than 365 lessons, twelve assessments, or one workbook. Product catalogue and order-creation routes independently repeat the same completeness check and fail closed, so changing the environment flag alone cannot expose an incomplete sale. These checks supplement—rather than replace—professional content review.

The staging smoke workflow also verifies that the inventory endpoint is healthy, returns numeric published counts and targets, and reports staging enrollment closed.
