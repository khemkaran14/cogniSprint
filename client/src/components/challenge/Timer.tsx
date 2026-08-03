import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function CountdownTimer({ seconds, onComplete, label }: { seconds: number; onComplete: () => void; label: string }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timeout = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        <span aria-live="polite">{remaining}s</span>
      </div>
      <ProgressBar value={seconds - remaining} max={seconds} />
    </div>
  );
}
