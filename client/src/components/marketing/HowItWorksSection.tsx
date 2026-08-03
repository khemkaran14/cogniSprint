import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";

const steps = [
  { title: "Choose your plan", description: "Review what's included and select the program on the pricing page." },
  { title: "Checkout securely", description: "Pay through Razorpay's secure checkout — we never see your card or bank details." },
  { title: "Get instant access", description: "Your account and dashboard are ready as soon as payment is verified." },
  { title: "Start today's session", description: "Begin with Module 1 and your first 15-minute daily session." },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="How it works" title="From checkout to your first session in minutes" />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <div className="relative pl-4">
                <span className="font-display text-4xl font-semibold text-[var(--color-border-strong)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
