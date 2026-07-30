import dotenv from "dotenv";
import slugify from "../utils/slugify.js";
import { connectDB } from "../config/db.js";
import Tool from "../models/Tool.js";
import Category from "../models/Category.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import { TOOLS, CLAUDE_CODE_QUESTIONS, placeholderQuestions } from "./data.js";

dotenv.config();

async function run() {
  await connectDB();

  console.log("Clearing existing content...");
  await Question.deleteMany({});
  await Category.deleteMany({});
  await Tool.deleteMany({});

  console.log("Seeding tools, categories and questions...");
  for (let toolIndex = 0; toolIndex < TOOLS.length; toolIndex++) {
    const t = TOOLS[toolIndex];
    const tool = await Tool.create({
      name: t.name,
      slug: t.slug,
      group: t.group,
      description: t.description,
      order: toolIndex,
    });

    for (let catIndex = 0; catIndex < t.categories.length; catIndex++) {
      const categoryName = t.categories[catIndex];
      const category = await Category.create({
        tool: tool._id,
        name: categoryName,
        slug: slugify(categoryName),
        order: catIndex,
      });

      const questions =
        t.slug === "claude" && categoryName === "Claude Code"
          ? CLAUDE_CODE_QUESTIONS
          : placeholderQuestions(t.name, categoryName);

      await Question.insertMany(
        questions.map((q, i) => ({
          tool: tool._id,
          category: category._id,
          question: q.question,
          answer: q.answer,
          difficulty: q.difficulty,
          order: i,
        }))
      );
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@aicareershield.com").toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    console.log(`Creating admin account (${adminEmail})...`);
    const admin = new User({ name: "Admin", email: adminEmail, role: "admin", plan: "premium" });
    await admin.setPassword(process.env.ADMIN_PASSWORD || "change-this-password");
    await admin.save();
  } else {
    console.log("Admin account already exists, skipping.");
  }

  console.log("Seed complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
