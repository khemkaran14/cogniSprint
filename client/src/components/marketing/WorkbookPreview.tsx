import { FileText, Printer, BookOpen } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";

const items = [
  { icon: BookOpen, title: "Full downloadable workbook", description: "A structured PDF workbook covering every module, formatted for calm, focused reading." },
  { icon: Printer, title: "Printable practice worksheets", description: "Print-ready worksheets for mental math, memory and logic drills — no screen required." },
  { icon: FileText, title: "Progress & habit trackers", description: "Printable calendars and trackers to log your daily streak and monthly assessment scores." },
];

export function WorkbookPreview() {
  return (
    <section className="bg-[var(--color-surface-sunken)] py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Beyond the screen" title="A real workbook, not just an app" description="CogniSprint is built to work on paper as well as on screen, so the daily habit doesn't depend on being logged in." />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <div className="surface-card h-full p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-brand-blue)_12%,transparent)] text-[var(--color-brand-blue)]">
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
