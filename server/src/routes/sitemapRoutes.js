import { Router } from "express";
import Tool from "../models/Tool.js";
import Category from "../models/Category.js";

export const sitemapRouter = Router();

function siteUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

sitemapRouter.get("/sitemap.xml", async (_req, res) => {
  const base = siteUrl();
  const tools = await Tool.find().lean();
  const categories = await Category.find().populate("tool", "slug").lean();

  const staticUrls = ["/", "/pricing"];
  const toolUrls = tools.map((t) => `/tools/${t.slug}`);
  const categoryUrls = categories
    .filter((c) => c.tool)
    .map((c) => `/tools/${c.tool.slug}/${c.slug}`);

  const urls = [...staticUrls, ...toolUrls, ...categoryUrls];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${base}${path}</loc></url>`).join("\n")}
</urlset>`;

  res.type("application/xml").send(body);
});

sitemapRouter.get("/robots.txt", (_req, res) => {
  const base = siteUrl();
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
});
