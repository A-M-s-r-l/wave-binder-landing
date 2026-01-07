const fs = require("fs");
const path = require("path");

// 1️⃣ Base URL
const BASE_URL = "https://wavebinder.it";

// 2️⃣ Manual URLs (just the paths and priority)
const manualPages = [
    { loc: "/", priority: 1.0 },
    { loc: "/blog", priority: 0.9 },
    { loc: "/contest", priority: 0.9 },
    // add more static pages here if needed
];

// 3️⃣ Use today's date for manual pages
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const manualUrls = manualPages.map(page => ({
    loc: page.loc,
    lastmod: today,
    priority: page.priority
}));

// 4️⃣ Load articles from index.json
const indexPath = path.join(__dirname, "blogAssets", "index.json");
const articles = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

const articleUrls = articles.map(a => ({
    loc: `/blogAssets/articles/${a.slug}`,
    lastmod: a.date,
    priority: 0.8
}));

// 5️⃣ Combine manual and article URLs
const allUrls = [...manualUrls, ...articleUrls];

// 6️⃣ Generate XML
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

// 7️⃣ Write to sitemap.xml
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemapXml.trim());
console.log("✅ sitemap.xml generated successfully!");
