import { Schema, model } from "mongoose";

const migrationSchema = new Schema(
  {
    migrationId: { type: String, required: true, unique: true, index: true },
    checksum: { type: String, required: true },
    appliedAt: { type: Date, required: true, default: Date.now },
    durationMs: { type: Number, required: true, min: 0 },
  },
  { versionKey: false }
);

const migrationLockSchema = new Schema(
  {
    lockId: { type: String, required: true, unique: true, default: "database-migrations" },
    ownerId: { type: String, required: true },
    acquiredAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { versionKey: false }
);

export const MigrationRecord = model("Migration", migrationSchema);
export const MigrationLock = model("MigrationLock", migrationLockSchema);
