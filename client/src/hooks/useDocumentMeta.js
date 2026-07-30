import { useEffect } from "react";

const SITE_NAME = "AI Career Shield";

function setMetaDescription(content) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// Sets the document title and meta description for the current route. Since
// this is a client-rendered SPA (no SSR), this covers the browser tab/history
// and anything that executes JS when crawling, while /sitemap.xml (server
// -generated) and /robots.txt cover discovery for crawlers that don't.
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    if (description) setMetaDescription(description);
  }, [title, description]);
}
