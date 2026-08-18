import { Schema, model, Types } from "mongoose";

const auditEventSchema = new Schema({
  actorUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  requestId: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, required: true },
}, { timestamps: true });

auditEventSchema.index({ createdAt: -1 });
auditEventSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
export const AuditEvent = model("AuditEvent", auditEventSchema);
