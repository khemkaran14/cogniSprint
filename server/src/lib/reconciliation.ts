export type LocalOrderState = { status: string; amount: number; providerPaymentId?: string | null };
export type ProviderOrderState = { status: string; amount: number; amount_paid?: number; amount_due?: number };

export type ReconciliationDecision =
  | { action: "mark_paid"; reason: string }
  | { action: "mark_failed"; reason: string }
  | { action: "none"; reason: string }
  | { action: "review"; reason: string };

export function reconcileOrderState(local: LocalOrderState, provider: ProviderOrderState | null): ReconciliationDecision {
  if (!provider) return { action: "review", reason: "Provider order could not be retrieved." };
  if (provider.amount !== local.amount) return { action: "review", reason: "Provider and local order amounts differ." };
  if (provider.status === "paid" && local.status === "pending") return { action: "mark_paid", reason: "Provider reports the order as fully paid." };
  if (["created", "attempted"].includes(provider.status) && local.status === "pending") return { action: "none", reason: "Provider order remains open." };
  if (provider.status === "paid" && local.status === "paid") return { action: "none", reason: "Local and provider states agree." };
  if (local.status === "pending" && provider.amount_due === provider.amount && provider.amount_paid === 0) return { action: "mark_failed", reason: "Provider reports no captured amount after the pending window." };
  return { action: "review", reason: `Unexpected local/provider state: ${local.status}/${provider.status}.` };
}
