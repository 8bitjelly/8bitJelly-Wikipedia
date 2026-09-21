import Link from 'next/link'
import { getAllDocs } from '@/lib/docs'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import SidebarItem from '@/components/SidebarItem'
import { filterDocs } from "@/lib/filterdocs"
import SearchBar from "@/components/SearchBar"

export default function Home({ docs }) {
    const [sidebarDocs, setSidebarDocs] = useState(docs)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (searchQuery) {
            setSidebarDocs(filterDocs(docs, searchQuery))
        } else {
            setSidebarDocs(docs)
        }
    }, [searchQuery, docs])

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-rose-100 selection:text-rose-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Head>
                    <title>8BitJelly | Wiki</title>
                    <meta name="description" content="Welcome to our documentation" />
                </Head>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Table of Contents Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sticky top-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">
                                    Navigation
                                </h3>
                            </div>
                            
                            <div className="mb-4">
                                <SearchBar onSearch={setSearchQuery} />
                            </div>

                            <nav className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                                <ul className="space-y-1">
                                    {sidebarDocs.map((item) => (
                                        <SidebarItem key={item.slug} item={item} />
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0">
                        <header className="mb-8 pb-6 border-b border-slate-200">

                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                                Welcome to our Wiki
                            </h1>
                            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                                Explore our project guides, architecture overviews, and team coding standards.
                            </p>
                        </header>

                        <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                Getting Started
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {docs.filter(doc => doc.isDirectory).slice(0, 4).map((doc) => (
                                    <Link
                                        key={doc.slug}
                                        href={`/${doc.slug}`}
                                        className="group relative flex flex-col justify-between p-5 rounded-lg border border-slate-200 bg-white hover:border-rose-300 hover:shadow-sm transition-all duration-150"
                                    >
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-rose-600 transition-colors mb-1.5">
                                                {doc.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                                {doc.description || 'Explore guides and references in this section.'}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-rose-600 transition-colors">
                                            <span>Explore category</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    )
}

export async function getStaticProps() {
    const docs = getAllDocs()
    return {
        props: {
            docs,
        },
    }
}