import { Search, X } from 'lucide-react'

/**
 * Narrows the visible nav tree as you type. Controlled by <Sidebar>.
 *
 * This is deliberately NOT the site search - it only filters the tree by
 * title. Full-text search lives in the header dialog.
 */
export default function SidebarFilter({ value, onChange, placeholder = 'Filter articles...' }) {
    return (
        <div className="relative">
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
            />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label="Filter articles by title"
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white
                    text-slate-800 placeholder-slate-400 transition-colors
                    hover:border-slate-300 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Clear filter"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400
                        hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    )
}
