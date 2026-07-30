// Seed catalogue: tools -> categories. Real, hand-written sample questions are
// provided for "Claude" (the flagship demo). Every other category gets a
// clearly-marked placeholder question per difficulty tier so the full site
// structure is browsable immediately -- replace these via Admin -> Content.

export const TOOLS = [
  {
    slug: "claude",
    name: "Claude",
    group: "assistants",
    description: "Anthropic's assistant and agentic coding tool.",
    categories: ["Claude Code", "Projects", "Coding", "Design", "Vision"],
  },
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    group: "assistants",
    description: "GitHub's AI pair programmer.",
    categories: ["Copilot Chat", "Copilot Workspace", "CLI", "Extensions"],
  },
  {
    slug: "cursor",
    name: "Cursor",
    group: "assistants",
    description: "The AI-first code editor.",
    categories: ["Composer", "Tab & Autocomplete", "Agent Mode", "Rules & Context"],
  },
  {
    slug: "windsurf",
    name: "Windsurf",
    group: "assistants",
    description: "Codeium's agentic IDE.",
    categories: ["Cascade", "Flows"],
  },
  {
    slug: "amazon-q-developer",
    name: "Amazon Q Developer",
    group: "assistants",
    description: "AWS's AI coding assistant.",
    categories: ["Code Transformation", "Security Scans"],
  },
  {
    slug: "v0",
    name: "v0 by Vercel",
    group: "assistants",
    description: "AI UI generation tool.",
    categories: ["UI Generation", "Component Design"],
  },
  {
    slug: "replit-agent",
    name: "Replit Agent",
    group: "assistants",
    description: "Full app-building AI agent.",
    categories: ["App Building", "Deployment"],
  },
  {
    slug: "antigravity",
    name: "Google Antigravity",
    group: "agentic",
    description: "Google's agentic development platform.",
    categories: ["Agents", "Browser Control", "Workflows"],
  },
  {
    slug: "devin",
    name: "Devin",
    group: "agentic",
    description: "Cognition's autonomous software engineer.",
    categories: ["Autonomous Tasks", "PR Workflows"],
  },
  {
    slug: "mcp",
    name: "Model Context Protocol",
    group: "agentic",
    description: "The open protocol for connecting agents to tools and data.",
    categories: ["Servers & Tools", "Agent Integration"],
  },
  {
    slug: "openai-platform",
    name: "OpenAI Platform",
    group: "foundation",
    description: "OpenAI's models and developer platform.",
    categories: ["Assistants API", "Function Calling", "Reasoning Models", "Custom GPTs"],
  },
  {
    slug: "gemini",
    name: "Gemini",
    group: "foundation",
    description: "Google's multimodal model family.",
    categories: ["Code Assist", "Multimodal", "Workspace Integration"],
  },
  {
    slug: "ai-engineering-concepts",
    name: "AI Engineering Concepts",
    group: "foundation",
    description: "Cross-cutting concepts every AI engineer is asked about.",
    categories: ["Prompt Engineering", "RAG Systems", "Embeddings & Vector DBs", "Fine-Tuning"],
  },
];

// Bespoke, fully-written sample content for the flagship category.
export const CLAUDE_CODE_QUESTIONS = [
  {
    difficulty: "easy",
    question: "What is Claude Code and how does it differ from a chat-based coding assistant?",
    answer:
      "Claude Code is Anthropic's agentic command-line and IDE tool that reads, edits, and runs code directly in your repository, rather than only answering questions in a chat window. It plans multi-file changes, executes shell commands, runs tests, and iterates on failures autonomously, while a chat assistant only proposes snippets you copy in yourself.",
  },
  {
    difficulty: "easy",
    question: "How do you initialize Claude Code in an existing repository?",
    answer:
      "Run `claude` from the project root in a terminal. Claude Code reads the working directory, and picks up a CLAUDE.md file (if present) for project-specific context such as build commands, coding conventions, and architecture notes. No separate 'init' step is required to start working, though `/init` can scaffold a starter CLAUDE.md for you.",
  },
  {
    difficulty: "medium",
    question:
      "Explain how Claude Code's plan mode differs from auto-accept edit mode, and when you'd choose each.",
    answer:
      "Plan mode has Claude draft a step-by-step change proposal before touching any files, which is useful for reviewing scope on large or risky refactors before anything is written to disk. Auto-accept mode applies edits immediately as Claude works, which suits tight, low-risk iteration loops (small bug fixes, test-driven changes) where reviewing every diff individually would slow you down. Senior engineers typically default to plan mode on unfamiliar codebases or cross-cutting changes, and switch to auto-accept for well-scoped, reversible work.",
  },
  {
    difficulty: "hard",
    question:
      "Design a workflow where Claude Code safely refactors a service touching a shared database migration path across three repositories. What guardrails would you add?",
    answer:
      "Start by scoping Claude Code's first pass to read-only exploration across the three repositories to produce a dependency and migration-order map before any edit is proposed. Require plan-mode approval gated on a human reviewer specifically for any file under a migrations/ directory, and keep unrelated refactors in separate sessions so a risky change can't hide inside a large diff. Run the change behind a feature flag and against a staging database snapshot first, with Claude Code's test-execution loop wired to the migration's rollback path so a failed forward migration is exercised automatically. Finally, require a second, independent Claude Code session (or a human) to review the aggregate diff across all three repos before merge, since agentic edits across repo boundaries are exactly where silent inconsistencies are most likely to slip through.",
  },
];

// Cheap, transparent placeholder generator for every other category.
export function placeholderQuestions(tool, category) {
  return [
    {
      difficulty: "easy",
      question: `What is ${category} in ${tool}, and when would you reach for it?`,
      answer: `${category} is one of ${tool}'s core capabilities. (Placeholder answer — replace with real content from Admin → Content → Questions before launch.)`,
    },
    {
      difficulty: "medium",
      question: `Walk through how ${category} behaves in ${tool} under a non-trivial, real-world scenario. What are the trade-offs?`,
      answer: `A strong answer would cover how ${tool}'s ${category} handles context, failure modes, and cost/latency trade-offs. (Placeholder answer — replace with real content from Admin → Content → Questions before launch.)`,
    },
    {
      difficulty: "hard",
      question: `Design a production rollout of ${tool}'s ${category} for a 50-engineer team. What guardrails and review process would you put in place?`,
      answer: `A strong answer would address staged rollout, human-in-the-loop review, observability, and rollback strategy for ${category}. (Placeholder answer — replace with real content from Admin → Content → Questions before launch.)`,
    },
  ];
}
