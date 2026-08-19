import type { Connection } from "mongoose";

export type MigrationContext = {
  connection: Connection;
  log: (message: string) => void;
};

export type Migration = {
  /** Immutable, sortable identifier: YYYYMMDDHHMM-description. */
  id: string;
  /** Change whenever a not-yet-applied migration body changes. Applied checksums are immutable. */
  checksum: string;
  up: (context: MigrationContext) => Promise<void>;
};

export type AppliedMigration = {
  migrationId: string;
  checksum: string;
  appliedAt: Date;
  durationMs: number;
};

export type MigrationStore = {
  listApplied: () => Promise<AppliedMigration[]>;
  recordApplied: (record: AppliedMigration) => Promise<void>;
  acquireLock: (ownerId: string, ttlMs: number) => Promise<boolean>;
  refreshLock: (ownerId: string, ttlMs: number) => Promise<boolean>;
  releaseLock: (ownerId: string) => Promise<void>;
};
