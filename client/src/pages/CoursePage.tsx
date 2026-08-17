import { Link } from "react-router-dom";
import { ArrowRight, Award, Calendar, Clock, Layers } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/shared/Reveal";
import { CurriculumAccordion } from "@/components/course/CurriculumAccordion";
import { FaqSection } from "@/components/marketing/FaqSection";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useCurriculum } from "@/lib/queries";

const phaseGroups = [
  { phase: "guided_learning" as const, title: "Guided learning (months 1–3)" },
  { phase: "structured_practice" as const, title: "Structured practice (months 4–12)" },
  { phase: "assessment" as const, title: "Assessments & the full challenge" },
];

export default function CoursePage() {
  const { data: modules, isLoading, isError, refetch } = useCurriculum();

    const facts = [
    { icon: Calendar, label: "3 lessons", detail: "Published foundation content" },
    { icon: Clock, label: "~15 minutes", detail: "Proposed session target" },
    { icon: Layers, label: `${modules?.length ?? 20} modules`, detail: "Roadmap structure, mostly unpublished" },
    { icon: Award, label: "1 assessment", detail: "Technical baseline, not a monthly bank" },
  ];

  return (
    <>
      <Seo
        title="CogniSprint Course Roadmap and Published Preview"
        description="Review three published CogniSprint foundation lessons and the proposed curriculum roadmap. Paid enrollment is currently closed."
        path="/brain-training-course"
      />

      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Published preview and roadmap"
              title="Three lessons available; the complete curriculum is still in development"
              description="CogniSprint currently demonstrates protected learning, exercises, scoring and progress with three reviewed foundation lessons. The wider module structure is a roadmap, not delivered purchase content."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="surface-card p-5 text-center">
                  <fact.icon className="mx-auto h-6 w-6 text-[var(--color-brand-blue)]" aria-hidden />
                  <p className="mt-3 text-lg font-semibold">{fact.label}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{fact.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[var(--color-surface-sunken)] py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Curriculum roadmap" title="Published foundations and planned modules" description="Counts on planned module cards are design targets. Only three Getting Started lessons are currently published." align="left" />
          </Reveal>

          {isLoading ? <LoadingState label="Loading curriculum…" /> : null}
          {isError ? <ErrorState onRetry={() => refetch()} /> : null}

          {modules ? (
            <div className="mt-10 space-y-12">
              {phaseGroups.map((group) => (
                <div key={group.phase}>
                  <h3 className="mb-4 text-lg font-semibold">{group.title}</h3>
                  <CurriculumAccordion modules={modules.filter((m) => m.phase === group.phase)} />
                </div>
              ))}
            </div>
          ) : null}

          <p className="mt-6 text-center">
            <Link to="/curriculum" className="text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
              Browse the searchable roadmap →
            </Link>
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="surface-card h-full p-8">
              <h3 className="text-xl font-semibold">Learning format</h3>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                The three published lessons combine short explanations and interactive exercises with immediate feedback.
                One technical assessment baseline demonstrates secure scoring. Monthly assessment coverage, printable
                worksheets and a downloadable workbook are not currently available.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="surface-card h-full p-8">
              <h3 className="text-xl font-semibold">Course access</h3>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                Paid enrollment is closed. The current preview does not include a complete 365-day curriculum,
                worksheets or a downloadable workbook. Pricing and access terms will be published only after the
                reviewed launch package is available.
              </p>
              <LinkButton to="/pricing" className="mt-5">
                See availability <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </section>

      <FaqSection category="content" title="Course questions" eyebrow="FAQ" />

      <section className="pb-24">
        <Container>
          <div className="surface-card flex flex-col items-center gap-4 p-10 text-center">
            <h3 className="text-2xl font-semibold">Review current content availability</h3>
            <LinkButton to="/sample-challenge" size="lg">
              Try the free challenge <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
