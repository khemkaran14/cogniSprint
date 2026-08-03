import { Check } from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/types/content";

function calculateDiscountPercentage(regular: number, discounted: number): number {
  if (regular <= 0 || discounted >= regular) return 0;
  return Math.round(((regular - discounted) / regular) * 100);
}

export function CheckoutSummary({ product, discountedAmount }: { product: Product; discountedAmount: number }) {
  const price = product.price!;
  const discountPercent = calculateDiscountPercentage(price.regularAmount, discountedAmount);

  return (
    <div className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">Order summary</p>
      <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{product.tagline}</p>

      <div className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-muted)]">Regular price</span>
          <span className="line-through text-[var(--color-ink-faint)]">{formatINR(price.regularAmount)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total due today</span>
          <span>{formatINR(discountedAmount)}</span>
        </div>
        {discountPercent > 0 ? <p className="text-xs font-medium text-[var(--color-success)]">You save {discountPercent}%</p> : null}
      </div>

      <ul className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4">
        {product.includes.filter((item) => item.enabled).slice(0, 6).map((item) => (
          <li key={item.key} className="flex items-start gap-2 text-xs text-[var(--color-ink-muted)]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
