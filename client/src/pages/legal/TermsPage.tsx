import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { brand } from "@/config/brand";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="2026-07-01" path="/legal/terms">
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">1. Acceptance of terms</h2>
        <p>By accessing or purchasing from the {brand.name} website (the &quot;Service&quot;), operated by {brand.company.owner}, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use the Service.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">2. Description of service</h2>
        <p>{brand.name} is an educational skills-practice program covering mental mathematics, memory, focus, logical reasoning, observation and critical thinking. It is provided for educational purposes only and does not constitute medical, psychological or professional advice.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">3. Accounts and access</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Course access is granted according to the terms described on the pricing page at the time of purchase.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">4. Payments</h2>
        <p>Payments are processed securely through Razorpay. We do not store your card, UPI or banking details. All prices are listed in Indian Rupees (INR) unless stated otherwise.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">5. Intellectual property</h2>
        <p>All course content, exercises, illustrations and worksheets are the property of {brand.company.owner} and are licensed to you for personal, non-commercial use only. Redistribution or resale is prohibited without written permission.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">6. No outcome guarantees</h2>
        <p>{brand.name} does not guarantee any specific increase in IQ, intelligence-test scores, academic performance or professional outcomes. See our Educational Disclaimer for full detail.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">7. Limitation of liability</h2>
        <p>To the maximum extent permitted by law, {brand.company.owner} shall not be liable for any indirect, incidental or consequential damages arising from use of the Service.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">8. Changes to these terms</h2>
        <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised terms.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">9. Contact</h2>
        <p>Questions about these terms can be sent to {brand.supportEmail}.</p>
      </section>
    </LegalPageLayout>
  );
}
