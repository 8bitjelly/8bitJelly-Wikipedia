import Link from 'next/link'
import { getAllDocs } from '@/lib/docs'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import SidebarItem from '@/components/SidebarItem'
import {filterDocs} from "@/lib/filterdocs";
import SearchBar from "@/components/SearchBar";

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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Head>
                <title>Knowledge Base | Wiki</title>
                <meta name="description" content="Welcome to our documentation knowledge base" />
            </Head>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Table of Contents Sidebar - matches [...slug].js exactly */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-md p-4 sticky top-8">
                        <h3 className="font-semibold text-pink-600 mb-4">Table of Contents</h3>
                        <SearchBar onSearch={setSearchQuery} />
                        <nav>
                            <ul>
                                {sidebarDocs.map((item) => (
                                    <SidebarItem
                                        key={item.slug}
                                        item={item}
                                    />
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Main content - aligned with TOC */}
                <div className="flex-1">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold text-pink-700 mb-2">Welcome to our Wiki</h1>
                        <p className="text-lg text-gray-600">Explore our comprehensive documentation</p>
                    </header>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-pink-600 mb-4">Getting Started</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {docs.filter(doc => doc.isDirectory).slice(0, 4).map((doc) => (
                                <Link
                                    key={doc.slug}
                                    href={`/${doc.slug}`}
                                    className="bg-pink-50 rounded-lg p-6 hover:bg-pink-100 transition-colors"
                                >
                                    <h3 className="text-xl font-semibold text-pink-700 mb-2">{doc.title}</h3>
                                    <p className="text-gray-600">
                                        {doc.description || 'Explore this category'}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
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