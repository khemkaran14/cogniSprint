import { GraduationCap, Briefcase, Users, School, Landmark, UserRound } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";

const audiences = [
  { icon: GraduationCap, title: "Students", description: "Sharper mental calculation, concentration and consistent study habits." },
  { icon: Landmark, title: "Competitive-exam aspirants", description: "Structured practice for aptitude, reasoning and calculation-heavy tests." },
  { icon: Briefcase, title: "Working professionals", description: "Quicker calculation, stronger focus and structured problem-solving for daily work." },
  { icon: Users, title: "Parents", description: "A productive, screen-free-friendly activity to do alongside their children." },
  { icon: School, title: "Teachers & trainers", description: "A preview of structured exercise formats; classroom worksheets are not currently published." },
  { icon: UserRound, title: "Adults & senior learners", description: "A consistent, structured routine of calculation, memory and puzzle practice." },
];

export function AudienceSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Who it's for" title="Built for a broad range of learners — not just one age group" description="The visual style and exercises are designed to feel engaging without being childish, so the program works whether you're 12 or 62." />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience, index) => (
            <Reveal key={audience.title} delay={index * 0.05}>
              <div className="flex h-full items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)]">
                  <audience.icon className="h-5 w-5 text-[var(--color-brand-blue)]" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">{audience.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{audience.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
