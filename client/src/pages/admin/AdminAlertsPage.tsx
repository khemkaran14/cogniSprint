import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPost } from "@/lib/api";
type OpsAlert = { _id: string; category: string; severity: "warning" | "critical"; status: "open" | "acknowledged" | "resolved"; title: string; details: Record<string, unknown>; occurrences: number; firstSeenAt: string; lastSeenAt: string };
export default function AdminAlertsPage() {
  const { user, loading } = useAuth(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-alerts"], queryFn: () => apiGet<{ alerts: OpsAlert[] }>("/admin/alerts"), enabled: user?.role === "admin", retry: false });
  const action = useMutation({ mutationFn: ({ id, action }: { id: string; action: "acknowledge" | "resolve" }) => apiPost(`/admin/alerts/${id}/${action}`, {}), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-alerts"] }) });
  if (loading) return <LoadingState label="Loading operational alerts…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin/alerts" }} replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  return <section className="py-12"><Seo title="Operational alerts" description="Review CogniSprint operational risks." path="/admin/alerts" /><Container className="max-w-6xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/admin">← Administrator dashboard</Link><h1 className="mt-5 text-3xl font-semibold">Operational alerts</h1><p className="mt-2 text-[var(--color-ink-muted)]">Acknowledge active investigation or resolve a corrected condition. A later scan reopens conditions that still exist.</p>{query.isLoading ? <LoadingState label="Loading alerts…" /> : null}{action.isError ? <Alert className="mt-5" variant="error">The alert could not be updated.</Alert> : null}<div className="mt-8 space-y-3">{query.data?.alerts.map((item) => <article className={`surface-card border-l-4 p-5 ${item.severity === "critical" ? "border-l-[var(--color-error)]" : "border-l-[var(--color-warning)]"}`} key={item._id}><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide">{item.severity} · {item.category.replaceAll("_", " ")} · {item.status}</p><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-2 text-xs text-[var(--color-ink-muted)]">Seen {item.occurrences} times · Last {new Date(item.lastSeenAt).toLocaleString()}</p><pre className="mt-3 max-w-3xl overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(item.details, null, 2)}</pre></div><div className="flex gap-2">{item.status === "open" ? <Button size="sm" variant="secondary" onClick={() => action.mutate({ id: item._id, action: "acknowledge" })}>Acknowledge</Button> : null}{item.status !== "resolved" ? <Button size="sm" variant="secondary" onClick={() => action.mutate({ id: item._id, action: "resolve" })}>Resolve</Button> : null}</div></div></article>)}</div></Container></section>;
}
