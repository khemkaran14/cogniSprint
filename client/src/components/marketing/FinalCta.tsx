import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/shared/Reveal";
import { brand } from "@/config/brand";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div
            className="overflow-hidden rounded-[var(--radius-xl)] px-8 py-16 text-center text-white sm:px-16"
            style={{ background: "linear-gradient(135deg, var(--color-brand-navy), var(--color-brand-blue-strong) 55%, var(--color-brand-violet))" }}
          >
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
              Your next 15 minutes could go toward something you&apos;ll actually feel in a year.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Start with the free challenge, or go straight to the full 365-day program.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton to="/pricing" size="lg" className="bg-white text-[var(--color-brand-navy)] hover:bg-white/90">
                {brand.primaryCta} <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to="/sample-challenge" size="lg" variant="outlineInverse">
                {brand.secondaryCta}
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
