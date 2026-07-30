import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { planPrice, PLAN_DURATION_MS } from "../utils/plans.js";

// POST /api/payments/order  { plan: "pro" | "premium", billingPeriod?: "monthly" | "yearly" }
export async function createOrder(req, res) {
  const { plan, billingPeriod = "monthly" } = req.body;
  if (!["pro", "premium"].includes(plan)) {
    return res.status(400).json({ message: "Invalid plan" });
  }
  if (!["monthly", "yearly"].includes(billingPeriod)) {
    return res.status(400).json({ message: "Invalid billing period" });
  }

  const amount = planPrice(plan, billingPeriod); // INR
  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: "INR",
    receipt: `acs_${req.user._id}_${Date.now()}`,
    notes: { userId: String(req.user._id), plan, billingPeriod },
  });

  await Payment.create({
    user: req.user._id,
    plan,
    billingPeriod,
    amount,
    razorpayOrderId: order.id,
    status: "created",
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}

// POST /api/payments/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment verification fields" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment signature verification failed" });
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, user: req.user._id });
  if (!payment) return res.status(404).json({ message: "Order not found" });

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "paid";
  await payment.save();

  const user = await User.findById(req.user._id);
  user.plan = payment.plan;
  user.billingPeriod = payment.billingPeriod || "monthly";
  user.planExpiresAt = new Date(Date.now() + PLAN_DURATION_MS[payment.billingPeriod || "monthly"]);
  await user.save();

  res.json({ message: "Payment verified", user: user.toSafeJSON() });
}

// GET /api/payments/me — the current user's payment history
export async function myPayments(req, res) {
  const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ payments });
}
