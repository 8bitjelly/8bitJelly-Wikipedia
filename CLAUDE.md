# 8bitJelly Wiki — working notes

Next.js 15 **Pages Router**, React 19, Tailwind CSS **v4**, plain JavaScript (no TypeScript).
Content is markdown on disk under `content/`, read at build time by `lib/docs.js`.

## Architecture

| Layer | Where | Notes |
|---|---|---|
| Content loading | `lib/docs.js` | Node-only (`fs`). Importable **only** from `getStaticProps` / `getStaticPaths` / scripts. |
| Slug rules | `lib/slug.js` | `slugifySegment` (paths) and `headingSlug` (anchors). **The only two sluggers in the repo.** |
| Routing | `pages/[...slug].js` | Catch-all. `fallback: 'blocking'` is load-bearing — see below. |
| Chrome | `components/Layout.js` | Header, sidebar, TOC column, mobile nav. Both pages render through it. |
| Theming | `styles/globals.css` + `lib/theme.js` | CSS variables on `<html>`; no `dark:` variants in component code. |
| UI strings | `lib/i18n.js` | Plain dict + `useT()`. Never hardcode user-visible English in JSX. |

## Content conventions

- **One canonical slug per article, mirrored across locales.** `content/en/<slug>.md` and `content/pl/<slug>.md` are the same article; the slug is an opaque id and never changes when a title changes.
- **Path segments are `[a-z0-9-]` only.** `lib/docs.js` rejects anything else — that is what makes path traversal structurally impossible rather than merely blocked.
- **Frontmatter contract:**
  - `title` — short nav label. Used by sidebar, breadcrumbs, search, `<title>`. **Required.**
  - `description` — one sentence. Used by cards, section indexes, `<meta>`. Required but may be `""`.
  - `headline` — optional longer page heading. The page renders `headline || title` as its `<h1>`.
- **`_meta.json` per directory:** `{ title, description, order: [...] }`.
  - `order` is read **only from the default locale** — one source of truth for structure, so locale trees cannot drift apart. Listed items come first in the given order; unlisted items follow alphabetically, directories first.
  - `title` / `description` are read per locale, falling back to the default locale. A `content/pl/**/_meta.json` is only needed where you actually want a translated label.
  - An entry in `order` with no matching file on disk is a warning from `scripts/check-content.mjs`, not a crash.
- **Articles with no translation still appear** in every locale's sidebar, showing the fallback locale's title plus a marker. Hiding them would turn a 45-article wiki into a stub.

## Rules that will cost you an afternoon if you break them

1. **Never re-serialize markdown.** Do not run content through `mdast-util-to-markdown`. It reflows tables, swaps emphasis markers and renumbers lists, turning a reviewable 20-line diff into an unreviewable 45-file one. Parse to find positions, then patch the **text** by `node.position.*.offset`, applied right-to-left.
2. **Heading ids come from the server, never from a client slugger.** `extractHeadings()` produces the ordered id list; `MarkdownRenderer` assigns those exact ids via a rehype plugin. A second slugger implementation is a broken-anchor generator. This is why there is no `rehype-slug`.
3. **Extract headings from `matter(src).content`, never the raw file.** The raw frontmatter fence parses as a setext H2 and yields a junk first heading.
4. **The `lib/docs.js` cache is gated on `NODE_ENV === 'production'`.** In dev the module stays warm across requests, so a cache would serve stale content after every content edit.
5. **Theme overrides go on `<html>`, not `<body>`.** Two reasons: `@theme` emits into `@layer theme` and an unlayered rule beats any layered one; and `color-mix()`-derived tokens re-resolve only if the values they mix are redefined on the *same* element.
6. **Tailwind v4 needs `@custom-variant dark (&:where(.dark, .dark *));`** for a class-based toggle. A `darkMode: 'class'` key in a JS config does nothing — v4 does not auto-load `tailwind.config.*` and there is deliberately no such file here.
7. **`fallback: 'blocking'` must stay.** It is what routes unknown paths into `getStaticProps`, where legacy-URL redirects are resolved and real 404s are returned.
8. **Do not derive the active slug from `router.asPath`.** It is URL-encoded; comparing it against decoded tree slugs silently breaks active-state and auto-expand. Pass `doc.slug` down from `getStaticProps`.
9. **No state in `Layout` above `{children}`.** `ReactMarkdown` re-parses the whole document on every render, so a filter input in `Layout` re-parses the article on every keystroke. Filter state lives in `Sidebar`, dialog state in `SearchDialog`, active heading in `TableOfContents`.
10. **Polish `ł` has no NFKD decomposition.** `normalize('NFD').replace(/\p{Diacritic}/gu,'')` will not strip it. `lib/slug.js` carries an explicit transliteration map — use it, don't reinvent it.

## Commands

```bash
npm run dev      # predev regenerates the search index
npm run build    # prebuild regenerates the index and runs content checks
node -e "console.log(Object.keys(require('./.next/prerender-manifest.json').routes).length)"
```

That last one is the regression canary: every article in every locale should prerender. If the count drops, `getStaticPaths` stopped enumerating something.
