// Central source of truth for membership tiers and what they unlock.
// A question's `difficulty` maps 1:1 to the plan required to read its full answer.

export const PLAN_RANK = { free: 0, pro: 1, premium: 2 };

export const DIFFICULTY_REQUIRED_PLAN = {
  easy: "free",
  medium: "pro",
  hard: "premium",
};

export const PLANS = {
  free: { name: "Free", monthly: 0, yearly: 0 },
  pro: { name: "Pro", monthly: 499, yearly: 4999 },
  premium: { name: "Premium", monthly: 999, yearly: 9999 },
};

export function planPrice(plan, billingPeriod) {
  return PLANS[plan][billingPeriod === "yearly" ? "yearly" : "monthly"];
}

export const PLAN_DURATION_MS = {
  monthly: 30 * 24 * 60 * 60 * 1000,
  yearly: 365 * 24 * 60 * 60 * 1000,
};

export function canViewAnswer(userPlan, difficulty) {
  const required = DIFFICULTY_REQUIRED_PLAN[difficulty] ?? "free";
  return PLAN_RANK[userPlan ?? "free"] >= PLAN_RANK[required];
}

// A user's stored `plan` field only gets swept back to "free" once a day (see
// jobs/planExpiry.js). Anything that gates content must call this instead of
// reading user.plan directly, so a lapsed subscription is never honored in
// the window before that sweep runs.
export function getEffectivePlan(user) {
  if (!user) return "free";
  if (user.plan !== "free" && user.planExpiresAt && new Date(user.planExpiresAt) <= new Date()) {
    return "free";
  }
  return user.plan || "free";
}
