import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { BadgeCheck, BadgeX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet } from "@/lib/api";

type Verification = { valid: boolean; learnerName?: string; issuedAt?: string; product?: { name: string } };
export default function CertificateVerificationPage() {
  const { code = "" } = useParams();
  const query = useQuery({ queryKey: ["certificate-verification", code], queryFn: () => apiGet<Verification>(`/certificates/verify/${encodeURIComponent(code)}`), retry: false });
  if (query.isLoading) return <LoadingState label="Verifying certificate…" />;
  const valid = query.data?.valid === true;
  return <section className="py-20"><Seo title="Verify certificate" description="Verify a CogniSprint completion certificate." path={`/certificates/verify/${code}`} /><Container className="max-w-2xl"><div className="surface-card p-8 text-center">{valid ? <BadgeCheck className="mx-auto h-16 w-16 text-[var(--color-success)]" /> : <BadgeX className="mx-auto h-16 w-16 text-[var(--color-error)]" />}<h1 className="mt-5 text-3xl font-semibold">{valid ? "Valid certificate" : "Certificate not found"}</h1>{valid ? <><p className="mt-5 text-lg">Issued to <strong>{query.data?.learnerName}</strong></p><p className="mt-2 text-[var(--color-ink-muted)]">{query.data?.product?.name} · {new Date(query.data!.issuedAt!).toLocaleDateString()}</p></> : <p className="mt-4 text-[var(--color-ink-muted)]">The code is invalid, unknown, or the certificate has been revoked.</p>}<p className="mt-6 font-mono text-sm">{code.toUpperCase()}</p></div></Container></section>;
}
