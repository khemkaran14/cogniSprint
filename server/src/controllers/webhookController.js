import crypto from "crypto";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { PLAN_DURATION_MS } from "../utils/plans.js";

// POST /api/payments/webhook
// Configure this URL in the Razorpay dashboard (Settings -> Webhooks) for the
// "payment.captured" event. Acts as a safety net if the client never calls
// /api/payments/verify (e.g. the browser closed right after paying).
export async function razorpayWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  if (!signature || signature !== expected) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = req.body;
  if (event.event === "payment.captured") {
    const paymentEntity = event.payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
    if (payment && payment.status !== "paid") {
      payment.razorpayPaymentId = paymentEntity.id;
      payment.status = "paid";
      await payment.save();

      const user = await User.findById(payment.user);
      if (user) {
        user.plan = payment.plan;
        user.billingPeriod = payment.billingPeriod || "monthly";
        user.planExpiresAt = new Date(Date.now() + PLAN_DURATION_MS[payment.billingPeriod || "monthly"]);
        await user.save();
      }
    }
  }

  res.json({ received: true });
}
