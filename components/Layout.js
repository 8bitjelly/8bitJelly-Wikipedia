import { useMemo, useRef } from 'react'
import Sidebar from './Sidebar'
import SearchDialog from './SearchDialog'
import SiteHeader from './SiteHeader'
import { SearchContext } from '@/lib/search-context'
import { useT } from '@/lib/i18n'

/**
 * The single source of page chrome. Before this existed the sidebar markup was
 * copy-pasted into both pages, so every change had to be made twice.
 *
 * The three-column grid includes the table-of-contents track from the start so
 * that adding the TOC does not mean re-cutting the layout.
 *
 * Note what is NOT here: no state. <Layout> renders the article, and
 * ReactMarkdown re-parses the whole document on every render, so state at this
 * level would re-parse the article on every keystroke. Sidebar filter state
 * lives in <Sidebar>, active-heading state in <TableOfContents>.
 */
export default function Layout({ tree = [], currentSlug = '', toc = null, children }) {
    const t = useT()
    const hasSidebar = tree.length > 0

    // A ref plus a memoized handle, not state: the dialog's open/closed state
    // lives in the DOM (native <dialog>), so opening search cannot re-render -
    // and therefore cannot re-parse - the article.
    const searchRef = useRef(null)
    const searchApi = useMemo(() => ({ open: () => searchRef.current?.open() }), [])

    return (
        <SearchContext.Provider value={searchApi}>
        <div className="min-h-screen bg-canvas text-ink antialiased selection:bg-accent-soft selection:text-accent">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3
                    focus:px-4 focus:py-2 focus:rounded-lg focus:bg-surface focus:shadow-md
                    focus:text-sm focus:font-medium focus:text-ink"
            >
                {t('nav.skipToContent')}
            </a>

            <SiteHeader tree={tree} currentSlug={currentSlug} />

            {hasSidebar ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div
                        className={`lg:grid lg:gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] ${
                            toc ? 'xl:grid-cols-[18rem_minmax(0,1fr)_14rem]' : ''
                        }`}
                    >
                        {/* Below lg the nav is the <MobileNav> drawer in the header
                            instead of a block stacked above the article. */}
                        <div className="hidden lg:block">
                            <Sidebar tree={tree} currentSlug={currentSlug} />
                        </div>

                        <main id="main" className="min-w-0">
                            {children}
                        </main>

                        {toc && <div className="hidden xl:block">{toc}</div>}
                    </div>
                </div>
            ) : (
                <main id="main">{children}</main>
            )}

            <SearchDialog ref={searchRef} />
        </div>
        </SearchContext.Provider>
    )
}
