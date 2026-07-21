---
title: Article title
description: One-sentence description used for search engines and link previews.
summary: One-sentence blurb shown in the article listing (may differ from description).
date: 2026-01-01
tags: [software-architecture]
---

Opening paragraph. The first paragraph is automatically styled as the lede.

## First section

Body text. Supported formatting: **bold**, *emphasis*, `inline code`, and
[links](https://example.com).

- Bullet lists
- like this

1. Numbered lists
2. like this

```text
code blocks render as the site's dark code panels
```

![Alt text describing the image](../assets/articles/example.png "Optional caption")

| Tables | Work |
| --- | --- |
| like | this |

<!--
Optional front matter fields:
  eyebrow: Essay        (label above the title; defaults to "Essay")
  hero: example.png     (file in assets/articles/ used for social-share previews;
                         defaults to the profile photo)
  medium: https://...   (adds the "Originally published on Medium" attribution)
  order: 1              (tie-breaker when several articles share a date; lower = higher)

Images must be .png files in assets/articles/ with a .webp sibling
(cwebp -q 82 image.png -o image.webp). Dimensions are read automatically.

Raw HTML is allowed for anything the subset above doesn't cover: any block
starting with "<" passes through to the page verbatim.
-->
