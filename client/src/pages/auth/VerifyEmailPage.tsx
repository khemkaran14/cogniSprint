import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { LoadingState } from "@/components/shared/QueryStates";
import { apiPost, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : "This link is missing a verification token."
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        await apiPost("/auth/verify-email", { token });
        if (cancelled) return;
        await refresh();
        setStatus("success");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="py-16 sm:py-24">
      <Seo title="Verify Email" description="Verify your CogniSprint email address." path="/verify-email" noindex />
      <Container className="max-w-md text-center">
        {status === "loading" ? <LoadingState label="Verifying your email…" /> : null}

        {status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--color-success)]" aria-hidden />
            <h1 className="mt-5 text-3xl font-semibold">Email verified</h1>
            <p className="mt-2 text-[var(--color-ink-muted)]">Your email address is confirmed. You're all set.</p>
            <LinkButton to="/" size="lg" className="mt-8">
              Go to CogniSprint
            </LinkButton>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <XCircle className="mx-auto h-14 w-14 text-[var(--color-error)]" aria-hidden />
            <h1 className="mt-5 text-3xl font-semibold">Verification failed</h1>
            <p className="mt-2 text-[var(--color-ink-muted)]">{errorMessage}</p>
            <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
              <Link to="/login" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
                Back to log in
              </Link>
            </p>
          </>
        ) : null}
      </Container>
    </section>
  );
}
