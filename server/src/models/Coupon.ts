import { Schema, model, type InferSchemaType } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    label: { type: String, required: true },
    discountType: { type: String, required: true, enum: ["percentage", "flat"] },
    discountValue: { type: Number, required: true, min: 0 },
    active: { type: Boolean, required: true, default: true },
    startAt: { type: Date },
    endAt: { type: Date },
    usageLimit: { type: Number },
    timesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type CouponDoc = InferSchemaType<typeof couponSchema>;
export const Coupon = model("Coupon", couponSchema);
