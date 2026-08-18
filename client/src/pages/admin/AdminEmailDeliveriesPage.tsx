import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPost } from "@/lib/api";
type Delivery = { _id: string; category: string; to: string; subject: string; status: string; attempts: number; providerMessageId?: string; lastError?: string; providerEventAt?: string; deliveredAt?: string; bouncedAt?: string; complainedAt?: string };
export default function AdminEmailDeliveriesPage() {
  const { user, loading } = useAuth(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-email-deliveries"], queryFn: () => apiGet<{ deliveries: Delivery[] }>("/admin/email-deliveries"), enabled: user?.role === "admin", retry: false });
  const retry = useMutation({ mutationFn: (id: string) => apiPost(`/admin/email-deliveries/${id}/retry`, {}), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-email-deliveries"] }) });
  if (loading) return <LoadingState label="Loading email deliveries…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin/email-deliveries" }} replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  return <section className="py-12"><Seo title="Email operations" description="Review transactional email delivery." path="/admin/email-deliveries" /><Container className="max-w-6xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/admin">← Administrator dashboard</Link><h1 className="mt-5 text-3xl font-semibold">Transactional email</h1><p className="mt-2 text-[var(--color-ink-muted)]">Review queue and provider delivery states. Bounces and complaints require recipient or sender-domain investigation, not an automatic retry.</p>{query.isLoading ? <LoadingState label="Loading email deliveries…" /> : null}{retry.isError ? <Alert className="mt-5" variant="error">The delivery could not be queued for retry.</Alert> : null}<div className="mt-8 space-y-3">{query.data?.deliveries.map((delivery) => <article className="surface-card flex flex-wrap justify-between gap-4 p-5" key={delivery._id}><div><h2 className="font-semibold">{delivery.subject}</h2><p className="text-sm text-[var(--color-ink-muted)]">{delivery.to} · {delivery.category.replaceAll("_", " ")} · <span className="capitalize">{delivery.status}</span> · {delivery.attempts} attempts</p>{delivery.lastError ? <p className="mt-2 text-sm text-[var(--color-error)]">{delivery.lastError}</p> : null}{delivery.providerEventAt ? <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Provider update {new Date(delivery.providerEventAt).toLocaleString()}</p> : null}{delivery.providerMessageId ? <p className="mt-1 font-mono text-xs">{delivery.providerMessageId}</p> : null}</div>{delivery.status === "failed" ? <Button size="sm" variant="secondary" onClick={() => retry.mutate(delivery._id)}>Retry</Button> : null}</article>)}</div></Container></section>;
}
