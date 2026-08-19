# Protected workbook and worksheet delivery

CogniSprint stores reviewed PDF resources in MongoDB GridFS and exposes them only to authenticated users with an active entitlement for the resource's product. Metadata, versions and SHA-256 integrity hashes live in `LearningResource`; every successful download request creates a `ResourceDownload` audit record.

## Import a draft

Run imports only from a trusted server shell. The importer accepts PDF files up to 25 MB, verifies the PDF header, computes SHA-256, uploads a new GridFS version and safely removes the prior stored version after metadata is committed.

```bash
cd server
npm run resource:import -- \
  --file /secure/reviewed/focus-workbook.pdf \
  --product cognisprint-complete \
  --slug focus-workbook \
  --title "Focus Workbook" \
  --kind workbook \
  --description "Reviewed practice sheets for the focus module"
```

Imports always return the resource to `draft`; the shell cannot publish it. Sign in as an administrator, open `/admin/resources`, verify the displayed filename, version, size and SHA-256 digest, enter a release note, then publish. Publishing and archiving are written to the administrator audit ledger.

## Learner access

Learners open `/learn/resources`. `GET /api/resources` returns only published resources linked to an actively entitled product. `GET /api/resources/:slug/download` repeats the product-specific entitlement check before streaming the GridFS file with `private, no-store` and attachment headers.

Revoked entitlements immediately lose listing and download access. Draft and archived resources are never returned. Do not market a workbook until its real reviewed PDF has been imported, approved and published; the delivery system does not substitute for authoring or professional review.
