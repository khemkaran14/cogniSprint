import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPatch } from "@/lib/api";

type Status = "draft" | "in_review" | "changes_requested" | "approved" | "published" | "archived";
type Item = { _id: string; title: string; status: Status; reviewNote?: string; updatedAt: string; sequenceNumber?: number; month?: number; reviewedBy?: { name: string; email: string } };
const nextStates: Record<Status, Status[]> = { draft: ["in_review"], in_review: ["changes_requested", "approved"], changes_requested: ["in_review"], approved: ["published", "changes_requested"], published: ["archived"], archived: ["draft"] };

export default function AdminContentPage() {
  const { user, loading } = useAuth(); const client = useQueryClient(); const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["admin-content"], queryFn: () => apiGet<{ lessons: Item[]; assessments: Item[] }>("/admin/content"), enabled: user?.role === "admin", retry: false });
  const transition = useMutation({ mutationFn: ({ type, id, status }: { type: "lessons" | "assessments"; id: string; status: Status }) => apiPatch(`/admin/content/${type}/${id}/status`, { status, note: notes[id] }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin-content"] }) });
  if (loading) return <LoadingState label="Loading content operations…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin/content" }} replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  const group = (title: string, type: "lessons" | "assessments", items: Item[]) => <section className="mt-10"><h2 className="text-2xl font-semibold">{title}</h2><div className="mt-4 space-y-4">{items.map((item) => <article className="surface-card p-5" key={item._id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide">{item.status.replaceAll("_", " ")}</p><h3 className="mt-1 text-lg font-semibold">{item.sequenceNumber ? `Day ${item.sequenceNumber} · ` : item.month ? `Month ${item.month} · ` : ""}{item.title}</h3><p className="mt-1 text-sm text-[var(--color-ink-muted)]">Updated {new Date(item.updatedAt).toLocaleString()}{item.reviewedBy ? ` · ${item.reviewedBy.email}` : ""}</p>{item.reviewNote ? <p className="mt-3 rounded-md bg-[var(--color-surface-muted)] p-3 text-sm">Latest note: {item.reviewNote}</p> : null}</div><span className="rounded-full border px-3 py-1 text-xs font-semibold">{item.status.replaceAll("_", " ")}</span></div><label className="mt-4 block text-sm font-semibold" htmlFor={`note-${item._id}`}>Required audit note</label><textarea id={`note-${item._id}`} className="mt-2 min-h-20 w-full rounded-md border bg-transparent p-3" value={notes[item._id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))} /><div className="mt-3 flex flex-wrap gap-2">{nextStates[item.status].map((status) => <Button key={status} size="sm" variant={status === "published" || status === "approved" ? "primary" : "secondary"} disabled={(notes[item._id]?.trim().length ?? 0) < 5 || transition.isPending} onClick={() => transition.mutate({ type, id: item._id, status })}>{status.replaceAll("_", " ")}</Button>)}</div></article>)}</div></section>;
  return <section className="py-12"><Seo title="Content operations" description="Review and publish learning content." path="/admin/content" /><Container className="max-w-6xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/admin">← Administrator dashboard</Link><h1 className="mt-5 text-3xl font-semibold">Content review and publishing</h1><p className="mt-2 text-[var(--color-ink-muted)]">Every state change requires a note and is written to the immutable administrator audit ledger.</p>{query.isLoading ? <LoadingState label="Loading content…" /> : null}{query.isError || transition.isError ? <Alert className="mt-6" variant="error">The content operation could not be completed. Refresh and verify the requested transition.</Alert> : null}{query.data ? <>{group("Daily lessons", "lessons", query.data.lessons)}{group("Monthly assessments", "assessments", query.data.assessments)}</> : null}</Container></section>;
}
