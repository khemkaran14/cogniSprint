import { Entitlement } from "../models/Entitlement.js";

type PaidOrder = { _id: unknown; userId: unknown; productId: unknown; status: string };

export function canRestoreEntitlementFromOrder(order: { status: string } | null | undefined) {
  return Boolean(order && ["paid", "partially_refunded", "disputed"].includes(order.status));
}

/** Idempotently grants access. Safe to call from both payment verification paths. */
export async function grantPaidOrderEntitlement(order: PaidOrder | null) {
  if (!order || order.status !== "paid" || !order.userId || !order.productId) return null;
  const filter = { userId: order.userId, productId: order.productId };
  const update = { $set: { status: "active", sourceOrderId: order._id, revokedAt: null }, $setOnInsert: { grantedAt: new Date() } };
  try {
    return await Entitlement.findOneAndUpdate(filter, update, { upsert: true, new: true });
  } catch (error) {
    // The signed callback and capture webhook can race on the first upsert.
    // The unique user/product index chooses one insert; the loser safely reapplies the state.
    if ((error as { code?: number }).code !== 11000) throw error;
    return Entitlement.findOneAndUpdate(filter, update.$set, { new: true });
  }
}

export async function revokeOrderEntitlement(order: PaidOrder | null) {
  if (!order || !order.userId || !order.productId) return null;
  return Entitlement.findOneAndUpdate(
    { userId: order.userId, productId: order.productId, sourceOrderId: order._id },
    { status: "revoked", revokedAt: new Date() },
    { new: true }
  );
}
