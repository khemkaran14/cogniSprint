import { Schema, model, Types } from "mongoose";

const resourceDownloadSchema = new Schema({
  resourceId: { type: Types.ObjectId, ref: "LearningResource", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  entitlementId: { type: Types.ObjectId, ref: "Entitlement", required: true },
  resourceVersion: { type: Number, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, maxlength: 500 },
  downloadedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

resourceDownloadSchema.index({ userId: 1, downloadedAt: -1 });
export const ResourceDownload = model("ResourceDownload", resourceDownloadSchema);
