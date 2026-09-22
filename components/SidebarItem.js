import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useT } from '@/lib/i18n'

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Wraps matches in <mark>. Deliberately compares lowercased strings instead of
 * re-testing the regex: a /gi/ regex is stateful across .test() calls, so the
 * obvious implementation skips every other match.
 */
function HighlightedText({ text, query }) {
    if (!query || !text) return text || null

    const parts = String(text).split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
    const needle = query.toLowerCase()

    return parts.map((part, i) =>
        part.toLowerCase() === needle ? (
            <mark key={i} className="bg-accent-soft text-accent rounded px-0.5">
                {part}
            </mark>
        ) : (
            <span key={i}>{part}</span>
        )
    )
}

/**
 * Presentational: expansion state is owned by <Sidebar>, not here. That matters
 * because the previous version called useState *below* a conditional early
 * return - a Rules of Hooks violation waiting to fire. The only hook left is
 * useT, called unconditionally at the top.
 */
export default function SidebarItem({
    item,
    currentSlug = '',
    level = 0,
    expanded,
    onToggle,
    query = '',
    locale,
}) {
    const t = useT()
    const hasChildren = item.children?.length > 0
    // Untranslated articles stay visible with the fallback locale's title and a
    // quiet marker. Hiding them would leave the Polish sidebar a stub.
    const untranslated =
        locale && item.availableIn?.length > 0 && !item.availableIn.includes(locale)
    const isOpen = hasChildren && expanded.has(item.slug)
    const isActive = currentSlug === item.slug
    const isAncestorOfActive = currentSlug.startsWith(`${item.slug}/`)

    return (
        <li>
            <div className="flex items-center" style={{ paddingLeft: level * 14 }}>
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={() => onToggle(item.slug)}
                        className="p-0.5 -ml-0.5 mr-0.5 rounded text-ink-3 hover:text-ink-2 hover:bg-surface-2 transition-colors"
                        aria-label={t(isOpen ? 'nav.collapse' : 'nav.expand', { title: item.title })}
                        aria-expanded={isOpen}
                    >
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                        />
                    </button>
                ) : (
                    <span className="w-4 mr-0.5 flex-shrink-0" aria-hidden="true" />
                )}

                <Link
                    href={`/${item.slug}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex-1 min-w-0 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive
                            ? 'bg-accent-soft text-accent font-semibold'
                            : isAncestorOfActive
                                ? 'text-accent font-medium hover:bg-canvas'
                                : 'text-ink-2 hover:bg-surface-2'
                    } ${item.isDirectory && !isActive ? 'font-medium' : ''}`}
                >
                    <HighlightedText text={item.title} query={query} />
                    {untranslated && (
                        <span
                            title={t('translation.badge', {
                                locale: t(`locale.${item.availableIn[0]}`),
                            })}
                            className="ml-1.5 align-middle text-[10px] font-semibold tracking-wide
                                text-ink-3 border border-line rounded px-1 py-px"
                        >
                            {item.availableIn[0].toUpperCase()}
                        </span>
                    )}
                </Link>
            </div>

            {/*
              Rendered conditionally rather than hidden with max-h-0: collapsed
              children then leave the DOM, the tab order and the a11y tree, and
              a deep branch cannot be clipped by a max-height guess.
            */}
            {isOpen && (
                <ul className="mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                        <SidebarItem
                            key={child.slug}
                            item={child}
                            currentSlug={currentSlug}
                            level={level + 1}
                            expanded={expanded}
                            onToggle={onToggle}
                            query={query}
                            locale={locale}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
}
