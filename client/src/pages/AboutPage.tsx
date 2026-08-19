import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { brand, educationalDisclaimer } from "@/config/brand";

const sections = [
  { title: "Why CogniSprint was created", body: "Most of us already spend small blocks of time each day on our phones, often without deciding to. CogniSprint started from a simple question: what if a few of those minutes went toward structured mental practice instead — mental math, memory, focus, reasoning, observation and critical thinking — in a format short enough to actually stick with?" },
  { title: "The problem with passive screen time", body: "There's nothing wrong with rest or entertainment. The issue is when scrolling becomes the default use of every spare minute, with no deliberate choice involved. CogniSprint doesn't ask anyone to give up their phone — it asks for one 15-minute block to be spent differently." },
  { title: "The value of deliberate practice", body: "Skills like mental calculation, memory technique and structured reasoning respond well to short, focused, repeated practice — the same principle behind spaced repetition and skill drills in many other fields. CogniSprint applies that principle to a specific set of everyday cognitive skills." },
  { title: "Our educational philosophy", body: "Progress should be visible, practice should be varied enough to stay interesting, and claims about what the program does should always match what it actually delivers. We'd rather understate results than oversell them." },
  { title: "The program's limitations", body: educationalDisclaimer },
  { title: "The role of consistency", body: "CogniSprint explores how short, repeatable practice can support a learning routine. The currently published preview does not claim or deliver a full-year program, and individual outcomes vary." },
  { title: "The company behind the product", body: `CogniSprint is built and maintained by ${brand.company.owner}.` },
];

export default function AboutPage() {
  return (
    <section className="py-16 sm:py-24">
      <Seo title="About CogniSprint" description="Why CogniSprint was built, the philosophy behind deliberate daily practice, and what the program can and can't do." path="/about" />
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="About" title="Why CogniSprint exists" align="left" />
        <div className="mt-12 space-y-10">
          {sections.map((section, index) => (
            <Reveal key={section.title} delay={index * 0.04}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-[var(--color-ink-muted)] leading-relaxed">{section.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              General enquiries: <a href={`mailto:${brand.contactEmail}`} className="underline">{brand.contactEmail}</a>
              <br />
              Support: <a href={`mailto:${brand.supportEmail}`} className="underline">{brand.supportEmail}</a>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
