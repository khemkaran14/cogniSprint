export type LessonSeed = {
  moduleSlug: string;
  position: number;
  sequenceNumber: number;
  unlockDay: number;
  prerequisiteSlug?: string;
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  status: "published" | "in_review";
  reviewNote?: string;
  content: string[];
  exercises: Array<{ prompt: string; options: string[]; correctIndex: number; explanation: string }>;
};

const skills = ["mental math", "memory", "focus", "logic", "observation", "critical thinking"] as const;
type Skill = typeof skills[number];

const monthThemes = [
  "Practice Foundations", "Number Sense", "Working Memory", "Focused Attention",
  "Patterns and Logic", "Careful Observation", "Everyday Reasoning", "Processing Fluency",
  "Flexible Problem Solving", "Decision Quality", "Integrated Challenges", "Independent Mastery",
] as const;

const skillModules: Record<Skill, string> = {
  "mental math": "mental-arithmetic-foundations",
  memory: "memory-mastery",
  focus: "focus-and-concentration",
  logic: "logical-thinking",
  observation: "observation-skills",
  "critical thinking": "critical-thinking",
};

// Twelve phrases per skill instead of four: at one skill-day per six-day
// rotation, this stretches the action-phrase repeat cycle from 24 days to
// 72 days, so a learner working through a full month rarely sees the same
// wording for "what to do today" twice.
const skillActions: Record<Skill, string[]> = {
  "mental math": [
    "decompose quantities into friendlier parts", "estimate before calculating exactly", "use a friendly-number adjustment",
    "check an answer with an inverse operation", "round and compensate in the other direction", "work left to right instead of right to left",
    "convert a percentage into a simple fraction", "double one factor and halve the other", "chain two small steps instead of one big one",
    "compare an estimate against the exact result", "practise a times-table fact to instant recall", "narrate the calculation out loud as you go",
  ],
  memory: [
    "group information into chunks", "build a vivid association", "recall before reviewing", "space a second retrieval attempt",
    "link a new item to something already memorised", "picture the information as a short scene", "test recall in a different order than you learned it",
    "recite the sequence without looking, then check", "attach a number to a memorable landmark", "compress a list into a short acronym",
    "review at a longer interval than yesterday", "explain the memory technique to an imagined listener",
  ],
  focus: [
    "define one attention target", "remove a likely distraction", "scan in a fixed direction", "pause and reset after an attention slip",
    "work in one short uninterrupted block", "notice the first moment attention wanders", "keep a single task visible at a time",
    "set a clear stopping point before you start", "silence one predictable interruption in advance", "return to the target the instant you notice drifting",
    "count how many resets a task actually takes", "choose the least distracting spot available to you",
  ],
  logic: [
    "name the given facts", "separate a rule from an example", "test a conclusion", "look for a counterexample",
    "state the rule before applying it", "check whether a conclusion truly follows or only sounds right", "trace a chain of two linked rules",
    "identify what the argument assumes but never states", "swap the order of a conditional and see if it still holds", "build a short logic chain from three facts",
    "restate a conclusion in your own words before judging it", "look for a hidden middle step in the reasoning",
  ],
  observation: [
    "compare one feature at a time", "use a consistent scan order", "describe the exact difference", "verify before responding",
    "compare pairs instead of scanning everything at once", "check the feature most likely to be swapped first", "describe what changed, not just that something did",
    "slow down on the section most likely to hide an error", "re-check the answer with a second, independent pass", "look for what is missing, not only what is different",
    "match position as carefully as content", "confirm a match twice before moving on",
  ],
  "critical thinking": [
    "identify the claim", "ask what evidence would support it", "consider an alternative explanation", "state a proportionate conclusion",
    "separate the claim from the tone it's delivered in", "ask who benefits if the claim is believed", "check whether the evidence actually matches the claim",
    "look for a missing comparison the claim relies on", "distinguish a correlation from a cause", "ask what would change your mind",
    "weigh the claim against a plausible counter-argument", "decide how much confidence the evidence actually earns",
  ],
};

function mentalMathExercise(day: number, variant: number, shape: number) {
  if (shape === 0) {
    const left = 20 + ((day * 7 + variant * 11) % 70);
    const right = 10 + ((day * 5 + variant * 13) % 60);
    const answer = left + right;
    return {
      prompt: `Calculate ${left} + ${right} without a calculator.`,
      options: [String(answer - 10), String(answer), String(answer + 10)], correctIndex: 1,
      explanation: `Split the values into tens and ones: ${left} + ${right} = ${answer}.`,
    };
  }
  if (shape === 1) {
    const minuend = 60 + ((day * 9 + variant * 7) % 140);
    const subtrahend = 10 + ((day * 3 + variant * 17) % (minuend - 10));
    const answer = minuend - subtrahend;
    return {
      prompt: `Calculate ${minuend} − ${subtrahend} without a calculator.`,
      options: [String(answer - 10), String(answer + 10), String(answer)], correctIndex: 2,
      explanation: `Round ${subtrahend} to the nearest ten, subtract, then adjust: ${minuend} − ${subtrahend} = ${answer}.`,
    };
  }
  if (shape === 2) {
    const factor = 3 + ((day + variant) % 9);
    const base = 6 + ((day * 4 + variant * 6) % 12);
    const answer = factor * base;
    return {
      prompt: `Calculate ${factor} × ${base} without a calculator.`,
      options: [String(answer), String(answer + factor), String(answer - base)], correctIndex: 0,
      explanation: `${factor} × ${base} = ${answer}. Break it into (${factor} × ${Math.floor(base / 2)}) doubled if that is faster for you.`,
    };
  }
  const base = 200 + ((day * 6 + variant * 8) % 800);
  const percent = [10, 20, 25, 50][(day + variant) % 4];
  const answer = Math.round((base * percent) / 100);
  return {
    prompt: `What is ${percent}% of ${base}?`,
    options: [String(answer), String(answer + Math.round(base * 0.05)), String(Math.round(answer / 2))], correctIndex: 0,
    explanation: `${percent}% is the same as ${percent}/100. ${base} × ${percent}/100 = ${answer}.`,
  };
}

