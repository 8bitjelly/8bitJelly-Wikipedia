/**
 * Content loading. Node-only (uses `fs`) - import this ONLY from
 * getStaticProps / getStaticPaths / scripts, never from a component.
 *
 * Locales are mirrored trees under content/<locale>/ sharing one canonical
 * slug. The slug universe is the UNION of all locales, not just the default
 * one: several articles exist only in Polish, and an English-only universe
 * would make them unreachable.
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { visit } from 'unist-util-visit'
import { toString as nodeToString } from 'mdast-util-to-string'
import { headingSlug } from './slug.js'
import { DEFAULT_LOCALE, LOCALES } from './locales.js'

const CONTENT_ROOT = path.join(process.cwd(), 'content')
const SEGMENT = /^[a-z0-9-]+$/

// In dev the module stays warm between requests, so caching here would serve
// stale content after every content edit. Production only.
const USE_CACHE = process.env.NODE_ENV === 'production'
let skeletonCache = null
const treeCache = new Map()

/* ------------------------------------------------------------------ *
 * Reading helpers
 * ------------------------------------------------------------------ */

function localeRoot(locale) {
    return path.join(CONTENT_ROOT, locale)
}

function readJson(absPath) {
    try {
        return JSON.parse(fs.readFileSync(absPath, 'utf8')) || {}
    } catch {
        return {}
    }
}

function readFrontmatter(absPath) {
    try {
        return matter(fs.readFileSync(absPath, 'utf8')).data || {}
    } catch {
        return {}
    }
}

/** First locale in preference order that has an entry. */
function preferredLocales(locale) {
    return [locale, DEFAULT_LOCALE, ...LOCALES].filter(
        (value, index, all) => all.indexOf(value) === index
    )
}

function pick(byLocale, locale, field) {
    for (const candidate of preferredLocales(locale)) {
        const value = byLocale[candidate]?.[field]
        if (value) return value
    }
    return ''
}

/* ------------------------------------------------------------------ *
 * Skeleton: the union structure, built once
 * ------------------------------------------------------------------ */

/** Union of the entries of content/<locale>/<relDir> across every locale. */
function readUnion(relDir) {
    const entries = new Map()

    for (const locale of LOCALES) {
        const abs = path.join(localeRoot(locale), relDir)
        if (!fs.existsSync(abs)) continue

        for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
            const isDirectory = entry.isDirectory()
            if (!isDirectory && (!entry.name.endsWith('.md') || entry.name === 'index.md')) continue

            const key = entry.name
            const existing = entries.get(key) || { name: entry.name, isDirectory, locales: [] }
            existing.locales.push(locale)
            entries.set(key, existing)
        }
    }

    return [...entries.values()]
}

function buildSkeleton(relDir = '', slugPrefix = '') {
    const nodes = []

    for (const entry of readUnion(relDir)) {
        const segment = entry.isDirectory ? entry.name : entry.name.replace(/\.md$/, '')
        const slug = slugPrefix ? `${slugPrefix}/${segment}` : segment
        const childRel = relDir ? `${relDir}/${entry.name}` : entry.name

        if (entry.isDirectory) {
            const children = buildSkeleton(childRel, slug)

            const byLocale = {}
            for (const locale of LOCALES) {
                const dirAbs = path.join(localeRoot(locale), childRel)
                if (!fs.existsSync(dirAbs)) continue

                const indexAbs = path.join(dirAbs, 'index.md')
                const hasIndex = fs.existsSync(indexAbs)
                const meta = readJson(path.join(dirAbs, '_meta.json'))
                const indexMatter = hasIndex ? readFrontmatter(indexAbs) : {}

                byLocale[locale] = {
                    // `_meta.json.title` is the directory's NAV LABEL; index.md
                    // frontmatter is the PAGE's own title. Different things.
                    //
                    // Deliberately NOT defaulting to `segment` here: a directory
                    // that exists in this locale but carries no metadata must
                    // fall through to another locale's label rather than
                    // shadowing it with a raw slug.
                    title: meta.title || indexMatter.title || '',
                    description: indexMatter.description || meta.description || '',
                    headline: indexMatter.headline || '',
                    order: meta.order,
                    filePath: hasIndex ? indexAbs : null,
                }
            }

            // Scaffolding folders with no markdown anywhere are not pages.
            const hasAnyIndex = Object.values(byLocale).some((v) => v.filePath)
            if (!hasAnyIndex && children.length === 0) continue

            nodes.push({
                slug,
                segment,
                isDirectory: true,
                availableIn: entry.locales,
                byLocale,
                children,
            })
            continue
        }

        const byLocale = {}
        for (const locale of entry.locales) {
            const abs = path.join(localeRoot(locale), childRel)
            const frontmatter = readFrontmatter(abs)
            byLocale[locale] = {
                title: frontmatter.title || segment,
                description: frontmatter.description || '',
                headline: frontmatter.headline || '',
                filePath: abs,
            }
        }

        nodes.push({
            slug,
            segment,
            isDirectory: false,
            availableIn: entry.locales,
            byLocale,
            children: [],
        })
    }

    return orderNodes(nodes, relDir)
}

