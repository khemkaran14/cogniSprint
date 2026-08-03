import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { useCurriculum } from "@/lib/queries";

const phases = [
  { label: "Months 1–3", title: "Guided learning", description: "Structured lessons introduce each technique step by step — mental arithmetic foundations, memory methods, focus drills and early logic work." },
  { label: "Months 4–12", title: "Structured practice", description: "Daily sessions apply what you've learned with progressively harder exercises across all six skill areas, plus a rotating library of brain games." },
  { label: "Every month", title: "Assessment checkpoint", description: "A short monthly assessment summarises progress across every skill category so you can see what's improving and what needs more attention." },
  { label: "Day 365", title: "Completion certificate", description: "Finish the full one-year practice calendar and unlock a shareable completion certificate with a verification ID." },
];

export function CourseTimeline() {
  const { data: modules } = useCurriculum();
  const lessonCount = modules?.reduce((sum, m) => sum + m.lessonCount, 0) ?? 0;
  const exerciseCount = modules?.reduce((sum, m) => sum + m.exerciseCount, 0) ?? 0;

  return (
    <section className="bg-[var(--color-surface-sunken)] py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The 12-month roadmap"
            title="365 days, structured into four phases"
            description={
              lessonCount
                ? `${lessonCount.toLocaleString("en-IN")}+ lessons and ${exerciseCount.toLocaleString("en-IN")}+ exercises across the full program.`
                : "Lessons and exercises across the full program."
            }
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
