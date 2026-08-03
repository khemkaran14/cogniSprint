import { Container } from "@/components/ui/Container";
import { useCurriculum } from "@/lib/queries";

export function TrustFactsSection() {
  const { data: modules } = useCurriculum();
  const exerciseCount = modules?.reduce((sum, m) => sum + m.exerciseCount, 0) ?? 0;

  const facts = [
    { value: "365", label: "Daily training sessions" },
    { value: "15 min", label: "Target daily practice time" },
    { value: `${modules?.length ?? 20}`, label: "Structured learning modules" },
    { value: exerciseCount ? `${exerciseCount.toLocaleString("en-IN")}+` : "10,000+", label: "Practice exercises" },
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
