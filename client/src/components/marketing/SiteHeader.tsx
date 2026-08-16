import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Brain } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { mainNav } from "@/config/navigation";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass-panel">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] text-white">
            <Brain className="h-4.5 w-4.5" aria-hidden />
          </span>
          {brand.name}
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex lg:items-center lg:gap-1">
          {mainNav.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]",
                location.pathname === link.href && "text-[var(--color-ink)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <LinkButton to={user ? "/account" : "/login"} size="sm" variant="secondary">{user ? "My account" : "Sign in"}</LinkButton>
          {user?.role === "admin" ? <LinkButton to="/admin" size="sm" variant="secondary">Admin</LinkButton> : null}
          <LinkButton to="/pricing" size="sm">
            {brand.primaryCta}
          </LinkButton>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink)] lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-sm)] px-3 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 px-3">
              <LinkButton to={user ? "/account" : "/login"} variant="secondary" className="mb-2 w-full" onClick={() => setOpen(false)}>{user ? "My account" : "Sign in"}</LinkButton>
              {user?.role === "admin" ? <LinkButton to="/admin" variant="secondary" className="mb-2 w-full" onClick={() => setOpen(false)}>Admin dashboard</LinkButton> : null}
              <LinkButton to="/pricing" className="w-full" onClick={() => setOpen(false)}>
                {brand.primaryCta}
              </LinkButton>
            </div>
            <div className="px-3 pt-3">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
