import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-page", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-blue)]">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-[var(--color-ink-muted)] sm:text-lg">{description}</p> : null}
    </div>
  );
}
