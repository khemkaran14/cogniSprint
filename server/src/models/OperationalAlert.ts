import { Schema, model } from "mongoose";

const operationalAlertSchema = new Schema({
  fingerprint: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ["payment_failure", "stale_order", "webhook_failure", "entitlement_mismatch", "email_failure", "reconciliation_review"], required: true, index: true },
  severity: { type: String, enum: ["warning", "critical"], required: true },
  status: { type: String, enum: ["open", "acknowledged", "resolved"], required: true, default: "open", index: true },
  title: { type: String, required: true, maxlength: 200 },
  details: { type: Schema.Types.Mixed, default: {} },
  firstSeenAt: { type: Date, required: true, default: Date.now },
  lastSeenAt: { type: Date, required: true, default: Date.now },
  occurrences: { type: Number, required: true, default: 0 },
  acknowledgedAt: { type: Date },
  resolvedAt: { type: Date },
}, { timestamps: true });

operationalAlertSchema.index({ status: 1, severity: 1, lastSeenAt: -1 });
export const OperationalAlert = model("OperationalAlert", operationalAlertSchema);
