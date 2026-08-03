import { Schema, model, type InferSchemaType } from "mongoose";

const includeItemSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    productType: {
      type: String,
      required: true,
      enum: ["course", "workbook", "bundle", "subscription"],
    },
    accessDuration: {
      type: String,
      required: true,
      enum: ["lifetime", "one_year", "fixed_days", "subscription"],
    },
    accessDurationDays: { type: Number },
    status: { type: String, required: true, enum: ["active", "draft", "archived"], default: "active" },
    includes: { type: [includeItemSchema], default: [] },
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const Product = model("Product", productSchema);
