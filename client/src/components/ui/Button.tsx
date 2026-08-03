import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-semibold transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-glow-blue)] hover:bg-[var(--color-brand-blue-strong)]",
        secondary: "bg-[var(--color-surface-raised)] text-[var(--color-ink)] border border-[var(--color-border-strong)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]",
        ghost: "text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]",
        outlineInverse: "border border-white/20 text-white hover:bg-white/10",
        destructive: "bg-[var(--color-error)] text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
