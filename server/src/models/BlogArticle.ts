import { Schema, model, type InferSchemaType } from "mongoose";

const blogSectionSchema = new Schema(
  {
    heading: { type: String, required: true },
    paragraphs: { type: [String], required: true },
  },
  { _id: false }
);

const blogArticleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    updatedAt2: { type: Date, required: true }, // avoid clashing with the timestamps plugin's updatedAt
    readingTimeMinutes: { type: Number, required: true },
    coverImage: { type: String, required: true },
    sections: { type: [blogSectionSchema], required: true },
  },
  { timestamps: true }
);

export type BlogArticleDoc = InferSchemaType<typeof blogArticleSchema>;
export const BlogArticle = model("BlogArticle", blogArticleSchema);
