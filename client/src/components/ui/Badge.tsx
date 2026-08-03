import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]",
      brand: "bg-[color-mix(in_srgb,var(--color-brand-blue)_12%,transparent)] text-[var(--color-brand-blue)]",
      success: "bg-[var(--color-success-surface)] text-[var(--color-success)]",
      warning: "bg-[var(--color-warning-surface)] text-[var(--color-warning)]",
      error: "bg-[var(--color-error-surface)] text-[var(--color-error)]",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
