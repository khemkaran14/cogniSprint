import { Schema, model, Types, type InferSchemaType } from "mongoose";

const orderSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    couponId: { type: Types.ObjectId, ref: "Coupon" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, required: true, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentProvider: { type: String, required: true, default: "razorpay" },
    providerOrderId: { type: String, unique: true, sparse: true, index: true },
    providerPaymentId: { type: String, unique: true, sparse: true },
    paidAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = model("Order", orderSchema);
