import Head from 'next/head'
import {
    getAdjacentDocs,
    getAllDocSlugs,
    getDocBySlug,
    getNavTree,
    getSectionChildren,
} from '@/lib/docs'
import Breadcrumbs from '@/components/Breadcrumbs'
import DocPagination from '@/components/DocPagination'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import SectionIndex from '@/components/SectionIndex'

export default function DocPage({ doc, prev, next, sectionChildren }) {
    return (
        <>
            <Head>
                <title>{`${doc.meta.title} | 8BitJelly Wiki`}</title>
                {doc.meta.description && <meta name="description" content={doc.meta.description} />}
            </Head>

            <article className="bg-surface rounded-xl border border-line shadow-sm p-6 sm:p-10">
                <Breadcrumbs crumbs={doc.breadcrumbs} current={doc.meta.title} />

                <header className="pb-6 mb-8 border-b border-line">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
                        {doc.meta.headline || doc.meta.title}
                    </h1>
                    {doc.meta.description && (
                        <p className="text-base text-ink-2 leading-relaxed">
                            {doc.meta.description}
                        </p>
                    )}
                </header>

                {doc.content && (
                    <MarkdownRenderer
                        content={doc.content}
                        headingIds={doc.headingIds}
                        slug={doc.slug}
                    />
                )}

                {sectionChildren.length > 0 && (
                    <div className={doc.content ? 'mt-10 pt-8 border-t border-line' : ''}>
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
