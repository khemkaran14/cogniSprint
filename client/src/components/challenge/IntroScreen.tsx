import { Calculator, BrainCircuit, Puzzle, Eye, Lightbulb, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  { icon: Calculator, label: "Mental math" },
  { icon: BrainCircuit, label: "Memory" },
  { icon: Puzzle, label: "Pattern recognition" },
  { icon: Eye, label: "Observation" },
  { icon: Lightbulb, label: "Critical thinking" },
];

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">The Brain Skills Challenge</h1>
      <p className="mx-auto mt-3 max-w-lg text-[var(--color-ink-muted)]">
        Five short rounds, about 3–5 minutes total. Get a practice snapshot across mental math, memory,
        pattern recognition, observation and critical thinking.
      </p>

      <div className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border)] px-4 py-2 text-sm">
            <step.icon className="h-4 w-4 text-[var(--color-brand-blue)]" aria-hidden />
            {step.label}
          </div>
        ))}
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
        <Clock className="h-3.5 w-3.5" /> No signup required · this is a practice snapshot, not an IQ test
      </p>

      <Button size="lg" className="mt-8" onClick={onStart}>Start the challenge</Button>
    </div>
  );
}
