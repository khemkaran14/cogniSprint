import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Entitlement } from "../models/Entitlement.js";
import type { OrderDoc } from "../models/Order.js";
import { generateVerificationToken } from "./auth.js";
import { sendEmail } from "./email.js";
import { formatINR } from "./pricing.js";

type OrderWithId = OrderDoc & { _id: unknown };

export function computeExpiresAt(accessDuration: string, accessDurationDays: number | undefined | null): Date | undefined {
  const now = Date.now();
  if (accessDuration === "one_year") return new Date(now + 365 * 24 * 60 * 60 * 1000);
  if (accessDuration === "fixed_days" && accessDurationDays) {
    return new Date(now + accessDurationDays * 24 * 60 * 60 * 1000);
  }
  return undefined; // lifetime / subscription (subscription renewal isn't modelled yet)
}

/**
 * Turns a paid Order into real course access: finds or creates the User,
 * creates the Entitlement (idempotent — safe to call twice for the same
 * order, e.g. once from the client verify callback and once from the
 * webhook), and sends the appropriate email. This is the single place
 * "payment succeeded" becomes "you can use the product."
 */
export async function grantEntitlementForOrder(order: OrderWithId): Promise<void> {
  const existing = await Entitlement.findOne({ orderId: order._id });
  if (existing) return; // already granted — nothing to do

  const product = await Product.findById(order.productId);
  if (!product) {
    console.error(`[entitlements] product ${order.productId} not found for order ${order._id}`);
    return;
  }

  let user = await User.findOne({ email: order.customerEmail.toLowerCase() });
  const isNewUser = !user;

  if (!user) {
    user = await User.create({
      name: order.customerName,
      email: order.customerEmail.toLowerCase(),
      phone: order.customerPhone,
      role: "student",
    });
  }

  // A returning user who already holds this entitlement (repeat purchase,
  // gift, etc.) — nothing more to grant, but still worth acknowledging.
  const alreadyEntitled = await Entitlement.findOne({ userId: user._id, productId: product._id });
  if (!alreadyEntitled) {
    await Entitlement.create({
      userId: user._id,
      productId: product._id,
      orderId: order._id,
      expiresAt: computeExpiresAt(product.accessDuration, product.accessDurationDays),
    });
  }

  const clientUrl = process.env.CLIENT_URL ?? "https://cognisprint.divyrs.com";

  if (isNewUser || !user.passwordHash) {
    const { rawToken, tokenHash } = generateVerificationToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: `You're in — set your password for ${product.name}`,
      text: `Thanks for purchasing ${product.name} (${formatINR(order.amount)}).\n\nSet a password for your account to log in and start your first lesson:\n${clientUrl}/reset-password?token=${rawToken}\n\nThis link expires in 24 hours.`,
    });
  } else {
    await sendEmail({
      to: user.email,
      subject: `Order confirmed — ${product.name}`,
      text: `Thanks for purchasing ${product.name} (${formatINR(order.amount)}). Log in at ${clientUrl}/login to get started.`,
    });
  }
}
