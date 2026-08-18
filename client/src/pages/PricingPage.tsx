import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { PricingCard } from "@/components/marketing/PricingCard";
import { PurchaseReassurance } from "@/components/marketing/PurchaseReassurance";
import { FaqSection } from "@/components/marketing/FaqSection";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { Alert } from "@/components/ui/Alert";
import { useProducts } from "@/lib/queries";

export default function PricingPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const product = products?.[0];

  return (
    <>
      <Seo
        title="Availability — CogniSprint Learning Preview"
        description="CogniSprint paid enrollment is closed while the complete curriculum and supporting downloads are authored and reviewed."
        path="/pricing"
      />

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Availability"
            title="Paid enrollment is currently closed"
            description="Three foundation lessons and one technical assessment baseline are published. Pricing and checkout will remain unavailable until the launch content, downloads, terms and operational checks are complete."
          />
          <div className="mx-auto mt-12 max-w-lg">
            {isLoading ? <LoadingState label="Loading pricing…" /> : null}
            {isError ? <ErrorState onRetry={() => refetch()} /> : null}
            {product ? <PricingCard product={product} /> : <Alert variant="warning" title="No product is currently for sale">Try the free challenge and review the curriculum roadmap. Do not send payment or reuse an old checkout link.</Alert>}
          </div>
        </Container>
      </section>

      {product ? <PurchaseReassurance /> : null}

      <FaqSection category={product ? "purchase" : "content"} title={product ? "Purchase questions" : "Content availability"} eyebrow="FAQ" />
    </>
  );
}
