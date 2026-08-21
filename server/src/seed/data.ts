export const productSeed = {
  slug: "cognisprint-complete",
  name: "CogniSprint Learning Preview",
  shortName: "CogniSprint Preview",
  tagline: "A reviewed preview of the CogniSprint learning workflow.",
  description:
    "Published foundation content is reported from the live content inventory. The complete 365-day curriculum is authored as review-gated drafts; enrollment remains closed until independent review and approval are complete.",
  productType: "bundle" as const,
  accessDuration: "lifetime" as const,
  status: "draft" as const,
  includes: [
    { key: "guided_learning", label: "Published foundation lessons shown in the live inventory", enabled: true },
    { key: "practice_phase", label: "Structured practice phase (planned, unavailable)", enabled: false },
    { key: "daily_sessions", label: "365 daily training sessions (planned, unavailable)", enabled: false },
    { key: "mental_math", label: "Mental mathematics exercises, including tables up to 100", enabled: true },
    { key: "memory", label: "Memory technique lessons and recall drills", enabled: true },
    { key: "focus", label: "Focus and concentration drills", enabled: true },
    { key: "logic", label: "Logical reasoning challenges", enabled: true },
    { key: "critical_thinking", label: "Critical-thinking exercises", enabled: true },
    { key: "observation", label: "Observation activities", enabled: true },
    { key: "assessments", label: "Published assessment baselines shown in the live inventory", enabled: true },
    { key: "habit_tracker", label: "Habit and streak tracker", enabled: true },
    { key: "progress_sheets", label: "Printable progress sheets (planned, unavailable)", enabled: false },
    { key: "badges", label: "Achievement badges", enabled: true },
    { key: "workbook", label: "Downloadable workbook (planned, unavailable)", enabled: false },
    { key: "worksheets", label: "Printable worksheets (planned, unavailable)", enabled: false },
    { key: "certificate", label: "Completion certificate (unavailable until the reviewed program is complete)", enabled: false },
    { key: "updates", label: "Future content updates", enabled: true },
  ],
};

export const priceSeed = {
  currency: "INR",
  regularAmount: 249900,
  launchAmount: 99900,
  active: true,
};

export const couponSeed = {
  code: "LAUNCH100",
  label: "Launch offer",
  discountType: "flat" as const,
  discountValue: 10000,
  active: true,
};

