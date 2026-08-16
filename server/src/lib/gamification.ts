const DAY_MS = 86_400_000;

function utcDay(value: Date): number {
  return Math.floor(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()) / DAY_MS);
}

export function learningStats(progress: Array<{ status: string; bestScore: number; completedAt?: Date | null }>, now = new Date()) {
  const completed = progress.filter((item) => item.status === "completed");
  const completedDays = [...new Set(completed.flatMap((item) => item.completedAt ? [utcDay(item.completedAt)] : []))].sort((a, b) => b - a);
  const today = utcDay(now);
  let streak = 0;
  let expected = completedDays[0] === today ? today : today - 1;
  for (const day of completedDays) {
    if (day !== expected) break;
    streak += 1;
    expected -= 1;
  }
  const xp = completed.reduce((total, item) => total + 100 + Math.round(item.bestScore / 10) * 5, 0);
  const badges = [
    ...(completed.length >= 1 ? [{ key: "first-step", label: "First Step" }] : []),
    ...(completed.length >= 7 ? [{ key: "seven-lessons", label: "Seven Lessons" }] : []),
    ...(streak >= 7 ? [{ key: "week-streak", label: "Seven-Day Streak" }] : []),
    ...(completed.some((item) => item.bestScore === 100) ? [{ key: "perfect-score", label: "Perfect Score" }] : []),
  ];
  return { streak, xp, badges };
}
