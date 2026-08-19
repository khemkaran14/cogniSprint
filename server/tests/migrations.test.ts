import { describe, expect, it, vi } from "vitest";
import type { AppliedMigration, Migration, MigrationStore } from "../src/migrations/types.js";
import { pendingMigrations, runMigrations, validateMigrationPlan } from "../src/migrations/runner.js";

function migration(id: string, checksumCharacter: string, up = vi.fn(async () => undefined)): Migration {
  return { id, checksum: `sha256:${checksumCharacter.repeat(64)}`, up };
}

function memoryStore(initial: AppliedMigration[] = [], lockAvailable = true): MigrationStore & { records: AppliedMigration[]; released: string[] } {
  const records = [...initial];
  const released: string[] = [];
  return {
    records,
    released,
    listApplied: async () => [...records],
    recordApplied: async (record) => { records.push(record); },
    acquireLock: async () => lockAvailable,
    refreshLock: async () => true,
    releaseLock: async (ownerId) => { released.push(ownerId); },
  };
}

describe("migration plan", () => {
  it("requires ordered, unique and checksummed migrations", () => {
    expect(() => validateMigrationPlan([
      migration("202608120002-second", "b"),
      migration("202608120001-first", "a"),
    ])).toThrow(/ascending/);
    expect(() => validateMigrationPlan([migration("bad-id", "a")])).toThrow(/Invalid migration ID/);
  });

  it("rejects edits to an applied migration", () => {
    const item = migration("202608120001-first", "a");
    expect(() => pendingMigrations([item], [{
      migrationId: item.id,
      checksum: `sha256:${"b".repeat(64)}`,
      appliedAt: new Date(),
      durationMs: 1,
    }])).toThrow(/changed checksum/);
  });

  it("rejects a database migration unknown to the deployed code", () => {
    expect(() => pendingMigrations([], [{
      migrationId: "202608120001-missing",
      checksum: `sha256:${"a".repeat(64)}`,
      appliedAt: new Date(),
      durationMs: 1,
    }])).toThrow(/unknown migration/);
  });
});

describe("runMigrations", () => {
  it("reports pending migrations without locking or applying in dry-run mode", async () => {
    const up = vi.fn(async () => undefined);
    const store = memoryStore();
    const result = await runMigrations({ migrations: [migration("202608120001-first", "a", up)], store, dryRun: true });
    expect(result).toEqual({ applied: [], pending: ["202608120001-first"] });
    expect(up).not.toHaveBeenCalled();
    expect(store.released).toEqual([]);
  });

  it("applies pending migrations in order and records each success", async () => {
    const calls: string[] = [];
    const items = [
      migration("202608120001-first", "a", vi.fn(async () => { calls.push("first"); })),
      migration("202608120002-second", "b", vi.fn(async () => { calls.push("second"); })),
    ];
    const store = memoryStore();
    const result = await runMigrations({ migrations: items, store, ownerId: "runner-1", log: () => undefined });
    expect(result.applied).toEqual(items.map((item) => item.id));
    expect(calls).toEqual(["first", "second"]);
    expect(store.records.map((record) => record.migrationId)).toEqual(result.applied);
    expect(store.released).toEqual(["runner-1"]);
  });

  it("does not record a failed migration and always releases its lock", async () => {
    const item = migration("202608120001-first", "a", vi.fn(async () => { throw new Error("boom"); }));
    const store = memoryStore();
    await expect(runMigrations({ migrations: [item], store, ownerId: "runner-1", log: () => undefined })).rejects.toThrow("boom");
    expect(store.records).toEqual([]);
    expect(store.released).toEqual(["runner-1"]);
  });

  it("renews the lease while a long migration is running", async () => {
    const store = memoryStore();
    const refresh = vi.spyOn(store, "refreshLock");
    const item = migration("202608120001-first", "a", vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 160));
    }));
    await runMigrations({ migrations: [item], store, ownerId: "runner-1", lockTtlMs: 300, log: () => undefined });
    expect(refresh.mock.calls.length).toBeGreaterThanOrEqual(3); // before, heartbeat, after
    expect(store.records).toHaveLength(1);
  });

  it("refuses to run when another process owns the lock", async () => {
    const store = memoryStore([], false);
    await expect(runMigrations({ migrations: [migration("202608120001-first", "a")], store })).rejects.toThrow(/Another migration process/);
  });
});
