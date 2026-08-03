import { useMemo, useState } from "react";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/challenge/Timer";
import { memoryItems, memoryDistractors } from "@/content/challengeQuestions";
import { skillCategories } from "@/config/brand";
import { cn } from "@/lib/utils";

const skill = skillCategories.find((s) => s.key === "memory")!;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function MemoryStep({ onComplete }: { onComplete: (correct: number, total: number) => void }) {
  const [phase, setPhase] = useState<"show" | "recall">("show");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const shownLabels = useMemo(() => memoryItems.map((i) => i.label), []);
  const options = useMemo(() => shuffle([...shownLabels, ...memoryDistractors]), [shownLabels]);

  function toggle(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function handleSubmit() {
    const correctSelections = shownLabels.filter((label) => selected.has(label)).length;
    const falsePositives = [...selected].filter((label) => !shownLabels.includes(label)).length;
    const correct = Math.max(0, correctSelections - falsePositives);
    onComplete(correct, shownLabels.length);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${skill.color} 14%, transparent)`, color: skill.color }}>
          <BrainCircuit className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Memory</p>
          <p className="text-xs text-[var(--color-ink-faint)]">{phase === "show" ? "Memorise these words" : "Which words did you see?"}</p>
        </div>
      </div>

      {phase === "show" ? (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {memoryItems.map((item) => (
              <div key={item.id} className="surface-card p-4 text-center text-sm font-semibold">{item.label}</div>
            ))}
          </div>
          <CountdownTimer seconds={10} label="Memorising time" onComplete={() => setPhase("recall")} />
        </div>
      ) : (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {options.map((label) => {
              const isSelected = selected.has(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggle(label)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-[var(--radius-md)] border p-4 text-center text-sm font-semibold transition-colors",
                    isSelected ? "border-[var(--color-brand-violet)] bg-[color-mix(in_srgb,var(--color-brand-violet)_12%,transparent)]" : "border-[var(--color-border-strong)] hover:border-[var(--color-brand-violet)]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <Button onClick={handleSubmit}>Submit recall</Button>
        </div>
      )}
    </div>
  );
}
