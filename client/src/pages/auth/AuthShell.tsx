import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { Seo } from "@/components/shared/Seo";

export function AuthShell({ title, description, path, children, footer }: { title: string; description: string; path: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--color-surface-sunken)] px-5 py-12">
      <Seo title={title} description={description} path={path} />
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] text-white"><Brain className="h-5 w-5" /></span>
          CogniSprint
        </Link>
        <section className="surface-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{description}</p>
          <div className="mt-7">{children}</div>
        </section>
        {footer ? <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">{footer}</p> : null}
      </div>
    </main>
  );
}
