const fs = require("fs");
const path = require("path");

// Base URL
const BASE_URL = "https://wavebinder.it";

// Manual URLs (just the paths and priority)
const manualPages = [
    { loc: "/", priority: 1.0 },
    { loc: "/blog", priority: 0.9 },
    { loc: "/contest", priority: 0.9 },
    // add more static pages here if needed
];

// Use today's date for manual pages
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const manualUrls = manualPages.map(page => ({
    loc: page.loc,
    lastmod: today,
    priority: page.priority
}));

// Load articles from index.json
const indexPath = path.join(__dirname, "blog", "index.json");
const articles = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

// Exclude list (slugs)
const excludedArticles = [];

// Filter and map article URLs
const articleUrls = articles
    .filter(a => !excludedArticles.includes(a.slug))
    .map(a => ({
        loc: `/blogAssets/articles/${a.slug}`,
        lastmod: a.date,
        priority: 0.8
    }));

// Combine manual and article URLs
const allUrls = [...manualUrls, ...articleUrls];

// Generate XML
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `
  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>
`).join("")}
</urlset>`;

// Write to sitemap.xml
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemapXml.trim());
console.log("✅ sitemap.xml generated successfully!");
