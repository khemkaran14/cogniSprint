import { Link } from "react-router-dom";
import { ShieldCheck, RefreshCcw, FileText, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";

const items = [
  { icon: Lock, title: "Secure Razorpay payment", description: "We never see or store your card, UPI or bank details." },
  { icon: RefreshCcw, title: "Clear refund policy", description: "Read the exact terms before you buy — no fine print surprises.", href: "/legal/refund-policy" },
  { icon: FileText, title: "Transparent contents", description: "Every included item on the pricing page is actually delivered." },
  { icon: ShieldCheck, title: "Real support", description: "Reach a person for payment, access or technical issues.", href: "/contact" },
];

export function PurchaseReassurance() {
  return (
    <section className="py-16">
      <Container>
        <Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const content = (
                <div className="flex h-full flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 text-center">
                  <item.icon className="h-6 w-6 text-[var(--color-brand-blue)]" aria-hidden />
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{item.description}</p>
                </div>
              );
              return item.href ? <Link key={item.title} to={item.href} className="block">{content}</Link> : <div key={item.title}>{content}</div>;
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