function memoryExercise(day: number, variant: number, shape: number) {
  if (shape === 0) {
    const sequence = [day % 10, (day + 3 + variant) % 10, (day + 6) % 10, (day + 8 + variant) % 10];
    const exact = sequence.join(" – ");
    return {
      prompt: `Study ${exact}. Which option preserves the exact order?`,
      options: [exact, [sequence[0], sequence[2], sequence[1], sequence[3]].join(" – "), [...sequence].reverse().join(" – ")], correctIndex: 0,
      explanation: "The first option retains every digit in its original position.",
    };
  }
  const items = ["lantern", "compass", "ledger", "kettle", "anchor", "quill", "beacon", "satchel"];
  const shown = [items[day % items.length], items[(day + 2 + variant) % items.length], items[(day + 5) % items.length]];
  let decoy = items[(day + 3 + variant) % items.length];
  if (shown.includes(decoy)) decoy = items[(day + 4) % items.length];
  const options = [decoy, ...shown].filter((value, index, array) => array.indexOf(value) === index).slice(0, 3);
  let fillerIndex = 0;
  while (options.length < 3) { const candidate = items[(day + fillerIndex + 7) % items.length]; if (!options.includes(candidate)) options.push(candidate); fillerIndex += 1; }
  return {
    prompt: `You were shown ${shown.join(", ")}. Which of these was NOT in that list?`,
    options,
    correctIndex: options.indexOf(decoy),
    explanation: `${shown.join(", ")} were shown. ${decoy} was not part of the original list.`,
  };
}

function focusExercise(day: number, variant: number, shape: number) {
  if (shape === 0) {
    const groups = variant === 0 ? "B8B6BB3B" : "QOQ0QQOQ";
    const target = variant === 0 ? "B" : "Q";
    const count = [...groups].filter((character) => character === target).length;
    return {
      prompt: `Scan ${groups}. How many exact ${target} characters appear?`,
      options: [String(count - 1), String(count), String(count + 1)], correctIndex: 1,
      explanation: `A left-to-right scan finds ${count} exact ${target} characters. Similar characters are distractors.`,
    };
  }
  const sentences = ["the quiet fox ran past the old the barn near the river the fields", "a calm river flows past a calm dock beside a calm meadow at dawn"];
  const sentence = sentences[variant % sentences.length];
  const target = variant % sentences.length === 0 ? "the" : "calm";
  const count = sentence.split(" ").filter((word) => word === target).length;
  return {
    prompt: `Count the exact word "${target}" in: "${sentence}"`,
    options: [String(count - 1), String(count + 1), String(count)], correctIndex: 2,
    explanation: `Reading word by word without skimming finds "${target}" exactly ${count} times.`,
  };
}

function logicExercise(day: number, variant: number, shape: number) {
  if (shape === 0) {
    const subject = variant === 0 ? "cedars" : "bronze tokens";
    const category = variant === 0 ? "trees" : "metal objects";
    return {
      prompt: `All ${subject} are ${category}. This item is a ${subject.slice(0, -1)}. What must follow?`,
      options: [`It is one of the ${category}`, `All ${category} are ${subject}`, "No conclusion is possible"], correctIndex: 0,
      explanation: `The stated rule applies to an item identified as one of the ${subject}. It does not reverse the rule.`,
    };
  }
  const setups = [
    { rule: "If a shipment is late, the tracking status shows \"delayed\".", fact: "The tracking status does not show \"delayed\".", conclusion: "The shipment is not late" },
    { rule: "If a battery is fully charged, the indicator light is green.", fact: "The indicator light is not green.", conclusion: "The battery is not fully charged" },
  ];
  const setup = setups[(day + variant) % setups.length];
  return {
    prompt: `${setup.rule} ${setup.fact} What follows?`,
    options: [setup.conclusion, "Nothing can be concluded", "The rule must be false"], correctIndex: 0,
    explanation: "This is a valid inference: when the result described by the rule doesn't hold, the condition that would have produced it doesn't hold either.",
  };
}

function observationExercise(day: number, variant: number, shape: number) {
  if (shape === 0) {
    const prefix = String.fromCharCode(65 + (day % 20));
    const alternatePrefix = String.fromCharCode(66 + (day % 20));
    const base = `${prefix}${(day % 9) + 1}K${variant + 4}`;
    const changed = `${prefix}${(day % 9) + 1}X${variant + 4}`;
    return {
      prompt: "Which code contains X in the position where the other codes contain K?",
      options: [base, changed, `${alternatePrefix}${(day % 9) + 1}K${variant + 4}`], correctIndex: 1,
      explanation: "The middle code uses X in the third position; both other codes use K in that position.",
    };
  }
  return {
    prompt: 'Two rows are meant to be identical: "△○□△○□△○□" and "△○□△○□△●□". Which position differs?',
    options: ["Position 5", "Position 7", "The rows are identical"], correctIndex: 1,
    explanation: "Position 7 has a filled circle (●) in one row and an open circle (○) in the other; every other position matches.",
  };
}

