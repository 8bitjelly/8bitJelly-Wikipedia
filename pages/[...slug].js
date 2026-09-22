import Head from 'next/head'
import {
    getAdjacentDocs,
    getAllDocSlugs,
    getDocBySlug,
    getNavTree,
    getSectionChildren,
    resolveLegacySlug,
} from '@/lib/docs'
import { DEFAULT_LOCALE } from '@/lib/locales'
import Breadcrumbs from '@/components/Breadcrumbs'
import DocPagination from '@/components/DocPagination'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import SectionIndex from '@/components/SectionIndex'
import TranslationNotice from '@/components/TranslationNotice'

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

                <TranslationNotice
                    requestedLocale={doc.requestedLocale}
                    servedLocale={doc.servedLocale}
                />

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

export async function getStaticProps({ params, locale = DEFAULT_LOCALE }) {
    const slug = (params.slug || []).join('/')

    // Pre-migration URLs (spaces, parentheses, ampersands) land here through
    // fallback: 'blocking' and are redirected. Resolving them in getStaticProps
    // rather than next.config redirects() avoids escaping `(`, `)` and `&` as
    // path-to-regexp patterns, and params.slug arrives already decoded.
    const legacy = resolveLegacySlug(slug)
    if (legacy) {
        return {
            redirect: {
                destination: locale === DEFAULT_LOCALE ? `/${legacy}` : `/${locale}/${legacy}`,
                permanent: true,
            },
        }
    }

    const doc = getDocBySlug(slug, locale)

    // A real 404 instead of a "page not found" card served with HTTP 200.
    if (!doc) return { notFound: true }

    const { prev, next } = getAdjacentDocs(slug, locale)

    return {
        props: {
            doc,
            prev,
            next,
            tree: getNavTree(locale),
            currentSlug: slug,
            sectionChildren: doc.isSection ? getSectionChildren(slug, locale) : [],
        },
    }
}

export async function getStaticPaths({ locales }) {
    const slugs = getAllDocSlugs()

    // Every locale variant has to be listed explicitly - Next does not fan a
    // path out across locales for you.
    return {
        paths: locales.flatMap((locale) =>
            slugs.map((slug) => ({ params: { slug: slug.split('/') }, locale }))
        ),
        // Keep 'blocking': unknown paths must reach getStaticProps, which is
        // where legacy-URL redirects and real 404s are decided.
        fallback: 'blocking',
    }
}
