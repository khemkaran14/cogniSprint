import type {
  MentalMathQuestion,
  MemoryItem,
  PatternQuestion,
  ObservationSceneItem,
  ObservationQuestion,
  CriticalThinkingQuestion,
} from "@/types/challenge";

export const mentalMathQuestions: MentalMathQuestion[] = [
  { id: "mm-1", prompt: "8 + 15 = ?", answer: 23 },
  { id: "mm-2", prompt: "12 × 6 = ?", answer: 72 },
  { id: "mm-3", prompt: "144 ÷ 12 = ?", answer: 12 },
];

export const memoryItems: MemoryItem[] = [
  { id: "mem-1", label: "Lantern" },
  { id: "mem-2", label: "River" },
  { id: "mem-3", label: "Compass" },
  { id: "mem-4", label: "Ladder" },
  { id: "mem-5", label: "Ember" },
  { id: "mem-6", label: "Anchor" },
  { id: "mem-7", label: "Meadow" },
  { id: "mem-8", label: "Falcon" },
];

export const memoryDistractors = ["Harbor", "Thicket", "Cinder", "Prairie", "Tunnel", "Beacon"];

export const patternQuestions: PatternQuestion[] = [
  { id: "pat-1", sequence: ["2", "4", "6", "8", "?"], options: ["9", "10", "12", "14"], correctOption: "10" },
  { id: "pat-2", sequence: ["3", "6", "12", "24", "?"], options: ["30", "36", "48", "60"], correctOption: "48" },
  { id: "pat-3", sequence: ["1", "4", "9", "16", "?"], options: ["20", "24", "25", "30"], correctOption: "25" },
];

export const observationScene: ObservationSceneItem[] = [
  { id: "obs-1", icon: "Triangle", color: "var(--color-skill-math)", label: "Blue triangle" },
  { id: "obs-2", icon: "Circle", color: "var(--color-skill-logic)", label: "Orange circle" },
  { id: "obs-3", icon: "Square", color: "var(--color-skill-memory)", label: "Violet square" },
  { id: "obs-4", icon: "Circle", color: "var(--color-skill-focus)", label: "Green circle" },
  { id: "obs-5", icon: "Star", color: "var(--color-skill-observation)", label: "Cyan star" },
  { id: "obs-6", icon: "Triangle", color: "var(--color-skill-critical)", label: "Red triangle" },
  { id: "obs-7", icon: "Circle", color: "var(--color-skill-math)", label: "Blue circle" },
];

export const observationQuestions: ObservationQuestion[] = [
  { id: "obs-q1", prompt: "How many circles were in the scene?", options: ["1", "2", "3", "4"], correctOption: "3" },
  { id: "obs-q2", prompt: "What colour was the star?", options: ["Blue", "Cyan", "Violet", "Red"], correctOption: "Cyan" },
  { id: "obs-q3", prompt: "How many triangles were in the scene?", options: ["1", "2", "3", "4"], correctOption: "2" },
];

export const criticalThinkingQuestions: CriticalThinkingQuestion[] = [
  {
    id: "ct-1",
    prompt: "A train leaves the station every 20 minutes. If one just left 8 minutes ago, how long until the next one?",
    options: ["8 minutes", "12 minutes", "16 minutes", "20 minutes"],
    correctOption: "12 minutes",
    explanation: "20 minutes total minus the 8 minutes already elapsed leaves 12 minutes.",
  },
  {
    id: "ct-2",
    prompt: "You need to choose between two routes: one is shorter but often has traffic, the other is longer but reliably clear. You have an important meeting. Which factor matters most?",
    options: ["Distance alone", "Predictability of arrival time", "Which route is prettier", "Fuel cost only"],
    correctOption: "Predictability of arrival time",
    explanation: "For a time-sensitive commitment, a reliable arrival time is usually more valuable than a shorter but unpredictable route.",
  },
];
