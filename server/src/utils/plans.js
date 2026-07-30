// Central source of truth for membership tiers and what they unlock.
// A question's `difficulty` maps 1:1 to the plan required to read its full answer.

export const PLAN_RANK = { free: 0, pro: 1, premium: 2 };

export const DIFFICULTY_REQUIRED_PLAN = {
  easy: "free",
  medium: "pro",
  hard: "premium",
};

export const PLANS = {
  free: { name: "Free", price: 0, billingPeriod: null },
  pro: { name: "Pro", price: 499, billingPeriod: "monthly" },
  premium: { name: "Premium", price: 999, billingPeriod: "monthly" },
};

export function canViewAnswer(userPlan, difficulty) {
  const required = DIFFICULTY_REQUIRED_PLAN[difficulty] ?? "free";
  return PLAN_RANK[userPlan ?? "free"] >= PLAN_RANK[required];
}
