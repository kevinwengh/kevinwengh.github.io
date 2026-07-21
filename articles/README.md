# Adding an article

1. Copy `template.html` to a descriptive filename, such as `distributed-systems.html`.
2. Replace the title, description, publication date, tag link, and article body.
3. In the `<head>`, replace every `REPLACE-WITH-FILENAME.html` / `YYYY-MM-DD` placeholder in the canonical link, `og:*`/`twitter:*` meta tags, and the JSON-LD `<script>` block. If the article has a hero diagram in `../assets/articles/`, point `og:image`/`twitter:image`/the JSON-LD `image` at it instead of the default profile photo.
4. Add a linked list item to `index.html` with the title, date, one-sentence description, and the same tag slugs in `data-tags`.
5. Add the new URL to `../sitemap.xml`.

Keep the canonical, durable copy here. If an article is also published on Medium, add a short attribution line and point Medium readers back to this URL.

Use the existing tag vocabulary unless a genuinely new long-lived topic appears: AI Systems, Agentic Engineering, Software Architecture, Distributed Systems, Engineering Leadership, and Career Development.
