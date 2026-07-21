#!/usr/bin/env node
// Builds articles/*.html, articles/index.html, and sitemap.xml from content/articles/*.md.
// Zero dependencies. Run: node scripts/build.mjs
//
// Supported Markdown subset (anything else fails the build):
//   front matter        --- key: value ... ---   (tags: [a, b] as a list)
//   headings            ## h2, ### h3
//   inline              **strong**, *em*, `code`, [text](url)
//   lists               "- item" bullets, "1. item" numbered
//   code blocks         ``` fenced (rendered as bare <pre> to match site CSS)
//   images              ![alt](../assets/articles/x.png "optional caption")
//                       -> <figure><picture> with WebP source, dimensions, lazy loading
//   tables              GFM pipe tables
//   raw HTML            a block whose first line starts with "<" passes through verbatim

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://kevinwengh.github.io";
const CONTENT = join(ROOT, "content", "articles");
const OUTDIR = join(ROOT, "articles");

const TAG_LABELS = {
  "ai-systems": "AI Systems",
  "agentic-engineering": "Agentic Engineering",
  "software-architecture": "Software Architecture",
  "distributed-systems": "Distributed Systems",
  "data-platforms": "Data Platforms",
  "security": "Security",
  "engineering-leadership": "Engineering Leadership",
  "career-development": "Career Development",
};
const FILTER_ORDER = Object.keys(TAG_LABELS);

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escAttr = (s) => esc(s).replaceAll('"', "&quot;");

const fail = (msg) => { throw new Error(msg); };

// ---------- front matter ----------
function parseFrontMatter(src, file) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) fail(`${file}: missing front matter`);
  const fm = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const i = line.indexOf(":");
    if (i < 0) fail(`${file}: bad front matter line: ${line}`);
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (key === "tags") {
      const lm = value.match(/^\[(.*)\]$/);
      if (!lm) fail(`${file}: tags must be [a, b, c]`);
      value = lm[1].split(",").map((t) => t.trim()).filter(Boolean);
    }
    fm[key] = value;
  }
  for (const req of ["title", "description", "summary", "date", "tags"]) {
    if (!fm[req]) fail(`${file}: front matter missing "${req}"`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) fail(`${file}: date must be YYYY-MM-DD`);
  for (const t of fm.tags) if (!TAG_LABELS[t]) fail(`${file}: unknown tag slug "${t}"`);
  return { fm, body: src.slice(m[0].length) };
}

// ---------- inline rendering ----------
function renderInline(s, file) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "\\" && i + 1 < s.length && "\\`*_[]\"#-.|>!<".includes(s[i + 1])) {
      out += esc(s[i + 1]); i += 2; continue;
    }
    if (ch === "`") {
      const end = s.indexOf("`", i + 1);
      if (end < 0) fail(`${file}: unclosed \` in: ${s.slice(0, 80)}`);
      out += `<code>${esc(s.slice(i + 1, end))}</code>`;
      i = end + 1; continue;
    }
    if (ch === "[") {
      const lm = s.slice(i).match(/^\[([^\]]*)\]\(([^)\s]+)\)/);
      if (!lm) fail(`${file}: malformed link at: ${s.slice(i, i + 60)}`);
      out += `<a href="${escAttr(lm[2])}">${renderInline(lm[1], file)}</a>`;
      i += lm[0].length; continue;
    }
    if (s.startsWith("**", i)) {
      const end = s.indexOf("**", i + 2);
      if (end < 0) fail(`${file}: unclosed ** in: ${s.slice(0, 80)}`);
      out += `<strong>${renderInline(s.slice(i + 2, end), file)}</strong>`;
      i = end + 2; continue;
    }
    if (ch === "*") {
      const end = s.indexOf("*", i + 1);
      if (end < 0) fail(`${file}: unclosed * in: ${s.slice(0, 80)}`);
      out += `<em>${renderInline(s.slice(i + 1, end), file)}</em>`;
      i = end + 1; continue;
    }
    out += esc(ch); i += 1;
  }
  return out;
}