/**
 * `order` is read from the DEFAULT locale only, so structure has one source of
 * truth and the locale trees cannot drift apart.
 */
function orderNodes(nodes, relDir) {
    const defaultMeta = readJson(path.join(localeRoot(DEFAULT_LOCALE), relDir, '_meta.json'))
    const order = defaultMeta.order

    const byDefault = (a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.segment.localeCompare(b.segment)
    }

    if (!Array.isArray(order) || order.length === 0) return [...nodes].sort(byDefault)

    const rank = new Map(order.map((name, index) => [name, index]))
    const listed = nodes.filter((node) => rank.has(node.segment))
    const unlisted = nodes.filter((node) => !rank.has(node.segment)).sort(byDefault)

    listed.sort((a, b) => rank.get(a.segment) - rank.get(b.segment))

    const present = new Set(nodes.map((node) => node.segment))
    for (const name of order) {
        if (!present.has(name)) {
            console.warn(
                `[content] _meta.json order entry "${name}" has no file in ${relDir || 'content/'}`
            )
        }
    }

    return [...listed, ...unlisted]
}

function flattenSkeleton(nodes, out = []) {
    for (const node of nodes) {
        out.push(node)
        if (node.children.length) flattenSkeleton(node.children, out)
    }
    return out
}

function getSkeleton() {
    if (USE_CACHE && skeletonCache) return skeletonCache

    const tree = buildSkeleton()
    const flat = flattenSkeleton(tree)
    const bySlug = new Map(flat.map((node) => [node.slug, node]))
    const built = { tree, flat, bySlug }

    if (USE_CACHE) skeletonCache = built
    return built
}

/* ------------------------------------------------------------------ *
 * Per-locale views
 * ------------------------------------------------------------------ */

/** Lean nodes - this ships in __NEXT_DATA__ on every page. */
function toLocaleTree(nodes, locale) {
    return nodes.map((node) => ({
        slug: node.slug,
        title: pick(node.byLocale, locale, 'title') || node.segment,
        isDirectory: node.isDirectory,
        hasIndex: Boolean(node.byLocale[locale]?.filePath),
        availableIn: node.availableIn,
        children: toLocaleTree(node.children, locale),
    }))
}

export function getNavTree(locale = DEFAULT_LOCALE) {
    if (USE_CACHE && treeCache.has(locale)) return treeCache.get(locale)

    const tree = toLocaleTree(getSkeleton().tree, locale)
    if (USE_CACHE) treeCache.set(locale, tree)
    return tree
}

/** Every navigable slug across every locale. Feeds getStaticPaths. */
export function getAllDocSlugs() {
    return getSkeleton().flat.map((node) => node.slug)
}

export function getSectionChildren(slug, locale = DEFAULT_LOCALE) {
    const { tree, bySlug } = getSkeleton()
    const children = slug ? bySlug.get(slug)?.children : tree
    if (!children) return []

    return children.map((child) => ({
        slug: child.slug,
        title: pick(child.byLocale, locale, 'title') || child.segment,
        description: pick(child.byLocale, locale, 'description'),
        isDirectory: child.isDirectory,
        availableIn: child.availableIn,
    }))
}

export function getAdjacentDocs(slug, locale = DEFAULT_LOCALE) {
    const { flat } = getSkeleton()
    const index = flat.findIndex((node) => node.slug === slug)
    if (index === -1) return { prev: null, next: null }

    const at = (i) =>
        i >= 0 && i < flat.length
            ? { slug: flat[i].slug, title: pick(flat[i].byLocale, locale, 'title') || flat[i].segment }
            : null

    return { prev: at(index - 1), next: at(index + 1) }
}

/* ------------------------------------------------------------------ *
 * Headings / table of contents
 * ------------------------------------------------------------------ */

