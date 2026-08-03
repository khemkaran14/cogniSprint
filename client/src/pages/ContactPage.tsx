import { Mail, Clock, Search } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ContactForm } from "@/components/marketing/ContactForm";
import { brand } from "@/config/brand";

const commonIssues = [
  { title: "Payment support", description: `Payment failed or double charge? Email ${brand.supportEmail} with your order reference.` },
  { title: "Access support", description: "Not seeing course access after payment? Check your confirmation email first, then contact us." },
  { title: "Technical support", description: "Something not working as expected on the site or in a lesson? Let us know what device and browser you're using." },
];

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-24">
      <Seo title="Contact & Support" description="Get in touch for payment support, course access, technical issues or general questions about CogniSprint." path="/contact" />
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Contact & support" title="We're happy to help" align="left" />
          <div className="mt-8 space-y-5">
            {commonIssues.map((issue) => (
              <div key={issue.title} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
                <p className="font-semibold">{issue.title}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{issue.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3 text-sm text-[var(--color-ink-muted)]">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {brand.supportEmail}</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> We typically respond within 1–2 business days.</p>
            <p className="flex items-center gap-2"><Search className="h-4 w-4" /> Order lookup: include the order reference from your confirmation email so we can find your purchase quickly.</p>
          </div>
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
