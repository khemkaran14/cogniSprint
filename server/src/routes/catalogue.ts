import { Router } from "express";
import { Product } from "../models/Product.js";
import { Price } from "../models/Price.js";
import { CurriculumModule } from "../models/Module.js";
import { FaqItem } from "../models/FaqItem.js";
import { BlogArticle } from "../models/BlogArticle.js";
import { isEnrollmentOpen } from "../lib/availability.js";

export const catalogueRouter = Router();

catalogueRouter.get("/products", async (_req, res) => {
  if (!isEnrollmentOpen()) return res.json([]);
  const products = await Product.find({ status: "active" }).lean();
  const withPrices = await Promise.all(
    products.map(async (product) => {
      const price = await Price.findOne({ productId: product._id, active: true }).lean();
      return { ...product, price };
    })
  );
  res.json(withPrices);
});

catalogueRouter.get("/products/:slug", async (req, res) => {
  if (!isEnrollmentOpen()) return res.status(404).json({ error: "Enrollment is currently closed." });
  const product = await Product.findOne({ slug: req.params.slug, status: "active" }).lean();
  if (!product) return res.status(404).json({ error: "Product not found." });

  const price = await Price.findOne({ productId: product._id, active: true }).lean();
  res.json({ ...product, price });
});

catalogueRouter.get("/curriculum", async (_req, res) => {
  const modules = await CurriculumModule.find().sort({ position: 1 }).lean();
  res.json(modules);
});

catalogueRouter.get("/faq", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const filter = category ? { category } : {};
  const items = await FaqItem.find(filter).lean();
  res.json(items);
});

catalogueRouter.get("/blog", async (_req, res) => {
  const articles = await BlogArticle.find()
    .select("-sections")
    .sort({ publishedAt: -1 })
    .lean();
  res.json(articles);
});

catalogueRouter.get("/blog/:slug", async (req, res) => {
  const article = await BlogArticle.findOne({ slug: req.params.slug }).lean();
  if (!article) return res.status(404).json({ error: "Article not found." });
  res.json(article);
});
