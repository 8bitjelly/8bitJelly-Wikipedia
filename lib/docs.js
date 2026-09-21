/**
 * Content loading. Node-only (uses `fs`) - import this ONLY from
 * getStaticProps / getStaticPaths / scripts, never from a component.
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { visit } from 'unist-util-visit'
import { toString as nodeToString } from 'mdast-util-to-string'
import { headingSlug } from './slug.js'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

// In dev the module stays warm between requests, so caching here would serve
// stale content after every content edit. Production only.
const USE_CACHE = process.env.NODE_ENV === 'production'
let contentCache = null

/* ------------------------------------------------------------------ *
 * Reading helpers
 * ------------------------------------------------------------------ */

function readMeta(dirAbs) {
    try {
        return JSON.parse(fs.readFileSync(path.join(dirAbs, '_meta.json'), 'utf8')) || {}
    } catch {
        return {}
    }
}

function readFrontmatter(fileAbs) {
    try {
        return matter(fs.readFileSync(fileAbs, 'utf8')).data || {}
    } catch {
        return {}
    }
}

function lastSegment(slug) {
    return slug.split('/').pop()
}

/* ------------------------------------------------------------------ *
 * Tree building
 * ------------------------------------------------------------------ */

function defaultSort(nodes) {
    return [...nodes].sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.title.localeCompare(b.title)
    })
}

/**
 * `_meta.json.order` lists child path segments. Listed children keep the given
 * order; everything else follows in the default order (directories first, then
 * alphabetically by title) - which is the pre-existing behaviour, so a
 * directory with no `order` renders unchanged.
 */
function applyOrder(nodes, order, dirSlug) {
    if (!Array.isArray(order) || order.length === 0) return defaultSort(nodes)

    const rank = new Map(order.map((name, i) => [name, i]))
    const listed = []
    const unlisted = []

    for (const node of nodes) {
        if (rank.has(lastSegment(node.slug))) listed.push(node)
        else unlisted.push(node)
    }

    listed.sort((a, b) => rank.get(lastSegment(a.slug)) - rank.get(lastSegment(b.slug)))

    const present = new Set(nodes.map((n) => lastSegment(n.slug)))
    for (const name of order) {
        if (!present.has(name)) {
            console.warn(
                `[content] _meta.json order entry "${name}" has no file in ${dirSlug || 'content/'}`
            )
        }
    }

    return [...listed, ...defaultSort(unlisted)]
}

function buildDirectory(dirAbs, dirSlug, bySlug) {
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true })
    const nodes = []

    for (const entry of entries) {
        const abs = path.join(dirAbs, entry.name)

        if (entry.isDirectory()) {
            const slug = dirSlug ? `${dirSlug}/${entry.name}` : entry.name
            const children = buildDirectory(abs, slug, bySlug)
            const indexAbs = path.join(abs, 'index.md')
            const hasIndex = fs.existsSync(indexAbs)
            const meta = readMeta(abs)
            const indexMatter = hasIndex ? readFrontmatter(indexAbs) : {}

            // Two different things, two different sources:
            //   `_meta.json.title`     - the directory's NAV LABEL (sidebar, breadcrumbs)
            //   index.md frontmatter   - the PAGE's own title/description
            // e.g. Tutorials/Programmers is labelled "Programmers" in the tree
            // while its page is headed "Programmers Tutorials".
            const node = {
                slug,
                title: meta.title || indexMatter.title || entry.name,
                isDirectory: true,
                hasIndex,
                children,
            }

            bySlug.set(slug, {
                ...node,
                description: indexMatter.description || meta.description || '',
                headline: indexMatter.headline || '',
                filePath: hasIndex ? indexAbs : null,
            })
            nodes.push(node)
            continue
        }

        if (!entry.isFile() || !entry.name.endsWith('.md')) continue
        if (entry.name === 'index.md') continue // represented by its directory

        const name = entry.name.replace(/\.md$/, '')
        const slug = dirSlug ? `${dirSlug}/${name}` : name
        const fm = readFrontmatter(abs)

        // Fallback title is the filename verbatim: today's filenames ARE the
        // human-readable labels, so this keeps the 8 frontmatter-less articles
        // rendering exactly as before.
        const node = {
            slug,
            title: fm.title || name,
            isDirectory: false,
            hasIndex: false,
            children: [],
        }

        bySlug.set(slug, {
            ...node,
            description: fm.description || '',
            headline: fm.headline || '',
            filePath: abs,
        })
        nodes.push(node)
    }

    return applyOrder(nodes, readMeta(dirAbs).order, dirSlug)
}

