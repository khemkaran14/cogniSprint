import { Container } from "@/components/ui/Container";
import type { ContentAvailability } from "@/lib/queries";

export function TrustFactsSection({ availability }: { availability?: ContentAvailability }) {
  const facts = [
    { value: availability ? String(availability.published.lessons) : "—", label: "Published foundation lessons" },
    { value: availability ? String(availability.published.assessments) : "—", label: "Published assessment baselines" },
    { value: "6", label: "Skills in the free challenge" },
    { value: availability?.enrollmentOpen ? "Open" : "Closed", label: "Paid enrollment status" },
  ];

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-sunken)] py-10">
      <Container>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-[var(--color-brand-blue)] sm:text-4xl">{fact.value}</p>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)] sm:text-sm">{fact.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
