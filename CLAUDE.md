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
| Locale constants | `lib/locales.js` | No Node imports, so client components can read it. `lib/docs.js` must never reach the browser bundle. |
| Search | `lib/searchIndex.js` (build) + `lib/search.js` (client) | Index generated into `public/`, gitignored, lazy-fetched on first use. |

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
  - **`_meta.json.title` is the directory's nav label; `index.md`'s frontmatter is the page's own title.** Different things, deliberately different sources — `tutorials/programmers` is "Programmers" in the tree and "Programmers Tutorials" as a page heading.
  - A directory's `title` in `byLocale` must **not** default to the raw segment. A folder present in one locale but carrying no metadata has to fall through to another locale's label instead of shadowing it with a slug.
- **Articles with no translation still appear** in every locale's sidebar, showing the fallback locale's title plus a marker. Hiding them would turn a 60-article wiki into a stub.
- **The slug universe is the union of all locales.** Several articles exist only in Polish; an English-only universe would make them unreachable from either language.
- **Folders with no markdown anywhere are not pages.** An empty `sprint-2/` would otherwise become a route rendering a heading and nothing else.

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
11. **Don't use `git mv` on content.** This repo's history contains case-duplicate directories (`content/Tutorials/` *and* `content/tutorials/`), so `git mv` refuses paths it thinks are untracked. Plain `fs.renameSync` plus `git add -A` lets rename detection sort it out and repairs the case split as a side effect.
12. **`::backdrop` gets literal colours, not theme tokens.** It lives in the top layer and custom-property inheritance into it is inconsistent; a failed `color-mix()` leaves the scrim fully transparent.
13. **Dialog open/closed state lives in the DOM, not React.** Both the search dialog and the mobile nav use native `<dialog>` + `showModal()`. They sit inside `Layout`, so a React boolean there would re-render — and re-parse — the article every time one opened. `SearchContext` carries a stable `{ open }` handle, not state.
14. **`npx next build` skips npm lifecycle scripts.** Only `npm run build` runs `prebuild`, so only that path validates content and regenerates the search index.
15. **Never run a build while `next dev` is up.** They share `.next/` and the build deletes chunks the dev server needs, which surfaces as `Cannot find module './chunks/vendor-chunks/next.js'` and spurious 500s. Set `WIKI_DIST_DIR` to give the second process its own directory.

## Commands

```bash
npm run dev             # predev regenerates the search index
npm run build           # prebuild validates content, then regenerates the index
npm run check-content   # frontmatter, links, _meta.json drift, translation coverage
npm run search-index    # regenerate public/search-index.<locale>.json

node -e "console.log(Object.keys(require('./.next/prerender-manifest.json').routes).length)"
```

That last one is the regression canary: every article in every locale should prerender (126 at the time of writing, symmetric across the two locales). If the count drops, `getStaticPaths` stopped enumerating something.