/**
 * Every navigable node in the order the sidebar renders it. Directories are
 * included - they all have a page now (their own index.md, or a generated
 * section index) - which is what fixes prev/next silently vanishing on
 * directory pages.
 */
function flattenTree(nodes, out = []) {
    for (const node of nodes) {
        out.push({ slug: node.slug, title: node.title })
        if (node.children.length) flattenTree(node.children, out)
    }
    return out
}

function buildContent() {
    const bySlug = new Map()
    const tree = buildDirectory(CONTENT_ROOT, '', bySlug)
    return { tree, bySlug, flat: flattenTree(tree) }
}

function loadContent() {
    if (USE_CACHE && contentCache) return contentCache
    const built = buildContent()
    if (USE_CACHE) contentCache = built
    return built
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

    const min = Math.min(...headings.map((h) => h.depth))
    return headings.map((h) => ({ ...h, level: h.depth - min }))
}

/* ------------------------------------------------------------------ *
 * Path safety
 * ------------------------------------------------------------------ */

function resolveWithinContent(slug) {
    const segments = String(slug).split('/').filter(Boolean)
    if (segments.length === 0) return null
    if (segments.some((s) => s === '.' || s === '..' || s.includes('\\'))) return null

    const resolved = path.resolve(CONTENT_ROOT, ...segments)
    if (resolved !== CONTENT_ROOT && !resolved.startsWith(CONTENT_ROOT + path.sep)) return null

    return resolved
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/** Sidebar tree. Lean nodes - this ships in __NEXT_DATA__ on every page. */
export function getNavTree() {
    return loadContent().tree
}

/** Every navigable slug, recursively. Feeds getStaticPaths. */
export function getAllDocSlugs() {
    return loadContent().flat.map((n) => n.slug)
}

function getBreadcrumbs(slug, bySlug) {
    const parts = slug.split('/')
    const crumbs = []
    let acc = ''

    for (let i = 0; i < parts.length - 1; i++) {
        acc = acc ? `${acc}/${parts[i]}` : parts[i]
        crumbs.push({ slug: acc, title: bySlug.get(acc)?.title || parts[i] })
    }

    return crumbs
}

function findNode(nodes, slug) {
    for (const node of nodes) {
        if (node.slug === slug) return node
        const hit = node.children.length ? findNode(node.children, slug) : null
        if (hit) return hit
    }
    return null
}

/** Direct children of a section, with descriptions. Powers section indexes. */
export function getSectionChildren(slug) {
    const { tree, bySlug } = loadContent()
    const node = slug ? findNode(tree, slug) : { children: tree }
    if (!node) return []

    return node.children.map((child) => ({
        slug: child.slug,
        title: child.title,
        description: bySlug.get(child.slug)?.description || '',
        isDirectory: child.isDirectory,
    }))
}

/** { prev, next } in sidebar order. */
export function getAdjacentDocs(slug) {
    const { flat } = loadContent()
    const i = flat.findIndex((n) => n.slug === slug)
    if (i === -1) return { prev: null, next: null }

    return {
        prev: i > 0 ? flat[i - 1] : null,
        next: i < flat.length - 1 ? flat[i + 1] : null,
    }
}

/**
 * One document. Returns null for anything that is not a real page, so the
 * caller can answer with a genuine 404 instead of a 200 that says "not found".
 */
export function getDocBySlug(slug) {
    if (!resolveWithinContent(slug)) return null

    const { bySlug } = loadContent()
    const entry = bySlug.get(slug)
    if (!entry) return null

    // A directory with no index.md is still a real page: a generated section index.
    if (!entry.filePath) {
        return {
            slug,
            content: '',
            isSection: true,
            meta: { title: entry.title, description: entry.description, headline: entry.headline },
            headings: [],
            breadcrumbs: getBreadcrumbs(slug, bySlug),
        }
    }

    let raw
    try {
        raw = fs.readFileSync(entry.filePath, 'utf8')
    } catch {
        return null
    }

    const { data, content } = matter(raw)

    return {
        slug,
        content,
        isSection: entry.isDirectory,
        meta: {
            title: data.title || entry.title,
            description: data.description || '',
            headline: data.headline || '',
        },
        headings: extractHeadings(content),
        breadcrumbs: getBreadcrumbs(slug, bySlug),
    }
}
