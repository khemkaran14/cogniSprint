import { useQuery } from "@tanstack/react-query";
import { MailCheck, UserRound, BookOpenCheck } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet } from "@/lib/api";

type Entitlement = {
  id: string;
  status: "active" | "revoked";
  grantedAt: string;
  product: { name: string; slug: string; description?: string };
};

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const entitlements = useQuery({
    queryKey: ["entitlements", user?.id],
    queryFn: () => apiGet<{ entitlements: Entitlement[] }>("/entitlements"),
    enabled: Boolean(user),
  });

  if (loading) return <LoadingState label="Loading account…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/account" }} replace />;

  return (
    <section className="py-16 sm:py-24">
      <Seo title="My account" description="Manage your CogniSprint account and learning access." path="/account" />
      <Container className="max-w-3xl">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-info-surface)] text-[var(--color-brand-blue)]">
              <UserRound aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <p className="text-sm text-[var(--color-ink-muted)]">{user.email}</p>
            </div>
          </div>

          {!user.emailVerified ? (
            <Alert className="mt-6" variant="warning" title="Verify your email">
              Check your inbox for your verification link before beginning the learning program.
            </Alert>
          ) : null}

          <div className="mt-8 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4">
            <MailCheck className="h-5 w-5 text-[var(--color-brand-blue)]" aria-hidden />
            <p className="mt-2 text-sm font-semibold">Email status</p>
            <p className="text-sm text-[var(--color-ink-muted)]">{user.emailVerified ? "Verified" : "Awaiting verification"}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Your learning access</h2>
            {entitlements.isLoading ? <LoadingState label="Checking course access…" /> : null}
            {entitlements.isError ? <Alert className="mt-4" variant="error">We could not load your course access. Please try again.</Alert> : null}
            {entitlements.data?.entitlements.length === 0 ? (
              <p className="mt-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-5 text-sm text-[var(--color-ink-muted)]">
                You do not have an active course purchase yet.
              </p>
            ) : null}
            <div className="mt-3 space-y-3">
              {entitlements.data?.entitlements.map((entitlement) => (
                <article key={entitlement.id} className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
                  <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" aria-hidden />
                  <div>
                    <p className="font-semibold">{entitlement.product.name}</p>
                    <p className="text-sm capitalize text-[var(--color-ink-muted)]">{entitlement.status} access</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <Button className="mt-8" variant="secondary" onClick={() => void logout()}>Sign out</Button>
        </div>
      </Container>
    </section>
  );
}
