export type DisputeStatus = "open" | "won" | "lost" | "closed";

export function disputeStatusForEvent(eventType: string): DisputeStatus | null {
  const statuses: Record<string, DisputeStatus> = {
    "payment.dispute.created": "open",
    "payment.dispute.won": "won",
    "payment.dispute.lost": "lost",
    "payment.dispute.closed": "closed",
  };
  return statuses[eventType] ?? null;
}
