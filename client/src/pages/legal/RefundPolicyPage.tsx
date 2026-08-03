import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { brand } from "@/config/brand";

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy" lastUpdated="2026-07-01" path="/legal/refund-policy">
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">1. Refund window</h2>
        <p>If you are not satisfied with {brand.name}, you may request a full refund within 7 days of your purchase date, provided you have not completed more than 20% of the guided learning modules. This window and condition are configurable — confirm the final figures before launch.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">2. How to request a refund</h2>
        <p>Email {brand.supportEmail} with your order reference and the email address used at checkout. Refund requests are typically processed within 5–7 business days back to the original payment method via Razorpay.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">3. Non-refundable circumstances</h2>
        <p>Refunds are not available once the refund window has closed, or where a completion certificate has already been issued. Coupon-discounted purchases are refunded at the amount actually paid.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">4. Cancellations</h2>
        <p>Because {brand.name} is currently offered as a one-time lifetime-access purchase rather than a recurring subscription, there is no recurring charge to cancel. If a subscription plan is introduced in future, this policy will be updated with cancellation instructions specific to that plan.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">5. Contact</h2>
        <p>Refund questions can be sent to {brand.supportEmail}.</p>
      </section>
    </LegalPageLayout>
  );
}
