import { Link } from "react-router-dom";
import { ArrowRight, Award, Calendar, Clock, Layers } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/shared/Reveal";
import { CurriculumAccordion } from "@/components/course/CurriculumAccordion";
import { FaqSection } from "@/components/marketing/FaqSection";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useCurriculum, useProducts } from "@/lib/queries";

const phaseGroups = [
  { phase: "guided_learning" as const, title: "Guided learning (months 1–3)" },
  { phase: "structured_practice" as const, title: "Structured practice (months 4–12)" },
  { phase: "assessment" as const, title: "Assessments & the full challenge" },
];

export default function CoursePage() {
  const { data: modules, isLoading, isError, refetch } = useCurriculum();
  const { data: products } = useProducts();
  const product = products?.[0];

  const lessonCount = modules?.reduce((s, m) => s + m.lessonCount, 0) ?? 0;

  const facts = [
    { icon: Calendar, label: "12 months", detail: "3 guided + 9 structured practice" },
    { icon: Clock, label: "15 minutes/day", detail: "Target daily commitment" },
    { icon: Layers, label: `${modules?.length ?? 20} modules`, detail: `${lessonCount || "300+"} lessons` },
    { icon: Award, label: "12 assessments", detail: "One per month, plus a certificate" },
  ];

  return (
    <>
      <Seo
        title="Brain Training Course — Mental Math, Memory & Reasoning Program"
        description="A structured 365-day brain-training course covering mental math, memory technique, focus, logic, observation and critical thinking in 15-minute daily sessions."
        path="/brain-training-course"
      />

      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The complete program"
              title="One structured course, twelve months, six skill areas"
              description="CogniSprint combines mental mathematics, memory technique, focus, logical reasoning, observation and critical thinking into a single daily routine — building from guided lessons to independent practice over a full year."
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
            <SectionHeading eyebrow="Complete curriculum" title="Every module, from foundations to the full challenge" align="left" />
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
              Browse the full searchable curriculum →
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
                Each lesson combines a short explanation, worked examples and interactive exercises with immediate
                feedback. Assessments run monthly and summarise progress across every skill category. Everything is
                available digitally, with printable worksheets and a downloadable workbook for offline practice.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="surface-card h-full p-8">
              <h3 className="text-xl font-semibold">Course access</h3>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                Purchasing the program grants lifetime access to the current 365-day curriculum, all worksheets and
                the downloadable workbook, along with future content updates. A completion certificate becomes
                available once the full one-year practice calendar is finished.
              </p>
              <LinkButton to="/pricing" className="mt-5">
                See pricing <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </section>

      <FaqSection category="content" title="Course questions" eyebrow="FAQ" />

      <section className="pb-24">
        <Container>
          <div className="surface-card flex flex-col items-center gap-4 p-10 text-center">
            <h3 className="text-2xl font-semibold">Ready to start Module 1?</h3>
            {product ? (
              <LinkButton to={`/checkout?product=${product.slug}`} size="lg">
                Enrol in {product.shortName} <ArrowRight className="h-4 w-4" />
              </LinkButton>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}
