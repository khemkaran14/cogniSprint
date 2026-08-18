# MongoDB Migrations

Production schema and index changes use the versioned runner in `server/src/migrations/`. Development seed data is intentionally separate and must not be used as a deployment migration.

## Commands

Run from `server/` with the target environment's `MONGODB_URI` configured:

```bash
npm run migrate:status   # read-only pending migration report
npm run migrate          # apply pending migrations
npm run migrate:prod     # apply from a compiled production/container artifact
```

The runner:

1. validates migration ID order and checksums;
2. rejects applied migrations whose source checksum changed;
3. rejects database history unknown to the deployed build;
4. bootstraps unique migration-history/lock indexes and acquires a renewable database lease so only one release process applies migrations;
5. re-reads history after acquiring the lock;
6. records a migration only after its `up` function succeeds;
7. releases the lease after success or failure.

## Adding a migration

1. Add `server/src/migrations/YYYYMMDDHHMM-description.ts` implementing the `Migration` type.
2. Give it an immutable, sortable ID and a `sha256:<64 lowercase hex characters>` checksum.
3. Register it in ascending order in `server/src/migrations/index.ts`.
4. Add tests for data transformation, repeat execution, and failure behavior.
5. Run `npm run migrate:status` against a production-like backup before deployment.
6. Prefer backward-compatible expand/contract changes. Deploy code that tolerates both shapes before destructive cleanup.

Never edit or remove an applied migration. Add a new forward-fix migration instead. The runner deliberately stops when an applied checksum differs or the database contains a migration absent from the build.

## Index changes

The initial migration calls Mongoose `createIndexes()` for every current application model. This is additive and does not silently drop production indexes. A destructive or renamed index requires its own reviewed migration, an impact assessment, and a production-like rehearsal.

Mongoose automatic index creation is disabled when `NODE_ENV=production`; deployments must run migrations before shifting traffic to a build that depends on new indexes.

## Deployment order

Use this sequence for backward-compatible migrations:

1. build and verify the release artifact;
2. run `npm run migrate:status`;
3. run `npm run migrate:prod` from the compiled release image as a single release job (`npm run migrate` is the source-development equivalent);
4. deploy/roll the API instances;
5. verify `/api/ready` and application smoke tests;
6. retain logs containing applied IDs and durations.

Do not run migrations from every application replica at startup. The distributed lease prevents overlap, but a dedicated release job makes failures visible and keeps application startup predictable.

## Recovery

The framework is forward-only because arbitrary MongoDB data rollback can be destructive. Before high-risk changes, take or verify a restorable backup. If a migration fails, fix the cause and add or rerun the unapplied migration as appropriate; if an already-applied change needs correction, ship a new migration. Document restore decisions and recovery time as part of the external launch gate in `PRODUCTION_READINESS.md`.
