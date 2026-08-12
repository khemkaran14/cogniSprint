import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { Product } from "../models/Product.js";
import { Price } from "../models/Price.js";
import { Coupon } from "../models/Coupon.js";
import { CurriculumModule } from "../models/Module.js";
import { FaqItem } from "../models/FaqItem.js";
import { BlogArticle } from "../models/BlogArticle.js";
import { Lesson } from "../models/Lesson.js";
import { productSeed, priceSeed, couponSeed, curriculumSeed, lessonSeed, faqSeed, blogSeed } from "./data.js";

async function run() {
  await connectDB();

  const product = await Product.findOneAndUpdate({ slug: productSeed.slug }, productSeed, {
    upsert: true,
    new: true,
  });
  console.info(`[seed] product: ${product.slug}`);

  await Price.findOneAndUpdate(
    { productId: product._id, active: true },
    { ...priceSeed, productId: product._id },
    { upsert: true }
  );
  console.info("[seed] price ready");

  await Coupon.findOneAndUpdate({ code: couponSeed.code }, couponSeed, { upsert: true });
  console.info(`[seed] coupon: ${couponSeed.code}`);

  for (const module of curriculumSeed) {
    await CurriculumModule.findOneAndUpdate({ slug: module.slug }, module, { upsert: true });
  }
  console.info(`[seed] ${curriculumSeed.length} curriculum modules ready`);

  for (const lesson of lessonSeed) {
    const { moduleSlug, ...lessonData } = lesson;
    const module = await CurriculumModule.findOne({ slug: moduleSlug });
    if (!module) throw new Error(`Cannot seed lesson: module ${moduleSlug} was not found.`);
    const prerequisiteSlug = "prerequisiteSlug" in lessonData ? lessonData.prerequisiteSlug : undefined;
    const prerequisite = prerequisiteSlug ? await Lesson.findOne({ slug: prerequisiteSlug }) : null;
    if (prerequisiteSlug && !prerequisite) throw new Error(`Cannot seed lesson: prerequisite ${prerequisiteSlug} was not found.`);
    const persistedLesson = { ...lessonData } as typeof lessonData & { prerequisiteSlug?: string };
    delete persistedLesson.prerequisiteSlug;
    await Lesson.findOneAndUpdate(
      { slug: lesson.slug },
      { ...persistedLesson, moduleId: module._id, prerequisiteLessonId: prerequisite?._id ?? null },
      { upsert: true }
    );
  }
  console.info(`[seed] ${lessonSeed.length} lessons ready`);

  await FaqItem.deleteMany({});
  await FaqItem.insertMany(faqSeed);
  console.info(`[seed] ${faqSeed.length} FAQ items ready`);

  for (const article of blogSeed) {
    await BlogArticle.findOneAndUpdate({ slug: article.slug }, article, { upsert: true });
  }
  console.info(`[seed] ${blogSeed.length} blog article(s) ready`);

  console.info("[seed] done");
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("[seed] failed:", error);
  process.exit(1);
});
