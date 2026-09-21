/**
 * Builds the full-text search index. Node-only - used by
 * scripts/build-search-index.mjs and by the dev-only API route.
 *
 * Section ids come from extractHeadings(), the same function the table of
 * contents uses, so a search result can deep-link to `#heading` and land on a
 * real anchor.
 */
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString as nodeToString } from 'mdast-util-to-string'
import { extractHeadings, getAllDocSlugs, getDocBySlug, getNavTree } from './docs.js'
import { LOCALES } from './locales.js'

function normalize(text) {
    return text.replace(/\s+/g, ' ').trim()
}

/**
 * Splits a body into one record per heading, plus a lead-in chunk for whatever
 * sits above the first heading.
 *
 * Code fences are flattened rather than dropped: this is a Unity wiki, so
 * people will search for `GetComponent` and `[SerializeField]`, and those live
 * mostly inside fences.
 */
function buildSections(body) {
    const headings = extractHeadings(body)
    const tree = fromMarkdown(body)

    const sections = []
    let headingIndex = 0
    let current = { id: null, heading: '', level: 0, nodes: [] }

    const flush = () => {
        const text = normalize(nodeToString({ type: 'root', children: current.nodes }))
        if (text || current.heading) {
            sections.push({ id: current.id, heading: current.heading, level: current.level, text })
        }
    }

    for (const node of tree.children) {
        // Skip empty headings exactly as extractHeadings does, or the ids drift.
        if (node.type === 'heading' && nodeToString(node).trim()) {
            flush()
            const heading = headings[headingIndex++]
            current = {
                id: heading?.id ?? null,
                heading: heading?.text ?? nodeToString(node).trim(),
                level: heading?.level ?? 0,
                nodes: [],
            }
            continue
        }
        current.nodes.push(node)
    }
    flush()

    return sections
}

/** slug -> ['Coding Standards', 'Best Practices'] in the given locale. */
function buildBreadcrumbIndex(locale) {
    const labels = new Map()

    const walk = (nodes) => {
        for (const node of nodes) {
            labels.set(node.slug, node.title)
            if (node.children?.length) walk(node.children)
        }
    }
    walk(getNavTree(locale))

    return (slug) =>
        slug
            .split('/')
            .slice(0, -1)
            .map((_, i, parts) => labels.get(parts.slice(0, i + 1).join('/')))
            .filter(Boolean)
}

export function buildSearchIndex(locale) {
    const breadcrumbFor = buildBreadcrumbIndex(locale)
    const records = []

    for (const slug of getAllDocSlugs()) {
        const doc = getDocBySlug(slug, locale)
        // No content means a generated section index - nothing to search.
        if (!doc?.content) continue

        records.push({
            slug,
            locale: doc.servedLocale,
            title: doc.meta.title,
            headline: doc.meta.headline || '',
            description: doc.meta.description || '',
            breadcrumb: breadcrumbFor(slug),
            sections: buildSections(doc.content),
        })
    }

    return { locale, builtAt: new Date().toISOString(), records }
}

export function buildAllSearchIndexes() {
    return LOCALES.map((locale) => buildSearchIndex(locale))
}
