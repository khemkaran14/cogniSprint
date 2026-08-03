import { useState } from "react";
import { Circle, Square, Triangle, Star, Eye } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CountdownTimer } from "@/components/challenge/Timer";
import { observationScene, observationQuestions } from "@/content/challengeQuestions";
import { skillCategories } from "@/config/brand";
import { cn } from "@/lib/utils";

const shapeIcons = { Circle, Square, Triangle, Star } as const;
const skill = skillCategories.find((s) => s.key === "observation")!;

export function ObservationStep({ onComplete }: { onComplete: (correct: number, total: number) => void }) {
  const [phase, setPhase] = useState<"show" | "questions">("show");
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const question = observationQuestions[index]!;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === question.correctOption;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);

    setTimeout(() => {
      if (index + 1 >= observationQuestions.length) {
        onComplete(nextCorrect, observationQuestions.length);
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
          <Eye className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Observation</p>
          <p className="text-xs text-[var(--color-ink-faint)]">{phase === "show" ? "Study the scene" : `Question ${index + 1} of ${observationQuestions.length}`}</p>
        </div>
      </div>

      {phase === "show" ? (
        <div>
          <div className="mb-6 grid grid-cols-4 gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 sm:grid-cols-7">
            {observationScene.map((item) => {
              const Icon = shapeIcons[item.icon as keyof typeof shapeIcons];
              return (
                <div key={item.id} className="flex items-center justify-center" aria-label={item.label}>
                  <Icon className="h-8 w-8" style={{ color: item.color }} aria-hidden />
                </div>
              );
            })}
          </div>
          <CountdownTimer seconds={6} label="Scene visible for" onComplete={() => setPhase("questions")} />
        </div>
      ) : (
        <div>
          <ProgressBar value={index} max={observationQuestions.length} color={skill.color} className="mb-8" />
          <p className="mb-5 text-lg font-semibold">{question.prompt}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                disabled={!!selected}
                className={cn(
                  "rounded-[var(--radius-md)] border p-4 text-center font-semibold transition-colors",
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
      )}
    </div>
  );
}
