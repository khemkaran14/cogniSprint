import { Schema, model, Types, type InferSchemaType } from "mongoose";

const entitlementSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true, index: true },
    sourceOrderId: { type: Types.ObjectId, ref: "Order", required: true },
    status: { type: String, enum: ["active", "revoked"], required: true, default: "active" },
    grantedAt: { type: Date, required: true, default: Date.now },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

entitlementSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type EntitlementDoc = InferSchemaType<typeof entitlementSchema>;
export const Entitlement = model("Entitlement", entitlementSchema);
