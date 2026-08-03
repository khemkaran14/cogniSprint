import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/Accordion";
import { ModuleMeta, ModuleStats } from "@/components/course/ModuleMeta";
import type { CurriculumModule } from "@/types/content";

export function CurriculumAccordion({ modules }: { modules: CurriculumModule[] }) {
  return (
    <Accordion type="single" collapsible className="surface-card px-6">
      {modules.map((module) => (
        <AccordionItem key={module._id} value={module._id}>
          <AccordionTrigger>
            <span className="flex flex-col items-start gap-1 text-left">
              <span className="text-xs font-medium text-[var(--color-ink-faint)]">
                Module {module.position.toString().padStart(2, "0")}
              </span>
              <span>{module.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p>{module.description}</p>
            <div className="mt-4 flex flex-col gap-3">
              <ModuleMeta module={module} />
              <ModuleStats module={module} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
