import { ProgressBar } from "@/components/ui/ProgressBar";
import { skillCategories } from "@/config/brand";
import type { SkillScore } from "@/types/challenge";

const skillLabels: Record<string, string> = {
  "mental-math": "Mental Math",
  memory: "Memory",
  logic: "Pattern Recognition",
  observation: "Observation",
  "critical-thinking": "Critical Thinking",
};

export function ScoreBreakdown({ scores }: { scores: SkillScore[] }) {
  return (
    <div className="space-y-4">
      {scores.map((score) => {
        const skill = skillCategories.find((s) => s.key === score.skill);
        return (
          <div key={score.skill}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">{skillLabels[score.skill] ?? score.skill}</span>
              <span className="text-[var(--color-ink-faint)]">{score.correct}/{score.total} · {score.percentage}%</span>
            </div>
            <ProgressBar value={score.percentage} color={skill?.color} />
          </div>
        );
      })}
    </div>
  );
}
