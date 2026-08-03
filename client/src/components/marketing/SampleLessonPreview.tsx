import { Calculator, BrainCircuit, Puzzle, Eye, Lightbulb, ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/shared/Reveal";

const steps = [
  { icon: Calculator, label: "Mental math", detail: "3 progressively harder calculations" },
  { icon: BrainCircuit, label: "Memory", detail: "Recall a short list after it disappears" },
  { icon: Puzzle, label: "Pattern recognition", detail: "Find the missing item in a sequence" },
  { icon: Eye, label: "Observation", detail: "Spot details in a short scene" },
  { icon: Lightbulb, label: "Critical thinking", detail: "One practical reasoning question" },
];

export function SampleLessonPreview() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Try it before you buy it"
            title="A genuinely interactive 5-minute sample"
            description="No signup required. Work through all five skill areas and see your practice score at the end — it's the same format used throughout the full program."
          />
          <LinkButton to="/sample-challenge" size="lg" className="mt-8">
            Try the free challenge <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="surface-card divide-y divide-[var(--color-border)] p-2">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-4 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)]">
                  <step.icon className="h-5 w-5 text-[var(--color-brand-blue)]" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
