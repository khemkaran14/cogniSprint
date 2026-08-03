import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { apiPost } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  topic: z.enum(["general", "payment", "access", "technical"]),
  message: z.string().trim().min(10, "Please add a few more details (10+ characters)"),
  website: z.string().max(0).optional(),
});
type ContactInput = z.infer<typeof schema>;

const topics = [
  { value: "general", label: "General question" },
  { value: "payment", label: "Payment support" },
  { value: "access", label: "Course access" },
  { value: "technical", label: "Technical issue" },
] as const;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: ContactInput) {
    setStatus("idle");
    try {
      await apiPost("/contact", data);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="surface-card flex flex-col items-center gap-2 p-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-[var(--color-success)]" />
        <p className="font-semibold">Message sent</p>
        <p className="text-sm text-[var(--color-ink-muted)]">We typically respond within 1–2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card space-y-4 p-6 sm:p-8">
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />

      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" autoComplete="name" {...register("name")} />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" type="email" autoComplete="email" {...register("email")} />
        <FieldError>{errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="contact-topic">Topic</Label>
        <select id="contact-topic" className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-3.5 text-sm" {...register("topic")} defaultValue="">
          <option value="" disabled>Select a topic</option>
          {topics.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <FieldError>{errors.topic?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" {...register("message")} />
        <FieldError>{errors.message?.message}</FieldError>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
      </Button>
      {status === "error" ? <FieldError>Something went wrong. Please email us directly instead.</FieldError> : null}
    </form>
  );
}
