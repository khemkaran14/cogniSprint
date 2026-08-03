import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input, FieldError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { apiPost } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});
type FormInput = z.infer<typeof schema>;

export function NewsletterForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormInput) {
    setStatus("idle");
    try {
      await apiPost("/newsletter", data);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-success)]">
        <CheckCircle2 className="h-4 w-4" /> You&apos;re subscribed. Look out for the next brain challenge.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <Input id="newsletter-email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="shrink-0">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
      <FieldError>{errors.email?.message}</FieldError>
      {status === "error" ? <FieldError>Something went wrong. Please try again.</FieldError> : null}
    </form>
  );
}
