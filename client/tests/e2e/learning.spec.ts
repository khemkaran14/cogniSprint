import { expect, test, type Page } from "@playwright/test";

const user = { id: "user_1", name: "Asha Rao", email: "asha@example.com", role: "learner", emailVerified: true };
const lesson = {
  slug: "build-your-15-minute-routine",
  title: "Build Your 15-Minute Routine",
  summary: "Create a small, repeatable practice cue that fits your day.",
  estimatedMinutes: 8,
  passingScore: 60,
  content: ["Consistency starts with a reliable cue."],
  exercises: [{ prompt: "Which plan is easiest to repeat?", options: ["Wait for inspiration", "Practise after breakfast"] }],
  progress: { status: "started", bestScore: 0, draftAnswers: [1] },
  navigation: { previous: null, next: { slug: "accuracy-before-speed", title: "Accuracy Before Speed", available: false } },
};

async function mockLearner(page: Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user } }));
  await page.route("**/api/learning/dashboard", (route) => route.fulfill({ json: {
    summary: { totalLessons: 3, completedLessons: 0, programDay: 1, timezone: "Asia/Kolkata", courseComplete: false, streak: 0, xp: 0, badges: [] },
    continueLesson: { _id: "lesson_1", ...lesson, availability: { available: true, lockReason: null } },
    modules: [{
      _id: "module_1", position: 1, title: "Getting Started", description: "Build a sustainable routine.",
      completion: { totalLessons: 2, completedLessons: 0 },
      lessons: [
        { _id: "lesson_1", ...lesson, availability: { available: true, lockReason: null } },
        { _id: "lesson_2", slug: "accuracy-before-speed", title: "Accuracy Before Speed", summary: "Build accuracy first.", estimatedMinutes: 7, unlockDay: 2, progress: null, availability: { available: false, lockReason: "scheduled" } },
      ],
    }],
  } }));
}

