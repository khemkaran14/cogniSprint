import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPost } from "@/lib/api";

type Certificate = { _id: string; learnerName: string; verificationCode: string; issuedAt: string; revokedAt?: string; revocationReason?: string; userId?: { email: string } };
export default function AdminCertificatesPage() {
  const { user, loading } = useAuth(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-certificates"], queryFn: () => apiGet<{ certificates: Certificate[] }>("/admin/certificates"), enabled: user?.role === "admin", retry: false });
  const revoke = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => apiPost(`/admin/certificates/${id}/revoke`, { reason }), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["admin-certificates"] }); void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }); } });
  if (loading) return <LoadingState label="Loading certificates…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin/certificates" }} replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;
  return <section className="py-12"><Seo title="Certificate administration" description="Review and revoke issued certificates." path="/admin/certificates" /><Container className="max-w-5xl"><Link className="font-semibold text-[var(--color-brand-blue)]" to="/admin">← Administrator dashboard</Link><h1 className="mt-5 text-3xl font-semibold">Issued certificates</h1><p className="mt-2 text-[var(--color-ink-muted)]">Revocation immediately invalidates public verification and appends an audit event.</p>{query.isLoading ? <LoadingState label="Loading certificates…" /> : null}{revoke.isError ? <Alert className="mt-5" variant="error">Certificate revocation failed.</Alert> : null}<div className="mt-8 space-y-4">{query.data?.certificates.map((certificate) => <article className="surface-card p-5" key={certificate._id}><div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-semibold">{certificate.learnerName}</h2><p className="text-sm text-[var(--color-ink-muted)]">{certificate.userId?.email} · {certificate.verificationCode} · {new Date(certificate.issuedAt).toLocaleDateString()}</p>{certificate.revokedAt ? <p className="mt-2 text-sm text-[var(--color-error)]">Revoked: {certificate.revocationReason}</p> : null}</div>{!certificate.revokedAt ? <form onSubmit={(event) => { event.preventDefault(); const reason = String(new FormData(event.currentTarget).get("reason") ?? ""); if (window.confirm("Revoke this certificate? This action is publicly visible and audited.")) revoke.mutate({ id: certificate._id, reason }); }}><label className="text-sm font-semibold">Reason<input name="reason" required minLength={10} className="ml-2 rounded-[var(--radius-md)] border px-3 py-2 font-normal" /></label><Button className="ml-2" size="sm" variant="secondary" type="submit">Revoke</Button></form> : null}</div></article>)}</div></Container></section>;
}
