import { useState } from "react";
import { Puzzle } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { patternQuestions } from "@/content/challengeQuestions";
import { skillCategories } from "@/config/brand";
import { cn } from "@/lib/utils";

const skill = skillCategories.find((s) => s.key === "logic")!;

export function PatternStep({ onComplete }: { onComplete: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const question = patternQuestions[index]!;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === question.correctOption;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);

    setTimeout(() => {
      if (index + 1 >= patternQuestions.length) {
        onComplete(nextCorrect, patternQuestions.length);
      } else {
        setCorrectCount(nextCorrect);
        setIndex(index + 1);
        setSelected(null);
      }
    }, 500);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${skill.color} 14%, transparent)`, color: skill.color }}>
          <Puzzle className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Pattern Recognition</p>
          <p className="text-xs text-[var(--color-ink-faint)]">Question {index + 1} of {patternQuestions.length}</p>
        </div>
      </div>

      <ProgressBar value={index} max={patternQuestions.length} color={skill.color} className="mb-8" />

      <div className="mb-6 flex flex-wrap items-center gap-3 font-display text-2xl font-semibold sm:text-3xl">
        {question.sequence.map((item, i) => (
          <span
            key={i}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)]",
              item === "?" ? "border-2 border-dashed border-[var(--color-border-strong)]" : "bg-[var(--color-surface-sunken)]"
            )}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            disabled={!!selected}
            className={cn(
              "rounded-[var(--radius-md)] border p-4 text-center text-lg font-semibold transition-colors",
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
    </div>
  );
}
