import { Entitlement } from "../models/Entitlement.js";

type PaidOrder = { _id: unknown; userId: unknown; productId: unknown; status: string };

/** Idempotently grants access. Safe to call from both payment verification paths. */
export async function grantPaidOrderEntitlement(order: PaidOrder | null) {
  if (!order || order.status !== "paid" || !order.userId || !order.productId) return null;
  return Entitlement.findOneAndUpdate(
    { userId: order.userId, productId: order.productId },
    { $set: { status: "active", sourceOrderId: order._id, revokedAt: null }, $setOnInsert: { grantedAt: new Date() } },
    { upsert: true, new: true }
  );
}

export async function revokeOrderEntitlement(order: PaidOrder | null) {
  if (!order || !order.userId || !order.productId) return null;
  return Entitlement.findOneAndUpdate(
    { userId: order.userId, productId: order.productId, sourceOrderId: order._id },
    { status: "revoked", revokedAt: new Date() },
    { new: true }
  );
}
