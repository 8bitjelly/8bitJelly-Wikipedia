import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

export default function SidebarItem({ item, currentSlug = '', level = 0, searchQuery = '' }) {
    // Determine if this item or any child matches the search
    const matchesSearch = searchQuery
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.children && item.children.some(child =>
            child.title.toLowerCase().includes(searchQuery.toLowerCase())
        ))
        : false

    const [isExpanded, setIsExpanded] = useState(
        level === 0 || (currentSlug && currentSlug.startsWith(item.slug)) || matchesSearch
    )

    useEffect(() => {
        // Expand if matches search
        if (matchesSearch) setIsExpanded(true)
    }, [matchesSearch])

    const isActive = currentSlug && currentSlug === item.slug
    const isParentOfActive = currentSlug && currentSlug.startsWith(item.slug + '/')
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
            <div className={`flex items-center ${paddingClass}`}>
                {item.isDirectory && item.children.length > 0 && (
                    <button
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
                {!item.isDirectory && <span className="w-4"></span>}

                {isClickable ? (
                    <Link
                        href={`/${item.slug}`}
                        className={`flex-1 px-3 py-1 rounded-lg transition-colors ${
                            isActive
                                ? 'bg-pink-100 text-pink-700'
                                : isParentOfActive
                                    ? 'text-pink-600'
                                    : 'text-gray-700 hover:bg-pink-50'
                        } ${item.isDirectory ? 'font-semibold' : ''}`}
                    >
                        {item.title}
                    </Link>
                ) : (
                    <span
                        className={`flex-1 px-3 py-1 rounded-lg ${
                            item.isDirectory
                                ? 'font-semibold text-gray-500'
                                : 'text-gray-400'
                        }`}
                    >
                        {item.title}
                    </span>
                )}
            </div>

            {item.children && item.children.length > 0 && (
                <ul
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96' : 'max-h-0'
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
