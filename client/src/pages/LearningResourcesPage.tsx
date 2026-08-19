import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiUrl } from "@/lib/api";

type Resource = { _id: string; slug: string; title: string; description: string; kind: "workbook" | "worksheet"; version: number; filename: string; sizeBytes: number; publishedAt?: string };
export default function LearningResourcesPage() {
  const { user, loading } = useAuth(); const query = useQuery({ queryKey: ["learning-resources", user?.id], queryFn: () => apiGet<{ resources: Resource[] }>("/resources"), enabled: Boolean(user), retry: false });
  if (loading) return <LoadingState label="Loading resources…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/learn/resources" }} replace />;
  return <section className="py-12 sm:py-20"><Seo title="Workbooks and worksheets" description="Download your entitlement-protected learning resources." path="/learn/resources" /><Container className="max-w-5xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/learn">← Learning dashboard</Link><p className="eyebrow mt-6">Your downloads</p><h1 className="mt-3 text-3xl font-semibold">Workbooks and worksheets</h1><p className="mt-3 text-[var(--color-ink-muted)]">Only published files included with your active purchase appear here. Downloads are private and recorded for account security.</p>{query.isLoading ? <LoadingState label="Loading resources…" /> : null}{query.isError ? <Alert className="mt-8" variant="error">Resources could not be loaded. Confirm that your course access is active.</Alert> : null}<div className="mt-8 grid gap-4 sm:grid-cols-2">{query.data?.resources.map((resource) => <article className="surface-card p-6" key={resource._id}><FileText className="h-6 w-6 text-[var(--color-brand-blue)]" /><p className="mt-4 text-xs font-semibold uppercase tracking-wide">{resource.kind} · version {resource.version}</p><h2 className="mt-1 text-xl font-semibold">{resource.title}</h2><p className="mt-2 text-sm text-[var(--color-ink-muted)]">{resource.description}</p><p className="mt-3 text-xs text-[var(--color-ink-muted)]">PDF · {(resource.sizeBytes / 1024 / 1024).toFixed(1)} MB</p><a className="mt-5 inline-flex items-center gap-2 font-semibold text-[var(--color-brand-blue)]" href={apiUrl(`/resources/${resource.slug}/download`)}><Download className="h-4 w-4" />Download PDF</a></article>)}{query.data?.resources.length === 0 ? <p className="text-[var(--color-ink-muted)]">No workbook or worksheet has been published for your purchase yet.</p> : null}</div></Container></section>;
}
