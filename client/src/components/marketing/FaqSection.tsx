import { Container, SectionHeading } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/Accordion";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/QueryStates";
import { useFaq } from "@/lib/queries";

export function FaqSection({
  category,
  title = "Frequently asked questions",
  eyebrow = "FAQ",
  limit,
}: {
  category?: string;
  title?: string;
  eyebrow?: string;
  limit?: number;
}) {
  const { data, isLoading, isError, refetch } = useFaq(category);
  const items = limit ? data?.slice(0, limit) : data;

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} />
        </Reveal>

        {isLoading ? <LoadingState label="Loading FAQs…" /> : null}
        {isError ? <ErrorState onRetry={() => refetch()} /> : null}
        {items && items.length === 0 ? <EmptyState message="No questions in this category yet." /> : null}

        {items && items.length > 0 ? (
          <Reveal delay={0.1}>
            <Accordion type="single" collapsible className="mt-10 surface-card px-6">
              {items.map((item) => (
                <AccordionItem key={item._id} value={item._id}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
