import { Loader2, AlertTriangle, Inbox } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand-blue)]" aria-hidden />
      <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong loading this content.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <AlertTriangle className="h-6 w-6 text-[var(--color-error)]" aria-hidden />
      <p className="text-sm text-[var(--color-ink-muted)]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-semibold text-[var(--color-brand-blue)] hover:underline"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message = "Nothing here yet." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] py-16 text-center">
      <Inbox className="h-6 w-6 text-[var(--color-ink-faint)]" aria-hidden />
      <p className="text-sm text-[var(--color-ink-muted)]">{message}</p>
    </div>
  );
}
