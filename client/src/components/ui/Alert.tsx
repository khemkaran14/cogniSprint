import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex gap-3 rounded-[var(--radius-md)] border p-4 text-sm", {
  variants: {
    variant: {
      info: "border-[var(--color-info)]/30 bg-[var(--color-info-surface)] text-[var(--color-ink)]",
      success: "border-[var(--color-success)]/30 bg-[var(--color-success-surface)] text-[var(--color-ink)]",
      warning: "border-[var(--color-warning)]/30 bg-[var(--color-warning-surface)] text-[var(--color-ink)]",
      error: "border-[var(--color-error)]/30 bg-[var(--color-error-surface)] text-[var(--color-ink)]",
    },
  },
  defaultVariants: { variant: "info" },
});

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
}

export function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn(alertVariants({ variant, className }))} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-[var(--color-ink-muted)]">{children}</div>
      </div>
    </div>
  );
}
