/**
 * Narrows a nav tree to the branches whose titles match `query`.
 * Pure - safe to import from components.
 */
export function filterDocs(docs, query) {
    if (!query) return docs

    const needle = query.toLowerCase()

    function filterItems(items) {
        return items
            .map((item) => {
                const selfMatches = item.title?.toLowerCase().includes(needle)

                if (item.children?.length) {
                    const matchingChildren = filterItems(item.children)
                    if (matchingChildren.length > 0) {
                        return { ...item, children: matchingChildren }
                    }
                    // A section that matches by its own title keeps its whole
                    // subtree. Returning `children: []` here - as this used to -
                    // hid everything inside the thing you just searched for.
                    return selfMatches ? { ...item } : null
                }

                return selfMatches ? item : null
            })
            .filter(Boolean)
    }

    return filterItems(docs)
}
