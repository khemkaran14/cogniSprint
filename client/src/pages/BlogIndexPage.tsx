import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { BlogCard } from "@/components/marketing/BlogCard";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/QueryStates";
import { useBlogList } from "@/lib/queries";

export default function BlogIndexPage() {
  const { data: articles, isLoading, isError, refetch } = useBlogList();

  return (
    <section className="py-16 sm:py-24">
      <Seo title="Blog — Mental Math, Memory & Focus Articles" description="Practical, no-hype articles on mental math, memory, focus, critical thinking and daily learning habits." path="/blog" />
      <Container>
        <SectionHeading eyebrow="Blog" title="Practical articles, no hype" align="left" />

        {isLoading ? <LoadingState label="Loading articles…" /> : null}
        {isError ? <ErrorState onRetry={() => refetch()} /> : null}
        {articles && articles.length === 0 ? <EmptyState message="No articles published yet." /> : null}

        {articles && articles.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => <BlogCard key={article._id} article={article} />)}
          </div>
        ) : null}

        <div className="mt-16 surface-card mx-auto max-w-xl p-8 text-center">
          <h2 className="text-lg font-semibold">Get a weekly brain challenge by email</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">One short puzzle, one useful fact, no spam.</p>
          <NewsletterForm className="mt-5" />
        </div>
      </Container>
    </section>
  );
}
