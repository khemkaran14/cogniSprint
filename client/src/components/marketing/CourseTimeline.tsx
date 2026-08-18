import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
const phases = [
  { label: "Available now", title: "Foundation preview", description: "Three published Getting Started lessons demonstrate protected access, exercises, scoring, drafts and progress tracking." },
  { label: "Available now", title: "Assessment baseline", description: "One technical baseline demonstrates server-side assessment scoring. It is not a complete monthly assessment bank." },
  { label: "Planned", title: "Expanded curriculum", description: "The additional modules and daily sessions remain an authoring roadmap and are not currently included in a sale." },
  { label: "Unavailable", title: "Program certificate", description: "The verification workflow exists, but qualification is impossible until at least 365 reviewed lessons are published and completed." },
];

export function CourseTimeline() {
  return (
    <section className="bg-[var(--color-surface-sunken)] py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Content availability"
            title="Published now versus planned"
            description="Only reviewed, published material is represented as available. Roadmap counts are not purchase deliverables."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {phases.map((phase, index) => (
            <Reveal key={phase.title} delay={index * 0.08}>
              <div className="surface-card h-full p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-blue)]">{phase.label}</p>
                <h3 className="mt-2 text-lg font-semibold">{phase.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{phase.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
