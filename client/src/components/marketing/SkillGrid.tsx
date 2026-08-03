import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { SkillIcon } from "@/components/shared/SkillIcon";
import { skillCategories } from "@/config/brand";

export function SkillGrid() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Skills covered"
            title="Six skill areas, trained on a rotation"
            description="Every session touches multiple skills so practice stays varied — and each area gets dedicated modules across the year-long curriculum."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((skill, index) => (
            <Reveal key={skill.key} delay={index * 0.06}>
              <div className="surface-card h-full p-6 transition-transform hover:-translate-y-1">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ background: `color-mix(in srgb, ${skill.color} 14%, transparent)`, color: skill.color }}
                >
                  <SkillIcon name={skill.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{skill.label}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{skill.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
