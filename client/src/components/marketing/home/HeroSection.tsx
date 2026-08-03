import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Container } from "@/components/ui/Container";
import { SkillIcon } from "@/components/shared/SkillIcon";
import { brand, skillCategories } from "@/config/brand";

const floatOffsets = [0, 0.9, 0.3, 1.2, 0.6, 1.5];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, color-mix(in srgb, var(--color-brand-blue) 16%, transparent), transparent), radial-gradient(50% 40% at 85% 10%, color-mix(in srgb, var(--color-brand-violet) 14%, transparent), transparent)",
        }}
      />

      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-1.5 text-xs font-semibold text-[var(--color-brand-blue)]">
            {brand.tagline}
          </span>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {brand.heroHeadline}
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[var(--color-ink-muted)]">{brand.heroSubheadline}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/pricing" size="lg">
              {brand.primaryCta} <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton to="/sample-challenge" variant="secondary" size="lg">
              <PlayCircle className="h-4 w-4" /> {brand.secondaryCta}
            </LinkButton>
          </div>

          <p className="mt-5 text-sm text-[var(--color-ink-faint)]">{brand.heroMicrocopy}</p>
        </div>

        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4" role="presentation">
          {skillCategories.map((skill, index) => (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: index * 0.08 },
                y: { duration: 4 + floatOffsets[index]!, repeat: Infinity, ease: "easeInOut", delay: floatOffsets[index] },
              }}
              className="surface-card flex flex-col items-start gap-3 p-4"
              style={{ borderTop: `3px solid ${skill.color}` }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]"
                style={{ background: `color-mix(in srgb, ${skill.color} 14%, transparent)`, color: skill.color }}
              >
                <SkillIcon name={skill.icon} className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold">{skill.shortLabel}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
