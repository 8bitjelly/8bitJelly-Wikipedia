export function filterDocs(docs, query) {
    if (!query) return docs

    const lowerQuery = query.toLowerCase()

    function filterItems(items) {
        return items
            .map(item => {
                if (item.isDirectory) {
                    const filteredChildren = filterItems(item.children)
                    if (
                        filteredChildren.length > 0 ||
                        item.title.toLowerCase().includes(lowerQuery)
                    ) {
                        return {
                            ...item,
                            children: filteredChildren
                        }
                    }
                    return null
                } else {
                    if (item.title.toLowerCase().includes(lowerQuery)) {
                        return item
                    }
                    return null
                }
            })
            .filter(Boolean)
    }

    return filterItems(docs)
}
