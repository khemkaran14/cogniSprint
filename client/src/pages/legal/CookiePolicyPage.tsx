import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { brand } from "@/config/brand";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="2026-07-01" path="/legal/cookie-policy">
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">1. What cookies we use</h2>
        <p>We use strictly necessary cookies to operate core functionality such as authentication sessions and theme preference. Where analytics tools are enabled, they may set cookies to measure aggregate site usage.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">2. Your choices</h2>
        <p>You can control cookies through your browser settings. Disabling strictly necessary cookies may prevent parts of the Service, such as staying logged in, from working correctly.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">3. Third-party cookies</h2>
        <p>Payment processing via Razorpay and any embedded analytics scripts may set their own cookies, governed by their respective privacy policies.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">4. Contact</h2>
        <p>Questions about this policy can be sent to {brand.supportEmail}.</p>
      </section>
    </LegalPageLayout>
  );
}