function criticalThinkingExercise(day: number, variant: number, shape: number) {
  if (shape === 0) {
    const contexts = variant === 0
      ? ["A study app claims its method doubles test scores but provides no source.", "Look for an independent study and examine how improvement was measured."]
      : ["A popular post says one routine works for every learner.", "Compare credible evidence and check whether the claim accounts for different learners."];
    return {
      prompt: `${contexts[0]} What is the strongest next step?`,
      options: [contexts[1], "Accept it because it sounds confident.", "Reject it without checking anything."], correctIndex: 0,
      explanation: "A proportionate conclusion starts with relevant, independently checkable evidence rather than confidence or an unsupported dismissal.",
    };
  }
  const claims = [
    "Ice cream sales and drowning incidents rise together in summer, so ice cream causes drowning.",
    "A city added more streetlights and crime fell the same year, so streetlights eliminate crime.",
  ];
  const claim = claims[(day + variant) % claims.length];
  return {
    prompt: `"${claim}" What is the clearest flaw in this reasoning?`,
    options: ["It treats a correlation as if it were a proven cause", "It uses too many numbers", "It is grammatically incorrect"], correctIndex: 0,
    explanation: "Both events can share a hidden third cause (like warmer weather or a broader trend) without one causing the other.",
  };
}

function exerciseFor(skill: Skill, day: number, variant: number) {
  const shape = (day + variant) % 4;
  if (skill === "mental math") return mentalMathExercise(day, variant, shape);
  if (skill === "memory") return memoryExercise(day, variant, shape % 2);
  if (skill === "focus") return focusExercise(day, variant, shape % 2);
  if (skill === "logic") return logicExercise(day, variant, shape % 2);
  if (skill === "observation") return observationExercise(day, variant, shape % 2);
  return criticalThinkingExercise(day, variant, shape % 2);
}

// Five distinct paragraph framings per skill-day, selected by day, so the
// instructional wording rotates through genuinely different phrasing rather
// than reusing one template with words substituted in.
function contentFor(skill: Skill, month: number, action: string, difficulty: string, day: number): string[] {
  const theme = monthThemes[month - 1];
  const variant = day % 5;
  const openers = [
    `Month ${month} focuses on ${theme.toLowerCase()}. Today's ${skill} session asks you to ${action}.`,
    `You're in the ${theme} stretch of the program. The habit for today's ${skill} practice is to ${action}.`,
    `This session continues the ${theme.toLowerCase()} work for ${skill}. Before you start timing yourself, plan to ${action}.`,
    `As part of ${theme}, today's short ${skill} session centres on one thing: learning to ${action}.`,
    `${theme} builds gradually. Today's contribution to that is a ${skill} session where you ${action}.`,
  ];
  const middles = [
    "Work accurately before increasing pace. Say the step that produced each answer out loud or in your head; naming the step makes it easier to correct later.",
    "Resist the urge to rush. A method you can explain is a method you can fix; a method you can only guess at is not.",
    "Treat the first attempt as information, not a test. Notice which part of the process felt uncertain and slow down there specifically.",
    "Accuracy compounds faster than speed does. A correct, explainable answer today builds the base that later, faster sessions rely on.",
    "If a step feels automatic, that's a sign to check it more carefully, not less — automatic mistakes are the easiest ones to miss.",
  ];
  const closers = [
    `Finish with retrieval: state the method without looking back, note one error pattern, and record one adjustment for the next ${skill} session.`,
    `Close by recalling the technique from memory rather than re-reading it, then write down the single change you'd make tomorrow.`,
    `End the session by explaining what you did as if to someone new to it, then log one thing to try differently next time.`,
    `Before you stop, test whether you can restate the technique unaided. If you can't, that's today's most useful finding.`,
    `Wrap up by checking your work once more, then write one short note describing what a ${difficulty}-level version of this would add.`,
  ];
  return [openers[variant], middles[(variant + 2) % middles.length], closers[(variant + 4) % closers.length]];
}

