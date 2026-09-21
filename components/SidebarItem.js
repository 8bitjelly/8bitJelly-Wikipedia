import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

// Helper: Check recursively if this node or any deep descendant matches
function hasMatchingChild(node, query) {
    if (!query) return false
    const q = query.toLowerCase()
    if (node.title?.toLowerCase().includes(q)) return true
    if (node.children && node.children.length > 0) {
        return node.children.some(child => hasMatchingChild(child, q))
    }
    return false
}

// Helper: Highlight matching substring in title
function HighlightedText({ text, query }) {
    if (!query || !text) return <span>{text}</span>

    const regex = new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-pink-200 text-pink-900 rounded-sm px-0.5 font-bold">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    )
}

export default function SidebarItem({ item, currentSlug = '', level = 0, searchQuery = '' }) {
    const isDirectMatch = searchQuery && item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const containsMatch = searchQuery ? hasMatchingChild(item, searchQuery) : false

    // Hide node if searching and neither this node nor its subtree matches
    if (searchQuery && !containsMatch) {
        return null
    }

    const [isExpanded, setIsExpanded] = useState(
        level === 0 || (currentSlug && currentSlug.startsWith(item.slug)) || containsMatch
    )

    // Expand automatically whenever search query matches any descendant
    useEffect(() => {
        if (containsMatch) {
            setIsExpanded(true)
        }
    }, [containsMatch, searchQuery])

    const decodedSlug = decodeURIComponent(currentSlug)
    const isActive = decodedSlug === item.slug
    const isParentOfActive = decodedSlug.startsWith(item.slug + '/')
    const isClickable = !item.isDirectory || item.hasIndex

    const paddingClass = {
        0: 'pl-0',
        1: 'pl-4',
        2: 'pl-8',
        3: 'pl-12',
        4: 'pl-16'
    }[level] || 'pl-20'

    return (
        <li className="mb-1">
            <div
                className={`flex items-center rounded-lg transition-colors ${paddingClass} ${
                    isDirectMatch ? 'bg-pink-50/80 ring-1 ring-pink-300' : ''
                }`}
            >
                {item.isDirectory && item.children?.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-1 text-gray-500 hover:text-gray-700 transition-transform"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                            }`}
                        />
                    </button>
                )}
                {(!item.isDirectory || !item.children?.length) && <span className="w-4"></span>}

                {isClickable ? (
                    <Link
                        href={`/${item.slug}`}
                        className={`flex-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                            isActive
                                ? 'bg-pink-100 text-pink-700 font-medium'
                                : isParentOfActive
                                    ? 'text-pink-600 font-medium'
                                    : 'text-gray-700 hover:bg-pink-50'
                        } ${item.isDirectory ? 'font-semibold' : ''}`}
                    >
                        <HighlightedText text={item.title} query={searchQuery} />
                    </Link>
                ) : (
                    <span
                        className={`flex-1 px-2.5 py-1.5 rounded-lg ${
                            item.isDirectory
                                ? 'font-semibold text-gray-600'
                                : 'text-gray-400'
                        }`}
                    >
                        <HighlightedText text={item.title} query={searchQuery} />
                    </span>
                )}
            </div>

            {item.children && item.children.length > 0 && (
                <ul
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[3000px]' : 'max-h-0'
                    }`}
                >
                    {item.children.map((child) => (
                        <SidebarItem
                            key={child.slug}
                            item={child}
                            currentSlug={currentSlug}
                            level={level + 1}
                            searchQuery={searchQuery}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
}