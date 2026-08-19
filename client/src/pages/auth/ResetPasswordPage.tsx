import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container } from "@/components/ui/Container";
import { Input, Label, FieldError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { apiPost, ApiError } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[a-zA-Z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
});
type ResetPasswordInput = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: ResetPasswordInput) {
    if (!token) return;
    setFormError(null);
    try {
      await apiPost<{ user: AuthUser }>("/auth/reset-password", { token, password: data.password });
      await refresh();
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="py-16 sm:py-24">
      <Seo title="Set Password" description="Set a new password for your CogniSprint account." path="/reset-password" noindex />
      <Container className="max-w-md">
        <h1 className="text-center text-3xl font-semibold">Set a new password</h1>

        {!token ? (
          <Alert variant="error" className="mt-8">
            This link is missing a reset token. Request a new link to continue.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card mt-8 space-y-4 p-6 sm:p-8">
            {formError ? <Alert variant="error">{formError}</Alert> : null}

            <div>
              <Label htmlFor="reset-password">New password</Label>
              <Input id="reset-password" type="password" autoComplete="new-password" {...register("password")} />
              <FieldError>{errors.password?.message}</FieldError>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
          <Link to="/forgot-password" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
            Request a new link
          </Link>
        </p>
      </Container>
    </section>
  );
}
