import { Schema, model, Types, type InferSchemaType } from "mongoose";

const entitlementSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    orderId: { type: Types.ObjectId, ref: "Order", required: true, unique: true },
    startsAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date }, // null/absent = lifetime access
    status: { type: String, required: true, enum: ["active", "expired", "revoked"], default: "active" },
  },
  { timestamps: true }
);

entitlementSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type EntitlementDoc = InferSchemaType<typeof entitlementSchema>;
export const Entitlement = model("Entitlement", entitlementSchema);
