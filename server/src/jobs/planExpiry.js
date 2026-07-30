import cron from "node-cron";
import User from "../models/User.js";

// Sweeps any user whose paid plan has lapsed back to "free". This is a
// convenience for the admin/subscriptions views (so expired users don't show
// up as "active pro/premium" until someone looks); the actual answer-gating
// logic never trusts this alone -- see utils/plans.js#getEffectivePlan, which
// checks planExpiresAt directly so an expired plan is never honored even in
// the window before this job next runs.
export async function sweepExpiredPlans() {
  const result = await User.updateMany(
    { plan: { $ne: "free" }, planExpiresAt: { $lte: new Date() } },
    { $set: { plan: "free" } }
  );
  if (result.modifiedCount > 0) {
    console.log(`Plan expiry sweep: downgraded ${result.modifiedCount} user(s) to free.`);
  }
  return result.modifiedCount;
}

export function startPlanExpiryJob() {
  sweepExpiredPlans().catch((err) => console.error("Initial plan expiry sweep failed", err));
  // Daily at 00:05 -- comfortably clear of midnight rollover edge cases.
  cron.schedule("5 0 * * *", () => {
    sweepExpiredPlans().catch((err) => console.error("Scheduled plan expiry sweep failed", err));
  });
}
