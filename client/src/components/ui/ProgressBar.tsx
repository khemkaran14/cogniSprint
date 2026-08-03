import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  className,
  color,
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  label?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-surface-sunken)]"
      >
        <div
          className="h-full rounded-[var(--radius-full)] transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]"
          style={{ width: `${percentage}%`, background: color || "var(--color-brand-blue)" }}
        />
      </div>
    </div>
  );
}
