import { CheckCircle2 } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { SkillIcon } from "@/components/shared/SkillIcon";
import { skillCategories } from "@/config/brand";

const dailySteps = [
  { minutes: 3, skill: skillCategories[0] },
  { minutes: 2, skill: skillCategories[1] },
  { minutes: 2, skill: skillCategories[2] },
  { minutes: 2, skill: skillCategories[3] },
  { minutes: 2, skill: skillCategories[4] },
  { minutes: 2, skill: skillCategories[5] },
];

export function DailyRoutine() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The daily 15-minute system"
            title="A proposed short-session format across six skills"
            description="The free challenge demonstrates six skill categories. Published lessons currently cover only the reviewed foundation material shown in the learning catalogue."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dailySteps.map((step, index) => (
            <Reveal key={step.skill.key} delay={index * 0.05}>
              <div className="surface-card h-full p-5">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]"
                    style={{ background: `color-mix(in srgb, ${step.skill.color} 14%, transparent)`, color: step.skill.color }}
                  >
                    <SkillIcon name={step.skill.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-ink-faint)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold">{step.minutes} min</p>
                <p className="text-sm text-[var(--color-ink-muted)]">{step.skill.label}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={dailySteps.length * 0.05}>
            <div className="surface-card flex h-full flex-col justify-center p-5 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-[var(--color-success)]" aria-hidden />
              <p className="mt-3 text-lg font-semibold">2 min</p>
              <p className="text-sm text-[var(--color-ink-muted)]">Reflection &amp; streak check-in</p>
            </div>
          </Reveal>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-faint)]">
          15 minutes is the target, not a hard cut-off — finish the exercise in front of you at your own pace.
        </p>
      </Container>
    </section>
  );
}
