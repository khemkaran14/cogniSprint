import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { brand } from "@/config/brand";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="2026-07-01" path="/legal/privacy">
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">1. Information we collect</h2>
        <p>We collect information you provide directly, such as your name, email address and phone number when you create an account, purchase a course, subscribe to our newsletter or contact support. We also collect usage data such as pages visited, exercises completed and progress data, and payment metadata from Razorpay (we never receive or store your card or bank details directly).</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">2. How we use information</h2>
        <p>We use your information to provide and improve the Service, process payments, send transactional emails (account, payment and course-related communication), respond to support requests, and — only with your consent — send marketing communications such as the newsletter.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">3. Analytics</h2>
        <p>We may use privacy-conscious analytics tools to understand how the Service is used in aggregate. These tools are only activated with appropriate consent where required by applicable law.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">4. Data sharing</h2>
        <p>We share data with service providers strictly as needed to operate the Service — for example, Razorpay for payment processing and our transactional email provider for sending emails. We do not sell your personal data.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">5. Data retention</h2>
        <p>We retain account and order data for as long as your account is active or as required for legal, accounting or reporting purposes.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">6. Your rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data by contacting {brand.supportEmail}, subject to applicable law.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">7. Security</h2>
        <p>We use industry-standard security measures, including encrypted connections and secure payment processing, to protect your data.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">8. Children&apos;s privacy</h2>
        <p>{brand.name} is designed for ages 10 and above. Where a user is a minor, we expect a parent or guardian to review these policies and supervise account creation and purchases.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">9. Contact</h2>
        <p>Privacy questions can be sent to {brand.supportEmail}.</p>
      </section>
    </LegalPageLayout>
  );
}
