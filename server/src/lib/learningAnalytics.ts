export const SKILLS = ["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"] as const;
export type SkillKey = (typeof SKILLS)[number];

export type AnalyticsModule = { id: string; title: string; position: number; skills: string[] };
export type AnalyticsLesson = { id: string; moduleId: string; title: string };
export type AnalyticsProgress = { lessonId: string; status: string; bestScore: number; attempts: number; completedAt?: Date | null };
export type AnalyticsSubmission = { lessonId: string; score: number; correct: number; total: number; durationSeconds: number; createdAt: Date };

const round = (value: number) => Math.round(value * 10) / 10;

export function buildLearningAnalytics(options: {
  modules: AnalyticsModule[];
  lessons: AnalyticsLesson[];
  progress: AnalyticsProgress[];
  submissions: AnalyticsSubmission[];
  timezone: string;
  now?: Date;
}) {
  const lessonById = new Map(options.lessons.map((lesson) => [lesson.id, lesson]));
  const moduleById = new Map(options.modules.map((module) => [module.id, module]));
  const progressByLesson = new Map(options.progress.map((item) => [item.lessonId, item]));
  const localDate = (value: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: options.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  const skillTotals = new Map<SkillKey, { scores: number[]; correct: number; total: number; seconds: number }>(
    SKILLS.map((skill) => [skill, { scores: [], correct: 0, total: 0, seconds: 0 }])
  );
  const activity = new Map<string, { date: string; attempts: number; completedLessons: number; durationSeconds: number; scoreTotal: number }>();
  for (const submission of options.submissions) {
    const lesson = lessonById.get(submission.lessonId);
    const module = lesson ? moduleById.get(lesson.moduleId) : undefined;
    if (!module) continue;
    for (const skill of module.skills.filter((value): value is SkillKey => SKILLS.includes(value as SkillKey))) {
      const totals = skillTotals.get(skill)!;
      totals.scores.push(submission.score);
      totals.correct += submission.correct;
      totals.total += submission.total;
      totals.seconds += submission.durationSeconds;
    }
    const date = localDate(submission.createdAt);
    const day = activity.get(date) ?? { date, attempts: 0, completedLessons: 0, durationSeconds: 0, scoreTotal: 0 };
    day.attempts += 1;
    day.durationSeconds += submission.durationSeconds;
    day.scoreTotal += submission.score;
    activity.set(date, day);
  }
  for (const item of options.progress) {
    if (item.status !== "completed" || !item.completedAt) continue;
    const date = localDate(item.completedAt);
    const day = activity.get(date) ?? { date, attempts: 0, completedLessons: 0, durationSeconds: 0, scoreTotal: 0 };
    day.completedLessons += 1;
    activity.set(date, day);
  }

  const modules = [...options.modules].sort((a, b) => a.position - b.position).map((module) => {
    const lessons = options.lessons.filter((lesson) => lesson.moduleId === module.id);
    const completed = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.status === "completed");
    const scores = lessons.flatMap((lesson) => {
      const score = progressByLesson.get(lesson.id)?.bestScore;
      return typeof score === "number" ? [score] : [];
    });
    return {
      id: module.id,
      title: module.title,
      skills: module.skills,
      totalLessons: lessons.length,
      completedLessons: completed.length,
      completionPercent: lessons.length ? round((completed.length / lessons.length) * 100) : 0,
      averageBestScore: scores.length ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    };
  });
  const skills = SKILLS.map((skill) => {
    const totals = skillTotals.get(skill)!;
    return {
      skill,
      attempts: totals.scores.length,
      averageScore: totals.scores.length ? round(totals.scores.reduce((sum, score) => sum + score, 0) / totals.scores.length) : null,
      accuracyPercent: totals.total ? round((totals.correct / totals.total) * 100) : null,
      durationSeconds: totals.seconds,
    };
  });
  const activityDays = [...activity.values()].sort((a, b) => a.date.localeCompare(b.date)).map((day) => ({
    date: day.date,
    attempts: day.attempts,
    completedLessons: day.completedLessons,
    durationSeconds: day.durationSeconds,
    averageScore: day.attempts ? round(day.scoreTotal / day.attempts) : null,
  }));
  const totalDurationSeconds = options.submissions.reduce((sum, item) => sum + item.durationSeconds, 0);
  const totalAttempts = options.submissions.length;
  const completedLessons = options.progress.filter((item) => item.status === "completed").length;
  return {
    generatedAt: (options.now ?? new Date()).toISOString(),
    timezone: options.timezone,
    summary: {
      totalLessons: options.lessons.length,
      completedLessons,
      completionPercent: options.lessons.length ? round((completedLessons / options.lessons.length) * 100) : 0,
      totalAttempts,
      totalDurationSeconds,
      averageScore: totalAttempts ? round(options.submissions.reduce((sum, item) => sum + item.score, 0) / totalAttempts) : null,
    },
    skills,
    modules,
    activity: activityDays,
  };
}

export type LearningAnalytics = ReturnType<typeof buildLearningAnalytics>;

export function analyticsCsv(analytics: LearningAnalytics): string {
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows: unknown[][] = [["section", "name", "attempts", "score_or_completion_percent", "accuracy_percent", "duration_seconds"]];
  for (const skill of analytics.skills) rows.push(["skill", skill.skill, skill.attempts, skill.averageScore, skill.accuracyPercent, skill.durationSeconds]);
  for (const module of analytics.modules) rows.push(["module", module.title, "", module.completionPercent, "", ""]);
  for (const day of analytics.activity) rows.push(["activity", day.date, day.attempts, day.averageScore, "", day.durationSeconds]);
  return rows.map((row) => row.map(escape).join(",")).join("\n") + "\n";
}
