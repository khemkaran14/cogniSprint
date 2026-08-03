export type SkillCategoryKey =
  | "mental-math"
  | "memory"
  | "focus"
  | "logic"
  | "observation"
  | "critical-thinking";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type CurriculumModule = {
  _id: string;
  position: number;
  slug: string;
  title: string;
  description: string;
  skills: SkillCategoryKey[];
  lessonCount: number;
  exerciseCount: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  previewAvailable: boolean;
  phase: "guided_learning" | "structured_practice" | "assessment";
};

export type FaqItem = {
  _id: string;
  category: "general" | "purchase" | "access" | "content" | "audience";
  question: string;
  answer: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogArticle = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt2: string;
  readingTimeMinutes: number;
  coverImage: string;
  sections: BlogSection[];
};

export type IncludeItem = { key: string; label: string; enabled: boolean };

export type Price = {
  _id: string;
  productId: string;
  currency: string;
  regularAmount: number;
  launchAmount: number;
  active: boolean;
};

export type Product = {
  _id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  productType: string;
  accessDuration: string;
  status: string;
  includes: IncludeItem[];
  price?: Price | null;
};
