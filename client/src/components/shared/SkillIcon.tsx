import { Calculator, BrainCircuit, Target, Puzzle, Eye, Lightbulb, type LucideProps } from "lucide-react";

const iconMap = { Calculator, BrainCircuit, Target, Puzzle, Eye, Lightbulb } as const;

export type SkillIconName = keyof typeof iconMap;

export function SkillIcon({ name, ...props }: { name: SkillIconName } & LucideProps) {
  const Icon = iconMap[name];
  return <Icon aria-hidden {...props} />;
}
