import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/shared/QueryStates";
import { formatINR } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { brand } from "@/config/brand";

type OrderDetails = { orderId: string; amount: number; currency: string; status: string; productName?: string };

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiGet<OrderDetails>(`/checkout/order/${orderId}`),
    enabled: Boolean(orderId),
  });

  return (
    <section className="py-16 sm:py-24">
      <Seo title="Payment Successful" path="/checkout/success" noindex />
      <Container className="max-w-xl text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--color-success)]" aria-hidden />
        <h1 className="mt-5 text-3xl font-semibold">Payment received</h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">Thank you for enrolling in {brand.name}. Here are your order details.</p>

        <div className="surface-card mt-8 p-6 text-left">
          {isLoading ? (
            <LoadingState label="Loading order details…" />
          ) : (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-muted)]">Order reference</dt>
                <dd className="font-mono">{orderId ?? "—"}</dd>
              </div>
              {order ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-muted)]">Amount</dt>
                    <dd className="font-semibold">{formatINR(order.amount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-muted)]">Status</dt>
                    <dd className="capitalize">{order.status}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          )}
        </div>

        <Alert variant="info" className="mt-6 text-left" title="Check your email">
          <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 shrink-0" /> A confirmation email with your access details is on its way.</span>
        </Alert>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton to="/account" size="lg">View my course access <ArrowRight className="h-4 w-4" /></LinkButton>
          <Link to="/contact" className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand-blue)]">
            Contact support
          </Link>
        </div>
      </Container>
    </section>
  );
}
