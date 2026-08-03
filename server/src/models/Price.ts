import { Schema, model, Types, type InferSchemaType } from "mongoose";

const priceSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true, index: true },
    currency: { type: String, required: true, default: "INR" },
    regularAmount: { type: Number, required: true }, // smallest currency unit (paise)
    launchAmount: { type: Number, required: true },
    active: { type: Boolean, required: true, default: true },
    launchEndsAt: { type: Date },
  },
  { timestamps: true }
);

export type PriceDoc = InferSchemaType<typeof priceSchema>;
export const Price = model("Price", priceSchema);
