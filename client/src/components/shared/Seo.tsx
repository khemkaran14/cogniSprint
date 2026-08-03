import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/config/seo";

export function Seo({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description?: string;
  path: string;
  noindex?: boolean;
}) {
  const fullTitle = path === "/" ? siteConfig.title : `${title} | ${siteConfig.name}`;
  const desc = description ?? siteConfig.description;
  const url = `${siteConfig.url}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
