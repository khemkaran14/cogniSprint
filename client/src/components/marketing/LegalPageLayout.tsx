import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Seo } from "@/components/shared/Seo";
import { formatDate } from "@/lib/utils";

export function LegalPageLayout({
  title,
  lastUpdated,
  path,
  children,
}: {
  title: string;
  lastUpdated: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 sm:py-24">
      <Seo title={title} path={path} />
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Last updated: {formatDate(lastUpdated)}</p>

        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-surface)] p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" aria-hidden />
          <p>This is a structured draft for launch. Have it reviewed by a qualified legal professional for your jurisdiction before relying on it commercially.</p>
        </div>

        <div className="mt-10 space-y-6 text-[var(--color-ink-muted)] leading-relaxed">{children}</div>
      </Container>
    </section>
  );
}