const introductoryLessons: Omit<LessonSeed, "position">[] = [
  {
    moduleSlug: "getting-started", sequenceNumber: 1, unlockDay: 1, slug: "build-your-15-minute-routine", title: "Day 1: Build Your 15-Minute Routine",
    summary: "Create a small, repeatable practice cue that fits your day.", estimatedMinutes: 8, status: "published",
    content: [
      "Consistency starts with a reliable cue. Choose an existing event—such as finishing breakfast—and place CogniSprint immediately after it.",
      "Keep the first goal deliberately small. Completing a focused session matters more than extending it when your attention has already faded.",
      "Record completion honestly. A missed day is information, not failure: restart at the next available cue instead of compensating with an exhausting session.",
    ],
    exercises: [{ prompt: "Which plan is most likely to become a repeatable routine?", options: ["Practise whenever inspiration appears", "Practise after breakfast at the same desk", "Complete a week every Sunday"], correctIndex: 1, explanation: "Attaching a small session to a stable cue makes the behavior easier to repeat." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 2, unlockDay: 2, prerequisiteSlug: "build-your-15-minute-routine", slug: "accuracy-before-speed", title: "Day 2: Accuracy Before Speed",
    summary: "Learn why controlled, correct practice comes before faster responses.", estimatedMinutes: 7, status: "published",
    content: ["Speed is useful only when the underlying method is reliable. Begin slowly enough to notice each decision.", "Once a method is accurate, shorten response time gradually while continuing to record mistakes."],
    exercises: [{ prompt: "What should you do when faster practice causes frequent mistakes?", options: ["Guess more quickly", "Return to a controlled pace and review the method", "Skip the skill"], correctIndex: 1, explanation: "Reducing speed temporarily helps restore a correct and repeatable method." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 3, unlockDay: 3, prerequisiteSlug: "accuracy-before-speed", slug: "reflect-on-errors", title: "Day 3: Reflect on Errors",
    summary: "Turn mistakes into specific changes for the next attempt.", estimatedMinutes: 8, status: "published",
    content: ["After an incorrect answer, identify whether the cause was knowledge, attention, or strategy.", "Write one short adjustment for the next attempt. Specific adjustments are more useful than simply promising to try harder."],
    exercises: [{ prompt: "Which reflection is most actionable?", options: ["I am bad at this", "I will try harder", "I missed the sign; next time I will circle it before calculating"], correctIndex: 2, explanation: "A specific cause and concrete next action make reflection useful." }],
  },
];

// Days 4-30 close out Month 1 (Practice Foundations) with fully hand-written
// lessons about the practice system itself — goal-setting, session design,
// a first taste of each of the six skills, study technique, and motivation —
// before the skill-specific modules take over from day 31 onward.
const foundationLessons: Omit<LessonSeed, "position">[] = [
  {
    moduleSlug: "getting-started", sequenceNumber: 4, unlockDay: 4, slug: "set-a-realistic-daily-target", title: "Day 4: Set a Realistic Daily Target",
    summary: "Pick a target you can hit on your worst day, not your best one.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "A target set for your best day fails on every ordinary one. Pick a session length and exercise count you could complete even when you're tired or short on time.",
      "It's easier to raise a target that's proven too easy than to keep missing one that was never realistic. Start smaller than feels ambitious.",
      "Write your target down somewhere visible today. A target that only exists in your head is easy to quietly renegotiate.",
    ],
    exercises: [{ prompt: "Which daily target is most likely to survive a busy week?", options: ["45 minutes, every exercise type, no exceptions", "15 minutes, one short set, done consistently", "No fixed target — do what feels right each day"], correctIndex: 1, explanation: "A modest, fixed target is far more likely to be met on a bad day than an ambitious one, and consistency matters more than any single session's length." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 5, unlockDay: 5, slug: "warm-up-before-you-begin", title: "Day 5: Warm Up Before You Begin",
    summary: "Use one easy exercise to shift your attention before the real session.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Jumping straight from a distracted state into demanding practice rarely goes well. A short, easy warm-up exercise signals to your attention that focused work is starting.",
      "The warm-up shouldn't be the hard part of the session. Something you can already do comfortably is enough to make the transition.",
      "If you skip the warm-up on a rushed day, notice whether the rest of the session felt harder to settle into than usual.",
    ],
    exercises: [{ prompt: "What is the main purpose of a warm-up exercise before practice?", options: ["To test your maximum ability immediately", "To transition your attention into a focused state", "To replace the main session"], correctIndex: 1, explanation: "A warm-up's job is the transition, not the challenge — it prepares attention rather than testing capability." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 6, unlockDay: 6, slug: "design-your-practice-space", title: "Day 6: Design Your Practice Space",
    summary: "Reduce the number of decisions standing between you and starting.", estimatedMinutes: 7, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Every extra decision before a session — where to sit, whether to silence your phone, which device to use — is a small chance to delay or skip it.",
      "Choose one consistent spot and one consistent setup for your daily session. Deciding once, in advance, removes that friction permanently.",
      "If your only available spot changes day to day, decide on a short pre-session checklist instead — phone away, tab open, timer set — so the routine stays the same even when the location doesn't.",
    ],
    exercises: [{ prompt: "Why does a consistent practice setup help build a habit?", options: ["It makes the exercises easier", "It removes small decisions that could delay starting", "It is required by the platform"], correctIndex: 1, explanation: "Habits are more fragile at the point of starting than during the activity itself; removing setup decisions protects that starting point." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 7, unlockDay: 7, slug: "your-first-weekly-review", title: "Day 7: Your First Weekly Review",
    summary: "Look back at week one honestly before starting week two.", estimatedMinutes: 10, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "A week is long enough to see a real pattern and short enough to still remember the details. Look back at your first six days before starting the next.",
      "Ask three questions: which day was easiest to complete, which was hardest, and why. The answers usually point to a specific, fixable cause — timing, location, or energy level.",
      "Adjust one thing based on what you noticed, not everything. A single, well-chosen change is easier to test than an overhaul.",
    ],
    exercises: [{ prompt: "What is the goal of a weekly review at this stage?", options: ["To judge whether you are talented enough", "To find one specific, fixable adjustment", "To restart the whole plan from scratch"], correctIndex: 1, explanation: "A review at this stage is diagnostic, not evaluative — its job is to surface one concrete adjustment, not to pass judgment." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 8, unlockDay: 8, slug: "a-first-taste-of-mental-math", title: "Day 8: A First Taste of Mental Math",
    summary: "Try a small calculation without reaching for a calculator.", estimatedMinutes: 10, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Mental math here isn't about memorising tricks — it's about breaking a calculation into smaller, manageable pieces you can hold in your head.",
      "Try splitting a two-digit addition into tens and ones before you add them: 47 + 38 becomes 40 + 30, then 7 + 8, then combine. The pieces are each easy on their own.",
      "This module returns properly in Mental Arithmetic Foundations. Today is only a preview — the goal is familiarity, not speed.",
    ],
    exercises: [{ prompt: "What is the easiest way to add 47 + 38 without a calculator?", options: ["Guess and round to 90", "Split into tens and ones: (40+30) + (7+8) = 85", "Multiply instead of adding"], correctIndex: 1, explanation: "Breaking the numbers into tens and ones turns one hard step into two easy ones: 70 + 15 = 85." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 9, unlockDay: 9, slug: "a-first-taste-of-memory", title: "Day 9: A First Taste of Memory",
    summary: "Try holding a short list in mind using a simple technique.", estimatedMinutes: 10, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Most memory difficulty isn't a storage problem — it's that information was never encoded distinctly enough to retrieve later.",
      "Take a short list — say, four items — and build one connecting mental image linking them in order, even an odd one. An unusual image is easier to recall than a neutral list.",
      "This module returns properly in Memory Mastery, where techniques like chunking and the memory palace are covered in depth. Today is a first, small taste.",
    ],
    exercises: [{ prompt: "Why does an unusual mental image help you remember a list?", options: ["Unusual images are easier for the brain to distinguish and recall later", "Unusual images take longer to think of", "It has no real effect on memory"], correctIndex: 0, explanation: "Distinctive, vivid images are easier to retrieve than plain lists because they stand out from ordinary memory clutter." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 10, unlockDay: 10, slug: "a-first-taste-of-focus", title: "Day 10: A First Taste of Focus",
    summary: "Notice how long your attention holds before it drifts.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Focus is not an on/off switch — it's a skill of noticing drift quickly and returning to the task, over and over.",
      "Try a short scanning task today: look for one specific detail in a busy line of text or image, and time how long you can hold that single target before your mind wanders.",
      "This module returns properly in Focus and Concentration. Today's goal is simply noticing your own attention pattern, without judging it.",
    ],
    exercises: [{ prompt: "What is the most useful first step when you notice your attention has drifted?", options: ["Give up on the task", "Notice it, then calmly return to the target", "Switch to an easier task permanently"], correctIndex: 1, explanation: "Focus practice is built on the return, not on never drifting — noticing and returning is the actual skill being trained." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 11, unlockDay: 11, slug: "a-first-taste-of-logic", title: "Day 11: A First Taste of Logic",
    summary: "Practise separating a rule from a specific example of it.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Logical reasoning starts with a simple habit: naming the general rule and the specific case separately before deciding what follows.",
      "Consider: \"All ferries depart on the hour. This is a ferry.\" The rule is about departures on the hour; the fact is that this is a ferry. What follows is limited to what the rule actually states.",
      "This module returns properly in Logical Thinking. Today's goal is just practising the habit of separating rule from example before jumping to a conclusion.",
    ],
    exercises: [{ prompt: "\"All ferries depart on the hour. This is a ferry.\" What follows?", options: ["It departs on the hour", "All hourly departures are ferries", "Nothing can be concluded"], correctIndex: 0, explanation: "The rule applies directly to anything identified as a ferry, so the conclusion follows — but only that conclusion, not its reverse." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 12, unlockDay: 12, slug: "a-first-taste-of-observation", title: "Day 12: A First Taste of Observation",
    summary: "Compare two similar things one feature at a time.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Careful observation beats a quick glance almost every time a small detail matters — a typo, a mismatched code, a swapped digit.",
      "When comparing two similar things, resist scanning both at once. Compare one feature at a time — first letters, then numbers, then symbols — and only then decide.",
      "This module returns properly in Observation Skills. Today's exercise is a small taste of the comparison habit you'll build there.",
    ],
    exercises: [{ prompt: "What is the most reliable way to compare two similar-looking codes?", options: ["Glance at both quickly and decide", "Compare one feature at a time, in a fixed order", "Guess based on overall shape"], correctIndex: 1, explanation: "A fixed, feature-by-feature comparison catches small differences that a quick overall glance tends to miss." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 13, unlockDay: 13, slug: "a-first-taste-of-critical-thinking", title: "Day 13: A First Taste of Critical Thinking",
    summary: "Practise asking what evidence a claim actually rests on.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Critical thinking here means one specific habit: before accepting or rejecting a claim, ask what evidence would actually support or undercut it.",
      "Take a claim like \"This routine works for everyone.\" The strongest next step isn't to believe or dismiss it immediately — it's to ask what kind of evidence such a broad claim would need.",
      "This module returns properly in Critical Thinking. Today's goal is simply practising the pause between hearing a claim and reacting to it.",
    ],
    exercises: [{ prompt: "Someone claims \"This routine works for everyone,\" with no evidence given. What is the strongest response?", options: ["Accept it because it's stated confidently", "Ask what evidence would actually support such a broad claim", "Reject it outright without considering it"], correctIndex: 1, explanation: "A proportionate response neither accepts confident claims at face value nor dismisses them outright — it asks what evidence the claim would need." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 14, unlockDay: 14, slug: "choosing-what-to-practice-next", title: "Day 14: Choosing What to Practice Next",
    summary: "Decide which skill deserves extra attention based on this week's preview.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "You've now had a short preview of all six skill categories. Some probably felt more natural than others — that's useful information, not a verdict.",
      "A skill that felt hardest this week is often the one with the most room to improve quickly, since a small amount of deliberate practice tends to help most where you're currently weakest.",
      "Note which one or two skills felt least comfortable. You don't need to act on it yet — the structured modules for each skill are coming next, and this note will help you notice your own progress later.",
    ],
    exercises: [{ prompt: "Why is a skill that felt uncomfortable this week worth noting?", options: ["Because it should be avoided going forward", "Because it often has the most room for quick improvement", "Because comfort has no relationship to learning"], correctIndex: 1, explanation: "Areas of current weakness typically show the fastest early gains from deliberate, structured practice." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 15, unlockDay: 15, slug: "space-out-your-repetition", title: "Day 15: Space Out Your Repetition",
    summary: "Understand why reviewing something again tomorrow beats reviewing it five times today.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Repeating something five times in a row feels productive, but most of that repetition happens while the information is still fresh and doesn't need reinforcing yet.",
      "Spaced repetition works differently: you review right as you're about to forget, which is a more difficult, more effective kind of practice than immediate repetition.",
      "You don't need special software for this. Simply try to recall yesterday's technique before you look it up again today — that gap is doing real work.",
    ],
    exercises: [{ prompt: "Why is spacing out review sessions more effective than repeating something five times in a row?", options: ["It takes less total time", "Reviewing right before forgetting strengthens retrieval more than reviewing while still fresh", "It requires no effort"], correctIndex: 1, explanation: "Retrieval practice is more effective closer to the point of forgetting, which is exactly what immediate repetition skips past." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 16, unlockDay: 16, slug: "chunk-information-into-groups", title: "Day 16: Chunk Information Into Groups",
    summary: "Break a longer sequence into smaller groups to hold it more easily.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Working memory holds a small number of items comfortably — but a \"chunk\" can itself contain several pieces if they're grouped meaningfully.",
      "A phone number is easier to hold as three short groups than as ten separate digits. The same idea applies to lists, instructions, and steps in a calculation.",
      "Practise this today: take any sequence of six or more items and split it into two or three small groups before trying to recall it.",
    ],
    exercises: [{ prompt: "Why is a ten-digit number easier to remember split into three groups?", options: ["Grouping reduces the number of separate items to hold in mind", "It makes the number smaller", "It has no real effect"], correctIndex: 0, explanation: "Chunking reduces the number of distinct units working memory has to track, even though the total amount of information is unchanged." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 17, unlockDay: 17, slug: "test-yourself-instead-of-re-reading", title: "Day 17: Test Yourself Instead of Re-Reading",
    summary: "Recall before you check — retrieval builds memory better than re-reading does.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Re-reading a technique feels like learning because the material feels familiar — but familiarity while reading doesn't predict whether you can recall it later without the page in front of you.",
      "Testing yourself is harder in the moment and more effective over time: try to state the method from memory first, then check what you got right or missed.",
      "From today onward, resist the urge to check an explanation before attempting the exercise. Attempt first, even if you're unsure — then compare.",
    ],
    exercises: [{ prompt: "Why does testing yourself before checking an answer help you learn more than re-reading does?", options: ["Testing feels easier than reading", "Attempting recall strengthens retrieval more than passively reviewing familiar material", "Re-reading is always wrong"], correctIndex: 1, explanation: "Actively attempting to recall information, even imperfectly, strengthens memory more than passive review of already-familiar material." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 18, unlockDay: 18, slug: "keep-a-short-error-log", title: "Day 18: Keep a Short Error Log",
    summary: "Track the type of mistake, not just that a mistake happened.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "\"I got it wrong\" isn't specific enough to act on. Was the mistake a knowledge gap, a careless slip, or the wrong strategy for the problem?",
      "Start a short error log today — even three or four words per entry is enough: \"misread the sign\", \"forgot to carry\", \"rushed the last step\".",
      "After a week, look for a repeating pattern in the log. A mistake that shows up three times is worth a specific fix; a mistake that shows up once might just be noise.",
    ],
    exercises: [{ prompt: "What makes an error log useful over time?", options: ["Recording that a mistake happened, without detail", "Recording the specific type of mistake so patterns become visible", "Deleting entries once the exercise is corrected"], correctIndex: 1, explanation: "A useful error log captures the type of mistake, which is what reveals a repeating, fixable pattern over multiple sessions." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 19, unlockDay: 19, slug: "time-box-a-session", title: "Day 19: Time-Box a Session",
    summary: "Set a firm end time before you start, not just a start time.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "An open-ended session can quietly expand until it feels like too much effort to start tomorrow. A firm end time protects the habit, not just today's session.",
      "Set a timer before you begin, for slightly less time than you think you need. Working toward a visible deadline tends to sharpen focus rather than reduce quality.",
      "If the timer ends mid-task, stop anyway. Finishing a task you didn't have time for today is what tomorrow's session is for.",
    ],
    exercises: [{ prompt: "Why is setting a firm end time before starting useful, even if it means stopping mid-task?", options: ["It guarantees a perfect result", "It protects the habit from quietly expanding into something harder to sustain", "It has no real benefit"], correctIndex: 1, explanation: "A bounded session is easier to repeat daily than an open-ended one, which tends to grow until it becomes a barrier to starting again tomorrow." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 20, unlockDay: 20, slug: "interleave-instead-of-blocking", title: "Day 20: Interleave Instead of Blocking",
    summary: "Mix skill types in one session instead of drilling only one.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Practising one skill type repeatedly in a block feels smoother, because you settle into a single pattern — but that smoothness can mask how well you'd handle a mixed, unpredictable set.",
      "Interleaving — mixing two or three skill types within one session — is harder in the moment because you can't settle into one pattern, but it more closely matches how skills actually get used.",
      "The daily sessions ahead already mix skills across the week. Today's lesson is about why that structure is deliberate rather than arbitrary.",
    ],
    exercises: [{ prompt: "Why can practising several mixed skill types feel harder than drilling one repeatedly, even when it's more effective?", options: ["Mixed practice is objectively more difficult content", "You can't settle into one repeated pattern, which better matches real-world unpredictability", "Interleaving is a myth with no real basis"], correctIndex: 1, explanation: "Interleaved practice prevents settling into a single repeated pattern, which is exactly what makes it more effective for skills you'll need to apply flexibly later." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 21, unlockDay: 21, slug: "your-second-weekly-review", title: "Day 21: Your Second Weekly Review",
    summary: "Check whether last week's adjustment actually helped.", estimatedMinutes: 10, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Three weeks in, you have enough data to judge whether the one adjustment you made in week one actually helped, rather than just guessing.",
      "Look specifically at completion, not difficulty. Are you finishing sessions more reliably than in week one? That's the main signal at this stage — accuracy and speed come later.",
      "If the adjustment didn't help, that's useful too — try a different one this week rather than assuming the whole approach isn't working.",
    ],
    exercises: [{ prompt: "At this stage of the program, what is the most important signal to track in a weekly review?", options: ["Whether every exercise was solved perfectly", "Whether sessions are being completed reliably", "Whether the program feels exciting"], correctIndex: 1, explanation: "Consistency of completion is the foundation everything else builds on; accuracy and speed are addressed once the habit itself is reliable." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 22, unlockDay: 22, slug: "expect-and-plan-for-plateaus", title: "Day 22: Expect and Plan for Plateaus",
    summary: "A stretch of no visible progress doesn't mean the practice stopped working.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Skill improvement rarely moves in a straight line. There will be stretches where progress feels invisible even though the underlying practice hasn't changed.",
      "A plateau is not necessarily a sign to change your approach. It's often just a normal part of consolidating a skill before the next visible jump.",
      "Decide today what you'll do if next week feels stuck: keep the routine unchanged for at least a week before concluding it needs a real adjustment.",
    ],
    exercises: [{ prompt: "What is the most reasonable response to a week that feels like no progress?", options: ["Immediately overhaul the entire routine", "Continue the routine unchanged for a bit longer before judging it", "Stop practising until motivation returns"], correctIndex: 1, explanation: "Plateaus are a normal part of skill development; a brief stretch of no visible progress usually isn't enough evidence to justify abandoning an otherwise working routine." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 23, unlockDay: 23, slug: "compare-yourself-to-yesterday-not-others", title: "Day 23: Compare Yourself to Yesterday, Not Others",
    summary: "The only fair comparison is against your own earlier sessions.", estimatedMinutes: 7, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Comparing your day-23 results to someone else's day-23 results ignores everything about their starting point, schedule, and prior practice — it isn't a fair comparison.",
      "The only comparison that reliably means something is against your own earlier sessions: are today's answers more accurate, or come with more explainable reasoning, than three weeks ago?",
      "If you want a benchmark, use your own week-one results. That's the only dataset that controls for everything except your own progress.",
    ],
    exercises: [{ prompt: "Why is comparing your progress to another learner's progress usually unhelpful?", options: ["Other learners aren't real", "It ignores differences in starting point and practice history", "Comparison is never useful for anything"], correctIndex: 1, explanation: "A fair comparison requires a shared starting point; comparing against your own earlier results controls for that in a way comparing to others cannot." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 24, unlockDay: 24, slug: "protect-your-streak-without-fearing-a-miss", title: "Day 24: Protect Your Streak Without Fearing a Miss",
    summary: "A streak is motivating until missing one day feels like failure.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "A visible streak can be a genuinely useful motivator — but if missing a single day makes you want to quit altogether, the streak has become a liability instead.",
      "Decide in advance what a missed day means: it means exactly one missed day, not a reset of your progress or a reason to stop.",
      "The habit that survives an occasional missed day, and simply resumes the next, is stronger than one that only works under perfect conditions.",
    ],
    exercises: [{ prompt: "What is the healthiest response to missing a single day of practice?", options: ["Treat it as proof the habit has failed and stop", "Resume the next day, treating it as one missed day and nothing more", "Do a much longer session to compensate"], correctIndex: 1, explanation: "A resilient habit tolerates an occasional missed day; treating one miss as total failure or over-compensating both undermine long-term consistency more than the miss itself does." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 25, unlockDay: 25, slug: "rest-days-are-part-of-the-plan", title: "Day 25: Rest Days Are Part of the Plan",
    summary: "Recovery is not the opposite of progress — it's part of it.", estimatedMinutes: 7, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Mental practice, like physical practice, benefits from occasional rest. Constant, unbroken effort without any recovery tends to produce diminishing, not accelerating, returns.",
      "A short, deliberate lighter day — fewer exercises, less intensity — is different from an unplanned missed day. One is a choice that supports the plan; the other is a lapse.",
      "If you consistently feel that daily practice is becoming a chore rather than a habit, a genuinely lighter day is a reasonable adjustment, not a failure.",
    ],
    exercises: [{ prompt: "What distinguishes a planned lighter day from an unplanned missed day?", options: ["There is no real difference", "A planned lighter day is a deliberate choice that supports the overall routine", "A lighter day should never happen"], correctIndex: 1, explanation: "A deliberate, lighter session is a form of pacing that supports long-term consistency, unlike an unplanned lapse, which simply breaks the routine." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 26, unlockDay: 26, slug: "treat-mistakes-as-data", title: "Day 26: Treat Mistakes as Data",
    summary: "A wrong answer is information about your method, not about your ability.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "It's tempting to read a wrong answer as a verdict on ability. It's far more useful to read it as a data point about which step in your method needs adjustment.",
      "Ask specifically: was the concept unclear, was a step skipped, or did attention lapse mid-task? Each answer points to a different, specific fix.",
      "This is the same instinct behind your error log from day 18 — a mistake examined closely is more useful than a mistake dismissed or a mistake taken personally.",
    ],
    exercises: [{ prompt: "What is the most useful way to interpret a wrong answer?", options: ["As proof you lack the ability for the skill", "As a specific data point about which step in your method to adjust", "As something to ignore and move past"], correctIndex: 1, explanation: "Treating an error as diagnostic information about a specific step, rather than a verdict on ability, is what makes it actionable." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 27, unlockDay: 27, slug: "find-an-accountability-partner", title: "Day 27: Find an Accountability Partner",
    summary: "A small, external check-in makes a habit easier to sustain.", estimatedMinutes: 7, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "A habit that only you can see is easier to quietly abandon than one someone else occasionally asks about.",
      "This doesn't need to be formal. A friend, family member, or colleague who knows you're doing a daily short practice, and might ask how it's going, is enough external accountability for most people.",
      "If no one else is available, a simple visible tracker — a note on your calendar, a checklist on your wall — can serve a similar purpose.",
    ],
    exercises: [{ prompt: "Why can even informal accountability help sustain a daily habit?", options: ["It adds external pressure that makes a private habit harder to quietly abandon", "It replaces the need for the habit itself", "It guarantees perfect consistency"], correctIndex: 0, explanation: "External awareness, even informal, raises the small social cost of quietly abandoning a habit, which is often enough to help it stick." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 28, unlockDay: 28, slug: "notice-your-practice-triggers", title: "Day 28: Notice Your Practice Triggers",
    summary: "Identify what reliably reminds you to start, and what reliably doesn't.", estimatedMinutes: 8, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "By now you likely have a sense of what actually gets you to start a session versus what you intended to rely on but didn't.",
      "A notification you dismiss without reading isn't a real trigger. An existing routine event — finishing a meal, a commute, a specific time of day — usually works better.",
      "Note today which trigger has been most reliable across the last four weeks, and consider dropping any that consistently haven't worked.",
    ],
    exercises: [{ prompt: "What makes a practice trigger reliable rather than just aspirational?", options: ["It is stated with enthusiasm", "It's consistently followed by starting the session, in practice, not just in intention", "It happens only once"], correctIndex: 1, explanation: "A trigger's reliability is shown by what actually happens after it, over repeated days — not by how well-intentioned it sounded when chosen." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 29, unlockDay: 29, slug: "set-a-target-for-month-two", title: "Day 29: Set a Target for Month Two",
    summary: "Use what you've learned about yourself to set next month's target.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "You now have four weeks of real data about your own consistency, preferred timing, and which skills felt hardest — far more useful than a guess made on day one.",
      "Set one specific, modest target for month two based on that data: perhaps a slightly longer session, or extra attention on the skill that felt least comfortable.",
      "Keep the target measurable. \"Get better at memory\" is hard to check; \"complete every memory exercise without skipping the retrieval step\" is not.",
    ],
    exercises: [{ prompt: "What makes a month-two target more useful than the target you set on day one?", options: ["It's based on four weeks of real data about your own practice", "It's more ambitious by default", "There is no meaningful difference"], correctIndex: 0, explanation: "A target set after real practice data is available can be specific and realistic in a way a first-day guess cannot." }],
  },
  {
    moduleSlug: "getting-started", sequenceNumber: 30, unlockDay: 30, slug: "foundations-complete", title: "Day 30: Foundations Complete",
    summary: "Close out the first month and carry its habits into skill-specific practice.", estimatedMinutes: 9, status: "in_review",
    reviewNote: "Hand-authored foundations lesson. Pending independent educational review.",
    content: [
      "Month one wasn't about becoming fast or highly accurate at any one skill — it was about building the operating system the rest of the year runs on: a stable routine, an honest review habit, and a way of treating mistakes as useful information.",
      "From tomorrow, sessions shift into skill-specific modules — starting with deeper work on the six categories you previewed in week two. The habits from this month carry forward directly.",
      "Before moving on, revisit your day-4 target and your day-29 plan for month two side by side. If they still feel realistic, keep them; if not, this is the moment to adjust before the next stretch begins.",
    ],
    exercises: [{ prompt: "What was the primary goal of Month 1: Practice Foundations?", options: ["Maximum speed on every exercise type", "Building a durable routine and review habits that later skill-specific practice depends on", "Completing as many exercises as possible in one sitting"], correctIndex: 1, explanation: "Month 1 is designed to establish the practice system itself — routine, review, and error-handling habits — which the skill-specific modules starting in Month 2 then build on." }],
  },
];

export function buildLessonCurriculum(): LessonSeed[] {
  const modulePositions = new Map<string, number>();
  const allocatePosition = (moduleSlug: string) => {
    const next = (modulePositions.get(moduleSlug) ?? 0) + 1;
    modulePositions.set(moduleSlug, next);
    return next;
  };
  const lessons: LessonSeed[] = [];
  for (const lesson of [...introductoryLessons, ...foundationLessons]) {
    const prior = lessons[lessons.length - 1];
    lessons.push({ ...lesson, position: allocatePosition(lesson.moduleSlug), prerequisiteSlug: prior ? prior.slug : lesson.prerequisiteSlug });
  }

  for (let day = 31; day <= 365; day += 1) {
    const month = Math.min(12, Math.floor((day - 1) / 30) + 1);
    const skill = skills[(day - 1) % skills.length];
    const action = skillActions[skill][Math.floor((day - 1) / skills.length) % skillActions[skill].length];
    const slug = `day-${String(day).padStart(3, "0")}-${skill.replaceAll(" ", "-")}`;
    const prior = lessons[lessons.length - 1];
    const difficulty = month <= 3 ? "foundation" : month <= 8 ? "application" : "integration";
    const moduleSlug = skillModules[skill];
    lessons.push({
      moduleSlug, position: allocatePosition(moduleSlug), sequenceNumber: day, unlockDay: day,
      prerequisiteSlug: prior.slug, slug, title: `Day ${day}: ${monthThemes[month - 1]} — ${skill}`,
      summary: `Use a ${difficulty}-level ${skill} routine to ${action}.`, estimatedMinutes: 15, status: "in_review",
      reviewNote: "Authored curriculum draft. Independent educational review and explicit approval are required before publication.",
      content: contentFor(skill, month, action, difficulty, day),
      exercises: [exerciseFor(skill, day, 0), exerciseFor(skill, day, 1)],
    });
  }
  return lessons;
}

export const lessonSeed = buildLessonCurriculum();
