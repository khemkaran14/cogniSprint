import UserQuestionState from "../models/UserQuestionState.js";
import Question from "../models/Question.js";

// GET /api/bookmarks/state?ids=id1,id2,...
// Bulk lookup so a list of questions can render bookmark/practiced icons
// without one request per question.
export async function getStateForQuestions(req, res) {
  const ids = (req.query.ids || "").split(",").filter(Boolean);
  if (ids.length === 0) return res.json({ state: {} });

  const rows = await UserQuestionState.find({ user: req.user._id, question: { $in: ids } }).lean();
  const state = Object.fromEntries(
    rows.map((r) => [String(r.question), { bookmarked: r.bookmarked, practiced: r.practiced }])
  );
  res.json({ state });
}

// POST /api/bookmarks/:questionId/toggle-bookmark
export async function toggleBookmark(req, res) {
  const { questionId } = req.params;
  const existing = await UserQuestionState.findOne({ user: req.user._id, question: questionId });
  const nextValue = !existing?.bookmarked;

  const state = await UserQuestionState.findOneAndUpdate(
    { user: req.user._id, question: questionId },
    { $set: { bookmarked: nextValue } },
    { upsert: true, new: true }
  );
  res.json({ bookmarked: state.bookmarked, practiced: state.practiced });
}

// POST /api/bookmarks/:questionId/toggle-practiced
export async function togglePracticed(req, res) {
  const { questionId } = req.params;
  const existing = await UserQuestionState.findOne({ user: req.user._id, question: questionId });
  const nextValue = !existing?.practiced;

  const state = await UserQuestionState.findOneAndUpdate(
    { user: req.user._id, question: questionId },
    { $set: { practiced: nextValue } },
    { upsert: true, new: true }
  );
  res.json({ bookmarked: state.bookmarked, practiced: state.practiced });
}

// GET /api/bookmarks/me — every question the user has bookmarked, with context.
export async function myBookmarks(req, res) {
  const rows = await UserQuestionState.find({ user: req.user._id, bookmarked: true })
    .sort({ updatedAt: -1 })
    .populate({
      path: "question",
      populate: [
        { path: "tool", select: "name slug" },
        { path: "category", select: "name slug" },
      ],
    })
    .lean();

  const bookmarks = rows
    .filter((r) => r.question)
    .map((r) => ({
      question: {
        id: r.question._id,
        question: r.question.question,
        difficulty: r.question.difficulty,
      },
      practiced: r.practiced,
      tool: r.question.tool,
      category: r.question.category,
    }));

  res.json({ bookmarks });
}

// GET /api/bookmarks/progress — simple counts for the dashboard.
export async function myProgress(req, res) {
  const [totalQuestions, practicedCount, bookmarkedCount] = await Promise.all([
    Question.countDocuments({ published: true }),
    UserQuestionState.countDocuments({ user: req.user._id, practiced: true }),
    UserQuestionState.countDocuments({ user: req.user._id, bookmarked: true }),
  ]);
  res.json({ totalQuestions, practicedCount, bookmarkedCount });
}
