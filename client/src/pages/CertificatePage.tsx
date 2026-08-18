import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { Award, Download } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPost } from "@/lib/api";

type Certificate = { learnerName: string; verificationCode: string; issuedAt: string; emailDeliveryStatus: "pending" | "sent" | "failed" };
type Status = { publishedLessons: number; completedLessons: number; requiredLessons: number; eligible: boolean; certificate: Certificate | null };

export default function CertificatePage() {
  const { user, loading } = useAuth(); const queryClient = useQueryClient();
  const status = useQuery({ queryKey: ["certificate-status", user?.id], queryFn: () => apiGet<Status>("/certificates/status"), enabled: Boolean(user), retry: false });
  const claim = useMutation({ mutationFn: () => apiPost<{ certificate: Certificate }>("/certificates/claim", {}), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["certificate-status", user?.id] }) });
  if (loading) return <LoadingState label="Loading certificate…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/learn/certificate" }} replace />;
  if (status.isLoading) return <LoadingState label="Checking certificate eligibility…" />;
  if (!status.data) return <Container className="py-20"><Alert variant="error">Certificate status could not be loaded.</Alert></Container>;
  const data = status.data; const certificate = data.certificate;
  const progress = data.requiredLessons ? Math.min(100, Math.round((data.completedLessons / data.requiredLessons) * 100)) : 0;
  return <section className="py-12 sm:py-20"><Seo title="Completion certificate" description="Claim and print your verifiable CogniSprint completion certificate." path="/learn/certificate" /><Container className="max-w-4xl"><div className="print:hidden"><p className="eyebrow">Certificate</p><h1 className="mt-3 text-3xl font-semibold">Program completion certificate</h1><p className="mt-3 text-[var(--color-ink-muted)]">Certificates become available only after all 365 published lessons are complete.</p>{!certificate ? <div className="surface-card mt-8 p-6"><div className="flex justify-between"><span>{data.completedLessons} of {data.requiredLessons} lessons</span><strong>{progress}%</strong></div><ProgressBar className="mt-3" value={progress} label="Certificate completion progress" />{data.eligible ? <Button className="mt-6" onClick={() => claim.mutate()} disabled={claim.isPending}>{claim.isPending ? "Issuing…" : "Claim certificate"}</Button> : <Link className="mt-6 inline-block font-semibold text-[var(--color-brand-blue)]" to="/learn">Continue learning →</Link>}{claim.isError ? <Alert className="mt-4" variant="error">The certificate could not be issued. Please try again.</Alert> : null}</div> : <div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => window.print()}><Download className="h-4 w-4" />Print or save PDF</Button><Link className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold" to={`/certificates/verify/${certificate.verificationCode}`}>Public verification</Link></div>}</div>{certificate ? <article className="mt-8 border-8 border-double border-[var(--color-brand-blue)] bg-white p-8 text-center text-slate-950 print:m-0 print:min-h-screen print:border-[12px] print:p-16"><Award className="mx-auto h-16 w-16 text-blue-600" /><p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Certificate of completion</p><h2 className="mt-6 text-4xl font-semibold">CogniSprint Complete</h2><p className="mt-8 text-lg">This certifies that</p><p className="mt-3 text-3xl font-semibold">{certificate.learnerName}</p><p className="mx-auto mt-6 max-w-xl text-lg">completed the full CogniSprint structured learning program.</p><p className="mt-10 text-sm">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p><p className="mt-2 font-mono text-sm">Verification code: {certificate.verificationCode}</p><p className="mt-8 text-xs text-slate-600">This certificate records course completion. It does not certify IQ, medical status, or guaranteed outcomes.</p></article> : null}</Container></section>;
}