/**
 * Extract headings from a markdown BODY (i.e. `matter(src).content`).
 * Passing a raw file would parse its frontmatter fence as a setext H2 and
 * yield a junk first heading.
 *
 * `level` is depth relative to the shallowest heading in the document, because
 * this corpus is inconsistent: some articles are all h1, some all h2, some all
 * h3. A TOC hardcoded to "h2 and h3" would be empty on several of them.
 */
export function extractHeadings(body) {
    const tree = fromMarkdown(body || '')
    const seen = new Map()
    const headings = []

    visit(tree, 'heading', (node) => {
        const text = nodeToString(node).trim()
        if (!text) return
        headings.push({ id: headingSlug(text, seen), text, depth: node.depth })
    })

    if (headings.length === 0) return []

    const min = Math.min(...headings.map((heading) => heading.depth))
    return headings.map((heading) => ({ ...heading, level: heading.depth - min }))
}

/* ------------------------------------------------------------------ *
 * Legacy URLs
 * ------------------------------------------------------------------ */

/**
 * Maps a pre-migration path to its slugified home, or null.
 * Resolved in getStaticProps rather than next.config redirects(): the old paths
 * contain `(`, `)` and `&`, which are pattern syntax in a redirect `source`,
 * and `params.slug` arrives already decoded so the lookup key is unambiguous.
 */
let legacyRedirects = null

export function resolveLegacySlug(slug) {
    if (!slug) return null

    if (!legacyRedirects) {
        // Read rather than imported: a JSON import needs an import attribute in
        // plain Node ESM, which would break the scripts that import this module.
        legacyRedirects = readJson(path.join(process.cwd(), 'lib', 'legacy-redirects.json'))
    }

    return legacyRedirects[slug] || legacyRedirects[slug.toLowerCase()] || null
}

/* ------------------------------------------------------------------ *
 * A single document
 * ------------------------------------------------------------------ */

function getBreadcrumbs(slug, locale, bySlug) {
    const parts = slug.split('/')
    const crumbs = []
    let acc = ''

    for (let i = 0; i < parts.length - 1; i++) {
        acc = acc ? `${acc}/${parts[i]}` : parts[i]
        const node = bySlug.get(acc)
        crumbs.push({
            slug: acc,
            title: node ? pick(node.byLocale, locale, 'title') || node.segment : parts[i],
        })
    }

    return crumbs
}

/**
 * Returns null for anything that is not a real page, so the caller can answer
 * with a genuine 404 instead of a 200 that says "not found".
 *
 * `translationMissing` tells the page to show a notice: the slug exists, but
 * not in the requested language, so a fallback locale is being served.
 */
export function getDocBySlug(slug, locale = DEFAULT_LOCALE) {
    const segments = String(slug).split('/').filter(Boolean)
    if (segments.length === 0 || !segments.every((segment) => SEGMENT.test(segment))) return null

    const { bySlug } = getSkeleton()
    const node = bySlug.get(slug)
    if (!node) return null

    const servedLocale =
        preferredLocales(locale).find((candidate) => node.byLocale[candidate]?.filePath) || null

    const base = {
        slug,
        requestedLocale: locale,
        servedLocale: servedLocale || locale,
        translationMissing: Boolean(servedLocale) && servedLocale !== locale,
        availableIn: node.availableIn,
        isSection: node.isDirectory,
        breadcrumbs: getBreadcrumbs(slug, locale, bySlug),
    }

    // A directory with no index.md in any locale is still a real page: a
    // generated section index.
    if (!servedLocale) {
        return {
            ...base,
            translationMissing: false,
            content: '',
            meta: {
                title: pick(node.byLocale, locale, 'title') || node.segment,
                description: pick(node.byLocale, locale, 'description'),
                headline: '',
            },
            headings: [],
            headingIds: [],
        }
    }

    let raw
    try {
        raw = fs.readFileSync(node.byLocale[servedLocale].filePath, 'utf8')
    } catch {
        return null
    }

    const { data, content } = matter(raw)
    const headings = extractHeadings(content)

    return {
        ...base,
        content,
        meta: {
            title: data.title || node.segment,
            description: data.description || '',
            headline: data.headline || '',
        },
        headings,
        // Passed straight to MarkdownRenderer's rehype plugin, so the ids in the
        // HTML and the hrefs in the TOC come from one array.
        headingIds: headings.map((heading) => heading.id),
    }
}
