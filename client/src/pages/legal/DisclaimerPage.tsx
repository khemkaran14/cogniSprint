import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { educationalDisclaimer } from "@/config/brand";

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Educational Disclaimer" lastUpdated="2026-07-01" path="/legal/disclaimer">
      <section><p className="text-base">{educationalDisclaimer}</p></section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">What CogniSprint provides</h2>
        <p>Structured, progressive exercises in mental arithmetic, memory technique, focus, logical reasoning, observation and critical thinking, delivered in a short daily format alongside printable materials and periodic assessments of your own progress within the program.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">What CogniSprint does not claim</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>It does not guarantee any increase in IQ or intelligence-test scores.</li>
          <li>It does not guarantee academic, professional or exam outcomes.</li>
          <li>It is not a medical, psychological or diagnostic tool, and does not treat or prevent any condition.</li>
          <li>Results in the free challenge and in-program assessments reflect practice performance only, not intelligence.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Individual results vary</h2>
        <p>Outcomes depend on consistency, prior knowledge, age, health, sleep, lifestyle and individual effort. Structured practice can build skill over time, but no specific result is guaranteed for any individual.</p>
      </section>
    </LegalPageLayout>
  );
}
