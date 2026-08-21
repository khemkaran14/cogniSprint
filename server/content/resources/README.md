# Draft learning resources

PDFs in this directory are **authored drafts**, not published files. They exist so the
`resource:import` workflow (`server/src/ops/importResource.ts`) has something real to import
into a running instance, and so a reviewer can open them directly without standing up the app.

## Contents

- `month-1-practice-workbook.pdf` — a printable companion to the Month 1 (Practice Foundations)
  daily lessons: a 30-day tracker, four weekly-review pages (days 7/14/21/30), and a Month 2
  target-setting page.
- `foundations-practice-worksheet.pdf` — a standalone, login-free warm-up worksheet covering all
  six practice categories, with a worked answer key.
- `generate_month1_resources.py` — the ReportLab script that generated both PDFs. Regenerate with:

  ```bash
  pip install reportlab
  python3 generate_month1_resources.py
  ```

## Importing into a running instance

These files are **not** wired into the seed script (`npm run seed`) automatically, because
`LearningResource` publishing is a deliberate, audited admin action (see `PRODUCTION_READINESS.md`),
not something that should happen implicitly on every fresh install. To bring one in as a `draft`
resource on a running instance with `MONGODB_URI` configured:

```bash
cd server
npm run resource:import -- \
  --file content/resources/month-1-practice-workbook.pdf \
  --product cognisprint-complete \
  --slug month-1-practice-workbook \
  --title "Month 1 Practice Workbook" \
  --kind workbook \
  --description "A printable companion to the Month 1 (Practice Foundations) daily lessons."

npm run resource:import -- \
  --file content/resources/foundations-practice-worksheet.pdf \
  --product cognisprint-complete \
  --slug foundations-practice-worksheet \
  --title "Foundations Practice Worksheet" \
  --kind worksheet \
  --description "A standalone, login-free warm-up worksheet covering all six practice categories."
```

Both land with `status: "draft"`. Per `PRODUCTION_READINESS.md`, moving either to `published` (via
the admin `/admin/resources` status endpoint) requires an authored, professionally reviewed
resource — these drafts are a starting point for that review, not a finished, sellable product.
