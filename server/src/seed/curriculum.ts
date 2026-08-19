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

const skillActions: Record<Skill, string[]> = {
  "mental math": ["decompose quantities", "estimate before calculating", "use a friendly-number adjustment", "check an answer with an inverse operation"],
  memory: ["group information into chunks", "build a vivid association", "recall before reviewing", "space a second retrieval attempt"],
  focus: ["define one attention target", "remove a likely distraction", "scan in a fixed direction", "pause and reset after an attention slip"],
  logic: ["name the given facts", "separate a rule from an example", "test a conclusion", "look for a counterexample"],
  observation: ["compare one feature at a time", "use a consistent scan order", "describe the exact difference", "verify before responding"],
  "critical thinking": ["identify the claim", "ask what evidence would support it", "consider an alternative explanation", "state a proportionate conclusion"],
};

function exerciseFor(skill: Skill, day: number, variant: number) {
  if (skill === "mental math") {
    const left = 20 + ((day * 7 + variant * 11) % 70);
    const right = 10 + ((day * 5 + variant * 13) % 60);
    const answer = left + right;
    return {
      prompt: `Calculate ${left} + ${right} without a calculator.`,
      options: [String(answer - 10), String(answer), String(answer + 10)], correctIndex: 1,
      explanation: `Split the values into tens and ones: ${left} + ${right} = ${answer}.`,
    };
  }
  if (skill === "memory") {
    const sequence = [day % 10, (day + 3 + variant) % 10, (day + 6) % 10, (day + 8 + variant) % 10];
    const exact = sequence.join(" – ");
    return {
      prompt: `Study ${exact}. Which option preserves the exact order?`,
      options: [exact, [sequence[0], sequence[2], sequence[1], sequence[3]].join(" – "), [...sequence].reverse().join(" – ")], correctIndex: 0,
      explanation: "The first option retains every digit in its original position.",
    };
  }
  if (skill === "focus") {
    const groups = variant === 0 ? "B8B6BB3B" : "QOQ0QQOQ";
    const target = variant === 0 ? "B" : "Q";
    const count = [...groups].filter((character) => character === target).length;
    return {
      prompt: `Scan ${groups}. How many exact ${target} characters appear?`,
      options: [String(count - 1), String(count), String(count + 1)], correctIndex: 1,
      explanation: `A left-to-right scan finds ${count} exact ${target} characters. Similar characters are distractors.`,
    };
  }
  if (skill === "logic") {
    const subject = variant === 0 ? "cedars" : "bronze tokens";
    const category = variant === 0 ? "trees" : "metal objects";
    return {
      prompt: `All ${subject} are ${category}. This item is a ${subject.slice(0, -1)}. What must follow?`,
      options: [`It is one of the ${category}`, `All ${category} are ${subject}`, "No conclusion is possible"], correctIndex: 0,
      explanation: `The stated rule applies to an item identified as one of the ${subject}. It does not reverse the rule.`,
    };
  }
  if (skill === "observation") {
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
  const contexts = variant === 0
    ? ["A study app claims its method doubles test scores but provides no source.", "Look for an independent study and examine how improvement was measured."]
    : ["A popular post says one routine works for every learner.", "Compare credible evidence and check whether the claim accounts for different learners."];
  return {
    prompt: `${contexts[0]} What is the strongest next step?`,
    options: [contexts[1], "Accept it because it sounds confident.", "Reject it without checking anything."], correctIndex: 0,
    explanation: "A proportionate conclusion starts with relevant, independently checkable evidence rather than confidence or an unsupported dismissal.",
  };
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

export function buildLessonCurriculum(): LessonSeed[] {
  const modulePositions = new Map<string, number>();
  const allocatePosition = (moduleSlug: string) => {
    const next = (modulePositions.get(moduleSlug) ?? 0) + 1;
    modulePositions.set(moduleSlug, next);
    return next;
  };
  const lessons: LessonSeed[] = introductoryLessons.map((lesson) => ({ ...lesson, position: allocatePosition(lesson.moduleSlug) }));

  for (let day = 4; day <= 365; day += 1) {
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
      content: [
        `Month ${month}, ${monthThemes[month - 1]}, develops ${skill} through short, deliberate practice. Today you will ${action}.`,
        `Work accurately before increasing pace. Explain the step that produced each answer; this makes the method inspectable and easier to correct.`,
        `Finish with retrieval: state the method without looking back, note one error pattern, and record one adjustment for the next ${skill} session.`,
      ],
      exercises: [exerciseFor(skill, day, 0), exerciseFor(skill, day, 1)],
    });
  }
  return lessons;
}

export const lessonSeed = buildLessonCurriculum();