export const curriculumSeed = [
  {
    position: 1, slug: "getting-started", title: "Getting Started",
    description: "Orientation to the 15-minute daily format, how scoring works, and how to build the practice habit from day one.",
    skills: ["focus"], lessonCount: 5, exerciseCount: 20, difficulty: "beginner", estimatedMinutes: 60, previewAvailable: true, phase: "guided_learning",
  },
  {
    position: 2, slug: "understanding-the-brain", title: "Understanding the Brain",
    description: "A plain-language introduction to attention, memory and reasoning, and why short daily practice compounds over a year.",
    skills: ["focus", "critical-thinking"], lessonCount: 6, exerciseCount: 18, difficulty: "beginner", estimatedMinutes: 70, previewAvailable: true, phase: "guided_learning",
  },
  {
    position: 3, slug: "mental-arithmetic-foundations", title: "Mental Arithmetic Foundations",
    description: "Core techniques for addition, subtraction, rounding and estimation without reaching for a calculator.",
    skills: ["mental-math"], lessonCount: 12, exerciseCount: 480, difficulty: "beginner", estimatedMinutes: 150, previewAvailable: true, phase: "guided_learning",
  },
  {
    position: 4, slug: "multiplication-tables", title: "Multiplication Tables",
    description: "Structured drilling of multiplication tables up to 100, built for speed and long-term recall rather than rote cramming.",
    skills: ["mental-math", "memory"], lessonCount: 14, exerciseCount: 700, difficulty: "intermediate", estimatedMinutes: 180, previewAvailable: true, phase: "guided_learning",
  },
  {
    position: 5, slug: "mental-calculation-bootcamp", title: "Mental Calculation Bootcamp",
    description: "Multi-step multiplication, division, percentages and squaring techniques used in competitive exams and daily life.",
    skills: ["mental-math"], lessonCount: 16, exerciseCount: 900, difficulty: "intermediate", estimatedMinutes: 200, previewAvailable: false, phase: "guided_learning",
  },
  {
    position: 6, slug: "memory-mastery", title: "Memory Mastery",
    description: "Practical memory techniques — chaining, association, the memory palace and spaced recall — applied to names, numbers and lists.",
    skills: ["memory"], lessonCount: 14, exerciseCount: 650, difficulty: "intermediate", estimatedMinutes: 190, previewAvailable: true, phase: "guided_learning",
  },
  {
    position: 7, slug: "focus-and-concentration", title: "Focus and Concentration",
    description: "Short, structured drills to build sustained attention and reduce susceptibility to distraction during study or work.",
    skills: ["focus"], lessonCount: 12, exerciseCount: 400, difficulty: "intermediate", estimatedMinutes: 140, previewAvailable: false, phase: "guided_learning",
  },
  {
    position: 8, slug: "observation-skills", title: "Observation Skills",
    description: "Exercises in noticing detail, comparison and change-spotting, built from illustrated scenes and structured tasks.",
    skills: ["observation"], lessonCount: 10, exerciseCount: 350, difficulty: "intermediate", estimatedMinutes: 120, previewAvailable: false, phase: "guided_learning",
  },
  {
    position: 9, slug: "processing-speed", title: "Processing Speed",
    description: "Timed drills across mental math, memory and pattern tasks designed to build quicker, more confident responses.",
    skills: ["mental-math", "focus"], lessonCount: 10, exerciseCount: 500, difficulty: "advanced", estimatedMinutes: 130, previewAvailable: false, phase: "structured_practice",
  },
  {
    position: 10, slug: "logical-thinking", title: "Logical Thinking",
    description: "Sequences, patterns, conditional reasoning and structured logic puzzles that build on one another in difficulty.",
    skills: ["logic"], lessonCount: 14, exerciseCount: 750, difficulty: "advanced", estimatedMinutes: 180, previewAvailable: true, phase: "structured_practice",
  },
  {
    position: 11, slug: "critical-thinking", title: "Critical Thinking",
    description: "Everyday reasoning, argument evaluation, and structured decision frameworks applied to realistic scenarios.",
    skills: ["critical-thinking"], lessonCount: 12, exerciseCount: 480, difficulty: "advanced", estimatedMinutes: 160, previewAvailable: false, phase: "structured_practice",
  },
  {
    position: 12, slug: "pattern-intelligence", title: "Pattern Intelligence",
    description: "Number, shape and sequence pattern challenges that build the same reasoning skills used in aptitude tests.",
    skills: ["logic", "observation"], lessonCount: 12, exerciseCount: 620, difficulty: "advanced", estimatedMinutes: 150, previewAvailable: false, phase: "structured_practice",
  },
  {
    position: 13, slug: "creative-thinking", title: "Creative Thinking",
    description: "Open-ended problem-solving exercises that practise generating and evaluating multiple possible solutions.",
    skills: ["critical-thinking"], lessonCount: 8, exerciseCount: 240, difficulty: "advanced", estimatedMinutes: 100, previewAvailable: false, phase: "structured_practice",
  },
  {
    position: 14, slug: "reading-intelligence", title: "Reading Intelligence",
    description: "Short passages paired with structured comprehension, inference and summary exercises.",
    skills: ["critical-thinking", "focus"], lessonCount: 8, exerciseCount: 200, difficulty: "advanced", estimatedMinutes: 100, previewAvailable: false, phase: "structured_practice",
  },
  {
    position: 15, slug: "decision-making", title: "Decision-Making",
    description: "Structured frameworks for weighing options and trade-offs, applied to realistic everyday and workplace scenarios.",
    skills: ["critical-thinking", "logic"], lessonCount: 8, exerciseCount: 220, difficulty: "advanced", estimatedMinutes: 100, previewAvailable: false, phase: "structured_practice",
  },
  {
    position: 16, slug: "everyday-intelligence", title: "Everyday Intelligence",
    description: "Practical applications — budgeting, planning, tipping, unit conversion and quick estimation for daily situations.",
    skills: ["mental-math", "critical-thinking"], lessonCount: 10, exerciseCount: 300, difficulty: "advanced", estimatedMinutes: 120, previewAvailable: false, phase: "structured_practice",
  },
  {
    position: 17, slug: "brain-games", title: "Brain Games",
    description: "A rotating library of short games — sequence memory, pattern matching, math sprints and reaction drills — for lighter practice days.",
    skills: ["memory", "logic", "focus"], lessonCount: 10, exerciseCount: 1000, difficulty: "intermediate", estimatedMinutes: 140, previewAvailable: true, phase: "structured_practice",
  },
  {
    position: 18, slug: "digital-detox", title: "Digital Detox",
    description: "A short module on building a healthier relationship with screen time and replacing passive scrolling with active practice.",
    skills: ["focus"], lessonCount: 4, exerciseCount: 40, difficulty: "beginner", estimatedMinutes: 40, previewAvailable: true, phase: "structured_practice",
  },
  {
    position: 19, slug: "monthly-assessments", title: "Planned Monthly Assessments",
    description: "Roadmap target for twelve reviewed assessments. Current publication counts come from the live content inventory.",
    skills: ["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"], lessonCount: 12, exerciseCount: 360, difficulty: "advanced", estimatedMinutes: 240, previewAvailable: false, phase: "assessment",
  },
  {
    position: 20, slug: "one-year-challenge", title: "Planned One-Year Challenge",
    description: "Unpublished roadmap target for a 365-day practice calendar. It is not currently available or included in a sale.",
    skills: ["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"], lessonCount: 365, exerciseCount: 3650, difficulty: "advanced", estimatedMinutes: 5475, previewAvailable: false, phase: "assessment",
  },
];

