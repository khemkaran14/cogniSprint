import { Router } from "express";
import { createOrderSchema, verifyPaymentSchema, refundSchema } from "../lib/validation.js";
import { Product } from "../models/Product.js";
import { Price } from "../models/Price.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { applyCoupon } from "../lib/pricing.js";
import {
  createRazorpayOrder,
  createRazorpayRefund,
  isRazorpayConfigured,
  verifyPaymentSignature,
} from "../lib/razorpay.js";
import { grantEntitlementForOrder } from "../lib/entitlements.js";
import { requireFreshRole } from "../middleware/auth.js";

export const checkoutRouter = Router();

checkoutRouter.get("/coupon/:code", async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), active: true }).lean();
  if (!coupon) return res.status(404).json({ error: "Invalid or expired coupon code." });

  res.json({
    code: coupon.code,
    label: coupon.label,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  });
});

checkoutRouter.get("/order/:providerOrderId", async (req, res) => {
  const order = await Order.findOne({ providerOrderId: req.params.providerOrderId })
    .populate("productId", "name")
    .lean();
  if (!order) return res.status(404).json({ error: "Order not found." });

  res.json({
    orderId: order.providerOrderId,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    productName: (order.productId as unknown as { name?: string } | null)?.name,
  });
});

checkoutRouter.post("/create-order", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  const { productSlug, couponCode, customer } = parsed.data;

  const product = await Product.findOne({ slug: productSlug, status: "active" });
  if (!product) return res.status(404).json({ error: "Product not found." });

  const price = await Price.findOne({ productId: product._id, active: true });
  if (!price) return res.status(404).json({ error: "No active price configured for this product." });

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(422).json({ error: "Invalid or expired coupon code." });
    }
  }

  const amount = applyCoupon(price.launchAmount, coupon);

  if (!isRazorpayConfigured()) {
    return res.status(501).json({
      error: "payment_provider_not_configured",
      message:
        "Payment processing is not connected in this environment yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable checkout.",
    });
  }

  const order = await Order.create({
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    productId: product._id,
    couponId: coupon?._id,
    amount,
    currency: price.currency,
    status: "pending",
  });

  try {
    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: price.currency,
      receipt: `cognisprint_${order._id}`,
      notes: { productSlug: product.slug, orderId: String(order._id) },
    });

    order.providerOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      productName: product.name,
    });
  } catch (error) {
    console.error("Failed to create Razorpay order", error);
    order.status = "failed";
    await order.save();
    res.status(502).json({ error: "Could not start payment. Please try again." });
  }
});

checkoutRouter.post("/verify", async (req, res) => {
  const parsed = verifyPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const isValid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    console.warn("Razorpay signature verification failed for order", razorpay_order_id);
    return res.status(400).json({ verified: false });
  }

  const order = await Order.findOneAndUpdate(
    { providerOrderId: razorpay_order_id },
    { status: "paid", providerPaymentId: razorpay_payment_id },
    { new: true }
  );

  if (order) {
    try {
      await grantEntitlementForOrder(order);
    } catch (error) {
      // The payment is genuinely verified and paid regardless of whether
      // entitlement/email delivery succeeds — log and let the webhook's
      // independent call to the same (idempotent) function catch it.
      console.error(`Failed to grant entitlement for order ${order._id}`, error);
    }
  }

  res.json({ verified: true, orderId: order?._id });
});

checkoutRouter.post("/refund", requireFreshRole("admin"), async (req, res) => {
  const parsed = refundSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  const order = await Order.findById(parsed.data.orderId);
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.status !== "paid") {
    return res.status(409).json({ error: `Only paid orders can be refunded (this order is ${order.status}).` });
  }
  if (!order.providerPaymentId) {
    return res.status(409).json({ error: "This order has no associated payment to refund." });
  }

  try {
    const refund = await createRazorpayRefund({
      paymentId: order.providerPaymentId,
      amount: order.amount,
      receipt: `refund_${order._id}`,
      notes: { orderId: String(order._id), reason: parsed.data.reason },
    });

    order.status = "refunded";
    await order.save();

    res.json({ success: true, refundId: refund.id, status: refund.status });
  } catch (error) {
    console.error(`Failed to refund order ${order._id}`, error);
    res.status(502).json({ error: "Could not process the refund. Please try again." });
  }
});