test("learner dashboard shows continue, schedule, progress and timezone controls", async ({ page }) => {
  await mockLearner(page);
  await page.goto("/learn");
  await expect(page.getByRole("heading", { name: "Welcome back, Asha Rao" })).toBeVisible();
  await expect(page.getByRole("heading", { name: lesson.title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Resume lesson" })).toHaveAttribute("href", `/learn/lessons/${lesson.slug}`);
  await expect(page.getByText("Day 2")).toBeVisible();
  await expect(page.getByLabel("Learning timezone")).toHaveValue("Asia/Kolkata");
});

test("lesson restores a draft, saves edits and renders a server-scored result", async ({ page }) => {
  await mockLearner(page);
  let savedDraft: unknown;
  await page.route(`**/api/learning/lessons/${lesson.slug}`, (route) => route.fulfill({ json: lesson }));
  await page.route(`**/api/learning/lessons/${lesson.slug}/draft`, async (route) => {
    savedDraft = route.request().postDataJSON();
    await route.fulfill({ json: { saved: true } });
  });
  await page.route(`**/api/learning/lessons/${lesson.slug}/complete`, (route) => route.fulfill({ json: {
    score: 100, correct: 1, total: 1, passed: true, duplicate: false,
    explanations: ["A stable cue makes practice easier to repeat."],
    nextLesson: { slug: "accuracy-before-speed", title: "Accuracy Before Speed", available: true },
  } }));
  await page.goto(`/learn/lessons/${lesson.slug}`);
  await expect(page.getByRole("radio", { name: "Practise after breakfast" })).toBeChecked();
  await page.getByRole("radio", { name: "Wait for inspiration" }).check();
  await expect.poll(() => savedDraft).toEqual({ answers: [0] });
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await expect(page.getByText("Lesson complete — 100%")).toBeVisible();
  await expect(page.getByRole("link", { name: /Accuracy Before Speed/ })).toBeVisible();
});

test("locked lesson explains why access is unavailable", async ({ page }) => {
  await mockLearner(page);
  await page.route("**/api/learning/lessons/accuracy-before-speed", (route) => route.fulfill({ status: 423, json: { error: "This lesson unlocks on program day 2." } }));
  await page.goto("/learn/lessons/accuracy-before-speed");
  await expect(page.getByText("This lesson unlocks on program day 2.")).toBeVisible();
});

test("progress analytics presents summaries, accessible tables and CSV export", async ({ page }) => {
  await mockLearner(page);
  await page.route("**/api/learning/analytics", (route) => route.fulfill({ json: {
    generatedAt: "2026-08-12T12:00:00.000Z", timezone: "Asia/Kolkata",
    summary: { totalLessons: 3, completedLessons: 1, completionPercent: 33.3, totalAttempts: 2, totalDurationSeconds: 600, averageScore: 85 },
    skills: [
      { skill: "focus", attempts: 2, averageScore: 85, accuracyPercent: 85, durationSeconds: 600 },
      { skill: "mental-math", attempts: 0, averageScore: null, accuracyPercent: null, durationSeconds: 0 },
    ],
    modules: [{ id: "module_1", title: "Getting Started", totalLessons: 3, completedLessons: 1, completionPercent: 33.3, averageBestScore: 85 }],
    activity: [{ date: "2026-08-12", attempts: 2, completedLessons: 1, durationSeconds: 600, averageScore: 85 }],
  } }));
  await page.goto("/learn/progress");
  await expect(page.getByRole("heading", { name: "Your learning progress" })).toBeVisible();
  await expect(page.getByText("85%", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Export CSV" })).toHaveAttribute("href", /\/api\/learning\/analytics\.csv$/);
});

test("monthly assessment hides answer keys and renders server-scored skill results", async ({ page }) => {
  await mockLearner(page);
  const assessment = { slug: "month-1-foundations-check", title: "Month 1 Foundations Check", description: "Baseline", questions: [
    { prompt: "What is 48 + 27?", skill: "mental-math", options: ["65", "75", "85"] },
    { prompt: "Which item differs?", skill: "observation", options: ["AB12", "AB12", "AB21"] },
  ] };
  await page.route("**/api/assessments/month-1-foundations-check", (route) => route.fulfill({ json: { assessment, attempts: [] } }));
  await page.route("**/api/assessments/month-1-foundations-check/submit", (route) => route.fulfill({ status: 201, json: { attempt: { score: 100, correct: 2, total: 2, passed: true, skillResults: [{ skill: "mental-math", score: 100 }, { skill: "observation", score: 100 }] } } }));
  await page.goto("/learn/assessments/month-1-foundations-check");
  await page.getByRole("radio", { name: "75" }).check();
  await page.getByRole("radio", { name: "AB21" }).check();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByRole("heading", { name: "100%" })).toBeVisible();
  await expect(page.getByText("2 of 2 correct · Passed")).toBeVisible();
  await expect(page.getByText("mental-math:")).toBeVisible();
});

test("issued certificate is printable and links to public verification", async ({ page }) => {
  await mockLearner(page);
  await page.route("**/api/certificates/status", (route) => route.fulfill({ json: {
    publishedLessons: 365, completedLessons: 365, requiredLessons: 365, eligible: true,
    certificate: { learnerName: "Asha Rao", verificationCode: "CERTIFICATE123", issuedAt: "2026-08-12T12:00:00.000Z", emailDeliveryStatus: "sent" },
  } }));
  await page.goto("/learn/certificate");
  await expect(page.getByRole("heading", { name: "CogniSprint Complete" })).toBeVisible();
  await expect(page.getByText("Asha Rao", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print or save PDF" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Public verification" })).toHaveAttribute("href", "/certificates/verify/CERTIFICATE123");
});

test("public certificate verification handles a valid code", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, json: { user: null } }));
  await page.route("**/api/certificates/verify/CERTIFICATE123", (route) => route.fulfill({ json: { valid: true, learnerName: "Asha Rao", issuedAt: "2026-08-12T12:00:00.000Z", product: { name: "CogniSprint Complete" } } }));
  await page.goto("/certificates/verify/CERTIFICATE123");
  await expect(page.getByRole("heading", { name: "Valid certificate" })).toBeVisible();
  await expect(page.getByText("Asha Rao")).toBeVisible();
});
