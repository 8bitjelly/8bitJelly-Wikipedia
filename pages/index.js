import Link from 'next/link'
import { getAllDocs } from '@/lib/docs'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import SidebarItem from '@/components/SidebarItem'
import { filterDocs } from "@/lib/filterdocs";
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
        <div className="relative min-h-screen">
            {/* Background elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-8 left-1/2 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 relative">
                <Head>
                    <title>8BitJelly | Wiki</title>
                    <meta name="description" content="Welcome to our documentation" />
                </Head>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Table of Contents Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sticky top-8 border border-pink-100">
                            <h3 className="font-semibold text-pink-600 mb-4 text-lg">Table of Contents</h3>
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

                    {/* Main content */}
                    <div className="flex-1">
                        <header className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-pink-700 mb-4">
                                Welcome to our Wiki
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                Explore our documentation, coding standards and more!
                            </p>
                        </header>

                        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                            <h2 className="text-2xl font-semibold text-pink-600 mb-6 pb-2 border-b border-pink-100">Getting Started</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {docs.filter(doc => doc.isDirectory).slice(0, 4).map((doc) => (
                                    <Link
                                        key={doc.slug}
                                        href={`/${doc.slug}`}
                                        className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-6 hover:shadow-md transition-all border border-pink-100 hover:border-pink-200 hover:translate-y-[-2px]"
                                    >
                                        <h3 className="text-xl font-semibold text-pink-700 mb-3">{doc.title}</h3>
                                        <p className="text-gray-600">
                                            {doc.description || 'Explore this category'}
                                        </p>
                                        <div className="mt-4 text-pink-500 font-medium text-sm flex items-center">
                                            Explore section
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
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