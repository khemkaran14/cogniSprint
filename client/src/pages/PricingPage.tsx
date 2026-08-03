import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { PricingCard } from "@/components/marketing/PricingCard";
import { PurchaseReassurance } from "@/components/marketing/PurchaseReassurance";
import { FaqSection } from "@/components/marketing/FaqSection";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useProducts } from "@/lib/queries";

export default function PricingPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const product = products?.[0];

  return (
    <>
      <Seo
        title="Pricing — CogniSprint Brain Training Program"
        description="One clear offer: the CogniSprint Complete Brain Training Program. See what's included, launch pricing, refund policy and secure Razorpay checkout."
        path="/pricing"
      />

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="One program. Everything included. No confusing tiers."
            description="A single, clearly explained offer at launch pricing — the architecture supports future editions and tiers, but we'd rather you understand exactly what you're buying today."
          />
          <div className="mx-auto mt-12 max-w-lg">
            {isLoading ? <LoadingState label="Loading pricing…" /> : null}
            {isError ? <ErrorState onRetry={() => refetch()} /> : null}
            {product ? <PricingCard product={product} /> : null}
          </div>
        </Container>
      </section>

      <PurchaseReassurance />

      <FaqSection category="purchase" title="Purchase questions" eyebrow="FAQ" />
    </>
  );
}
