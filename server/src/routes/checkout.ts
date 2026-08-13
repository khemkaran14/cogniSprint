import { Router } from "express";
import { createOrderSchema, verifyPaymentSchema } from "../lib/validation.js";
import { Product } from "../models/Product.js";
import { Price } from "../models/Price.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { applyCoupon } from "../lib/pricing.js";
import { createRazorpayOrder, isRazorpayConfigured, verifyPaymentSignature } from "../lib/razorpay.js";
import { requireAuth } from "../middleware/auth.js";
import { grantPaidOrderEntitlement } from "../lib/entitlements.js";

export const checkoutRouter = Router();

checkoutRouter.get("/orders", requireAuth, async (_req, res, next) => {
  try {
    const orders = await Order.find({ userId: res.locals.user._id })
      .populate("productId", "name slug").select("productId amount currency status refundedAmount providerOrderId providerPaymentId paidAt refundedAt createdAt")
      .sort({ createdAt: -1 }).lean();
    res.json({ orders: orders.map((order) => ({ id: String(order._id), product: order.productId, amount: order.amount, currency: order.currency, status: order.status, refundedAmount: order.refundedAmount, providerOrderId: order.providerOrderId, providerPaymentId: order.providerPaymentId, paidAt: order.paidAt, refundedAt: order.refundedAt, createdAt: order.createdAt, receiptAvailable: ["paid", "partially_refunded", "refunded"].includes(order.status) })) });
  } catch (error) { next(error); }
});

checkoutRouter.get("/orders/:id/receipt", requireAuth, async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).json({ error: "Order not found." });
    const order = await Order.findOne({ _id: req.params.id, userId: res.locals.user._id, status: { $in: ["paid", "partially_refunded", "refunded"] } }).populate("productId", "name slug").lean();
    if (!order) return res.status(404).json({ error: "Receipt not found." });
    res.json({ receipt: { number: `CS-${String(order._id).slice(-10).toUpperCase()}`, orderId: String(order._id), providerOrderId: order.providerOrderId, providerPaymentId: order.providerPaymentId, customerName: order.customerName, customerEmail: order.customerEmail, product: order.productId, amount: order.amount, refundedAmount: order.refundedAmount, currency: order.currency, status: order.status, purchasedAt: order.paidAt ?? order.updatedAt, refundedAt: order.refundedAt } });
  } catch (error) { next(error); }
});

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

checkoutRouter.get("/order/:providerOrderId", requireAuth, async (req, res) => {
  const order = await Order.findOne({ providerOrderId: req.params.providerOrderId, userId: res.locals.user._id })
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

checkoutRouter.post("/create-order", requireAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  const { productSlug, couponCode, customer } = parsed.data;

  if (customer.email.toLowerCase() !== res.locals.user.email) {
    return res.status(422).json({ error: "Checkout email must match your signed-in account." });
  }

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
    userId: res.locals.user._id,
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

checkoutRouter.post("/verify", requireAuth, async (req, res) => {
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
    { providerOrderId: razorpay_order_id, userId: res.locals.user._id },
    [{ $set: { status: "paid", providerPaymentId: razorpay_payment_id, paidAt: { $ifNull: ["$paidAt", "$$NOW"] } } }],
    { new: true }
  );

  if (!order) return res.status(404).json({ verified: false, error: "Order not found." });
  await grantPaidOrderEntitlement(order);

  res.json({ verified: true, orderId: order._id, accessGranted: true });
});