export { lessonSeed } from "./curriculum.js";

// Month 1 is a reviewed, published technical baseline. Months 2-12 are
// hand-authored drafts (status "in_review") — a qualified reviewer must
// approve and publish each before it is sold, per PRODUCTION_READINESS.md.
export const assessmentSeed = [
  {
    slug: "month-1-foundations-check", title: "Month 1 Foundations Check", month: 1,
    description: "A short baseline check across the six CogniSprint practice categories.",
    passingScore: 60, estimatedMinutes: 10, status: "published" as const,
    questions: [
      { skill: "mental-math", prompt: "What is 48 + 27?", options: ["65", "75", "85"], correctIndex: 1, explanation: "Split 27 into 20 and 7: 48 + 20 + 7 = 75." },
      { skill: "memory", prompt: "Which sequence exactly matches 7, 2, 9, 4?", options: ["7, 2, 9, 4", "7, 9, 2, 4", "2, 7, 9, 4"], correctIndex: 0, explanation: "The first option preserves every item and its order." },
      { skill: "focus", prompt: "How many times does the letter P appear in APPLE PIE?", options: ["2", "3", "4"], correctIndex: 1, explanation: "APPLE contains two Ps and PIE contains one." },
      { skill: "logic", prompt: "All tulips are flowers. This is a tulip. What follows?", options: ["It is a flower", "All flowers are tulips", "Nothing follows"], correctIndex: 0, explanation: "The stated rule applies to the identified tulip." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["AB12", "AB12", "AB21"], correctIndex: 2, explanation: "The final option reverses the two digits." },
      { skill: "critical-thinking", prompt: "A claim has no source. What is the best next step?", options: ["Share it immediately", "Check independent reliable evidence", "Assume it is false"], correctIndex: 1, explanation: "Verifying with reliable independent evidence is more justified than accepting or rejecting it without review." },
    ],
  },
  {
    slug: "month-2-number-sense-check", title: "Month 2 Number Sense Check", month: 2,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Number Sense month.",
    passingScore: 60, estimatedMinutes: 12, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 64 + 38?", options: ["92", "102", "112"], correctIndex: 1, explanation: "64 + 30 = 94, then + 8 = 102." },
      { skill: "memory", prompt: "Which sequence exactly matches 5, 1, 8, 3, 6?", options: ["5, 1, 8, 3, 6", "5, 8, 1, 3, 6", "6, 3, 8, 1, 5"], correctIndex: 0, explanation: "The first option preserves every digit in its original position." },
      { skill: "focus", prompt: "How many times does the letter S appear in SUCCESS IS SWEET?", options: ["4", "5", "6"], correctIndex: 1, explanation: "SUCCESS has three S's, IS has one, and SWEET has one, for five total." },
      { skill: "logic", prompt: "All engineers on this team use Python. Maria is an engineer on this team. What follows?", options: ["She uses Python", "Everyone who uses Python is an engineer on this team", "Nothing follows"], correctIndex: 0, explanation: "The stated rule applies directly to Maria once she's identified as an engineer on the team." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["7B4K", "7B4K", "7B4X"], correctIndex: 2, explanation: "The final option uses X where the others use K." },
      { skill: "critical-thinking", prompt: "A product claims \"9 out of 10 users prefer it\" without stating how many users were surveyed. What is the best response?", options: ["Trust the claim completely", "Check the sample size and methodology before trusting it", "Dismiss the claim as automatically false"], correctIndex: 1, explanation: "A ratio without a sample size could be based on as few as ten people; checking the methodology is more justified than blind trust or automatic dismissal." },
    ],
  },
  {
    slug: "month-3-working-memory-check", title: "Month 3 Working Memory Check", month: 3,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Working Memory month.",
    passingScore: 60, estimatedMinutes: 12, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 91 − 47?", options: ["34", "44", "54"], correctIndex: 1, explanation: "91 − 40 = 51, then − 7 = 44." },
      { skill: "memory", prompt: "Which sequence exactly matches 4, 7, 1, 9, 2, 5?", options: ["4, 7, 1, 9, 2, 5", "4, 1, 7, 9, 2, 5", "5, 2, 9, 1, 7, 4"], correctIndex: 0, explanation: "The first option preserves every digit in its original position." },
      { skill: "focus", prompt: "Scan D9D7DD2D. How many exact D characters appear?", options: ["4", "5", "6"], correctIndex: 1, explanation: "A left-to-right scan finds D at five positions; the digits are distractors." },
      { skill: "logic", prompt: "If the printer is out of paper, the error light turns orange. The error light is not orange. What follows?", options: ["The printer is not out of paper", "All printers are out of paper", "No conclusion is possible"], correctIndex: 0, explanation: "This is a valid inference: when the result described by the rule doesn't hold, the condition that would have produced it doesn't hold either." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["M3P7", "M3P7", "M3Q7"], correctIndex: 2, explanation: "The final option uses Q where the others use P." },
      { skill: "critical-thinking", prompt: "Two unrelated events happened in the same week, and a post claims one caused the other. What is the strongest response?", options: ["Assume causation immediately, since the timing lines up", "Look for evidence connecting them beyond mere timing", "Ignore the possibility that either event is real"], correctIndex: 1, explanation: "Timing alone does not establish causation; a proportionate response looks for evidence of an actual connection." },
    ],
  },
  {
    slug: "month-4-focused-attention-check", title: "Month 4 Focused Attention Check", month: 4,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Focused Attention month.",
    passingScore: 60, estimatedMinutes: 12, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 6 × 14?", options: ["74", "84", "94"], correctIndex: 1, explanation: "6 × 14 = 6 × 10 + 6 × 4 = 60 + 24 = 84." },
      { skill: "memory", prompt: "Study: chair, lantern, bridge, kettle. Which option preserves the exact order?", options: ["chair, lantern, bridge, kettle", "chair, bridge, lantern, kettle", "kettle, bridge, lantern, chair"], correctIndex: 0, explanation: "The first option retains every item in its original position." },
      { skill: "focus", prompt: "Count the exact word \"again\" in: \"try again fail again try again learn well\"", options: ["2", "3", "4"], correctIndex: 1, explanation: "Reading word by word finds \"again\" exactly three times." },
      { skill: "logic", prompt: "Every certified driver has passed the exam. Sam has passed the exam. What follows?", options: ["Sam is certified", "Nothing certain follows from this alone", "Sam is not certified"], correctIndex: 1, explanation: "Passing the exam is presented as necessary for certification, not sufficient on its own; concluding Sam is certified from this alone assumes more than the rule states." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["K9L3", "K9L3", "K9L8"], correctIndex: 2, explanation: "The final option ends in 8 where the others end in 3." },
      { skill: "critical-thinking", prompt: "A workout app shows a before/after photo pair with different lighting and camera angles as \"proof\" of results. What is the best response?", options: ["Accept the photos as strong proof", "Note that differing lighting and angles undermine a fair comparison", "Share the photos as conclusive evidence"], correctIndex: 1, explanation: "Inconsistent conditions between the two photos make a fair visual comparison unreliable, regardless of the claimed result." },
    ],
  },
  {
    slug: "month-5-patterns-and-logic-check", title: "Month 5 Patterns and Logic Check", month: 5,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Patterns and Logic month.",
    passingScore: 60, estimatedMinutes: 13, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 25% of 160?", options: ["30", "40", "50"], correctIndex: 1, explanation: "25% is one quarter of 160, which is 40." },
      { skill: "memory", prompt: "Which sequence exactly matches 8, 2, 5, 9, 1, 6?", options: ["8, 2, 5, 9, 1, 6", "8, 5, 2, 9, 1, 6", "6, 1, 9, 5, 2, 8"], correctIndex: 0, explanation: "The first option preserves every digit in its original position." },
      { skill: "focus", prompt: "Scan Y4YYY7Y1Y. How many exact Y characters appear?", options: ["5", "6", "7"], correctIndex: 1, explanation: "A left-to-right scan finds Y at six positions; the digits are distractors." },
      { skill: "logic", prompt: "2, 4, 8, 16, ?. What comes next?", options: ["24", "32", "20"], correctIndex: 1, explanation: "Each term doubles the previous one: 16 × 2 = 32." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["Q7W2", "Q7W2", "Q7M2"], correctIndex: 2, explanation: "The final option uses M where the others use W." },
      { skill: "critical-thinking", prompt: "A claim states: \"Every top performer wakes up at 5am, so waking early causes success.\" What is the flaw?", options: ["It is a fully valid causal claim", "It treats a common trait among successful people as a proven cause", "It contains too many words to evaluate"], correctIndex: 1, explanation: "A shared habit among successful people doesn't establish that the habit caused their success; other factors could explain both." },
    ],
  },
  {
    slug: "month-6-careful-observation-check", title: "Month 6 Careful Observation Check", month: 6,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Careful Observation month.",
    passingScore: 60, estimatedMinutes: 13, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 130 − 68?", options: ["52", "62", "72"], correctIndex: 1, explanation: "130 − 70 = 60, then + 2 = 62." },
      { skill: "memory", prompt: "Study: falcon, harbor, meadow. Which of these was NOT in that list?", options: ["Harbor", "Ember", "Falcon"], correctIndex: 1, explanation: "Falcon, harbor and meadow were shown; ember was not part of the original list." },
      { skill: "focus", prompt: "Count the exact word \"blue\" in: \"the blue sky the clear blue sea the blue horizon\"", options: ["2", "3", "4"], correctIndex: 1, explanation: "Reading word by word finds \"blue\" exactly three times." },
      { skill: "logic", prompt: "If the seal is broken, the warranty is void. The warranty is void. What follows?", options: ["The seal is broken", "Nothing certain follows from this alone", "The seal is not broken"], correctIndex: 1, explanation: "The warranty could be void for a different reason; concluding the seal is broken from this alone assumes the rule works in reverse, which it doesn't." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["9F3H", "9F3H", "9F8H"], correctIndex: 2, explanation: "The final option has 8 where the others have 3." },
      { skill: "critical-thinking", prompt: "A supplement label says \"clinically tested\" without citing a specific study. What is the best next step?", options: ["Trust the label completely", "Look for the specific study and its actual findings", "Ignore the product without checking anything"], correctIndex: 1, explanation: "An unsupported claim of testing is not itself evidence; the proportionate response is to look for the specific study behind it." },
    ],
  },
  {
    slug: "month-7-everyday-reasoning-check", title: "Month 7 Everyday Reasoning Check", month: 7,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Everyday Reasoning month.",
    passingScore: 65, estimatedMinutes: 13, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 45 × 3?", options: ["125", "135", "145"], correctIndex: 1, explanation: "45 × 3 = 40 × 3 + 5 × 3 = 120 + 15 = 135." },
      { skill: "memory", prompt: "Which sequence exactly matches 7, 3, 9, 2, 5, 8?", options: ["7, 3, 9, 2, 5, 8", "7, 9, 3, 2, 5, 8", "8, 5, 2, 9, 3, 7"], correctIndex: 0, explanation: "The first option preserves every digit in its original position." },
      { skill: "focus", prompt: "Scan N2NNN5N8N. How many exact N characters appear?", options: ["5", "6", "7"], correctIndex: 1, explanation: "A left-to-right scan finds N at six positions; the digits are distractors." },
      { skill: "logic", prompt: "If it rains, the picnic moves indoors. It is not raining. What follows about the picnic?", options: ["It stays outdoors as planned", "Nothing certain follows from this alone", "It moves indoors anyway"], correctIndex: 1, explanation: "The rule only states what happens if it rains; it says nothing about what happens otherwise, so no conclusion follows from the absence of rain alone." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["L6P9", "L6P9", "L6P0"], correctIndex: 2, explanation: "The final option ends in 0 where the others end in 9." },
      { skill: "critical-thinking", prompt: "A headline reads \"Study finds coffee cures fatigue,\" but the study only found a small, temporary alertness increase in 12 people. What is the issue?", options: ["The headline accurately reflects the study", "The headline significantly overstates a small, limited finding", "The study must be entirely fake"], correctIndex: 1, explanation: "A small, temporary effect in a dozen people is far short of a \"cure\"; the headline overstates what the study actually found." },
    ],
  },
  {
    slug: "month-8-processing-fluency-check", title: "Month 8 Processing Fluency Check", month: 8,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Processing Fluency month.",
    passingScore: 65, estimatedMinutes: 13, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 18 × 4?", options: ["62", "72", "82"], correctIndex: 1, explanation: "18 × 4 = 20 × 4 − 2 × 4 = 80 − 8 = 72." },
      { skill: "memory", prompt: "Study: velvet, canyon, ember. Which of these was NOT in that list?", options: ["Canyon", "Lantern", "Velvet"], correctIndex: 1, explanation: "Velvet, canyon and ember were shown; lantern was not part of the original list." },
      { skill: "focus", prompt: "Count the exact word \"fast\" in: \"think fast move fast act fast stay calm\"", options: ["2", "4", "3"], correctIndex: 2, explanation: "Reading word by word finds \"fast\" exactly three times." },
      { skill: "logic", prompt: "All valid tickets have a barcode. This ticket has no barcode. What follows?", options: ["It is not valid", "It is valid", "No conclusion is possible"], correctIndex: 0, explanation: "This is a valid inference: since every valid ticket has a barcode, a ticket without one cannot be valid." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["4D8N", "4B8N", "4D8N"], correctIndex: 1, explanation: "The middle option has B where the others have D." },
      { skill: "critical-thinking", prompt: "A reviewer gives a product 5 stars without disclosing they were paid to promote it. What is the concern?", options: ["There is no concern; reviews are always honest", "Undisclosed payment is a conflict of interest that can bias the review", "5-star reviews are always accurate"], correctIndex: 1, explanation: "An undisclosed financial incentive can bias a review's content, which is exactly why disclosure matters for judging its reliability." },
    ],
  },
  {
    slug: "month-9-flexible-problem-solving-check", title: "Month 9 Flexible Problem Solving Check", month: 9,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Flexible Problem Solving month.",
    passingScore: 65, estimatedMinutes: 14, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 210 ÷ 5?", options: ["32", "42", "52"], correctIndex: 1, explanation: "210 ÷ 5 = 42, since 42 × 5 = 210." },
      { skill: "memory", prompt: "Which sequence exactly matches 6, 9, 3, 7, 1, 4?", options: ["6, 9, 3, 7, 1, 4", "6, 3, 9, 7, 1, 4", "4, 1, 7, 3, 9, 6"], correctIndex: 0, explanation: "The first option preserves every digit in its original position." },
      { skill: "focus", prompt: "Scan F3FFF6F9F. How many exact F characters appear?", options: ["5", "7", "6"], correctIndex: 2, explanation: "A left-to-right scan finds F at six positions; the digits are distractors." },
      { skill: "logic", prompt: "Either the meeting is in Room A or Room B. It is not in Room A. What follows?", options: ["It is in Room B", "It is in Room A", "No conclusion is possible"], correctIndex: 0, explanation: "With exactly two stated possibilities, ruling out one leaves the other as the valid conclusion." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["V2X6", "V2X6", "V2X9"], correctIndex: 2, explanation: "The final option ends in 9 where the others end in 6." },
      { skill: "critical-thinking", prompt: "A friend says, \"I tried this method once and it didn't work, so it must be useless for everyone.\" What is the flaw?", options: ["A single personal attempt is too small a sample to generalize from", "The reasoning is completely valid as stated", "There is no flaw in this reasoning"], correctIndex: 0, explanation: "One person's single attempt cannot reliably establish how a method performs for everyone, given how much can vary between attempts and people." },
    ],
  },
  {
    slug: "month-10-decision-quality-check", title: "Month 10 Decision Quality Check", month: 10,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Decision Quality month.",
    passingScore: 65, estimatedMinutes: 14, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 15% of 240?", options: ["26", "36", "46"], correctIndex: 1, explanation: "10% of 240 is 24, and 5% is 12; 24 + 12 = 36." },
      { skill: "memory", prompt: "Study: harbor, quartz, meadow. Which of these was NOT in that list?", options: ["Quartz", "Lantern", "Meadow"], correctIndex: 1, explanation: "Harbor, quartz and meadow were shown; lantern was not part of the original list." },
      { skill: "focus", prompt: "Count the exact word \"plan\" in: \"make a plan follow the plan adjust the plan\"", options: ["2", "3", "4"], correctIndex: 1, explanation: "Reading word by word finds \"plan\" exactly three times." },
      { skill: "logic", prompt: "If the budget is approved, the project starts in March. The project did not start in March. What follows?", options: ["The budget was not approved", "The budget was approved", "No conclusion is possible"], correctIndex: 0, explanation: "This is a valid inference: since approval was said to guarantee a March start, the absence of a March start means approval didn't happen." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["8K4R", "8K4R", "8K4T"], correctIndex: 2, explanation: "The final option ends in T where the others end in R." },
      { skill: "critical-thinking", prompt: "One option is a free trial with a recurring charge hidden in fine print; the other is a clearly priced paid plan. What is the best decision approach?", options: ["Choose whichever is free without reading the terms", "Read the full terms of both options before deciding", "Always avoid free trials in every situation"], correctIndex: 1, explanation: "A sound decision compares the actual terms of each option rather than reacting to the headline price or avoiding a category outright." },
    ],
  },
  {
    slug: "month-11-integrated-challenges-check", title: "Month 11 Integrated Challenges Check", month: 11,
    description: "Checks progress across mental math, memory, focus, logic, observation and critical thinking after the Integrated Challenges month.",
    passingScore: 65, estimatedMinutes: 14, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 27 + 58?", options: ["75", "85", "95"], correctIndex: 1, explanation: "27 + 58 = (20 + 50) + (7 + 8) = 70 + 15 = 85." },
      { skill: "memory", prompt: "Which sequence exactly matches 5, 8, 2, 6, 9, 3?", options: ["5, 8, 2, 6, 9, 3", "5, 2, 8, 6, 9, 3", "3, 9, 6, 2, 8, 5"], correctIndex: 0, explanation: "The first option preserves every digit in its original position." },
      { skill: "focus", prompt: "Scan H7HHH4H2H. How many exact H characters appear?", options: ["5", "6", "8"], correctIndex: 1, explanation: "A left-to-right scan finds H at six positions; the digits are distractors." },
      { skill: "logic", prompt: "All certified batches pass inspection. All batches that pass inspection are shipped. This batch is certified. What follows?", options: ["It is shipped", "It failed inspection", "No conclusion is possible"], correctIndex: 0, explanation: "Chaining the two rules together — certified implies inspected, inspected implies shipped — gives a valid two-step conclusion." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["Z3B7", "Z3B7", "Z8B7"], correctIndex: 2, explanation: "The final option has 8 where the others have 3." },
      { skill: "critical-thinking", prompt: "A claim mixes a true statistic with an unsupported conclusion: \"Sales rose 20% this quarter, proving our new strategy is the best in the industry.\" What is the issue?", options: ["The statistic alone doesn't support the broader industry-wide claim", "The statistic is definitely false", "There is no issue with this reasoning"], correctIndex: 0, explanation: "A real internal statistic doesn't automatically establish an industry-wide superiority claim; the two are different scopes of claim entirely." },
    ],
  },
  {
    slug: "month-12-independent-mastery-check", title: "Month 12 Independent Mastery Check", month: 12,
    description: "The final checkpoint across mental math, memory, focus, logic, observation and critical thinking, closing out the one-year program.",
    passingScore: 65, estimatedMinutes: 15, status: "in_review" as const,
    reviewNote: "Hand-authored assessment draft. Pending independent educational review.",
    questions: [
      { skill: "mental-math", prompt: "What is 320 ÷ 8?", options: ["35", "40", "45"], correctIndex: 1, explanation: "320 ÷ 8 = 40, since 40 × 8 = 320." },
      { skill: "memory", prompt: "Study: compass, ledger, harbor. Which of these was NOT in that list?", options: ["Ledger", "Thistle", "Compass"], correctIndex: 1, explanation: "Compass, ledger and harbor were shown; thistle was not part of the original list." },
      { skill: "focus", prompt: "Count the exact word \"check\" in: \"check twice check again then check once more\"", options: ["2", "3", "4"], correctIndex: 1, explanation: "Reading word by word finds \"check\" exactly three times." },
      { skill: "logic", prompt: "All senior reviewers can approve releases. Priya cannot approve releases. What follows?", options: ["Priya is not a senior reviewer", "Priya is a senior reviewer", "No conclusion is possible"], correctIndex: 0, explanation: "This is a valid inference: since every senior reviewer can approve releases, someone who cannot approve releases isn't a senior reviewer." },
      { skill: "observation", prompt: "Which item differs from the others?", options: ["N5Y8", "N5Y8", "N5Y3"], correctIndex: 2, explanation: "The final option ends in 3 where the others end in 8." },
      { skill: "critical-thinking", prompt: "A final claim states: \"This is the most-reviewed course online, so it must be the best.\" What is the flaw?", options: ["Popularity and quality are not necessarily the same thing", "The reasoning is fully valid as stated", "Reviews never matter at all"], correctIndex: 0, explanation: "A high review count reflects reach and popularity, not necessarily quality; treating them as equivalent skips a step the evidence doesn't support." },
    ],
  },
];

