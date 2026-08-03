import { Check, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/types/content";
import { cn } from "@/lib/utils";

function calculateDiscountPercentage(regular: number, discounted: number): number {
  if (regular <= 0 || discounted >= regular) return 0;
  return Math.round(((regular - discounted) / regular) * 100);
}

export function PricingCard({ product, className, compact = false }: { product: Product; className?: string; compact?: boolean }) {
  const price = product.price;
  if (!price) return null;

  const discountPercent = calculateDiscountPercentage(price.regularAmount, price.launchAmount);
  const includedItems = product.includes.filter((item) => item.enabled);

  return (
    <div className={cn("surface-card relative overflow-hidden p-8", className)} style={{ borderColor: "var(--color-brand-blue)" }}>
      <Badge variant="brand">Launch pricing</Badge>
      <h3 className="mt-4 text-2xl font-semibold">{product.shortName}</h3>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{product.tagline}</p>

      <div className="mt-6 flex items-end gap-3">
        <p className="font-display text-4xl font-semibold sm:text-5xl">{formatINR(price.launchAmount)}</p>
        <div className="pb-1">
          <p className="text-sm text-[var(--color-ink-faint)] line-through">{formatINR(price.regularAmount)}</p>
          {discountPercent > 0 ? <p className="text-xs font-semibold text-[var(--color-success)]">Save {discountPercent}%</p> : null}
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--color-ink-faint)]">One-time payment • Lifetime access</p>

      <LinkButton to={`/checkout?product=${product.slug}`} size="lg" className="mt-6 w-full">
        Buy Now
      </LinkButton>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
        <ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay
      </p>

      {!compact ? (
        <ul className="mt-8 space-y-3 border-t border-[var(--color-border)] pt-6">
          {includedItems.map((item) => (
            <li key={item.key} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
