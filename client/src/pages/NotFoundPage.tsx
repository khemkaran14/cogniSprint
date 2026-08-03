import { Compass } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export default function NotFoundPage() {
  return (
    <section className="py-24">
      <Seo title="Page Not Found" path="/404" noindex />
      <Container className="flex flex-col items-center gap-4 text-center">
        <Compass className="h-10 w-10 text-[var(--color-ink-faint)]" aria-hidden />
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="max-w-sm text-[var(--color-ink-muted)]">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <LinkButton to="/">Back to home</LinkButton>
      </Container>
    </section>
  );
}
