import { useCallback, useEffect, useMemo, useState } from 'react'
import SidebarItem from './SidebarItem'
import SidebarFilter from './SidebarFilter'
import { filterDocs } from '@/lib/filterdocs'

/** 'a/b/c' -> ['a', 'a/b', 'a/b/c'] - includes the slug itself, so landing on a
 *  directory page shows that directory's children already open. */
function ancestorsOf(slug) {
    const out = []
    let acc = ''
    for (const part of String(slug).split('/').filter(Boolean)) {
        acc = acc ? `${acc}/${part}` : part
        out.push(acc)
    }
    return out
}

function topLevelBranches(nodes) {
    return nodes.filter((n) => n.children?.length).map((n) => n.slug)
}

function allBranches(nodes, out = []) {
    for (const node of nodes) {
        if (node.children?.length) {
            out.push(node.slug)
            allBranches(node.children, out)
        }
    }
    return out
}

/**
 * Owns the two pieces of sidebar state - the filter string and the set of
 * expanded branches - so that <SidebarItem> can stay a pure function.
 *
 * This state MUST live here and not in <Layout>: <Layout> renders the article,
 * and ReactMarkdown re-parses the whole document on every render, so a filter
 * input one level higher would re-parse the article on every keystroke.
 */
export default function Sidebar({ tree, currentSlug = '', heading = 'Documentation' }) {
    const [filter, setFilter] = useState('')
    const [expanded, setExpanded] = useState(
        () => new Set([...topLevelBranches(tree), ...ancestorsOf(currentSlug)])
    )

    // Navigating keeps whatever the reader opened and adds the new active branch.
    useEffect(() => {
        setExpanded((prev) => {
            const next = new Set(prev)
            for (const slug of ancestorsOf(currentSlug)) next.add(slug)
            return next
        })
    }, [currentSlug])

    const query = filter.trim()
    const filtered = useMemo(() => (query ? filterDocs(tree, query) : tree), [tree, query])

    // While filtering, open every surviving branch so matches are actually visible.
    const openBranches = useMemo(
        () => (query ? new Set(allBranches(filtered)) : expanded),
        [query, filtered, expanded]
    )

    const onToggle = useCallback((slug) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(slug)) next.delete(slug)
            else next.add(slug)
            return next
        })
    }, [])

    return (
        <aside className="w-full">
            <div className="bg-surface rounded-xl border border-line shadow-sm p-5 lg:sticky lg:top-20">
                <h2 className="font-semibold text-ink text-xs tracking-wider uppercase mb-4">
                    {heading}
                </h2>

                <SidebarFilter value={filter} onChange={setFilter} />

                <nav
                    aria-label="Documentation"
                    className="mt-4 lg:max-h-[calc(100vh-18rem)] overflow-y-auto pr-1"
                >
                    {filtered.length === 0 ? (
                        <p className="px-1 py-2 text-sm text-ink-3">
                            Nothing matches <span className="font-medium text-ink-2">{query}</span>.
                        </p>
                    ) : (
                        <ul className="space-y-0.5">
                            {filtered.map((item) => (
                                <SidebarItem
                                    key={item.slug}
                                    item={item}
                                    currentSlug={currentSlug}
                                    expanded={openBranches}
                                    onToggle={onToggle}
                                    query={query}
                                />
                            ))}
                        </ul>
                    )}
                </nav>
            </div>
        </aside>
    )
}
