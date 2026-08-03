import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { Input, FieldError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { apiPost } from "@/lib/api";
import type { ChallengeResult } from "@/types/challenge";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});
type FormInput = z.infer<typeof schema>;

export function EmailReportForm({ result }: { result: ChallengeResult }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormInput) {
    try {
      await apiPost("/challenge/report", {
        ...data,
        overallScore: result.overallScore,
        durationSeconds: result.durationSeconds,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-success)]">
        <CheckCircle2 className="h-4 w-4" /> Sent — check your inbox for the detailed breakdown.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4" /> Get a detailed report by email</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
        <Button type="submit" disabled={isSubmitting} className="shrink-0">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Email me"}
        </Button>
      </div>
      <FieldError>{errors.email?.message}</FieldError>
      {status === "error" ? <FieldError>Something went wrong. Please try again.</FieldError> : null}
    </form>
  );
}
