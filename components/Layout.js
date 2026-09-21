import Sidebar from './Sidebar'
import SiteHeader from './SiteHeader'

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
    const hasSidebar = tree.length > 0

    return (
        <div className="min-h-screen bg-canvas text-ink antialiased selection:bg-accent-soft selection:text-accent">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3
                    focus:px-4 focus:py-2 focus:rounded-lg focus:bg-surface focus:shadow-md
                    focus:text-sm focus:font-medium focus:text-ink"
            >
                Skip to content
            </a>

            <SiteHeader />

            {hasSidebar ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div
                        className={`flex flex-col gap-8 lg:grid lg:gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] ${
                            toc ? 'xl:grid-cols-[18rem_minmax(0,1fr)_14rem]' : ''
                        }`}
                    >
                        <Sidebar tree={tree} currentSlug={currentSlug} />

                        <main id="main" className="min-w-0">
                            {children}
                        </main>

                        {toc && <div className="hidden xl:block">{toc}</div>}
                    </div>
                </div>
            ) : (
                <main id="main">{children}</main>
            )}
        </div>
    )
}
