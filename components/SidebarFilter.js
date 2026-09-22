import { Search, X } from 'lucide-react'
import { useT } from '@/lib/i18n'

/**
 * Narrows the visible nav tree as you type. Controlled by <Sidebar>.
 *
 * This is deliberately NOT the site search - it only filters the tree by
 * title. Full-text search lives in the header dialog.
 */
export default function SidebarFilter({ value, onChange, placeholder }) {
    const t = useT()

    return (
        <div className="relative">
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none"
                aria-hidden="true"
            />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || t('filter.placeholder')}
                aria-label={t('filter.label')}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-line bg-surface
                    text-ink placeholder-ink-3 transition-colors
                    hover:border-line-strong focus:outline-none focus:border-accent-line focus:ring-2 focus:ring-accent-soft"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label={t('filter.clear')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-ink-3
                        hover:text-ink-2 hover:bg-surface-2 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    )
}
