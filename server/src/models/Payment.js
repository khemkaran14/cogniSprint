import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["pro", "premium"], required: true },
    billingPeriod: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    amount: { type: Number, required: true }, // in INR rupees
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