// ---------- images ----------
function pngDims(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) fail(`${path}: not a PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function renderImage(line, file) {
  const m = line.match(/^!\[([^\]]*)\]\(([^ )]+)(?: "((?:[^"\\]|\\.)*)")?\)$/);
  if (!m) fail(`${file}: malformed image: ${line}`);
  const [, alt, src, rawCaption] = m;
  if (!src.endsWith(".png")) fail(`${file}: images must be .png with a .webp sibling: ${src}`);
  const { width, height } = pngDims(resolve(OUTDIR, src));
  const webp = src.replace(/\.png$/, ".webp");
  let out = `<figure><picture><source srcset="${escAttr(webp)}" type="image/webp">` +
    `<img alt="${escAttr(alt)}" src="${escAttr(src)}" width="${width}" height="${height}" loading="lazy"></picture>`;
  if (rawCaption !== undefined) {
    out += `<figcaption>${renderInline(rawCaption.replaceAll('\\"', '"'), file)}</figcaption>`;
  }
  return out + `</figure>`;
}

// ---------- tables ----------
function renderTable(lines, file) {
  const cells = (line) => {
    const t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return t.split("|").map((c) => c.trim());
  };
  if (lines.length < 2 || !/^\s*\|[\s|:-]+\|\s*$/.test(lines[1])) {
    fail(`${file}: table missing separator row: ${lines[1] ?? "(end)"}`);
  }
  const header = cells(lines[0]);
  const rows = lines.slice(2).map(cells);
  let out = "<table><thead><tr>";
  for (const h of header) out += `<th scope="col">${renderInline(h, file)}</th>`;
  out += "</tr></thead><tbody>";
  for (const r of rows) {
    if (r.length !== header.length) fail(`${file}: ragged table row: ${r.join("|")}`);
    out += "<tr>" + r.map((c) => `<td>${renderInline(c, file)}</td>`).join("") + "</tr>";
  }
  return out + "</tbody></table>";
}

// ---------- block rendering ----------
function renderBody(body, file) {
  const lines = body.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    if (line.startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) { buf.push(lines[i]); i += 1; }
      if (i >= lines.length) fail(`${file}: unclosed code fence`);
      i += 1;
      out.push(`<pre>${esc(buf.join("\n"))}</pre>`);
      continue;
    }
    const hm = line.match(/^(##+)\s+(.*)$/);
    if (hm) {
      const level = hm[1].length;
      if (level < 2 || level > 3) fail(`${file}: only ## and ### headings are supported: ${line}`);
      out.push(`<h${level}>${renderInline(hm[2], file)}</h${level}>`);
      i += 1; continue;
    }
    if (/^!\[/.test(line.trim())) {
      out.push(renderImage(line.trim(), file));
      i += 1; continue;
    }
    if (/^\s*\|/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { buf.push(lines[i]); i += 1; }
      out.push(renderTable(buf, file));
      continue;
    }
    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) { items.push(lines[i].slice(2)); i += 1; }
      out.push("<ul>" + items.map((t) => `<li>${renderInline(t, file)}</li>`).join("") + "</ul>");
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, "")); i += 1;
      }
      out.push("<ol>" + items.map((t) => `<li>${renderInline(t, file)}</li>`).join("") + "</ol>");
      continue;
    }
    if (line.startsWith("<")) {
      const buf = [];
      while (i < lines.length && lines[i].trim()) { buf.push(lines[i]); i += 1; }
      out.push(buf.join("\n"));
      continue;
    }
    // paragraph: consecutive non-blank lines that start no other block
    const buf = [];
    while (i < lines.length && lines[i].trim() &&
           !/^(```|##|- |\d+\. |\||!\[|<)/.test(lines[i])) {
      buf.push(lines[i]); i += 1;
    }
    out.push(`<p>${renderInline(buf.join("\n"), file)}</p>`);
  }
  return out.join("");
}

// ---------- page chrome ----------
const displayDate = (iso) =>
  new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(iso + "T00:00:00Z"));

const NAV = (current) =>
  `<header class="site-header"><nav class="site-nav shell" aria-label="Primary navigation">` +
  `<a class="wordmark" href="../"><img class="nav-avatar" width="36" height="36" src="../assets/kevin-wen-profile.jpg" alt=""><span>KEVIN WEN</span></a>` +
  `<div class="nav-links"><a href="../resume/">Résumé</a><a href="./"${current === "writing" ? ' aria-current="page"' : ""}>Writing</a>` +
  `<a href="mailto:kevinwen@gmail.com">Contact</a></div></nav></header>`;

const FOOTER =
  `<footer class="site-footer"><div class="footer-row shell"><span>© 2026 Kevin Wen</span>` +
  `<div class="footer-links"><a href="mailto:kevinwen@gmail.com">Email</a>` +
  `<a href="https://www.linkedin.com/in/kevin-wen-9a594012/" target="_blank" rel="noopener noreferrer">LinkedIn</a></div></div></footer>`;

const FAVICONS =
  `<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">` +
  `<link rel="apple-touch-icon" href="../assets/favicon-180.png">`;

function headBlock({ title, ogTitle, description, url, image, ogType, published }) {
  ogTitle ??= title;
  let h = `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="description" content="${escAttr(description)}"><title>${esc(title)} — Kevin Wen</title>` +
    `<link rel="stylesheet" href="../assets/site.css">` + FAVICONS +
    `<link rel="canonical" href="${escAttr(url)}">` +
    `<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="Kevin Wen">` +
    `<meta property="og:url" content="${escAttr(url)}"><meta property="og:title" content="${escAttr(ogTitle)}">` +
    `<meta property="og:description" content="${escAttr(description)}"><meta property="og:image" content="${escAttr(image)}">`;
  if (published) h += `<meta property="article:published_time" content="${published}">`;
  h += `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escAttr(ogTitle)}">` +
    `<meta name="twitter:description" content="${escAttr(description)}"><meta name="twitter:image" content="${escAttr(image)}">`;
  return h;
}

function articleJsonLd({ title, description, date, url, image }) {
  return `<script type="application/ld+json">` + JSON.stringify({
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: title, description, datePublished: date, image,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: "Kevin Wen", url: `${SITE}/` },
    publisher: { "@type": "Person", name: "Kevin Wen" },
  }) + `</script>`;
}

const tagLinks = (tags, prefix) =>
  tags.map((t) => `<a href="${prefix}?tag=${t}">${TAG_LABELS[t]}</a>`).join("");

function articlePage(slug, fm, bodyHtml) {
  const url = `${SITE}/articles/${slug}.html`;
  const image = fm.hero ? `${SITE}/assets/articles/${fm.hero}` : `${SITE}/assets/kevin-wen-profile.jpg`;
  const head = headBlock({ title: fm.title, description: fm.description, url, image, ogType: "article", published: fm.date }) +
    articleJsonLd({ title: fm.title, description: fm.description, date: fm.date, url, image }) + `</head>`;
  const origin = fm.medium
    ? `\n    <p class="article-origin">Originally published on <a href="${escAttr(fm.medium)}">Medium</a>.</p>`
    : "";
  return `<!doctype html>
<!-- Generated from content/articles/${slug}.md by scripts/build.mjs. Edit the Markdown source, not this file. -->
<html lang="en">
${head}
<body>
  ${NAV(null)}
  <main class="article shell">
    <div class="eyebrow">${esc(fm.eyebrow || "Essay")}</div><h1>${esc(fm.title)}</h1><p class="meta">${displayDate(fm.date)}</p><div class="tag-list">${tagLinks(fm.tags, "./")}</div>${origin}
    <div class="article-content">${bodyHtml}</div>
  </main>
  ${FOOTER}
</body>
</html>
`;
}

// Filter script for the listing page; plain string to keep its template literals intact.
const FILTER_SCRIPT = [
  "  <script>",
  "    const filters = [...document.querySelectorAll('[data-filter]')];",
  "    const articles = [...document.querySelectorAll('[data-article]')];",
  "    const status = document.querySelector('#filter-status');",
  "    const labels = Object.fromEntries(filters.map((button) => [button.dataset.filter, button.textContent]));",
  "    const setFilter = (tag) => { const selected = labels[tag] ? tag : 'all'; let visible = 0; articles.forEach((article) => { const match = selected === 'all' || article.dataset.tags.split(' ').includes(selected); article.hidden = !match; if (match) visible += 1; }); filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === selected))); status.textContent = selected === 'all' ? `Showing all ${visible} articles` : `Showing ${visible} article${visible === 1 ? '' : 's'} tagged ${labels[selected]}`; };",
  "    filters.forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));",
  "    setFilter(new URLSearchParams(window.location.search).get('tag') || 'all');",
  "  </script>",
].join("\n");

function listingPage(sorted) {
  const head = headBlock({
    title: "Writing",
    ogTitle: "Writing — Kevin Wen",
    description: "Writing by Kevin Wen on engineering leadership, systems, security, and AI.",
    url: `${SITE}/articles/`,
    image: `${SITE}/assets/kevin-wen-profile.jpg`,
    ogType: "website",
  }) + `</head>`;
  const buttons = [`<button type="button" data-filter="all" aria-pressed="true">All</button>`]
    .concat(FILTER_ORDER.map((t) =>
      `<button type="button" data-filter="${t}" aria-pressed="false">${TAG_LABELS[t]}</button>`)).join("");
  const items = sorted.map(({ slug, fm }) =>
    `<li data-article data-tags="${fm.tags.join(" ")}"><div class="eyebrow">${displayDate(fm.date)}</div>` +
    `<h2><a href="${slug}.html">${esc(fm.title)}</a></h2><p>${esc(fm.summary)}</p>` +
    `<div class="tag-list">${tagLinks(fm.tags, "")}</div></li>`).join("");
  return `<!doctype html>
<!-- Generated by scripts/build.mjs. Edit content/articles/*.md, not this file. -->
<html lang="en">
${head}
<body>
  ${NAV("writing")}
  <main class="shell"><header class="page-header"><div class="eyebrow">Notes from the field</div><h1>Writing about systems and the people who build them.</h1><p>Essays on engineering leadership, cloud platforms, security, data, and AI-assisted work.</p></header><section class="section"><div class="tag-filter" aria-label="Filter articles by tag">${buttons}</div><p class="filter-status" id="filter-status" aria-live="polite">Showing all ${sorted.length} articles</p><ol class="article-list" id="article-list">${items}</ol></section></main>
  ${FOOTER}
${FILTER_SCRIPT}
</body>
</html>
`;
}

function sitemap(sorted) {
  const maxDate = sorted.map(({ fm }) => fm.date).sort().at(-1);
  const rows = [
    [`${SITE}/`, maxDate, "weekly", "1.0"],
    [`${SITE}/resume/`, "2026-07-21", "monthly", "0.8"],
    [`${SITE}/articles/`, maxDate, "weekly", "0.9"],
    ...sorted.map(({ slug, fm }) => [`${SITE}/articles/${slug}.html`, fm.date, "monthly", "0.7"])
      .sort((a, b) => a[0].localeCompare(b[0])),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    rows.map(([loc, lastmod, changefreq, priority]) =>
      `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
    ).join("\n") + `\n</urlset>\n`;
}

// ---------- main ----------
const files = readdirSync(CONTENT)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md");
const entries = [];
for (const f of files) {
  const slug = f.replace(/\.md$/, "");
  const { fm, body } = parseFrontMatter(readFileSync(join(CONTENT, f), "utf8"), f);
  const bodyHtml = renderBody(body, f);
  writeFileSync(join(OUTDIR, `${slug}.html`), articlePage(slug, fm, bodyHtml));
  entries.push({ slug, fm });
}
entries.sort((a, b) =>
  b.fm.date.localeCompare(a.fm.date) ||
  (Number(a.fm.order ?? 999) - Number(b.fm.order ?? 999)) ||
  a.slug.localeCompare(b.slug));
writeFileSync(join(OUTDIR, "index.html"), listingPage(entries));
writeFileSync(join(ROOT, "sitemap.xml"), sitemap(entries));
console.log(`built ${entries.length} articles + listing + sitemap`);
