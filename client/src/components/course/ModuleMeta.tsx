import { Clock, BookOpen, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { skillCategories } from "@/config/brand";
import type { CurriculumModule } from "@/types/content";

const difficultyVariant = { beginner: "success", intermediate: "warning", advanced: "error" } as const;

export function ModuleMeta({ module }: { module: CurriculumModule }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={difficultyVariant[module.difficulty]}>{module.difficulty}</Badge>
      {module.skills.map((skillKey) => {
        const skill = skillCategories.find((s) => s.key === skillKey);
        if (!skill) return null;
        return (
          <span
            key={skillKey}
            className="rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-medium"
            style={{ background: `color-mix(in srgb, ${skill.color} 12%, transparent)`, color: skill.color }}
          >
            {skill.shortLabel}
          </span>
        );
      })}
      {module.previewAvailable ? <Badge variant="brand">Preview available</Badge> : null}
    </div>
  );
}

export function ModuleStats({ module }: { module: CurriculumModule }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-[var(--color-ink-faint)]">
      <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {module.lessonCount} lessons</span>
      <span className="flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> {module.exerciseCount.toLocaleString("en-IN")} exercises</span>
      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~{module.estimatedMinutes} min total</span>
    </div>
  );
}
