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

type Status = "draft" | "published" | "archived";
type Resource = { _id: string; title: string; kind: string; version: number; filename: string; sizeBytes: number; sha256: string; status: Status; releaseNote?: string; productId?: { name: string } };
const nextState: Record<Status, Status> = { draft: "published", published: "archived", archived: "draft" };
export default function AdminResourcesPage() {
  const { user, loading } = useAuth(); const client = useQueryClient(); const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["admin-resources"], queryFn: () => apiGet<{ resources: Resource[] }>("/admin/resources"), enabled: user?.role === "admin", retry: false });
  const transition = useMutation({ mutationFn: (resource: Resource) => apiPatch(`/admin/resources/${resource._id}/status`, { status: nextState[resource.status], note: notes[resource._id] }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin-resources"] }) });
  if (loading) return <LoadingState label="Loading resource operations…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin/resources" }} replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  return <section className="py-12"><Seo title="Resource operations" description="Publish protected workbook resources." path="/admin/resources" /><Container className="max-w-6xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/admin">← Administrator dashboard</Link><h1 className="mt-5 text-3xl font-semibold">Workbook and worksheet releases</h1><p className="mt-2 text-[var(--color-ink-muted)]">Import validated PDFs from the trusted server shell, then publish or archive them here with an audited release note.</p>{query.isLoading ? <LoadingState label="Loading resources…" /> : null}{query.isError || transition.isError ? <Alert className="mt-6" variant="error">The resource operation could not be completed.</Alert> : null}<div className="mt-8 space-y-4">{query.data?.resources.map((resource) => <article className="surface-card p-5" key={resource._id}><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-semibold uppercase">{resource.status} · {resource.kind} · version {resource.version}</p><h2 className="mt-1 text-xl font-semibold">{resource.title}</h2><p className="mt-1 text-sm text-[var(--color-ink-muted)]">{resource.productId?.name} · {resource.filename} · {(resource.sizeBytes / 1024 / 1024).toFixed(1)} MB</p><p className="mt-2 font-mono text-xs">SHA-256 {resource.sha256}</p>{resource.releaseNote ? <p className="mt-3 text-sm">Latest release note: {resource.releaseNote}</p> : null}</div><span className="h-fit rounded-full border px-3 py-1 text-xs font-semibold">{resource.status}</span></div><label className="mt-4 block text-sm font-semibold" htmlFor={`resource-note-${resource._id}`}>Required release note</label><textarea id={`resource-note-${resource._id}`} className="mt-2 min-h-20 w-full rounded-md border bg-transparent p-3" value={notes[resource._id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [resource._id]: event.target.value }))} /><Button className="mt-3" size="sm" disabled={(notes[resource._id]?.trim().length ?? 0) < 5 || transition.isPending} onClick={() => transition.mutate(resource)}>{nextState[resource.status]}</Button></article>)}</div></Container></section>;
}
