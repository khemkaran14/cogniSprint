import { ArrowRight, RotateCcw } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ScoreBreakdown } from "@/components/challenge/ScoreBreakdown";
import { ShareResultCard } from "@/components/challenge/ShareResultCard";
import { EmailReportForm } from "@/components/challenge/EmailReportForm";
import { feedbackForScore } from "@/lib/challengeScoring";
import type { ChallengeResult } from "@/types/challenge";

const skillLabels: Record<string, string> = {
  "mental-math": "Mental Math",
  memory: "Memory",
  logic: "Pattern Recognition",
  observation: "Observation",
  "critical-thinking": "Critical Thinking",
};

export function ResultsScreen({ result, onRetry }: { result: ChallengeResult; onRetry: () => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-blue)]">Your results</p>
        <h2 className="mt-2 text-3xl font-semibold">Brain Skills Snapshot</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{feedbackForScore(result.overallScore)}</p>

        <div className="mt-6 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4 text-sm">
          Suggested focus area: <span className="font-semibold">{skillLabels[result.focusSkill]}</span> — the Complete
          Brain Training Program includes dedicated modules for this.
        </div>

        <div className="mt-6"><ScoreBreakdown scores={result.scores} /></div>

        <Alert variant="info" className="mt-6" title="This is a practice snapshot, not an intelligence test">
          Your score reflects performance on this short sample only. It is not an IQ score or a diagnostic assessment,
          and it does not measure intelligence.
        </Alert>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/pricing" size="lg">See the full program <ArrowRight className="h-4 w-4" /></LinkButton>
          <Button variant="secondary" size="lg" onClick={onRetry}><RotateCcw className="h-4 w-4" /> Try again</Button>
        </div>
      </div>

      <div className="space-y-6">
        <ShareResultCard result={result} />
        <div className="surface-card p-5"><EmailReportForm result={result} /></div>
      </div>
    </div>
  );
}
