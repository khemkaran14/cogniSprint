import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { criticalThinkingQuestions } from "@/content/challengeQuestions";
import { skillCategories } from "@/config/brand";
import { cn } from "@/lib/utils";

const questions = criticalThinkingQuestions;
const skill = skillCategories.find((s) => s.key === "critical-thinking")!;

export function CriticalThinkingStep({ onComplete }: { onComplete: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const question = questions[index]!;
  const isLast = index + 1 >= questions.length;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
  }

  function next() {
    const isCorrect = selected === question.correctOption;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    if (isLast) {
      onComplete(nextCorrect, questions.length);
    } else {
      setCorrectCount(nextCorrect);
      setIndex(index + 1);
      setSelected(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${skill.color} 14%, transparent)`, color: skill.color }}>
          <Lightbulb className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Critical Thinking</p>
          <p className="text-xs text-[var(--color-ink-faint)]">Question {index + 1} of {questions.length}</p>
        </div>
      </div>

      <p className="mb-5 text-lg font-semibold">{question.prompt}</p>

      <div className="grid gap-3">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            disabled={!!selected}
            className={cn(
              "rounded-[var(--radius-md)] border p-4 text-left font-medium transition-colors",
              selected === option
                ? option === question.correctOption
                  ? "border-[var(--color-success)] bg-[var(--color-success-surface)]"
                  : "border-[var(--color-error)] bg-[var(--color-error-surface)]"
                : "border-[var(--color-border-strong)] hover:border-[var(--color-brand-blue)]"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4 text-sm text-[var(--color-ink-muted)]">
          {question.explanation}
        </div>
      ) : null}

      {selected ? (
        <Button onClick={next} className="mt-5">
          {isLast ? "See my results" : "Next question"}
        </Button>
      ) : null}
    </div>
  );
}
