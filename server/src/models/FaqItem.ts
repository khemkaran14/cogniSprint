import { Schema, model, type InferSchemaType } from "mongoose";

const faqItemSchema = new Schema(
  {
    category: { type: String, required: true, enum: ["general", "purchase", "access", "content", "audience"] },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

export type FaqItemDoc = InferSchemaType<typeof faqItemSchema>;
export const FaqItem = model("FaqItem", faqItemSchema);
