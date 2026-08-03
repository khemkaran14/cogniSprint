export const brand = {
  name: "CogniSprint",
  legalName: "CogniSprint",
  tagline: "Train Smarter. Think Faster. Every Day.",
  heroHeadline: "Train Your Brain in 15 Minutes a Day",
  heroSubheadline:
    "Build stronger mental math, memory, focus, reasoning and problem-solving skills through structured daily practice.",
  heroMicrocopy: "Designed for ages 10+ • Printable and digital • No special equipment required",
  primaryCta: "Start Your Training",
  secondaryCta: "Try a Free Challenge",
  positioningStatement:
    "CogniSprint is a structured 365-day brain-training and cognitive skills practice program that combines mental mathematics, memory, focus, reasoning, observation and problem-solving exercises into a simple 15-minute daily routine.",
  supportEmail: "support@cognisprint.com",
  contactEmail: "hello@cognisprint.com",
  company: { owner: "Divyrs Systems" },
} as const;

export const skillCategories = [
  { key: "mental-math", label: "Mental Math", shortLabel: "Math", description: "Faster, more confident mental calculation without reaching for a calculator.", color: "var(--color-skill-math)", icon: "Calculator" },
  { key: "memory", label: "Memory", shortLabel: "Memory", description: "Practical memory techniques for names, numbers, lists and sequences.", color: "var(--color-skill-memory)", icon: "BrainCircuit" },
  { key: "focus", label: "Focus", shortLabel: "Focus", description: "Short drills that build sustained attention and reduce distraction.", color: "var(--color-skill-focus)", icon: "Target" },
  { key: "logic", label: "Logical Reasoning", shortLabel: "Logic", description: "Sequences, patterns and structured reasoning problems.", color: "var(--color-skill-logic)", icon: "Puzzle" },
  { key: "observation", label: "Observation", shortLabel: "Observation", description: "Noticing detail, comparing, and spotting what changed.", color: "var(--color-skill-observation)", icon: "Eye" },
  { key: "critical-thinking", label: "Critical Thinking", shortLabel: "Critical Thinking", description: "Everyday reasoning, decision-making and problem decomposition.", color: "var(--color-skill-critical)", icon: "Lightbulb" },
] as const;

export type SkillCategoryKey = (typeof skillCategories)[number]["key"];

export const educationalDisclaimer =
  "CogniSprint is an educational skills-practice program. It is designed to provide structured exercises in areas such as mental arithmetic, memory, attention, reasoning, observation and problem-solving. Individual outcomes vary depending on consistency, prior knowledge, age, health, sleep, lifestyle and effort. The program does not guarantee an increase in IQ, intelligence-test scores, academic performance, professional success or medical outcomes. It is not a substitute for medical, psychological or educational advice.";
