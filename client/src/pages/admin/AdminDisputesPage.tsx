import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet } from "@/lib/api";

type Dispute = { _id: string; providerDisputeId: string; providerPaymentId: string; amount: number; currency: string; status: "open" | "won" | "lost" | "closed"; reason?: string; phase?: string; evidenceDueAt?: string; updatedAt: string; orderId?: { customerName: string; customerEmail: string; providerOrderId: string; status: string } };
export default function AdminDisputesPage() {
  const { user, loading } = useAuth();
  const query = useQuery({ queryKey: ["admin-disputes"], queryFn: () => apiGet<{ disputes: Dispute[] }>("/admin/disputes"), enabled: user?.role === "admin", retry: false });
  if (loading) return <LoadingState label="Loading payment disputes…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin/disputes" }} replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  return <section className="py-12"><Seo title="Payment disputes" description="Review Razorpay payment disputes." path="/admin/disputes" /><Container className="max-w-6xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/admin">← Administrator dashboard</Link><h1 className="mt-5 text-3xl font-semibold">Payment disputes</h1><p className="mt-2 text-[var(--color-ink-muted)]">Respond in Razorpay before the evidence deadline. Provider webhooks control the recorded outcome and learner entitlement.</p>{query.isLoading ? <LoadingState label="Loading disputes…" /> : null}<div className="mt-8 space-y-4">{query.data?.disputes.map((item) => <article className={`surface-card border-l-4 p-5 ${item.status === "open" ? "border-l-[var(--color-error)]" : "border-l-[var(--color-border-strong)]"}`} key={item._id}><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-semibold uppercase">{item.status} · {item.phase || "provider review"}</p><h2 className="mt-1 font-semibold">{item.orderId?.customerName || "Unknown customer"} · {item.currency} {(item.amount / 100).toFixed(2)}</h2><p className="mt-1 text-sm text-[var(--color-ink-muted)]">{item.orderId?.customerEmail} · {item.providerDisputeId}</p><p className="mt-3 text-sm">{item.reason || "No provider reason supplied."}</p></div><div className="text-right text-sm"><p>Order: {item.orderId?.providerOrderId || "Unknown"}</p><p className="capitalize">Order status: {item.orderId?.status?.replaceAll("_", " ")}</p>{item.evidenceDueAt ? <p className="mt-2 font-semibold text-[var(--color-error)]">Evidence due {new Date(item.evidenceDueAt).toLocaleString()}</p> : null}</div></div></article>)}{query.data?.disputes.length === 0 ? <p className="text-[var(--color-ink-muted)]">No disputes recorded.</p> : null}</div></Container></section>;
}
