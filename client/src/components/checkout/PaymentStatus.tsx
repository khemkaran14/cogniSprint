import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PaymentStatus({
  status,
  message,
  onRetry,
}: {
  status: "processing" | "success" | "failed" | "unavailable";
  message?: string;
  onRetry?: () => void;
}) {
  if (status === "processing") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-blue)]" aria-hidden />
        <p className="text-sm font-medium">Verifying your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-[var(--color-success)]" aria-hidden />
        <p className="text-lg font-semibold">Payment verified</p>
        {message ? <p className="text-sm text-[var(--color-ink-muted)]">{message}</p> : null}
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertTriangle className="h-10 w-10 text-[var(--color-warning)]" aria-hidden />
        <p className="text-lg font-semibold">Payment isn&apos;t connected yet</p>
        <p className="max-w-sm text-sm text-[var(--color-ink-muted)]">
          {message ?? "This environment doesn't have live payment processing configured. Please contact support to complete your purchase."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <XCircle className="h-10 w-10 text-[var(--color-error)]" aria-hidden />
      <p className="text-lg font-semibold">Payment didn&apos;t go through</p>
      <p className="max-w-sm text-sm text-[var(--color-ink-muted)]">{message ?? "No amount was charged. You can retry or contact support."}</p>
      {onRetry ? <Button onClick={onRetry} className="mt-2">Try again</Button> : null}
    </div>
  );
}
