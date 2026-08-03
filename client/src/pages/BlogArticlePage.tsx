import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock } from "lucide-react";
import { Seo } from "@/components/shared/Seo";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { ShareButtons } from "@/components/marketing/ShareButtons";
import { BlogCard } from "@/components/marketing/BlogCard";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useBlogArticle, useBlogList } from "@/lib/queries";
import { formatDate, slugifyHeading } from "@/lib/utils";
import { siteConfig } from "@/config/seo";

export default function BlogArticlePage() {
  const { slug = "" } = useParams();
  const { data: article, isLoading, isError, refetch } = useBlogArticle(slug);
  const { data: allArticles } = useBlogList();

  if (isLoading) return <div className="py-24"><LoadingState label="Loading article…" /></div>;
  if (isError || !article) return <div className="py-24"><ErrorState message="We couldn't find that article." onRetry={() => refetch()} /></div>;

  const url = `${siteConfig.url}/blog/${article.slug}`;
  const related = (allArticles ?? []).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article className="py-16 sm:py-24">
      <Seo title={article.title} description={article.description} path={`/blog/${article.slug}`} />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            url,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt2,
            author: { "@type": "Organization", name: article.author },
          })}
        </script>
      </Helmet>

      <Container className="grid gap-12 lg:grid-cols-[1fr_260px]">
        <div className="max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[var(--color-ink-faint)]">
            <Link to="/blog" className="hover:underline">Blog</Link> / {article.category}
          </nav>

          <h1 className="text-3xl font-semibold sm:text-4xl">{article.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--color-ink-muted)]">
            <span>{article.author}</span>
            <span aria-hidden>·</span>
            <span>Published {formatDate(article.publishedAt)}</span>
            <span aria-hidden>·</span>
            <span>Updated {formatDate(article.updatedAt2)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.readingTimeMinutes} min read</span>
          </div>

          <div className="mt-6"><ShareButtons url={url} title={article.title} /></div>

          <div className="mt-10 space-y-8">
            {article.sections.map((section) => (
              <div key={section.heading} id={slugifyHeading(section.heading)}>
                <h2 className="text-xl font-semibold">{section.heading}</h2>
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="mt-3 leading-relaxed text-[var(--color-ink-muted)]">{paragraph}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="surface-card mt-12 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Want structured daily practice?</p>
              <p className="text-sm text-[var(--color-ink-muted)]">CogniSprint turns techniques like these into a 15-minute daily routine.</p>
            </div>
            <LinkButton to="/brain-training-course">See the course</LinkButton>
          </div>
        </div>

        <aside className="space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">On this page</p>
            <nav className="space-y-2 text-sm">
              {article.sections.map((section) => (
                <a key={section.heading} href={`#${slugifyHeading(section.heading)}`} className="block text-[var(--color-ink-muted)] hover:text-[var(--color-brand-blue)]">
                  {section.heading}
                </a>
              ))}
            </nav>
          </div>
          <div className="surface-card p-5">
            <p className="mb-2 text-sm font-semibold">Weekly brain challenge</p>
            <NewsletterForm />
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <Container className="mt-16">
          <p className="mb-5 text-lg font-semibold">Related articles</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((a) => <BlogCard key={a._id} article={a} />)}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
