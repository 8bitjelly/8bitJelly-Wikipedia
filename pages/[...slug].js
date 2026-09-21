import { useRouter } from 'next/router'
import { getAllDocs, getDocBySlug } from '@/lib/docs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import SidebarItem from '@/components/SidebarItem'
import { filterDocs } from "@/lib/filterdocs"
import SearchBar from "@/components/SearchBar"

export default function DocPage({ doc, sidebarDocs: initialSidebarDocs }) {
    const router = useRouter()
    const currentSlug = router.asPath.replace(/^\//, '')
    const [sidebarDocs, setSidebarDocs] = useState(initialSidebarDocs)
    const [searchQuery, setSearchQuery] = useState('')

    const allDocsFlat = useMemo(() => {
        const out = []
        const walk = (items) => {
            items.forEach((it) => {
                if (it?.children?.length) walk(it.children)
                else out.push(it)
            })
        }
        walk(initialSidebarDocs || [])
        return out.length ? out : initialSidebarDocs
    }, [initialSidebarDocs])

    const currentIndex = useMemo(
        () => (doc ? allDocsFlat.findIndex((d) => d.slug === doc.slug) : -1),
        [allDocsFlat, doc]
    )
    const prevDoc = currentIndex > 0 ? allDocsFlat[currentIndex - 1] : null
    const nextDoc =
        currentIndex !== -1 && currentIndex < allDocsFlat.length - 1
            ? allDocsFlat[currentIndex + 1]
            : null

    useEffect(() => {
        if (searchQuery) setSidebarDocs(filterDocs(initialSidebarDocs, searchQuery))
        else setSidebarDocs(initialSidebarDocs)
    }, [searchQuery, initialSidebarDocs])

    useEffect(() => {
        const onKey = (e) => {
            const t = e.target
            const typing =
                t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
            if (typing) return
            if (e.key === 'ArrowLeft' && prevDoc) router.push(`/${prevDoc.slug}`)
            if (e.key === 'ArrowRight' && nextDoc) router.push(`/${nextDoc.slug}`)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [prevDoc?.slug, nextDoc?.slug, router])

    if (!doc) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
                    <p className="text-sm text-slate-500 mb-6">The document you're looking for doesn't exist or has moved.</p>
                    <Link
                        href="/"
                        className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Back to documentation
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-rose-100 selection:text-rose-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Head>
                    <title>{`${doc.meta.title} | Wiki`}</title>
                    <meta name="description" content={doc.meta.description} />
                </Head>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sticky top-8">
                            <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase mb-4">
                                Documentation
                            </h3>
                            <div className="mb-4">
                                <SearchBar onSearch={setSearchQuery} withFocusHandlers />
                            </div>
                            <nav className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                                <ul className="space-y-1">
                                    {sidebarDocs.map((item) => (
                                        <SidebarItem
                                            key={item.slug}
                                            item={item}
                                            currentSlug={currentSlug}
                                        />
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0">
                        <article className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
                            {/* Breadcrumbs */}
                            <nav className="flex items-center text-xs font-medium text-slate-500 mb-6 flex-wrap gap-1.5">
                                <Link href="/" className="hover:text-slate-900 transition-colors">Docs</Link>
                                {doc.breadcrumbs?.map((crumb, i) => (
                                    <span key={i} className="flex items-center gap-1.5">
                                        <span className="text-slate-300">/</span>
                                        <Link href={`/${crumb.slug}`} className="hover:text-slate-900 transition-colors">
                                            {crumb.title}
                                        </Link>
                                    </span>
                                ))}
                            </nav>

                            {/* Header */}
                            <header className="pb-6 mb-8 border-b border-slate-200">
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                                    {doc.meta.title}
                                </h1>
                                {doc.meta.description && (
                                    <p className="text-base text-slate-600 leading-relaxed">
                                        {doc.meta.description}
                                    </p>
                                )}
                            </header>

                            {/* Markdown Render */}
                            <div className="markdown-body">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                >
                                    {doc.content}
                                </ReactMarkdown>
                            </div>
                        </article>

                        {/* Page Pagination */}
                        <div className="flex items-stretch justify-between gap-4 mt-6">
                            {prevDoc ? (
                                <Link
                                    href={`/${prevDoc.slug}`}
                                    className="flex-1 max-w-[280px] p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-left shadow-sm group"
                                >
                                    <div className="text-xs text-slate-400 font-medium group-hover:text-slate-600 mb-1">
                                        ← Previous
                                    </div>
                                    <div className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                                        {prevDoc.title || 'Previous Document'}
                                    </div>
                                </Link>
                            ) : <div />}

                            {nextDoc && (
                                <Link
                                    href={`/${nextDoc.slug}`}
                                    className="flex-1 max-w-[280px] p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-right shadow-sm group"
                                >
                                    <div className="text-xs text-slate-400 font-medium group-hover:text-slate-600 mb-1">
                                        Next →
                                    </div>
                                    <div className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                                        {nextDoc.title || 'Next Document'}
                                    </div>
                                </Link>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export async function getStaticProps({ params }) {
    const slug = params.slug ? params.slug.join('/') : ''
    const doc = getDocBySlug(slug)
    const sidebarDocs = getAllDocs()

    return {
        props: {
            doc,
            sidebarDocs,
        },
    }
}

export async function getStaticPaths() {
    const docs = getAllDocs()
    const paths = docs.map((doc) => ({
        params: { slug: doc.slug.split('/') },
    }))

    return {
        paths,
        fallback: 'blocking',
    }
}