export const faqSeed = [
  { category: "general", question: "How much time does this take each day?", answer: "Each daily session targets around 15 minutes, split across mental math, memory, focus, logic, observation and critical thinking. It's a target, not a hard cut-off — you can finish a task even if it runs slightly over." },
  { category: "audience", question: "Who is CogniSprint designed for?", answer: "Anyone aged 10 and above who wants structured mental practice — students, competitive-exam aspirants, working professionals, parents looking for screen-free activities for their children, teachers, and adults who want a consistent learning routine." },
  { category: "audience", question: "Is this only for kids?", answer: "No. The curriculum and exercises are built to work across ages, from students to working professionals and senior learners. Difficulty progresses through the program regardless of the age of the person practising." },
  { category: "purchase", question: "What is the refund policy?", answer: "Refund terms are set out in full on our Refund & Cancellation Policy page. Read that page for the current window and conditions before purchasing." },
  { category: "content", question: "Do I get future updates?", answer: "Enrollment is currently closed. Future access terms will be published only after the reviewed content included at launch is known." },
  { category: "content", question: "Is there a certificate?", answer: "The certificate workflow exists, but no learner can qualify while the full reviewed program is unavailable. It is not part of a current sale." },
  { category: "content", question: "Can I practise offline or on paper?", answer: "Not yet. A workbook and printable worksheets are roadmap items and are not currently available or included in a purchase." },
  { category: "content", question: "Are the worksheets printable?", answer: "Printable worksheets are planned but not currently published. Enrollment remains closed while launch content is reviewed." },
  { category: "general", question: "What language is the course in?", answer: "The course is currently available in English. The underlying content structure is designed so additional languages can be added in future." },
  { category: "audience", question: "Is this useful for working professionals, not just students?", answer: "Yes. Many exercises — quick mental calculation, structured decision-making, focus drills — are aimed squarely at professional, everyday use rather than academic tests alone." },
  { category: "access", question: "How do I access the course after payment?", answer: "After your payment is verified, you'll get access instructions by email and a direct link to your dashboard, where you can start your first lesson immediately." },
  { category: "purchase", question: "Is payment secure?", answer: "Yes. All payments are processed through Razorpay's secure checkout. We never see or store your card, UPI or banking details." },
];

