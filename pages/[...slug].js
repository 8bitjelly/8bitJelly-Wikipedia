import { useRouter } from 'next/router'
import { getAllDocs, getDocBySlug } from '@/lib/docs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import SidebarItem from '@/components/SidebarItem'
import {filterDocs} from "@/lib/filterdocs";
import SearchBar from "@/components/SearchBar";

export default function DocPage({ doc, sidebarDocs: initialSidebarDocs }) {
    const router = useRouter()
    const currentSlug = router.asPath.replace(/^\//, '')
    const [sidebarDocs, setSidebarDocs] = useState(initialSidebarDocs)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (searchQuery) {
            setSidebarDocs(filterDocs(initialSidebarDocs, searchQuery))
        } else {
            setSidebarDocs(initialSidebarDocs)
        }
    }, [searchQuery, initialSidebarDocs])

    if (!doc) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h1 className="text-3xl font-bold text-pink-700 mb-4">Page not found</h1>
                    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Go back home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Head>
                <title>{`${doc.meta.title} | Wiki`}</title>
                <meta name="description" content={doc.meta.description} />
            </Head>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-md p-4 sticky top-8">
                        <h3 className="font-semibold text-pink-600 mb-4">Table of Contents</h3>
                        <SearchBar onSearch={setSearchQuery} withFocusHandlers />
                        <nav>
                            <ul>
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
                </div>

                {/* Main content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                        <div className="mb-8">
                            <nav className="flex items-center text-sm text-gray-500 mb-4">
                                <Link href="/" className="hover:text-pink-500">Home</Link>
                                {doc.breadcrumbs.map((crumb, i) => (
                                    <span key={i} className="flex items-center">
                                        <span className="mx-2">/</span>
                                        <Link href={`/${crumb.slug}`} className="hover:text-pink-500">
                                            {crumb.title}
                                        </Link>
                                    </span>
                                ))}
                            </nav>

                            <h1 className="text-3xl md:text-4xl font-bold text-pink-700 mb-2">
                                {doc.meta.title}
                            </h1>
                            {doc.meta.description && (
                                <p className="text-lg text-gray-600">{doc.meta.description}</p>
                            )}
                        </div>

                        <div className="markdown-body">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                            >
                                {doc.content}
                            </ReactMarkdown>
                        </div>
                    </div>
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
        fallback: 'blocking', // Changed to 'blocking' for better 404 handling
    }
}