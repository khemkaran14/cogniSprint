import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { skillCategories } from "@/config/brand";
import { siteConfig } from "@/config/seo";
import type { ChallengeResult } from "@/types/challenge";

const skillLabels: Record<string, string> = {
  "mental-math": "Mental Math",
  memory: "Memory",
  logic: "Pattern Recognition",
  observation: "Observation",
  "critical-thinking": "Critical Thinking",
};

export function ShareResultCard({ result }: { result: ChallengeResult }) {
  const [copied, setCopied] = useState(false);
  const strongestLabel = skillLabels[result.strongestSkill] ?? result.strongestSkill;
  const strongestColor = skillCategories.find((s) => s.key === result.strongestSkill)?.color;

  const shareText = `I scored ${result.overallScore}/100 on the CogniSprint Brain Skills Challenge, with ${strongestLabel} as my strongest area. Try it yourself:`;
  const shareUrl = `${siteConfig.url}/sample-challenge`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "CogniSprint Brain Skills Challenge", text: shareText, url: shareUrl });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] p-6 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-brand-navy), var(--color-brand-blue-strong) 60%, var(--color-brand-violet))" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">CogniSprint Brain Skills Snapshot</p>
        <p className="mt-3 font-display text-5xl font-semibold">{result.overallScore}<span className="text-2xl text-white/70">/100</span></p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/80">
          Strongest skill:
          <span className="inline-flex items-center rounded-[var(--radius-full)] bg-white px-2.5 py-0.5 text-xs font-semibold" style={{ color: strongestColor }}>
            {strongestLabel}
          </span>
        </p>
        <p className="mt-1 text-xs text-white/60">Completed in {result.durationSeconds}s · cognisprint.divyrs.com</p>
      </div>

      <Button variant="secondary" className="mt-4 w-full" onClick={handleShare}>
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Copied to clipboard" : "Share my result"}
      </Button>
    </div>
  );
}
