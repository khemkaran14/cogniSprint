import { useSearchParams } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useProduct, useProducts } from "@/lib/queries";

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const requestedSlug = searchParams.get("product");

  const { data: products } = useProducts();
  const fallbackSlug = products?.[0]?.slug ?? "";
  const { data: product, isLoading, isError, refetch } = useProduct(requestedSlug ?? fallbackSlug);

  return (
    <section className="py-16 sm:py-20">
      <Seo title="Checkout" path="/checkout" noindex />
      <Container>
        <SectionHeading align="left" eyebrow="Checkout" title="Complete your purchase" />
        <div className="mt-10">
          {isLoading ? <LoadingState label="Loading order details…" /> : null}
          {isError ? <ErrorState message="We couldn't find that product." onRetry={() => refetch()} /> : null}
          {product ? <CheckoutForm product={product} /> : null}
        </div>
      </Container>
    </section>
  );
}
