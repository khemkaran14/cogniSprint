export const productSeed = {
  slug: "cognisprint-complete",
  name: "CogniSprint Complete Brain Training Program",
  shortName: "CogniSprint Complete",
  tagline: "365 days of guided and structured brain-training practice.",
  description:
    "A full 12-month program combining mental mathematics, memory technique, focus drills, logical reasoning, observation and critical-thinking exercises in a 15-minute daily format.",
  productType: "bundle" as const,
  accessDuration: "lifetime" as const,
  status: "active" as const,
  includes: [
    { key: "guided_learning", label: "3 months of guided, structured learning", enabled: true },
    { key: "practice_phase", label: "9 months of daily structured practice", enabled: true },
    { key: "daily_sessions", label: "365 daily 15-minute training sessions", enabled: true },
    { key: "mental_math", label: "Mental mathematics exercises, including tables up to 100", enabled: true },
    { key: "memory", label: "Memory technique lessons and recall drills", enabled: true },
    { key: "focus", label: "Focus and concentration drills", enabled: true },
    { key: "logic", label: "Logical reasoning challenges", enabled: true },
    { key: "critical_thinking", label: "Critical-thinking exercises", enabled: true },
    { key: "observation", label: "Observation activities", enabled: true },
    { key: "assessments", label: "Monthly skill assessments", enabled: true },
    { key: "habit_tracker", label: "Habit and streak tracker", enabled: true },
    { key: "progress_sheets", label: "Printable progress sheets", enabled: true },
    { key: "badges", label: "Achievement badges", enabled: true },
    { key: "workbook", label: "Downloadable workbook (PDF)", enabled: true },
    { key: "worksheets", label: "Printable practice worksheets", enabled: true },
    { key: "certificate", label: "Completion certificate", enabled: true },
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
    position: 19, slug: "monthly-assessments", title: "Monthly Assessments",
    description: "Twelve structured assessments — one per month — that summarise progress across every skill category.",
    skills: ["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"], lessonCount: 12, exerciseCount: 360, difficulty: "advanced", estimatedMinutes: 240, previewAvailable: false, phase: "assessment",
  },
  {
    position: 20, slug: "one-year-challenge", title: "One-Year Challenge",
    description: "The full 365-day practice calendar that ties every module together into a single daily routine, with a completion certificate at the end.",
    skills: ["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"], lessonCount: 365, exerciseCount: 3650, difficulty: "advanced", estimatedMinutes: 5475, previewAvailable: false, phase: "assessment",
  },
];

export const lessonSeed = [
  {
    moduleSlug: "getting-started", position: 1, sequenceNumber: 1, unlockDay: 1, slug: "build-your-15-minute-routine", title: "Build Your 15-Minute Routine",
    summary: "Create a small, repeatable practice cue that fits your day.", estimatedMinutes: 8, status: "published" as const,
    content: [
      "Consistency starts with a reliable cue. Choose an existing event—such as finishing breakfast—and place CogniSprint immediately after it.",
      "Keep the first goal deliberately small. Completing a focused session matters more than extending it when your attention has already faded.",
      "Record completion honestly. A missed day is information, not failure: restart at the next available cue instead of trying to compensate with an exhausting session."
    ],
    exercises: [{ prompt: "Which plan is most likely to become a repeatable routine?", options: ["Practise whenever inspiration appears", "Practise after breakfast at the same desk", "Complete a week of exercises every Sunday"], correctIndex: 1, explanation: "Attaching a small session to a stable daily cue makes the behavior easier to repeat." }],
  },
  {
    moduleSlug: "getting-started", position: 2, sequenceNumber: 2, unlockDay: 2, prerequisiteSlug: "build-your-15-minute-routine", slug: "accuracy-before-speed", title: "Accuracy Before Speed",
    summary: "Learn why controlled, correct practice comes before faster responses.", estimatedMinutes: 7, status: "published" as const,
    content: ["Speed is useful only when the underlying method is reliable. Begin slowly enough to notice each decision.", "Once a method is accurate, shorten response time gradually while continuing to record mistakes."],
    exercises: [{ prompt: "What should you do when faster practice causes frequent mistakes?", options: ["Guess more quickly", "Return to a controlled pace and review the method", "Skip the skill"], correctIndex: 1, explanation: "Reducing speed temporarily helps restore a correct and repeatable method." }],
  },
  {
    moduleSlug: "getting-started", position: 3, sequenceNumber: 3, unlockDay: 3, prerequisiteSlug: "accuracy-before-speed", slug: "reflect-on-errors", title: "Reflect on Errors",
    summary: "Turn mistakes into specific changes for the next attempt.", estimatedMinutes: 8, status: "published" as const,
    content: ["After an incorrect answer, identify whether the cause was knowledge, attention, or strategy.", "Write one short adjustment for the next attempt. Specific adjustments are more useful than simply promising to try harder."],
    exercises: [{ prompt: "Which reflection is most actionable?", options: ["I am bad at this", "I will try harder", "I missed the sign; next time I will circle it before calculating"], correctIndex: 2, explanation: "A specific observed cause and a concrete next action make reflection useful." }],
  },
];

export const faqSeed = [
  { category: "general", question: "How much time does this take each day?", answer: "Each daily session targets around 15 minutes, split across mental math, memory, focus, logic, observation and critical thinking. It's a target, not a hard cut-off — you can finish a task even if it runs slightly over." },
  { category: "audience", question: "Who is CogniSprint designed for?", answer: "Anyone aged 10 and above who wants structured mental practice — students, competitive-exam aspirants, working professionals, parents looking for screen-free activities for their children, teachers, and adults who want a consistent learning routine." },
  { category: "audience", question: "Is this only for kids?", answer: "No. The curriculum and exercises are built to work across ages, from students to working professionals and senior learners. Difficulty progresses through the program regardless of the age of the person practising." },
  { category: "purchase", question: "What is the refund policy?", answer: "Refund terms are set out in full on our Refund & Cancellation Policy page. Read that page for the current window and conditions before purchasing." },
  { category: "content", question: "Do I get future updates?", answer: "Yes. Future content updates are included as part of the program access described on the pricing page, for as long as your access term is active." },
  { category: "content", question: "Is there a certificate?", answer: "Yes, a completion certificate with a unique verification ID becomes available once the defined completion requirements for the program are met." },
  { category: "content", question: "Can I practise offline or on paper?", answer: "Yes. The program includes printable worksheets and a downloadable workbook alongside the digital lessons, so you can practise on paper as well as on screen." },
  { category: "content", question: "Are the worksheets printable?", answer: "Yes, all worksheets and the workbook are formatted for standard home printing." },
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
