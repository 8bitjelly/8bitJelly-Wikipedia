import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import {
    getAdjacentDocs,
    getAllDocSlugs,
    getDocBySlug,
    getNavTree,
    getSectionChildren,
} from '@/lib/docs'
import Breadcrumbs from '@/components/Breadcrumbs'
import DocPagination from '@/components/DocPagination'
import SectionIndex from '@/components/SectionIndex'

export default function DocPage({ doc, prev, next, sectionChildren }) {
    return (
        <>
            <Head>
                <title>{`${doc.meta.title} | 8BitJelly Wiki`}</title>
                {doc.meta.description && <meta name="description" content={doc.meta.description} />}
            </Head>

            <article className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
                <Breadcrumbs crumbs={doc.breadcrumbs} current={doc.meta.title} />

                <header className="pb-6 mb-8 border-b border-slate-200">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                        {doc.meta.headline || doc.meta.title}
                    </h1>
                    {doc.meta.description && (
                        <p className="text-base text-slate-600 leading-relaxed">
                            {doc.meta.description}
                        </p>
                    )}
                </header>

                {doc.content && (
                    <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                            {doc.content}
                        </ReactMarkdown>
                    </div>
                )}

                {sectionChildren.length > 0 && (
                    <div className={doc.content ? 'mt-10 pt-8 border-t border-slate-200' : ''}>
                        <SectionIndex items={sectionChildren} />
                    </div>
                )}
            </article>

            <DocPagination prev={prev} next={next} />
        </>
    )
}

export async function getStaticProps({ params }) {
    const slug = (params.slug || []).join('/')
    const doc = getDocBySlug(slug)

    // A real 404 instead of a "page not found" card served with HTTP 200.
    if (!doc) return { notFound: true }

    const { prev, next } = getAdjacentDocs(slug)

    return {
        props: {
            doc,
            prev,
            next,
            tree: getNavTree(),
            currentSlug: slug,
            sectionChildren: doc.isSection ? getSectionChildren(slug) : [],
        },
    }
}

export async function getStaticPaths() {
    // Recursive, so every article prerenders. This used to map only the
    // top-level array and emitted 3 paths for a 45-article wiki.
    return {
        paths: getAllDocSlugs().map((slug) => ({ params: { slug: slug.split('/') } })),
        // Keep 'blocking': unknown paths must reach getStaticProps, which is
        // where legacy-URL redirects and real 404s are decided.
        fallback: 'blocking',
    }
}
