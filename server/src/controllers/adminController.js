import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Tool from "../models/Tool.js";
import Category from "../models/Category.js";
import Question from "../models/Question.js";
import { PLANS } from "../utils/plans.js";

// ---------- Dashboard ----------

export async function getOverview(_req, res) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, newUsersThisWeek, planCounts, activeSubs, newSubsThisWeek] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    User.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }]),
    User.find({ plan: { $ne: "free" }, planExpiresAt: { $gt: now } }).select("plan billingPeriod").lean(),
    User.countDocuments({ plan: { $ne: "free" }, planExpiresAt: { $gt: now }, updatedAt: { $gte: weekAgo } }),
  ]);

  const planMix = { free: 0, pro: 0, premium: 0 };
  for (const row of planCounts) planMix[row._id] = row.count;

  // Yearly subscribers are normalized to a monthly-equivalent so MRR reflects
  // actual run-rate rather than double-counting a year's revenue every month.
  const mrr = activeSubs.reduce((sum, u) => {
    const yearly = u.billingPeriod === "yearly";
    return sum + (yearly ? PLANS[u.plan].yearly / 12 : PLANS[u.plan].monthly);
  }, 0);
  const activeSubscribers = activeSubs.length;
  const conversionRate = totalUsers ? ((activeSubscribers / totalUsers) * 100).toFixed(1) : "0.0";

  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const dailyRevenue = await Payment.aggregate([
    { $match: { status: "paid", createdAt: { $gte: fourteenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const recentPayments = await Payment.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    totalUsers,
    newUsersThisWeek,
    activeSubscribers,
    newSubsThisWeek,
    mrr: Math.round(mrr),
    conversionRate,
    planMix,
    dailyRevenue,
    recentPayments,
  });
}

// ---------- Users ----------

export async function listUsers(req, res) {
  const { search = "", plan, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (plan) filter.plan = plan;
  if (role) filter.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page: Number(page), limit: Number(limit) });
}

export async function updateUser(req, res) {
  const { role, plan, status, planExpiresAt } = req.body;
  const update = {};
  if (role) update.role = role;
  if (plan) update.plan = plan;
  if (status) update.status = status;
  if (planExpiresAt !== undefined) update.planExpiresAt = planExpiresAt;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
}

// ---------- Subscriptions ----------

export async function listSubscriptions(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const filter = { plan: { $ne: "free" } };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email plan billingPeriod planExpiresAt createdAt")
      .sort({ planExpiresAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ subscriptions: users, total, page: Number(page), limit: Number(limit) });
}

// ---------- Payments ----------

export async function listPayments(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Payment.countDocuments(filter),
  ]);

  res.json({ payments, total, page: Number(page), limit: Number(limit) });
}

// ---------- Content: Tools ----------

export async function createTool(req, res) {
  const tool = await Tool.create(req.body);
  res.status(201).json({ tool });
}

export async function updateTool(req, res) {
  const tool = await Tool.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tool) return res.status(404).json({ message: "Tool not found" });
  res.json({ tool });
}

export async function deleteTool(req, res) {
  const categories = await Category.find({ tool: req.params.id }).select("_id");
  const categoryIds = categories.map((c) => c._id);
  await Question.deleteMany({ category: { $in: categoryIds } });
  await Category.deleteMany({ tool: req.params.id });
  await Tool.findByIdAndDelete(req.params.id);
  res.json({ message: "Tool and its content deleted" });
}

// ---------- Content: Categories ----------

export async function createCategory(req, res) {
  const category = await Category.create(req.body);
  res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ category });
}

export async function deleteCategory(req, res) {
  await Question.deleteMany({ category: req.params.id });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category and its questions deleted" });
}

// ---------- Content: Questions ----------

export async function listQuestionsAdmin(req, res) {
  const { tool, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (tool) filter.tool = tool;
  if (category) filter.category = category;

  const skip = (Number(page) - 1) * Number(limit);
  const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate("tool", "name slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Question.countDocuments(filter),
  ]);

  res.json({ questions, total, page: Number(page), limit: Number(limit) });
}

export async function createQuestion(req, res) {
  const question = await Question.create(req.body);
  res.status(201).json({ question });
}

export async function updateQuestion(req, res) {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!question) return res.status(404).json({ message: "Question not found" });
  res.json({ question });
}

export async function deleteQuestion(req, res) {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ message: "Question deleted" });
}
