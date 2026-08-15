import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MailCheck, UserRound, BookOpenCheck, MonitorSmartphone } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiDelete, apiGet, apiPatch, apiPost, apiUrl } from "@/lib/api";

type Entitlement = {
  id: string;
  status: "active" | "revoked";
  grantedAt: string;
  product: { name: string; slug: string; description?: string };
};
type Session = { id: string; userAgent: string; ipAddress: string; lastSeenAt: string; createdAt: string; expiresAt: string; current: boolean };
type PrivacyRequest = { _id: string; status: "pending" | "in_review" | "completed" | "rejected" | "cancelled"; reason?: string; resolutionNote?: string; createdAt: string };
type Order = { id: string; product: { name: string }; amount: number; currency: string; status: "pending" | "paid" | "failed" | "refunded"; createdAt: string; receiptAvailable: boolean };

export default function AccountPage() {
  const { user, loading, logout, setUser } = useAuth();
  const queryClient = useQueryClient();
  const entitlements = useQuery({
    queryKey: ["entitlements", user?.id],
    queryFn: () => apiGet<{ entitlements: Entitlement[] }>("/entitlements"),
    enabled: Boolean(user),
  });
  const sessions = useQuery({ queryKey: ["sessions", user?.id], queryFn: () => apiGet<{ sessions: Session[] }>("/auth/sessions"), enabled: Boolean(user) });
  const privacyRequests = useQuery({ queryKey: ["privacy-requests", user?.id], queryFn: () => apiGet<{ requests: PrivacyRequest[] }>("/privacy/requests"), enabled: Boolean(user) });
  const orders = useQuery({ queryKey: ["orders", user?.id], queryFn: () => apiGet<{ orders: Order[] }>("/checkout/orders"), enabled: Boolean(user) });
  const profile = useMutation({ mutationFn: (values: { name: string; timezone: string }) => apiPatch<{ user: typeof user }>("/auth/profile", values), onSuccess: ({ user: nextUser }) => { if (nextUser) setUser(nextUser); } });
  const revoke = useMutation({ mutationFn: (id: string) => apiDelete<void>(`/auth/sessions/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions", user?.id] }) });
  const requestDeletion = useMutation({ mutationFn: (reason: string) => apiPost("/privacy/deletion-requests", { reason }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["privacy-requests", user?.id] }) });
  const cancelDeletion = useMutation({ mutationFn: (id: string) => apiDelete(`/privacy/deletion-requests/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["privacy-requests", user?.id] }) });
  const revokeOthers = useMutation({ mutationFn: () => apiDelete<void>("/auth/sessions"), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions", user?.id] }) });

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

          <section className="mt-8 border-t border-[var(--color-border)] pt-8">
            <h2 className="text-lg font-semibold">Order history</h2><p className="text-sm text-[var(--color-ink-muted)]">Payments and printable receipts owned by this account.</p>
            {orders.isLoading ? <LoadingState label="Loading orders…" /> : null}{orders.isError ? <Alert className="mt-4" variant="error">Order history could not be loaded.</Alert> : null}
            <div className="mt-4 space-y-3">{orders.data?.orders.map((order) => <article className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4" key={order.id}><div><p className="font-semibold">{order.product.name}</p><p className="text-sm text-[var(--color-ink-muted)]">{new Date(order.createdAt).toLocaleDateString()} · <span className="capitalize">{order.status}</span> · {order.currency} {(order.amount / 100).toFixed(2)}</p></div>{order.receiptAvailable ? <Link className="text-sm font-semibold text-[var(--color-brand-blue)]" to={`/account/orders/${order.id}`}>View receipt →</Link> : null}</article>)}{orders.data?.orders.length === 0 ? <p className="text-sm text-[var(--color-ink-muted)]">No orders yet.</p> : null}</div>
          </section>

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
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{entitlement.product.name}</p>
                    <p className="text-sm capitalize text-[var(--color-ink-muted)]">{entitlement.status} access</p>
                  </div>
                  {entitlement.status === "active" ? <LinkButton to="/learn" size="sm">Start learning</LinkButton> : null}
                </article>
              ))}
            </div>
          </div>

          <form className="mt-8 border-t border-[var(--color-border)] pt-8" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); profile.mutate({ name: String(data.get("name") ?? ""), timezone: String(data.get("timezone") ?? "") }); }}>
            <h2 className="text-lg font-semibold">Profile preferences</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Display name<input name="name" className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white px-3 py-2 font-normal" defaultValue={user.name} /></label><label className="text-sm font-semibold">Learning timezone<input name="timezone" className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white px-3 py-2 font-normal" defaultValue={user.timezone} placeholder="Asia/Kolkata" /></label></div>
            {profile.isError ? <Alert className="mt-4" variant="error">Your profile could not be updated. Enter a valid name and IANA timezone.</Alert> : null}
            {profile.isSuccess ? <Alert className="mt-4" variant="success">Profile updated.</Alert> : null}
            <Button className="mt-4" type="submit" disabled={profile.isPending}>{profile.isPending ? "Saving…" : "Save profile"}</Button>
          </form>

          <section className="mt-8 border-t border-[var(--color-border)] pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Signed-in devices</h2><p className="text-sm text-[var(--color-ink-muted)]">Review and revoke active sessions you do not recognize.</p></div><Button size="sm" variant="secondary" onClick={() => revokeOthers.mutate()} disabled={revokeOthers.isPending}>Sign out other devices</Button></div>
            {sessions.isLoading ? <LoadingState label="Loading devices…" /> : null}
            <div className="mt-4 space-y-3">{sessions.data?.sessions.map((session) => <article key={session.id} className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"><MonitorSmartphone className="h-5 w-5 shrink-0 text-[var(--color-brand-blue)]" aria-hidden /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{session.userAgent}</p><p className="text-xs text-[var(--color-ink-muted)]">{session.ipAddress} · Last active {new Date(session.lastSeenAt).toLocaleString()}</p>{session.current ? <span className="text-xs font-semibold text-[var(--color-success)]">Current session</span> : null}</div>{!session.current ? <Button size="sm" variant="secondary" onClick={() => revoke.mutate(session.id)}>Revoke</Button> : null}</article>)}</div>
          </section>

          <section className="mt-8 border-t border-[var(--color-border)] pt-8">
            <h2 className="text-lg font-semibold">Privacy and your data</h2><p className="mt-1 text-sm text-[var(--color-ink-muted)]">Download a machine-readable copy of your account, purchases and learning activity, or submit a reviewed deletion request.</p>
            <div className="mt-4 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => window.location.assign(apiUrl("/privacy/export"))}>Download my data</Button></div>
            <form className="mt-5" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); requestDeletion.mutate(String(data.get("reason") ?? "")); }}><label className="text-sm font-semibold">Optional deletion-request context<textarea className="mt-2 block min-h-20 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] p-3 font-normal" maxLength={1000} name="reason" /></label><Button className="mt-3" variant="secondary" type="submit" disabled={requestDeletion.isPending}>Request account deletion</Button></form>
            {requestDeletion.isSuccess ? <Alert className="mt-4" variant="success">Your request was recorded for review.</Alert> : null}{requestDeletion.isError ? <Alert className="mt-4" variant="error">The request could not be submitted.</Alert> : null}
            <div className="mt-4 space-y-2">{privacyRequests.data?.requests.map((item) => <article className="rounded-[var(--radius-md)] border p-3 text-sm" key={item._id}><strong className="capitalize">Deletion request: {item.status.replace("_", " ")}</strong><p className="text-[var(--color-ink-muted)]">Submitted {new Date(item.createdAt).toLocaleString()}</p>{item.resolutionNote ? <p className="mt-1">Response: {item.resolutionNote}</p> : null}{item.status === "pending" ? <Button className="mt-2" size="sm" variant="secondary" onClick={() => cancelDeletion.mutate(item._id)}>Cancel request</Button> : null}</article>)}</div>
          </section>

          <Button className="mt-8" variant="secondary" onClick={() => void logout()}>Sign out</Button>
        </div>
      </Container>
    </section>
  );
}
