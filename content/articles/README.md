# Writing an article

Articles are authored in Markdown here and compiled to static HTML. The files in
`articles/` are generated output — never edit them directly.

1. Copy `_template.md` to a descriptive slug, e.g. `distributed-systems.md`
   (the filename becomes the URL: `/articles/distributed-systems.html`).
2. Fill in the front matter and write the body. `_template.md` documents every
   field and all supported formatting.
3. If the article has images, add the `.png` to `assets/articles/` along with a
   `.webp` sibling: `cwebp -q 82 image.png -o image.webp`.
4. Run `node scripts/build.mjs`. This regenerates the article page,
   `articles/index.html` (listing and tag filter), and `sitemap.xml`.
5. Commit the Markdown source together with the regenerated files.

The build is strict: unknown tags, malformed links, unclosed fences, or ragged
tables fail the build with the offending file and line content.

Use the existing tag vocabulary unless a genuinely new long-lived topic appears:
AI Systems, Agentic Engineering, Software Architecture, Distributed Systems,
Data Platforms, Security, Engineering Leadership, and Career Development
(slugs are the kebab-case versions). New tags require adding a label to
`TAG_LABELS` in `scripts/build.mjs`.

Keep the canonical, durable copy here. If an article is also published on
Medium, set the `medium:` front matter field so the page carries an attribution
line pointing Medium readers back to this URL.
