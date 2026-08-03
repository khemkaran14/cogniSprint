import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { brand } from "@/config/brand";

export function ProblemSolutionSection() {
  return (
    <>
      <section className="py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-blue)]">
              What could 15 focused minutes do?
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Most of us already have 15 minutes a day. It just goes somewhere else.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-base text-[var(--color-ink-muted)] sm:text-lg">
              A quick scroll between tasks. A few extra minutes on a feed before bed. None of it feels
              significant in the moment — but across a year, those small blocks of time add up to
              something substantial, spent on nothing in particular.
            </p>
            <p className="mt-4 text-base text-[var(--color-ink-muted)] sm:text-lg">
              CogniSprint doesn&apos;t ask for hours you don&apos;t have. It asks for one of those
              15-minute blocks, redirected toward structured practice in mental math, memory, focus,
              reasoning and problem-solving — every day, for a year.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[var(--color-surface-sunken)] py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Introducing CogniSprint"
              title="A structured 365-day system, not another app to check occasionally"
              description={brand.positioningStatement}
            />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
