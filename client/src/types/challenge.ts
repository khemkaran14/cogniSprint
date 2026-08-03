export type MentalMathQuestion = { id: string; prompt: string; answer: number };
export type MemoryItem = { id: string; label: string };
export type PatternQuestion = { id: string; sequence: string[]; options: string[]; correctOption: string };
export type ObservationSceneItem = { id: string; icon: string; color: string; label: string };
export type ObservationQuestion = { id: string; prompt: string; options: string[]; correctOption: string };
export type CriticalThinkingQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOption: string;
  explanation: string;
};

export type SkillKeyForChallenge = "mental-math" | "memory" | "logic" | "observation" | "critical-thinking";

export type SkillScore = {
  skill: SkillKeyForChallenge;
  correct: number;
  total: number;
  percentage: number;
};

export type ChallengeResult = {
  scores: SkillScore[];
  overallScore: number;
  durationSeconds: number;
  strongestSkill: SkillKeyForChallenge;
  focusSkill: SkillKeyForChallenge;
};
