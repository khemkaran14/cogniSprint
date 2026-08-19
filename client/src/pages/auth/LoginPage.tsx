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
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type LoginInput = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    try {
      await login(data.email, data.password);
      const next = searchParams.get("next");
      navigate(next && next.startsWith("/") ? next : "/", { replace: true });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="py-16 sm:py-24">
      <Seo title="Log In" description="Log in to your CogniSprint account." path="/login" noindex />
      <Container className="max-w-md">
        <h1 className="text-center text-3xl font-semibold">Log in</h1>
        <p className="mt-2 text-center text-sm text-[var(--color-ink-muted)]">Welcome back — pick up where you left off.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card mt-8 space-y-4 p-6 sm:p-8">
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" autoComplete="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link to="/forgot-password" className="mb-1.5 text-xs font-medium text-[var(--color-brand-blue)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="login-password" type="password" autoComplete="current-password" {...register("password")} />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
          New to CogniSprint?{" "}
          <Link to="/register" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
            Create an account
          </Link>
        </p>
      </Container>
    </section>
  );
}
