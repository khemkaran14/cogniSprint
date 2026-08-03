import { Gift } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { useProducts } from "@/lib/queries";

const bonusKeys = ["habit_tracker", "progress_sheets", "workbook", "worksheets", "certificate", "updates"];

export function BonusesSection() {
  const { data: products } = useProducts();
  const product = products?.[0];
  const bonuses = product?.includes.filter((item) => bonusKeys.includes(item.key) && item.enabled) ?? [];

  if (bonuses.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Included bonuses" title="Everything that comes with your program access" />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bonuses.map((bonus, index) => (
            <Reveal key={bonus.key} delay={index * 0.06}>
              <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
                <Gift className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-violet)]" aria-hidden />
                <p className="text-sm font-medium">{bonus.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
