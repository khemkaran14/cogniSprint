import { useState } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mentalMathQuestions } from "@/content/challengeQuestions";
import { skillCategories } from "@/config/brand";

const questions = mentalMathQuestions;
const skill = skillCategories.find((s) => s.key === "mental-math")!;

export function MentalMathStep({ onComplete }: { onComplete: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[index]!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isCorrect = Number(value.trim()) === question.answer;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);

    if (index + 1 >= questions.length) {
      onComplete(nextCorrect, questions.length);
    } else {
      setCorrectCount(nextCorrect);
      setIndex(index + 1);
      setValue("");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${skill.color} 14%, transparent)`, color: skill.color }}>
          <Calculator className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Mental Math</p>
          <p className="text-xs text-[var(--color-ink-faint)]">Question {index + 1} of {questions.length}</p>
        </div>
      </div>

      <ProgressBar value={index} max={questions.length} color={skill.color} className="mb-8" />

      <form onSubmit={handleSubmit}>
        <p className="mb-4 font-display text-3xl font-semibold sm:text-4xl">{question.prompt}</p>
        <Input
          type="number"
          inputMode="numeric"
          autoFocus
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your answer"
          aria-label="Your answer"
          className="max-w-xs text-lg"
        />
        <Button type="submit" className="mt-5">
          {index + 1 >= questions.length ? "Continue" : "Next question"}
        </Button>
      </form>
    </div>
  );
}
