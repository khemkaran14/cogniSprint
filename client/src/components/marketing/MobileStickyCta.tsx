import { LinkButton } from "@/components/ui/LinkButton";
import { brand } from "@/config/brand";

export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]/95 p-3 backdrop-blur lg:hidden">
      <LinkButton to="/pricing" className="w-full" size="lg">
        {brand.primaryCta}
      </LinkButton>
    </div>
  );
}
