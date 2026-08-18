export const contentStatuses = ["draft", "in_review", "changes_requested", "approved", "published", "archived"] as const;
export type ContentStatus = typeof contentStatuses[number];

const transitions: Record<ContentStatus, ContentStatus[]> = {
  draft: ["in_review"],
  in_review: ["changes_requested", "approved"],
  changes_requested: ["in_review"],
  approved: ["published", "changes_requested"],
  published: ["archived"],
  archived: ["draft"],
};

export function canTransitionContent(from: ContentStatus, to: ContentStatus): boolean {
  return transitions[from].includes(to);
}

export function contentTransitionDates(to: ContentStatus, now: Date) {
  if (to === "in_review") return { submittedAt: now };
  if (to === "changes_requested") return { reviewedAt: now, approvedAt: null };
  if (to === "approved") return { reviewedAt: now, approvedAt: now };
  if (to === "published") return { publishedAt: now, archivedAt: null };
  if (to === "archived") return { archivedAt: now };
  return { submittedAt: null, reviewedAt: null, approvedAt: null, publishedAt: null, archivedAt: null };
}
