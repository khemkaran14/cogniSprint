import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { BlogArticle } from "@/types/content";

export function BlogCard({ article }: { article: BlogArticle }) {
  return (
    <Link to={`/blog/${article.slug}`} className="surface-card block h-full overflow-hidden p-0 transition-transform hover:-translate-y-1">
      <img src={article.coverImage} alt="" width={1200} height={630} className="aspect-[1200/630] w-full object-cover" />
      <div className="p-6">
        <Badge variant="brand">{article.category}</Badge>
        <h3 className="mt-3 text-lg font-semibold">{article.title}</h3>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{article.description}</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-[var(--color-ink-faint)]">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.readingTimeMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
