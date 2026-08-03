import { Flame } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { Badge } from "@/components/ui/Badge";

const achievementLevels = ["Explorer", "Learner", "Skilled", "Advanced", "Expert", "Master", "Grandmaster", "Brain Champion"];
const previewWeeks = 10;
const previewDaysPerWeek = 7;

export function GamificationPreview() {
  return (
    <section className="bg-[var(--color-surface-sunken)] py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Progress that stays visible"
            title="Streaks, achievement levels and a real progress calendar"
            description="Consistency is the whole point, so your dashboard is built around showing it clearly — not around unhealthy competition."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {achievementLevels.map((level) => (
              <Badge key={level} variant="brand">{level}</Badge>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="surface-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[var(--color-brand-orange)]" aria-hidden />
                <p className="text-sm font-semibold">Practice calendar preview</p>
              </div>
              <p className="text-xs text-[var(--color-ink-faint)]">Illustrative dashboard preview</p>
            </div>
            <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1.5" aria-hidden>
              {Array.from({ length: previewWeeks * previewDaysPerWeek }).map((_, index) => {
                const intensity = (index * 37) % 5;
                const bg = intensity === 0 ? "var(--color-surface-sunken)" : `color-mix(in srgb, var(--color-brand-blue) ${intensity * 20}%, var(--color-surface-sunken))`;
                return <span key={index} className="h-3.5 w-3.5 rounded-[3px]" style={{ background: bg }} />;
              })}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