export const blogSeed = [
  {
    slug: "mental-math-exercises-for-adults",
    title: "7 Mental Math Exercises That Actually Help Adults",
    description: "Practical mental math exercises for adults who want faster calculation and more confidence with numbers — no calculator required.",
    category: "Mental Math",
    author: "CogniSprint Team",
    publishedAt: new Date("2026-05-12"),
    updatedAt2: new Date("2026-06-30"),
    readingTimeMinutes: 7,
    coverImage: "/images/blog/mental-math-adults.svg",
    sections: [
      { heading: "Why mental math still matters", paragraphs: [
        "Most adults reach for a calculator app the moment a sum gets even slightly complicated — splitting a bill, checking a discount, or estimating a monthly budget. That's convenient, but it also means the mental muscle for quick calculation rarely gets used.",
        "The exercises below are not about becoming a human calculator. They're structured ways to practise calculation, estimation and number sense a little each day, so everyday maths feels faster and less effortful.",
      ]},
      { heading: "1. Round first, then adjust", paragraphs: [
        "Instead of multiplying 8 × 97 directly, calculate 8 × 100 = 800, then subtract 8 × 3 = 24, giving 776. Rounding to a friendly number and adjusting afterwards is faster than working with the awkward number directly, and it works for most multiplication and percentage problems.",
      ]},
      { heading: "2. Practise percentages as fractions", paragraphs: [
        "10% of a number is just that number divided by 10. Once 10% is easy, 20%, 5% and 15% are all quick combinations of it. Practising this daily makes discounts, tips and tax calculations almost automatic.",
      ]},
      { heading: "3. Chunk large additions", paragraphs: [
        "Break numbers into hundreds, tens and units and add each group separately before combining them. 347 + 286 becomes (300+200) + (40+80) + (7+6) = 500 + 120 + 13 = 633. This is slower at first, then becomes near-instant with repetition.",
      ]},
      { heading: "4. Square numbers ending in 5", paragraphs: [
        "For any number ending in 5, squaring follows a simple pattern: take the leading digit(s), multiply by one more than itself, then append 25. For 35², take 3 × 4 = 12, append 25, giving 1225.",
      ]},
      { heading: "5. Estimate before you calculate", paragraphs: [
        "Before working out an exact answer, guess the rough size of it. This catches obvious errors quickly and builds a stronger intuitive sense of numbers over time.",
      ]},
      { heading: "6. Practise multiplication tables past 10", paragraphs: [
        "Tables up to 10 are familiar to most adults, but tables from 11 to 20 unlock a surprising amount of everyday speed — for splitting costs, converting units and quick multiplication. A few minutes of spaced repetition each day is enough to build this recall.",
      ]},
      { heading: "7. Make it a short daily habit", paragraphs: [
        "The biggest factor in mental math improvement isn't any single technique — it's consistency. Ten focused minutes a day, done regularly, produces more improvement than an occasional hour-long session.",
        "CogniSprint's mental arithmetic modules structure exercises like these into a short daily routine, progressing from foundational techniques to faster multi-step calculation over the course of the program.",
      ]},
    ],
  },
];
