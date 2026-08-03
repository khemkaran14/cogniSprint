import type { ChallengeResult, SkillKeyForChallenge, SkillScore } from "@/types/challenge";

export function scoreSkill(skill: SkillKeyForChallenge, correct: number, total: number): SkillScore {
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { skill, correct, total, percentage };
}

export function buildChallengeResult(scores: SkillScore[], durationSeconds: number): ChallengeResult {
  const overallScore = scores.length === 0 ? 0 : Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length);
  const sorted = [...scores].sort((a, b) => b.percentage - a.percentage);
  const strongestSkill = sorted[0]?.skill ?? scores[0]!.skill;
  const focusSkill = sorted[sorted.length - 1]?.skill ?? scores[0]!.skill;
  return { scores, overallScore, durationSeconds, strongestSkill, focusSkill };
}

export function feedbackForScore(overallScore: number): string {
  if (overallScore >= 85) {
    return "Strong performance across the board — the full program will help you sharpen these skills further and keep them consistent.";
  }
  if (overallScore >= 60) {
    return "A solid result with room to grow in a specific area or two — a good sign that structured daily practice will help.";
  }
  return "A useful starting point. Everyone starts somewhere — 15 minutes a day of structured practice is exactly what builds these skills over time.";
}
