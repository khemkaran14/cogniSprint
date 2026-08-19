import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container } from "@/components/ui/Container";
import { Input, Label, FieldError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { apiPost, ApiError } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});
type ForgotPasswordInput = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: ForgotPasswordInput) {
    setFormError(null);
    try {
      await apiPost("/auth/forgot-password", data);
      setSent(true);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="py-16 sm:py-24">
      <Seo title="Forgot Password" description="Reset your CogniSprint account password." path="/forgot-password" noindex />
      <Container className="max-w-md">
        <h1 className="text-center text-3xl font-semibold">Forgot your password?</h1>
        <p className="mt-2 text-center text-sm text-[var(--color-ink-muted)]">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="surface-card mt-8 flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-[var(--color-success)]" />
            <p className="font-semibold">Check your email</p>
            <p className="text-sm text-[var(--color-ink-muted)]">
              If an account exists for that email, we've sent a link to reset your password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card mt-8 space-y-4 p-6 sm:p-8">
            {formError ? <Alert variant="error">{formError}</Alert> : null}
            <div>
              <Label htmlFor="forgot-email">Email</Label>
              <Input id="forgot-email" type="email" autoComplete="email" {...register("email")} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
          <Link to="/login" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
            Back to log in
          </Link>
        </p>
      </Container>
    </section>
  );
}
