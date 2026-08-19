import { createHash, randomBytes } from "node:crypto";
import mongoose, { type Types } from "mongoose";
import { PrivacyErasure } from "../models/PrivacyErasure.js";
import { PrivacyRequest } from "../models/PrivacyRequest.js";
import { User } from "../models/User.js";

const deleteCollections = ["sessions", "accounttokens", "lessonprogresses", "lessonsubmissions", "assessmentattempts", "achievements", "resourcedownloads", "reminderpreferences"];
export async function executePrivacyErasure(options: { requestId: Types.ObjectId; actorId: Types.ObjectId; policyVersion: string; apply: boolean }) {
  const request = await PrivacyRequest.findOne({ _id: options.requestId, type: "deletion", status: { $in: ["pending", "in_review"] } }); if (!request) throw new Error("Actionable deletion request not found.");
  const counts: Record<string, number> = {}; for (const name of deleteCollections) counts[name] = await mongoose.connection.collection(name).countDocuments({ userId: request.userId }); counts.emaildeliveries = await mongoose.connection.collection("emaildeliveries").countDocuments({ userId: request.userId });
  if (!options.apply) return { mode: "dry_run" as const, summary: counts };
  const prior = await PrivacyErasure.findOne({ requestId: request._id }); if (prior) return { mode: prior.mode, summary: prior.summary };
  for (const name of deleteCollections) await mongoose.connection.collection(name).deleteMany({ userId: request.userId });
  await mongoose.connection.collection("emaildeliveries").updateMany({ userId: request.userId }, { $set: { to: "redacted@invalid.local", text: "[redacted by privacy erasure]" } });
  const pseudonym = createHash("sha256").update(String(request.userId)).digest("hex").slice(0, 16); await mongoose.connection.collection("orders").updateMany({ userId: request.userId }, { $set: { customerName: "Deleted learner", customerEmail: `deleted-${pseudonym}@invalid.local` } });
  await User.updateOne({ _id: request.userId }, { name: "Deleted learner", email: `deleted-${pseudonym}@invalid.local`, passwordHash: randomBytes(48).toString("hex"), status: "suspended" });
  request.set({ status: "completed", resolvedBy: options.actorId, resolvedAt: new Date(), resolutionNote: `Applied privacy erasure policy ${options.policyVersion}; legally retained commerce records were pseudonymized.` }); await request.save();
  const record = await PrivacyErasure.create({ requestId: request._id, userId: request.userId, policyVersion: options.policyVersion, mode: "applied", summary: counts, executedBy: options.actorId }); return { mode: "applied" as const, summary: record.summary };
}
