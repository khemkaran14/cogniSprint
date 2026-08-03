import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { footerNav } from "@/config/navigation";
import { brand } from "@/config/brand";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] text-white">
                <Brain className="h-4.5 w-4.5" aria-hidden />
              </span>
              {brand.name}
            </div>
            <p className="mt-3 max-w-xs text-sm text-[var(--color-ink-muted)]">{brand.tagline}</p>
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">Get a weekly brain challenge</p>
              <NewsletterForm />
            </div>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">{group.title}</p>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-brand-blue)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-4 text-xs leading-relaxed text-[var(--color-ink-muted)]">
          CogniSprint is an educational skills-practice program. It does not guarantee an increase in IQ,
          intelligence-test scores, academic performance, professional success or medical outcomes, and it is
          not a substitute for medical, psychological or educational advice. See our{" "}
          <Link to="/legal/disclaimer" className="underline">full educational disclaimer</Link>.
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-ink-faint)] sm:flex-row">
          <p>© {new Date().getFullYear()} {brand.company.owner}. All rights reserved.</p>
          <p>Made for focused, screen-free-friendly learning.</p>
        </div>
      </Container>
    </footer>
  );
}
