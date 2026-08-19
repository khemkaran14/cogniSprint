import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[a-zA-Z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
});
type RegisterInput = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: RegisterInput) {
    setFormError(null);
    try {
      await registerUser(data.name, data.email, data.password);
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="py-16 sm:py-24">
      <Seo title="Create Account" description="Create your CogniSprint account." path="/register" noindex />
      <Container className="max-w-md">
        <h1 className="text-center text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-center text-sm text-[var(--color-ink-muted)]">Already purchased a program? Use the same email — it's already set up.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card mt-8 space-y-4 p-6 sm:p-8">
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <div>
            <Label htmlFor="register-name">Name</Label>
            <Input id="register-name" autoComplete="name" {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="register-email">Email</Label>
            <Input id="register-email" type="email" autoComplete="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="register-password">Password</Label>
            <Input id="register-password" type="password" autoComplete="new-password" {...register("password")} />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
            Log in
          </Link>
        </p>
      </Container>
    </section>
  );
}
