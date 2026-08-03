import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Form";
import { ModuleCard } from "@/components/course/ModuleCard";
import { skillCategories, type SkillCategoryKey } from "@/config/brand";
import { cn } from "@/lib/utils";
import type { CurriculumModule } from "@/types/content";

export function CurriculumBrowser({ modules }: { modules: CurriculumModule[] }) {
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState<SkillCategoryKey | "all">("all");

  const filtered = useMemo(() => {
    return modules.filter((module) => {
      const matchesSkill = activeSkill === "all" || module.skills.includes(activeSkill);
      const matchesQuery =
        query.trim().length === 0 ||
        module.title.toLowerCase().includes(query.toLowerCase()) ||
        module.description.toLowerCase().includes(query.toLowerCase());
      return matchesSkill && matchesQuery;
    });
  }, [modules, activeSkill, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-faint)]" aria-hidden />
          <Input
            type="search"
            placeholder="Search modules…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search curriculum modules"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by skill">
          <button
            type="button"
            onClick={() => setActiveSkill("all")}
            className={cn(
              "rounded-[var(--radius-full)] border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              activeSkill === "all" ? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)] text-white" : "border-[var(--color-border-strong)] text-[var(--color-ink-muted)] hover:border-[var(--color-brand-blue)]"
            )}
          >
            All skills
          </button>
          {skillCategories.map((skill) => (
            <button
              key={skill.key}
              type="button"
              onClick={() => setActiveSkill(skill.key)}
              className={cn(
                "rounded-[var(--radius-full)] border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                activeSkill === skill.key ? "border-transparent text-white" : "border-[var(--color-border-strong)] text-[var(--color-ink-muted)] hover:border-[var(--color-brand-blue)]"
              )}
              style={activeSkill === skill.key ? { background: skill.color } : undefined}
            >
              {skill.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--color-ink-faint)]" role="status">
        {filtered.length} module{filtered.length === 1 ? "" : "s"} found
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((module) => (
            <ModuleCard key={module._id} module={module} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] p-10 text-center text-sm text-[var(--color-ink-muted)]">
          No modules match your search. Try a different skill filter or search term.
        </div>
      )}
    </div>
  );
}
