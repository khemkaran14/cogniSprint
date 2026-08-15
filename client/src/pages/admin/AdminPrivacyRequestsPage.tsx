import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPatch } from "@/lib/api";

type PrivacyRequest = { _id: string; type: "deletion"; status: "pending" | "in_review" | "completed" | "rejected" | "cancelled"; reason?: string; resolutionNote?: string; createdAt: string; userId: { name: string; email: string; status: string } };
export default function AdminPrivacyRequestsPage() {
  const { user, loading } = useAuth(); const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin-privacy-requests"], queryFn: () => apiGet<{ requests: PrivacyRequest[] }>("/admin/privacy-requests"), enabled: user?.role === "admin", retry: false });
  const update = useMutation({ mutationFn: ({ id, status, note }: { id: string; status: "in_review" | "completed" | "rejected"; note: string }) => apiPatch(`/admin/privacy-requests/${id}`, { status, note }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin-privacy-requests"] }) });
  if (loading) return <LoadingState label="Loading privacy operations…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin/privacy-requests" }} replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  return <section className="py-12"><Seo title="Privacy requests" description="Process CogniSprint privacy requests." path="/admin/privacy-requests" /><Container className="max-w-6xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/admin">← Administrator dashboard</Link><h1 className="mt-5 text-3xl font-semibold">Privacy requests</h1><p className="mt-2 text-[var(--color-ink-muted)]">Review deletion requests against legal retention requirements before changing account or transaction records.</p>{query.isLoading ? <LoadingState label="Loading requests…" /> : null}{update.isError ? <Alert className="mt-5" variant="error">The request could not be updated.</Alert> : null}<div className="mt-8 space-y-4">{query.data?.requests.map((item) => <article className="surface-card p-5" key={item._id}><p className="text-xs font-semibold uppercase">{item.type} · {item.status}</p><h2 className="mt-1 font-semibold">{item.userId.name} · {item.userId.email}</h2><p className="mt-2 text-sm text-[var(--color-ink-muted)]">Requested {new Date(item.createdAt).toLocaleString()}</p><p className="mt-3 text-sm">{item.reason || "No reason supplied."}</p>{["pending", "in_review"].includes(item.status) ? <form className="mt-4 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); update.mutate({ id: item._id, status: String(form.get("status")) as "in_review" | "completed" | "rejected", note: String(form.get("note")) }); }}><select className="rounded-[var(--radius-md)] border px-3 py-2 text-sm" name="status" defaultValue={item.status === "pending" ? "in_review" : "completed"}><option value="in_review">In review</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select><input className="min-w-64 flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-sm" name="note" required minLength={5} placeholder="Required operational note" /><Button size="sm" type="submit">Update</Button></form> : <p className="mt-3 text-sm">Resolution: {item.resolutionNote || "No note recorded."}</p>}</article>)}</div></Container></section>;
}
