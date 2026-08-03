import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { PricingCard } from "@/components/marketing/PricingCard";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useProducts } from "@/lib/queries";

export function HomePricingSection() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const product = products?.[0];

  return (
    <section className="bg-[var(--color-surface-sunken)] py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="One clear offer" title="Everything you need, in a single program" />
        </Reveal>
        <div className="mx-auto mt-12 max-w-lg">
          {isLoading ? <LoadingState label="Loading pricing…" /> : null}
          {isError ? <ErrorState onRetry={() => refetch()} /> : null}
          {product ? (
            <Reveal delay={0.1}>
              <PricingCard product={product} />
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
