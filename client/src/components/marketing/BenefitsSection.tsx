import { CheckCircle2 } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";

const benefits = [
  "Practise faster mental calculation",
  "Strengthen recall strategies for names, numbers and lists",
  "Build a consistent daily focus routine",
  "Improve confidence working with numbers",
  "Learn structured, repeatable problem-solving approaches",
  "Develop sharper observation and attention to detail",
  "Practise logical and critical thinking through varied exercises",
  "Spend a little less leisure time on passive scrolling",
];

export function BenefitsSection() {
  return (
    <section className="bg-[var(--color-surface-sunken)] py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="What consistent practice builds" title="Real, specific benefits — not vague promises" />
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-[var(--color-ink)] sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" aria-hidden />
                {benefit}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
