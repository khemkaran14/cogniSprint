import Tool from "../models/Tool.js";
import Category from "../models/Category.js";
import Question from "../models/Question.js";
import { canViewAnswer, getEffectivePlan, DIFFICULTY_REQUIRED_PLAN } from "../utils/plans.js";
import { escapeRegex } from "../utils/regex.js";

// GET /api/content/tools
// Returns every tool grouped by its group, each with its categories and a
// question count per category -- this powers the home page "tool cloud".
export async function listTools(_req, res) {
  const tools = await Tool.find().sort({ order: 1, name: 1 }).lean();
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  const counts = await Question.aggregate([
    { $match: { published: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countByCategory = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  const categoriesByTool = {};
  for (const cat of categories) {
    const key = String(cat.tool);
    (categoriesByTool[key] ||= []).push({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      questionCount: countByCategory[String(cat._id)] || 0,
    });
  }

  const payload = tools.map((tool) => ({
    id: tool._id,
    name: tool.name,
    slug: tool.slug,
    group: tool.group,
    description: tool.description,
    categories: categoriesByTool[String(tool._id)] || [],
  }));

  res.json({ tools: payload });
}

// GET /api/content/tools/:slug
export async function getTool(req, res) {
  const tool = await Tool.findOne({ slug: req.params.slug }).lean();
  if (!tool) return res.status(404).json({ message: "Tool not found" });

  const categories = await Category.find({ tool: tool._id }).sort({ order: 1, name: 1 }).lean();
  const questionCounts = await Question.aggregate([
    { $match: { tool: tool._id, published: true } },
    { $group: { _id: { category: "$category", difficulty: "$difficulty" }, count: { $sum: 1 } } },
  ]);

  const byCategory = {};
  for (const row of questionCounts) {
    const key = String(row._id.category);
    byCategory[key] ||= { easy: 0, medium: 0, hard: 0 };
    byCategory[key][row._id.difficulty] = row.count;
  }

  res.json({
    tool,
    categories: categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      counts: byCategory[String(cat._id)] || { easy: 0, medium: 0, hard: 0 },
    })),
  });
}

// GET /api/content/tools/:slug/categories/:categorySlug/questions
// Answer gating: req.user is attached (if logged in) by attachUserIfPresent.
export async function getCategoryQuestions(req, res) {
  const tool = await Tool.findOne({ slug: req.params.slug }).lean();
  if (!tool) return res.status(404).json({ message: "Tool not found" });

  const category = await Category.findOne({ tool: tool._id, slug: req.params.categorySlug }).lean();
  if (!category) return res.status(404).json({ message: "Category not found" });

  const questions = await Question.find({ tool: tool._id, category: category._id, published: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const userPlan = getEffectivePlan(req.user);

  const payload = questions.map((q) => {
    const unlocked = canViewAnswer(userPlan, q.difficulty);
    return {
      id: q._id,
      question: q.question,
      difficulty: q.difficulty,
      requiredPlan: DIFFICULTY_REQUIRED_PLAN[q.difficulty],
      unlocked,
      answer: unlocked ? q.answer : null,
    };
  });

  res.json({ tool, category, questions: payload });
}

// GET /api/content/search?q=...
// Answer gating: req.user is attached (if logged in) by attachUserIfPresent.
export async function searchQuestions(req, res) {
  const q = (req.query.q || "").trim();
  if (q.length < 2) return res.json({ query: q, results: [] });

  const matches = await Question.find({ published: true, question: { $regex: escapeRegex(q), $options: "i" } })
    .populate("tool", "name slug")
    .populate("category", "name slug")
    .limit(30)
    .lean();

  const userPlan = getEffectivePlan(req.user);

  const results = matches.map((question) => {
    const unlocked = canViewAnswer(userPlan, question.difficulty);
    return {
      id: question._id,
      question: question.question,
      difficulty: question.difficulty,
      requiredPlan: DIFFICULTY_REQUIRED_PLAN[question.difficulty],
      unlocked,
      answer: unlocked ? question.answer : null,
      tool: { name: question.tool.name, slug: question.tool.slug },
      category: { name: question.category.name, slug: question.category.slug },
    };
  });

  res.json({ query: q, results });
}
