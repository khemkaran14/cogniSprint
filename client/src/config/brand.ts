export const brand = {
  name: "CogniSprint",
  legalName: "CogniSprint",
  tagline: "Published Preview • Enrollment Closed",
  heroHeadline: "Explore CogniSprint’s Published Learning Preview",
  heroSubheadline:
    "Try the free challenge and review the currently published foundation material while the complete curriculum undergoes authoring and independent review.",
  heroMicrocopy: "Published inventory verified from the learning database • Paid enrollment currently unavailable",
  primaryCta: "View Availability",
  secondaryCta: "Try a Free Challenge",
  positioningStatement:
    "CogniSprint is an educational skills-practice platform in development. Published inventory is reported directly from the learning database; the larger curriculum shown on this site is a roadmap, not currently delivered content.",
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
