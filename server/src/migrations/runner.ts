import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { MigrationLock, MigrationRecord } from "../models/Migration.js";
import type { AppliedMigration, Migration, MigrationStore } from "./types.js";

const LOCK_ID = "database-migrations";
const DEFAULT_LOCK_TTL_MS = 5 * 60_000;

export function validateMigrationPlan(migrations: Migration[]): void {
  const ids = new Set<string>();
  let previous = "";
  for (const migration of migrations) {
    if (!/^\d{12}-[a-z0-9-]+$/.test(migration.id)) throw new Error(`Invalid migration ID: ${migration.id}`);
    if (ids.has(migration.id)) throw new Error(`Duplicate migration ID: ${migration.id}`);
    if (migration.id <= previous) throw new Error("Migrations must be registered in ascending ID order.");
    if (!/^sha256:[a-f0-9]{64}$/.test(migration.checksum)) throw new Error(`Invalid checksum for migration ${migration.id}`);
    ids.add(migration.id);
    previous = migration.id;
  }
}

export function pendingMigrations(migrations: Migration[], applied: AppliedMigration[]): Migration[] {
  validateMigrationPlan(migrations);
  const appliedById = new Map(applied.map((record) => [record.migrationId, record]));
  for (const migration of migrations) {
    const record = appliedById.get(migration.id);
    if (record && record.checksum !== migration.checksum) {
      throw new Error(`Applied migration ${migration.id} has changed checksum; create a new migration instead.`);
    }
  }
  const knownIds = new Set(migrations.map((migration) => migration.id));
  const unknown = applied.find((record) => !knownIds.has(record.migrationId));
  if (unknown) throw new Error(`Database contains unknown migration ${unknown.migrationId}; deploy the matching code before continuing.`);
  return migrations.filter((migration) => !appliedById.has(migration.id));
}

export async function runMigrations(options: {
  migrations: Migration[];
  store: MigrationStore;
  dryRun?: boolean;
  ownerId?: string;
  lockTtlMs?: number;
  log?: (message: string) => void;
}): Promise<{ applied: string[]; pending: string[] }> {
  const log = options.log ?? console.info;
  const appliedRecords = await options.store.listApplied();
  const pending = pendingMigrations(options.migrations, appliedRecords);
  if (options.dryRun) return { applied: [], pending: pending.map((migration) => migration.id) };
  if (!pending.length) return { applied: [], pending: [] };

  const ownerId = options.ownerId ?? randomUUID();
  const ttlMs = options.lockTtlMs ?? DEFAULT_LOCK_TTL_MS;
  if (!(await options.store.acquireLock(ownerId, ttlMs))) {
    throw new Error("Another migration process owns the database migration lock.");
  }

  const applied: string[] = [];
  try {
    // Re-read after locking because another runner may have completed while this process waited.
    const lockedPending = pendingMigrations(options.migrations, await options.store.listApplied());
    for (const migration of lockedPending) {
      if (!(await options.store.refreshLock(ownerId, ttlMs))) throw new Error("Database migration lock was lost.");
      log(`applying ${migration.id}`);
      const startedAt = Date.now();
      let lockLost = false;
      let refreshing = false;
      const heartbeat = setInterval(() => {
        if (refreshing) return;
        refreshing = true;
        void options.store.refreshLock(ownerId, ttlMs)
          .then((refreshed) => { if (!refreshed) lockLost = true; })
          .catch(() => { lockLost = true; })
          .finally(() => { refreshing = false; });
      }, Math.max(100, Math.floor(ttlMs / 3)));
      heartbeat.unref();
      try {
        await migration.up({ connection: mongoose.connection, log });
      } finally {
        clearInterval(heartbeat);
      }
      if (lockLost || !(await options.store.refreshLock(ownerId, ttlMs))) {
        throw new Error(`Database migration lock was lost while applying ${migration.id}; migration was not recorded.`);
      }
      await options.store.recordApplied({
        migrationId: migration.id,
        checksum: migration.checksum,
        appliedAt: new Date(),
        durationMs: Date.now() - startedAt,
      });
      applied.push(migration.id);
      log(`applied ${migration.id}`);
    }
    return { applied, pending: [] };
  } finally {
    await options.store.releaseLock(ownerId);
  }
}

export function mongooseMigrationStore(now: () => Date = () => new Date()): MigrationStore {
  let metadataReady: Promise<unknown> | undefined;
  const ensureMetadata = () => {
    metadataReady ??= Promise.all([MigrationRecord.createIndexes(), MigrationLock.createIndexes()]);
    return metadataReady;
  };
  return {
    async listApplied() {
      await ensureMetadata();
      return MigrationRecord.find().sort({ migrationId: 1 }).lean() as unknown as Promise<AppliedMigration[]>;
    },
    async recordApplied(record) {
      await ensureMetadata();
      await MigrationRecord.create(record);
    },
    async acquireLock(ownerId, ttlMs) {
      await ensureMetadata();
      const current = now();
      const expiresAt = new Date(current.getTime() + ttlMs);
      const claimed = await MigrationLock.findOneAndUpdate(
        { lockId: LOCK_ID, $or: [{ ownerId }, { expiresAt: { $lte: current } }] },
        { $set: { ownerId, acquiredAt: current, expiresAt } },
        { new: true }
      );
      if (claimed) return true;
      try {
        await MigrationLock.create({ lockId: LOCK_ID, ownerId, acquiredAt: current, expiresAt });
        return true;
      } catch (error) {
        if ((error as { code?: number }).code === 11000) return false;
        throw error;
      }
    },
    async refreshLock(ownerId, ttlMs) {
      await ensureMetadata();
      const current = now();
      const result = await MigrationLock.updateOne(
        { lockId: LOCK_ID, ownerId, expiresAt: { $gt: current } },
        { $set: { expiresAt: new Date(current.getTime() + ttlMs) } }
      );
      return result.modifiedCount === 1;
    },
    async releaseLock(ownerId) {
      await ensureMetadata();
      await MigrationLock.deleteOne({ lockId: LOCK_ID, ownerId });
    },
  };
}
