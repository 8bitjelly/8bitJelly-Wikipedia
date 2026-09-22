# 8bitJelly Wiki

Internal documentation for 8bitJelly: Unity coding standards, project guides and
team tutorials. Markdown files on disk, rendered as a static site.

Next.js 15 (Pages Router) · React 19 · Tailwind CSS 4 · plain JavaScript.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

`predev` and `prebuild` regenerate the search index and validate the content, so
there is no separate step to remember.

> Do not run `npm run build` while `npm run dev` is up — they share `.next/` and
> the build deletes chunks the dev server needs. Use
> `WIKI_DIST_DIR=.next-check npm run build` if you need both at once.

## Writing an article

Create a markdown file under `content/<locale>/…`. The path is the URL.

```
content/en/coding-standards/best-practices/object-pooling.md
        └── /coding-standards/best-practices/object-pooling
```

Two rules for file and folder names:

- **lowercase, digits and hyphens only** — `object-pooling.md`, not
  `Object Pooling.md`. `npm run check-content` fails the build otherwise.
- **the slug is an id, not a label.** Renaming an article's title is free;
  renaming its file breaks every link to it.

Every article needs frontmatter:

```markdown
---
title: Object Pooling
description: Reusing objects instead of creating and destroying them.
---

Body starts here.
```

| Field | Required | What it is |
|---|---|---|
| `title` | yes | Short nav label. Sidebar, breadcrumbs, search results, `<title>`. |
| `description` | yes (may be empty) | One sentence. Cards, section indexes, `<meta>`. |
| `headline` | no | A longer page heading. The page shows `headline` and the nav shows `title`. |

### Sections

A folder is a page too. Give it an `index.md` to write an introduction, or leave
it out and the wiki generates a card list of its children.

Folder labels and ordering live in `_meta.json`:

```json
{
  "title": "Best Practices",
  "description": "How we write Unity code.",
  "order": ["avoid", "cache-references", "object-pooling"]
}
```

`order` is read **only from `content/en/`**, so both languages always have the
same structure. Anything missing from `order` sorts to the end alphabetically.

## Translations

`content/en/` and `content/pl/` are mirror trees sharing one slug. An article
that exists in only one language is still reachable in both: the other language
serves the version that exists and shows a "not translated yet" notice, and the
sidebar marks it with a small language badge.

To translate an article, copy it to the same path under the other locale:

```
content/en/coding-standards/git-workflow/code-reviews.md
content/pl/coding-standards/git-workflow/code-reviews.md
```

`npm run check-content` prints translation coverage per language.

Interface strings (buttons, labels, notices) live in `lib/i18n.js`, not in the
components. Adding a third language is `lib/locales.js` + a block in
`lib/i18n.js` + a `content/<locale>/` folder.

## How it fits together

| | |
|---|---|
| `lib/docs.js` | Reads `content/`, builds the nav tree, resolves one document. Node-only — import it from `getStaticProps` only. |
| `lib/slug.js` | The only two sluggers: URL paths and heading anchors. |
| `lib/search.js` | Query matching over the generated index. Pure. |
| `components/Layout.js` | Header, sidebar, TOC column. Both pages render through it. |
| `styles/globals.css` | Design tokens. Components use semantic names (`bg-surface`, `text-ink`) — no raw colours anywhere. |
| `pages/[...slug].js` | Every article. Also resolves pre-2026 URLs from `lib/legacy-redirects.json`. |

Themes (light/dark/system plus an accent colour) are CSS variables on `<html>`,
applied before first paint by a small inline script in `_document.js`.

## Scripts

```bash
npm run dev             # dev server, regenerates the index first
npm run build           # validates content, regenerates the index, builds
npm run check-content   # frontmatter, links, _meta.json drift, translation coverage
npm run search-index    # regenerate public/search-index.<locale>.json
```

`scripts/migrate-content.mjs` and `scripts/restore-meta-titles.mjs` are the
one-off migration that moved the flat `content/` tree into per-locale folders
with slugified names. They are kept as the record of the old → new mapping.

## Deployment

Zero-config Vercel: it runs `npm run build`, which runs `prebuild`, so the
search index and the content checks happen automatically. Broken links and
badly-named files fail the deploy rather than shipping.
