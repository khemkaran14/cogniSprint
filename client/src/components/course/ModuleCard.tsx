import { Link } from "react-router-dom";
import { ModuleMeta, ModuleStats } from "@/components/course/ModuleMeta";
import type { CurriculumModule } from "@/types/content";

export function ModuleCard({ module }: { module: CurriculumModule }) {
  return (
    <div className="surface-card flex h-full flex-col gap-4 p-6">
      <div>
        <p className="text-xs font-medium text-[var(--color-ink-faint)]">
          Module {module.position.toString().padStart(2, "0")}
        </p>
        <h3 className="mt-1 text-lg font-semibold">{module.title}</h3>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{module.description}</p>
      </div>
      <ModuleMeta module={module} />
      <ModuleStats module={module} />
      {module.previewAvailable ? (
        <Link to="/sample-challenge" className="mt-auto text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
          Try a related preview →
        </Link>
      ) : (
        <p className="mt-auto text-xs text-[var(--color-ink-faint)]">Unlocked with full course access</p>
      )}
    </div>
  );
}
